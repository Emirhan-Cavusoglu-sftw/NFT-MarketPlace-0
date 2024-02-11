"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { GetIpfsUrlFromPinata } from "../../utils/util";
import {
  marketPlaceAddress,
  collectionFactoryAddress,
} from "../../utils/constants";
import collectionFactoryABI from "../../abis/collectionFactoryABI.json";
import collectionABI from "../../abis/collectionABI.json";
import axios from "axios";
import nftMarketPlaceABI from "../../abis/nftMarketPlaceABI.json";
import { readContract, writeContract } from "wagmi/actions";
import { useAccount, useContractRead } from "wagmi";
import { formatEther, parseEther } from "viem";
import { uploadFileToIPFS, uploadJSONToIPFS } from "@/app/utils/pinata";
import NFTCard from "@/app/components/NFTCard";
import dynamic from "next/dynamic";
const NFTCollectionPage = () => {
  const [formParams, updateFormParams] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [nftsData, updateNFTsData] = useState([]);
  const [dataFetched, updateDataFetched] = useState(false);

  const [fileURL, setFileURL] = useState(null);

  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [enableButton, setEnableButton] = useState(false);
  const params = useParams();
  const contractAddress = params.address;
  const account = useAccount();
  const [data, updateData] = useState({});
  const [nftdataFetched, updateNftDataFetched] = useState(false);
  const [message, updateMessage] = useState("");
  

  const { data: listingPrice } = useContractRead({
    address: contractAddress,
    abi: collectionABI,
    functionName: "getListPrice",
  });

  const listedPrice = listingPrice;

  const { data: totalPrice } = useContractRead({
    address: contractAddress,
    abi: collectionABI,
    functionName: "calculateTotalPrice",
  });
  const { data: id } = useContractRead({
    address: contractAddress,
    abi: collectionABI,
    functionName: "collectionId",
  });

  
  
  useEffect(() => {
    const fetchData = async () => {
      if (!dataFetched && !nftdataFetched) {
        await getNFTsData(contractAddress);
        await getNFTData(contractAddress);
      }}

    fetchData();
  }, []);

  

  async function getNFTsData(contractAddress) {
    let transaction = await readContract({
      address: contractAddress,
      abi: collectionABI,
      functionName: "getAllNFTs",
    });

    transaction = transaction.filter((i) => i.seller == account.address);

    const items = await Promise.all(
      transaction.map(async (i) => {
        const tokenURI = await readContract({
          address: contractAddress,
          abi: collectionABI,
          functionName: "tokenURI",
          args: [i.tokenId],
        });

        let meta = await axios.get(tokenURI as string);
        meta = meta.data;

        let price = formatEther(i.price.toString());
        let item = {
          price,
          tokenId: i.tokenId,
          seller: i.seller,
          owner: i.owner,
          image: meta.image,
          name: meta.name,
          description: meta.description,
        };

        return item;
      })
    );
    updateNFTsData(items);
    updateNftDataFetched(true);
  }
  
  async function buyNFTCollection(contractAddress) {
    try {
      const price = parseEther(formatEther(totalPrice))
      updateMessage("Buying the NFT... Please Wait (Upto 5 mins)");
      await writeContract({
        address: contractAddress,
        abi: collectionABI,
        functionName: "sellTheCollection",
        account: account.address,
        value: price ,
      });
      await writeContract({
        address: collectionFactoryAddress,
        abi: collectionFactoryABI,
        functionName: "updateUserData",
        account: account.address,
        args: [id],
      });
      
      alert("You successfully bought the NFT Collection!");
      updateMessage("");
    } catch (e) {
      alert("Upload Error" + e);
    }
  }

  async function getNFTData(contractAddress) {
    let tokenURI = await readContract({
      address: contractAddress,
      abi: collectionABI,
      functionName: "collectionURI",
    });
    console.log(tokenURI);
    let totalPrice = await readContract({
      address: contractAddress,
      abi: collectionABI,
      functionName: "calculateTotalPrice",
    });
    let owner = await readContract({
      address: contractAddress,
      abi: collectionABI,
      functionName: "owner",
    });
    // console.log(totalPrice);

    tokenURI = GetIpfsUrlFromPinata(tokenURI);
    let meta = await axios.get(tokenURI);
    
    meta = meta.data;

    let item = {
      owner: owner,
      price: totalPrice,
      image: meta.image,
      name: meta.name,
      description: meta.description,
    };
    
    updateData(item);
    updateDataFetched(true);
  }
  async function uploadMetadataToIPFS() {
    const { name, description, price } = formParams;

    if (!name || !description || !price || !isFileUploaded) {
      updateMessage("Please fill all the fields!");
      return -1;
    }

    const nftJSON = {
      name,
      description,
      price,
      image: fileURL,
    };

    try {
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success === true) {
        console.log("Uploaded JSON to Pinata: ", response);
        return response.pinataURL;
      }
    } catch (e) {
      console.log("error uploading JSON metadata:", e);
    }
  }
  async function OnChangeFile(e: any) {
    var file = e.target.files[0];

    try {
      updateMessage("Uploading image to IPFS.. please wait!");
      const response = await uploadFileToIPFS(file);
      if (response.success === true) {
        console.log("Uploaded image to Pinata: ", response.pinataURL);
        setFileURL(response.pinataURL);
        setIsFileUploaded(true);
        updateMessage(
          "Image uploaded successfully! you can now click on Create NFT!"
        );
        setEnableButton(true);
      }
    } catch (e) {
      console.log("Error during file upload", e);
    }
  }

  // koleksiyona nft ekleme fonksiyonu
  async function addNftToCollection(e, contractAddress) {
    e.preventDefault();

    try {
      const metadataURL = await uploadMetadataToIPFS();
      if (metadataURL === -1) return;

      updateMessage(
        "Uploading NFT(takes 5 mins).. please dont click anything!"
      );

      const price = parseEther(formParams.price);
      console.log(price);
      await writeContract({
        address: contractAddress,
        abi: collectionABI,
        functionName: "createToken",
        args: [metadataURL, price],
        value: listedPrice,
      });

      alert("Successfully listed your NFT!");
    } catch (e) {
      alert("Upload error" + e);
    }
  }

  if (typeof data.image == "string")
    data.image = GetIpfsUrlFromPinata(data.image);

  return (
    <>
      <div className="flex items-center justify-center mt-10 ">
        <div className="bg-gradient-to-r from-yellow-800 to-yellow-400  rounded-lg shadow-lg overflow-hidden">
          <img src={data.image} alt="" className="w-full h-64 object-cover" />
          <div className="px-6 py-4">
            <h2 className="text-xl font-semibold text-white mb-2">
              {data.name}
            </h2>
            <p className="text-white">{data.description}</p>
          </div>
          <div className="px-6 py-4">
            <div className="text-white">
              Price: <span className="font-semibold">{totalPrice==undefined?0:formatEther(totalPrice)} 
              
              ETH</span>
            </div>
            <div className="text-white">
              Owner: <span className="font-semibold">{data.owner}</span>
            </div>
            
          </div>
          <div className="px-6 py-4 flex justify-center items-center">
            {account.address !== data.owner &&
            account.address !== data.seller ? (
              <button
                className="bg-[#7D3799] hover:bg-purple-900 text-white font-bold py-2 px-4 rounded-full text-sm"
                onClick={() => buyNFTCollection(contractAddress)}
              >
                Buy this Collection
              </button>
            ) : (
              <div className="text-green-600 font-semibold">
                You are the owner of this NFT
              </div>
            )}
          </div>
        </div>
      </div>
      <>
        <div className="flex flex-col items-center mt-10 ">
          <form className="w-full max-w-lg bg-gradient-to-r from-yellow-800 to-yellow-400 shadow-md rounded-lg px-8 pt-6 pb-8 mb-4 ">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-900 to-violet-400 bg-clip-text text-transparent mb-8 text-center">
              Upload Your NFT to the Marketplace
            </h2>
            <div className="mb-6">
              <label
                className="block 
            bg-gradient-to-r from-purple-900 to-violet-400 bg-clip-text text-transparent text-sm font-bold mb-2"
                htmlFor="name"
              >
                NFT Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="name"
                type="text"
                placeholder="Axie#4563"
                onChange={(e) =>
                  updateFormParams({ ...formParams, name: e.target.value })
                }
              />
            </div>
            <div className="mb-6">
              <label
                className="block bg-gradient-to-r from-purple-900 to-violet-400 bg-clip-text text-transparent text-sm font-bold mb-2"
                htmlFor="description"
              >
                NFT Description
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="description"
                placeholder="Axie Infinity Collection"
                onChange={(e) =>
                  updateFormParams({
                    ...formParams,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-6">
              <label
                className="block bg-gradient-to-r from-purple-900 to-violet-400 bg-clip-text text-transparent text-sm font-bold mb-2"
                htmlFor="price"
              >
                Price (in ETH)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="number"
                placeholder="Min 0.01 ETH"
                step="0.01"
                onChange={(e) =>
                  updateFormParams({ ...formParams, price: e.target.value })
                }
              />
            </div>
            <div className="mb-6">
              <label
                className="block bg-gradient-to-r from-purple-900 to-violet-400 bg-clip-text text-transparent text-sm font-bold mb-2"
                htmlFor="image"
              >
                Upload Image (&lt;1000 KB)
              </label>
              <div className="flex items-center justify-between bg-gray-100 border-2 border-gray-200 rounded-md py-2 px-4">
                <input type={"file"} onChange={OnChangeFile} />
              </div>
            </div>
            <div className="text-red-500 text-sm mb-4 text-center">
              {message}
            </div>
            {enableButton ? (
              <button
                className="w-full bg-purple-600 hover:bg-purple-700 bg-gradient-to-r from-purple-900 to-violet-400 bg-clip-text text-transparent font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={(e) => addNftToCollection(e, contractAddress)}
              >
                Create NFT
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-gray-400 text-white font-bold py-2 px-4 rounded cursor-not-allowed"
              >
                Create NFT
              </button>
            )}
          </form>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-yellow-800 to-yellow-400 bg-clip-text text-transparent">
            Your NFTs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nftsData.length > 0 ? (
              nftsData.map((value, index) => (
                <NFTCard data={value} key={index} className="hover:shadow-lg" />
              ))
            ) : (
              <div className="flex items-center justify-center h-48 bg-gray-200 rounded-lg">
                <p className="text-xl">Loading your NFTs...</p>
              </div>
            )}
          </div>
        </div>
      </>
    </>
  );
};

export default dynamic(() => Promise.resolve(NFTCollectionPage), {
  ssr: false,
});
