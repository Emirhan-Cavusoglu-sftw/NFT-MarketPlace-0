"use client";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { GetIpfsUrlFromPinata } from "../../utils/util";
import { marketPlaceAddress } from "../../utils/constants";
import axios from "axios";
import nftMarketPlaceABI from "../../abis/nftMarketPlaceABI.json";
import { readContract, writeContract } from "wagmi/actions";
import { useAccount } from "wagmi";
import { formatEther, parseEther } from "viem";
const NftInfoPage = () => {
  const account = useAccount();
  const [data, updateData] = useState({});
  const [dataFetched, updateDataFetched] = useState(false);
  const [message, updateMessage] = useState("");
  const [currAddress, updateCurrAddress] = useState("0x");
  async function buyNFT(tokenId) {
    try {
      const salePrice = parseEther(data.price);
      updateMessage("Buying the NFT... Please Wait (Upto 5 mins)");

      await writeContract({
        address: marketPlaceAddress,
        abi: nftMarketPlaceABI,
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
      address: marketPlaceAddress,
      abi: nftMarketPlaceABI,
      functionName: "tokenURI",
      args: [tokenId],
    });
    const listedNft = await readContract({
      address: marketPlaceAddress,
      abi: nftMarketPlaceABI,
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


  const params = useParams();
  const tokenId = params.id;

  if (!dataFetched) getNFTData(tokenId);

  if (typeof data.image == "string")
    data.image = GetIpfsUrlFromPinata(data.image);



  return (
    <main className="bg-gradient-to-r from-purple-950 to-violet-600 min-h-screen px-4 py-8">
    <div className="mt-10 flex items-center justify-center">
      <div className="overflow-hidden rounded-lg bg-gradient-to-r  from-amber-600 to-amber-400 shadow-lg">
        <img
          src={data.image}
          alt=""
          className="h-[400px] w-full object-cover"
        />
        <div className="px-6 py-4">
          <h2 className="mb-2 text-xl font-semibold text-white">{data.name}</h2>
          <p className="text-white">{data.description}</p>
        </div>
        <div className="px-6 py-4">
          <div className="text-white">
            Price: <span className="font-semibold">{data.price} ETH</span>
          </div>
          <div className="text-white">
            Owner: <span className="font-semibold">{(data.owner)}</span>
          </div>
          <div className="text-white">
            Seller: <span className="font-semibold">{(data.seller)}</span>
          </div>
        </div>
        <div className="flex items-center justify-center px-6 py-4">
          {currAddress !== data.owner && currAddress !== data.seller ? (
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
          ) : (
            <div className="font-semibold text-green-600">
              You are the owner of this NFT
            </div>
          )}
        </div>
      </div>
    </div>
  </main>
  );
};

export default NftInfoPage;
