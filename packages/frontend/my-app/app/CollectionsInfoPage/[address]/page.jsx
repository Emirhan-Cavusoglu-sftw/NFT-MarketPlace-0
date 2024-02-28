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
import { readContract, waitForTransaction, writeContract } from "wagmi/actions";
import { useAccount, useContractRead } from "wagmi";
import { formatEther, parseEther } from "viem";
import { uploadFileToIPFS, uploadJSONToIPFS } from "@/app/utils/pinata";
import NFTCard from "@/app/components/NFTCard";
import dynamic from "next/dynamic";
import CollectionNftCard from "@/app/components/CollectionNftCard";

import Offers from "@/app/components/Offers";
const NFTCollectionPage = () => {
  const [formParams, updateFormParams] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [offerParams, updateOfferParams] = useState({
    price: "",
  });
  const [isOfferAccepted, setIsOfferAccepted] = useState(false);
  const [infoPopup, setInfoPopup] = useState(false);
  const [offerArray, setOfferArray] = useState([]);
  const [finalInfoPopup, setFinalInfoPopup] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [nftsData, updateNFTsData] = useState([]);
  const [dataFetched, updateDataFetched] = useState(false);
  const [offerDataFetched, updateOfferDataFetched] = useState(false);
  const [offerData, updateOfferData] = useState([]);

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

  const { data: collectionPrice } = useContractRead({
    address: contractAddress,
    abi: collectionABI,
    functionName: "collectionPrice",
  });

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
      if (!dataFetched && !nftdataFetched && !offerDataFetched) {
        await getNFTsData(contractAddress);
        await getNFTCollectionData(contractAddress);
        await getOfferData(contractAddress);
      }
    };

    fetchData();
  }, []);

  async function getOfferData(contractAddress) {
    let isOfferAccepted = await readContract({
      address: contractAddress,
      abi: collectionABI,
      functionName: "isOfferAccepted",
      args: [account.address],
      account: account.address,
    });

    let offerLength = await readContract({
      address: contractAddress,
      abi: collectionABI,
      functionName: "getOffersLengths",
    });

    for (let i = 0; i < offerLength; i++) {
      let offer = await readContract({
        address: contractAddress,
        abi: collectionABI,
        functionName: "offers",
        args: [i],
      });
      let offerItem = {
        address: offer[0],
        price: offer[1],
      };

      setOfferArray((offerArray) => [...offerArray, offerItem]);
    }

    setIsOfferAccepted(isOfferAccepted);
    updateDataFetched(true);
  }

  async function makeAnOffer(contractAddress, price) {
    await writeContract({
      address: contractAddress,
      abi: collectionABI,
      functionName: "makeOffer",
      account: account.address,
      args: [price],
    });
  }

  async function getNFTsData(contractAddress) {
    let transaction = await readContract({
      address: contractAddress,
      abi: collectionABI,
      functionName: "getAllNFTs",
    });

    const items = await Promise.all(
      transaction.map(async (i) => {
        const tokenURI = await readContract({
          address: contractAddress,
          abi: collectionABI,
          functionName: "tokenURI",
          args: [i.tokenId],
        });

        let meta = await axios.get(tokenURI);
        meta = meta.data;

        let price = formatEther(i.price.toString());
        let item = {
          price,
          collectionAddress: contractAddress,
          tokenId: i.tokenId,
          seller: i.seller,
          owner: i.owner,
          image: meta.image,
          name: meta.name,
          description: meta.description,
        };

        return item;
      }),
    );
    updateNFTsData(items);
    updateNftDataFetched(true);
  }
  // console.log(parseEther(formatEther(collectionPrice)))
  // console.log(formatEther(collectionPrice))
  async function buyNFTCollection(contractAddress) {
    try {
      const price = parseEther(formatEther(collectionPrice));
      setInfoPopup(true);

      const { hash } = await writeContract({
        address: contractAddress,
        abi: collectionABI,
        functionName: "sellTheCollection",
        account: account.address,
        value: collectionPrice,
      });
      await waitForTransaction({ hash });

      await writeContract({
        address: collectionFactoryAddress,
        abi: collectionFactoryABI,
        functionName: "updateUserData",
        account: account.address,
        args: [id],
      });
      setInfoPopup(false);
      setFinalInfoPopup(true);
    } catch (e) {
      alert("Upload Error" + e);
    }
  }

  async function getNFTCollectionData(contractAddress) {
    let tokenURI = await readContract({
      address: contractAddress,
      abi: collectionABI,
      functionName: "collectionURI",
    });

    let collectionPrice = await readContract({
      address: contractAddress,
      abi: collectionABI,
      functionName: "collectionPrice",
    });
    let owner = await readContract({
      address: contractAddress,
      abi: collectionABI,
      functionName: "owner",
    });

    tokenURI = GetIpfsUrlFromPinata(tokenURI);
    let meta = await axios.get(tokenURI);

    meta = meta.data;

    let item = {
      owner: owner,
      price: collectionPrice,
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
  async function OnChangeFile(e) {
    var file = e.target.files[0];

    try {
      updateMessage("Uploading image to IPFS.. please wait!");
      const response = await uploadFileToIPFS(file);
      if (response.success === true) {
        console.log("Uploaded image to Pinata: ", response.pinataURL);
        setFileURL(response.pinataURL);
        setIsFileUploaded(true);
        updateMessage(
          "Image uploaded successfully! you can now click on Create NFT!",
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
        "Uploading NFT(takes 5 mins).. please dont click anything!",
      );

      const price = parseEther(formParams.price);

      await writeContract({
        address: contractAddress,
        abi: collectionABI,
        functionName: "createToken",
        args: [metadataURL, price],
        value: listedPrice,
        account: account.address,
      });

      alert("Successfully listed your NFT!");
    } catch (e) {
      alert("Upload error" + e);
    }
  }

  if (typeof data.image == "string")
    data.image = GetIpfsUrlFromPinata(data.image);

    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-950  to-violet-600 px-4 py-8">
        <div className="flex flex-col items-center justify-center ">
          <div className="overflow-hidden rounded-lg bg-gradient-to-r  from-amber-600 to-amber-400 shadow-lg w-full sm:max-w-md">
            <img src={data.image} alt="" className="h-64 w-full object-cover" />
            <div className="px-6 py-4">
              <h2 className="mb-2 text-xl font-semibold text-white">
                {data.name}
              </h2>
              <p className="text-white">{data.description}</p>
            </div>
            <div className="px-6 py-4">
              <div className="text-white">
                Total Volume:{" "}
                <span className="font-semibold">
                  {totalPrice == undefined ? 0 : formatEther(totalPrice)}
                  ETH
                </span>
              </div>
              <div className="text-white">
                Owner: <span className="font-semibold">{data.owner}</span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center px-6 py-4 text-center">
              {data.owner !== account.address && (
                <div className="flex flex-col space-y-5 w-full">
                  {" "}
                  <input
                    className="focus:shadow-outline w-full appearance-none rounded border bg-gray-200 px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                    type="number"
                    placeholder="ETH"
                    step="0.01"
                    onChange={(e) =>
                      updateOfferParams({ price: e.target.value })
                    }
                  />
                  <button
                    className="mt-3 rounded-full bg-gradient-to-r from-purple-900 to-violet-600 py-2 text-sm font-bold text-white w-full"
                    onClick={() =>
                      makeAnOffer(
                        contractAddress,
                        parseEther(offerParams.price),
                      )
                    }
                  >
                    Make an Offer
                  </button>
                </div>
              )}
    
              {data.owner == account.address && (
                <div>
                  <p>YOU ARE THE OWNER OF THIS COLLECTION</p>
                  <button
                    className="focus:shadow-outline rounded-full bg-gradient-to-r from-purple-900 to-violet-600 px-4 py-2 font-bold text-white focus:outline-none mt-3 w-full"
                    onClick={() => setShowPopup(true)}
                  >
                    Add NFT to Your Collection
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center px-6 py-4">
              {isOfferAccepted && (
                <button
                  className="rounded-full bg-[#7D3799] px-4 py-2 text-sm font-bold text-white hover:bg-purple-900"
                  onClick={() => buyNFTCollection(contractAddress)}
                >
                  Your offer accepted click to buy this collection
                </button>
              )}
            </div>
          </div>
          <div className="mt-10 h-24  w-full max-w-md space-y-4 overflow-y-scroll bg-transparent pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white">
            {offerArray.length > 0 ? (
              offerArray.map((value, index) => (
                <Offers
                  data={value}
                  contractAddress={contractAddress}
                  collectionOwner={data.owner}
                  key={index}
                />
              ))
            ) : (
              <div className="flex h-48 flex-col items-center justify-center rounded-lg bg-gray-200">
                <p className="text-xl">There is No Offer</p>
              </div>
            )}
          </div>
        </div>
    
        {infoPopup && (
          <div className="h-50 w-50 fixed inset-0 flex items-center justify-center rounded-lg bg-red-800 p-2 shadow-lg">
            <p className="text-white">
              Buying the NFT... Please Wait (Upto 5 mins)
            </p>
          </div>
        )}
        {finalInfoPopup && (
          <div className="h-50 w-50 fixed inset-0 flex flex-col items-center justify-center rounded-lg bg-green-700 p-2 shadow-lg">
            <p className="text-black">
              Your NFT collection has been bought successfully!
            </p>
            <button className="" onClick={() => window.location.reload()}>
              {" "}
              ✕{" "}
            </button>
          </div>
        )}
    
        <>
          <div className="flex flex-col items-center justify-center text-center">
            <>
              {showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
                  <div className="rounded-lg bg-gradient-to-r from-amber-600 to-amber-400 p-8 shadow-lg w-full max-w-md">
                    <button
                      className="ml-auto flex "
                      onClick={() => setShowPopup(false)}
                    >
                      ✕
                    </button>
                    <h2 className="mb-4 bg-gradient-to-r from-purple-900 to-violet-500 bg-clip-text text-2xl font-bold text-transparent">
                      Upload Your NFT to the Marketplace
                    </h2>
                    <div className="mb-6">
                      <label
                        className="mb-2 block text-sm text-transparent text-white"
                        htmlFor="name"
                      >
                        NFT Name
                      </label>
                      <input
                        className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
                        id="name"
                        type="text"
                        placeholder=""
                        onChange={(e) =>
                          updateFormParams({
                            ...formParams,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="mb-6">
                      <label
                        className="mb-2 block text-sm text-transparent text-white"
                        htmlFor=""
                      >
                        NFT Description
                      </label>
                      <textarea
                        className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
                        id="description"
                        placeholder=""
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
                        className="mb-2 block text-sm text-transparent text-white"
                        htmlFor="price"
                      >
                        Price (in ETH)
                      </label>
                      <input
                        className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                        type="number"
                        placeholder="Min 0.01 ETH"
                        step="0.01"
                        onChange={(e) =>
                          updateFormParams({
                            ...formParams,
                            price: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="mb-6">
                      <label
                        className="mb-2 block text-sm text-transparent text-white"
                        htmlFor="image"
                      >
                        Upload Image (&lt;1000 KB)
                      </label>
                      <div className="flex items-center justify-between rounded-md border-2 border-gray-200 bg-gray-100 px-4 py-2">
                        <input type={"file"} onChange={OnChangeFile} />
                      </div>
                    </div>
                    <div className="mb-4 text-center text-sm text-red-500">
                      {message}
                    </div>
                    {enableButton ? (
                      <button
                        className="focus:shadow-outline w-full rounded bg-gradient-to-r from-purple-900 to-violet-400 px-4 py-2 font-bold text-white focus:outline-none"
                        onClick={(e) => {
                          addNftToCollection(e, contractAddress);
                        }}
                      >
                        Create NFT
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full cursor-not-allowed rounded bg-gray-400 px-4 py-2 font-bold text-white"
                      >
                        Create NFT
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
            <div className="flex flex-col items-center justify-center text-center">
              <h2 className="mb-8 mt-10 bg-amber-400  bg-clip-text text-2xl font-bold text-transparent">
                Collection NFTs
              </h2>
              <div className="grid grid-cols-1 items-center justify-center gap-4 text-center md:grid-cols-2 lg:grid-cols-3 pr-10">
                {nftsData.length > 0 ? (
                  nftsData.map((value, index) => (
                    <CollectionNftCard
                      data={value}
                      key={index}
                      className="hover:shadow-lg"
                    />
                  ))
                ) : (
                  <div className="flex flex-row items-center    justify-center gap-2">
                    <div className="h-4 w-4 animate-bounce rounded-full bg-amber-400 [animation-delay:.7s]"></div>
                    <div className="h-4 w-4 animate-bounce rounded-full bg-amber-400 [animation-delay:.3s]"></div>
                    <div className="h-4 w-4 animate-bounce rounded-full bg-amber-400 [animation-delay:.7s]"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      </div>
    );
    
};

export default dynamic(() => Promise.resolve(NFTCollectionPage), {
  ssr: false,
});
