"use client";
import React from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../utils/pinata";
import { useState } from "react";
import { useContractRead, useContractWrite, useAccount } from "wagmi";
import { writeContract } from "wagmi/actions";
import nftMarketPlaceABI from "../abis/nftMarketPlaceABI.json";
import { parseEther, formatEther } from "viem";
const Page = () => {
  const contractAddress = "0xbB6EB8CfA4790Aeb1AA6258c5A03DBD4f3Ac2386";
  const [formParams, updateFormParams] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [fileURL, setFileURL] = useState(null);
  const [message, updateMessage] = useState("");
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [enableButton, setEnableButton] = useState(false);

  // WAGMI HOOKS
  const {
    data: dataPay,
    isLoading: loadingPay,
    isSuccess: successPay,
    write: createToken,
  } = useContractWrite({
    address: contractAddress,
    abi: nftMarketPlaceABI,
    functionName: "createToken",
  });

  const { data: listingPrice } = useContractRead({
    address: contractAddress,
    abi: nftMarketPlaceABI,
    functionName: "getListPrice",
  });

  // const listedPrice = listingPrice?.toString();
  const listedPrice= listingPrice
  // console.log(listedPrice);

  async function OnChangeFile(e: any) {
    var file = e.target.files[0];
    //check for file extension
    try {
      //upload the file to IPFS
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
  async function uploadMetadataToIPFS() {
    const { name, description, price } = formParams;
    //Make sure that none of the fields are empty
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
      //upload the metadata JSON to IPFS
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success === true) {
        console.log("Uploaded JSON to Pinata: ", response);
        return response.pinataURL;
      }
    } catch (e) {
      console.log("error uploading JSON metadata:", e);
    }
  }

  async function createNFT(e: any) {
    e.preventDefault();

    try {
      const metadataURL = await uploadMetadataToIPFS();
      if (metadataURL === -1) return;

      updateMessage(
        "Uploading NFT(takes 5 mins).. please dont click anything!"
      );

      const price = parseEther(formParams.price);

      console.log("listedPrice", listedPrice);

      await writeContract({
        address: contractAddress,
        abi: nftMarketPlaceABI,
        functionName: "createToken",
        args: [metadataURL, price],
        value: listedPrice,
      });
      // await transaction.wait()

      alert("Successfully listed your NFT!");

      window.location.replace("/");
    } catch (e) {
      alert("Upload error" + e);
    }
  }

  return (
    <div className="flex flex-col items-center mt-10 ">
      <form className="w-full max-w-lg bg-gradient-to-r from-yellow-800 to-yellow-400 shadow-md rounded-lg px-8 pt-6 pb-8 mb-4 ">
        <h2 className="text-3xl font-bold text-purple-600 mb-8 text-center">
          Upload Your NFT to the Marketplace
        </h2>
        <div className="mb-6">
          <label
            className="block text-purple-600 text-sm font-bold mb-2"
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
            className="block text-purple-600 text-sm font-bold mb-2"
            htmlFor="description"
          >
            NFT Description
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            placeholder="Axie Infinity Collection"
            onChange={(e) =>
              updateFormParams({ ...formParams, description: e.target.value })
            }
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-purple-600 text-sm font-bold mb-2"
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
            className="block text-purple-600 text-sm font-bold mb-2"
            htmlFor="image"
          >
            Upload Image (&lt;1000 KB)
          </label>
          <div className="flex items-center justify-between bg-gray-100 border-2 border-gray-200 rounded-md py-2 px-4">
          <input type={"file"} onChange={OnChangeFile} />
          </div>
        </div>
        <div className="text-red-500 text-sm mb-4 text-center">{message}</div>
        {enableButton ? (
          <button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={createNFT}
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
  );
  
};

export default Page;
