"use client";
import React from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../utils/pinata";
import { useState } from "react";
import { useContractRead, useContractWrite, useAccount } from "wagmi";
import { writeContract } from "wagmi/actions";
import nftMarketPlaceABI from "../abis/nftMarketPlaceABI.json";
import { parseEther } from "viem";
const Page = () => {
  const contractAddress = "0x424778313C58D929B8D948d28e4D70dBB742b135";
  const [formParams, updateFormParams] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [fileURL, setFileURL] = useState(null);
  const [message, updateMessage] = useState("");

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

  const {data:listingPrice}  = useContractRead({
    address: contractAddress,
    abi: nftMarketPlaceABI,
    functionName: "getListPrice",
  });

  const listedPrice = listingPrice?.toString();
console.log(listedPrice);

  async function OnChangeFile(e: any) {
    var file = e.target.files[0];
    //check for file extension
    try {
      //upload the file to IPFS

      const response = await uploadFileToIPFS(file);
      if (response.success === true) {
        console.log("Uploaded image to Pinata: ", response.pinataURL);
        setFileURL(response.pinataURL);
      }
    } catch (e) {
      console.log("Error during file upload", e);
    }
  }
  async function uploadMetadataToIPFS() {
    const { name, description, price } = formParams;
    //Make sure that none of the fields are empty
    if (!name || !description || !price || !fileURL) {
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
    <div className="flex flex-col place-items-center mt-10" id="nftForm">
      <form className="bg-white shadow-md rounded px-8 pt-4 pb-8 mb-4">
        <h3 className="text-center font-bold text-purple-500 mb-8">
          Upload your NFT to the marketplace
        </h3>
        <div className="mb-4">
          <label
            className="block text-purple-500 text-sm font-bold mb-2"
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
          ></input>
        </div>
        <div className="mb-6">
          <label
            className="block text-purple-500 text-sm font-bold mb-2"
            htmlFor="description"
          >
            NFT Description
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            cols="40"
            rows="5"
            id="description"
            type="text"
            placeholder="Axie Infinity Collection"
            onChange={(e) =>
              updateFormParams({ ...formParams, description: e.target.value })
            }
          ></textarea>
        </div>
        <div className="mb-6">
          <label
            className="block text-purple-500 text-sm font-bold mb-2"
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
          ></input>
        </div>
        <div>
          <label
            className="block text-purple-500 text-sm font-bold mb-2"
            htmlFor="image"
          >
            Upload Image (&lt;500 KB)
          </label>
          <input type={"file"} onChange={OnChangeFile}></input>
        </div>
        <br></br>
        <div className="text-red-500 text-center">{message}</div>
        <button
          className="font-bold mt-10 w-full bg-purple-500 text-white rounded p-2 shadow-lg"
          id="list-button"
          onClick={createNFT}
        >
          Create NFT
        </button>
      </form>
    </div>
  );
};

export default Page;
