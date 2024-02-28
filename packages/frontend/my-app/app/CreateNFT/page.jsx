"use client";
import React from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../utils/pinata";
import { marketPlaceAddress } from "../utils/constants";
import { useState } from "react";
import { useContractRead, useContractWrite, useAccount } from "wagmi";
import { writeContract } from "wagmi/actions";
import nftMarketPlaceABI from "../abis/nftMarketPlaceABI.json";
import { parseEther, formatEther } from "viem";
const Page = () => {
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

  const { data: listingPrice } = useContractRead({
    address: marketPlaceAddress,
    abi: nftMarketPlaceABI,
    functionName: "getListPrice",
  });

  // const listedPrice = listingPrice?.toString();
  const listedPrice = listingPrice;
  // console.log(listedPrice);

  async function OnChangeFile(e) {
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

  async function createNFT(e) {
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
        address: marketPlaceAddress,
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
    <main className="bg-gradient-to-r from-purple-950 to-violet-600 min-h-screen px-4 py-8">
      <div className="flex flex-col items-center">
        <form className="border-r-8 border-b-8 border-black w-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-md rounded-lg px-8 pt-6 pb-8 mx-auto max-w-md">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-900 to-violet-500 bg-clip-text text-transparent mb-8 text-center">
            Upload Your NFT to the Marketplace
          </h2>
          <div className="mb-4">
            <label
              className="block text-white text-transparent text-sm mb-2"
              htmlFor="name"
            >
              NFT Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-200 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder=""
              onChange={(e) =>
                updateFormParams({ ...formParams, name: e.target.value })
              }
            />
          </div>
          <div className="mb-4">
            <label
              className="block bg-clip-text text-white text-transparent text-sm mb-2"
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
          <div className="mb-4">
            <label
              className="block bg-clip-text text-white text-transparent text-sm mb-2"
              htmlFor="price"
            >
              Price (in ETH)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-200 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="number"
              placeholder="Min 0.01 ETH"
              step="0.01"
              onChange={(e) =>
                updateFormParams({ ...formParams, price: e.target.value })
              }
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-white text-transparent text-sm mb-2"
              htmlFor="image"
            >
              Upload Image (&lt;1000 KB)
            </label>
            <div className="flex items-center justify-between bg-gray-200 border-2 border-gray-200 rounded-md py-2 px-4">
              <input type="file" onChange={OnChangeFile} />
            </div>
          </div>
          <div className="text-red-500 text-xs mb-4 text-center">{message}</div>
          {enableButton ? (
            <button
              className="w-full bg-gradient-to-r from-purple-900 to-violet-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-2"
              onClick={createNFT}
            >
              Create NFT
            </button>
          ) : (
            <button
              disabled
              className="w-full bg-gray-400 text-white font-bold py-2 px-4 rounded cursor-not-allowed mb-2"
            >
              Create NFT
            </button>
          )}
        </form>
      </div>
    </main>
  );
  
};

export default Page;
