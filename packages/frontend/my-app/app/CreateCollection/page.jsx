"use client";
import React from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../utils/pinata";
import { collectionFactoryAddress } from "../utils/constants";
import { useState } from "react";
import { useContractRead, useContractWrite, useAccount } from "wagmi";
import { writeContract } from "wagmi/actions";

import collectionFactoryABI from "../abis/collectionFactoryABI.json";
import { parseEther, formatEther } from "viem";
const Page = () => {
  const contractAddress = "0xbB6EB8CfA4790Aeb1AA6258c5A03DBD4f3Ac2386";
  const [formParams, updateFormParams] = useState({
    name: "",
    symbol: "",
    price: "",
    description: "",
  });
  const [fileURL, setFileURL] = useState(null);
  const [message, updateMessage] = useState("");
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [enableButton, setEnableButton] = useState(false);
  const account = useAccount();

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
          "Image uploaded successfully! you can now click on Create NFT!"
        );
        setEnableButton(true);
      }
    } catch (e) {
      console.log("Error during file upload", e);
    }
  }
  async function uploadMetadataToIPFS() {
    const { name, symbol, price,description } = formParams;
    //Make sure that none of the fields are empty
    if (!name || !symbol || !price || !description || !isFileUploaded) {
      updateMessage("Please fill all the fields!");
      return -1;
    }

    const nftJSON = {
      name,
      symbol,
      price,
      description,

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

  async function createNFTCollection(e) {
    e.preventDefault();

    try {
      const metadataURL = await uploadMetadataToIPFS();
      if (metadataURL === -1) return;

      updateMessage(
        "Uploading NFT(takes 5 mins).. please dont click anything!"
      );

      const symbol = formParams.symbol;
      const name = formParams.name;
      const price = parseEther(formParams.price);

      await writeContract({
        address: collectionFactoryAddress,
        abi: collectionFactoryABI,
        functionName: "createNFTCollectionContract",
        args: [name, symbol, metadataURL, price,account.address],
      });

      alert("Successfully listed your NFT!");
      window.location.replace("/");
    } catch (e) {
      alert("Upload error" + e);
    }
  }

  return (
    <main className="bg-gradient-to-r from-purple-950 to-violet-600 min-h-screen px-4 py-8">
    <div className="flex flex-col items-center  ">
      <form className="border-r-8 border-b-8 border-black w-full max-w-lg bg-gradient-to-r from-amber-600 to-amber-400 shadow-md rounded-lg px-8 pt-6 pb-8 mb-4 ">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-900 to-violet-500 bg-clip-text text-transparent mb-8 text-center">
          Create Your Own NFT Collection
        </h2>
        <div className="mb-6">
          <label
            className="block 
            text-white bg-clip-text text-transparent text-sm  mb-2"
            htmlFor="name"
          >
            Collection Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3  bg-gray-200 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            placeholder=""
            onChange={(e) =>
              updateFormParams({ ...formParams, name: e.target.value })
            }
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-white bg-clip-text text-transparent text-sm mb-2"
            htmlFor="description"
          >
            Collection Symbol
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-200 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            placeholder=""
            onChange={(e) =>
              updateFormParams({ ...formParams, symbol: e.target.value })
            }
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-white bg-clip-text text-transparent text-sm mb-2"
            htmlFor="description"
          >
            NFT Description
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-200 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            placeholder=""
            onChange={(e) =>
              updateFormParams({ ...formParams, description: e.target.value })
            }
          />
        </div>
        <div className="mb-6">
          <label
            className="block  bg-clip-text text-white text-transparent text-sm  mb-2"
            htmlFor="price"
          >
            Price (in ETH)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-200 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            placeholder="ETH"
            step="0.01"
            onChange={(e) =>
              updateFormParams({ ...formParams, price: e.target.value })
            }
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-white bg-clip-text text-transparent text-sm  mb-2"
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
            className="w-full bg-gradient-to-r from-purple-900 to-violet-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={createNFTCollection}
          >
            Create NFT Collection
          </button>
        ) : (
          <button
            disabled
            className="w-full bg-gray-400 text-white font-bold py-2 px-4 rounded cursor-not-allowed"
          >
            Create NFT Collection
          </button>
        )}
      </form>
    </div>
  </main>
  );
};

export default Page;
