"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { GetIpfsUrlFromPinata } from "../../../utils/util";
import { marketPlaceAddress } from "../../../utils/constants";
import axios from "axios";
import nftMarketPlaceABI from "../../../abis/nftMarketPlaceABI.json";
import collectionFactoryABI from "../../../abis/collectionFactoryABI.json";
import collectionABI from "../../../abis/collectionABI.json";
import { readContract, writeContract } from "wagmi/actions";
import { useAccount } from "wagmi";
import { formatEther, parseEther } from "viem";
import Link from "next/link";
import dynamic from "next/dynamic";
const NftInfoPage = () => {
  const contractAddress = useParams().address;
  const tokenId = useParams().id;
  const account = useAccount();
  const [data, updateData] = useState({});
  const [dataFetched, updateDataFetched] = useState(false);
  const [message, updateMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!dataFetched) {
        await getNFTData(tokenId);
      }
    };

    fetchData();
  }, []);

  async function buyNFT(tokenId) {
    try {
      const salePrice = parseEther(data.price);
      updateMessage("Buying the NFT... Please Wait (Upto 5 mins)");

      await writeContract({
        address: contractAddress,
        abi: collectionABI,
        functionName: "executeSale",
        args: [tokenId],
        value: salePrice,
      });

      alert("You successfully bought the NFT!");
      updateMessage("");
    } catch (e) {
      alert("Upload Error" + e);
    }
  }

  async function getNFTData(tokenId) {
    let tokenURI = await readContract({
      address: contractAddress,
      abi: collectionABI,
      functionName: "tokenURI",
      args: [tokenId],
    });
    const listedNft = await readContract({
      address: contractAddress,
      abi: collectionABI,
      functionName: "getListedNftForId",
      args: [tokenId],
    });
    tokenURI = GetIpfsUrlFromPinata(tokenURI);
    let meta = await axios.get(tokenURI);

    meta = meta.data;

    let item = {
      price: meta.price,
      tokenId: tokenId,
      seller: listedNft.seller,
      owner: listedNft.owner,
      image: meta.image,
      name: meta.name,
      description: meta.description,
    };

    updateData(item);
    updateDataFetched(true);
  }

  if (typeof data.image == "string")
    data.image = GetIpfsUrlFromPinata(data.image);

    return (
      <main className="bg-gradient-to-r from-purple-950 to-violet-600 min-h-screen px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg shadow-lg overflow-hidden w-full max-w-md">
            <img src={data.image} alt="" className="w-full h-48 object-cover" />
            <div className="px-6 py-4">
              <h2 className="text-xl font-semibold text-white mb-2">{data.name}</h2>
              <p className="text-white text-sm">{data.description}</p>
            </div>
            <div className="px-6 py-2">
              <div className="text-white text-sm">
                Price: <span className="font-semibold">{data.price} ETH</span>
              </div>
              <div className="text-white text-sm">
                Owner: <span className="font-semibold">{data.owner}</span>
              </div>
              <div className="text-white text-sm">
                Seller: <span className="font-semibold">{data.seller}</span>
              </div>
            </div>
            <div className="px-6 py-4 flex justify-center items-center">
              {account.address !== data.owner && account.address !== data.seller && (
                <button className="group relative  z-10 h-12 w-64 cursor-pointer 
                overflow-hidden rounded-md border-none bg-black p-2 text-xl font-bold text-white"
                onClick={() => buyNFT(tokenId)}
                >
                  Buy this NFT
                  <span className="absolute -left-2 -top-8 h-32 w-72 origin-bottom scale-x-0 transform rounded-full bg-purple-200 transition-transform duration-1000 group-hover:scale-x-100 group-hover:duration-500"></span>
                  <span className="absolute -left-2 -top-8 h-32 w-72 origin-bottom scale-x-0 transform rounded-full bg-purple-400 transition-transform duration-700 group-hover:scale-x-100 group-hover:duration-700"></span>
                  <span className="absolute -left-2 -top-8 h-32 w-72 origin-bottom scale-x-0 transform rounded-full bg-violet-800 transition-transform duration-500 group-hover:scale-x-100 group-hover:duration-1000"></span>
                  <span className="absolute -left-3 top-2.5 z-10 w-72 opacity-0 duration-100 group-hover:opacity-100 group-hover:duration-1000">
                  Buy this NFT
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    );
    
};

export default dynamic(() => Promise.resolve(NftInfoPage), {
  ssr: false,
});
