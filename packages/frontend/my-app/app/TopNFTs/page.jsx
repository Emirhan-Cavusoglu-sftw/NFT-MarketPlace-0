"use client";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import NFTCard from "../components/NFTCard";
import Link from "next/link";
import nftMarketPlaceABI from "../abis/nftMarketPlaceABI.json";
import { marketPlaceAddress } from "../utils/constants";
import { useState } from "react";
import { readContract } from "wagmi/actions";
import { formatEther } from "viem";
import axios from "axios";
export default function Home() {
  const [data, updateData] = useState([]);
  const [dataFetched, updateFetched] = useState(false);

  async function getNFTData() {
    let transaction = await readContract({
      address: marketPlaceAddress,
      abi: nftMarketPlaceABI,
      functionName: "getAllNFTs",
    });

    const items = await Promise.all(
      transaction.map(async (i) => {
        const tokenURI = await readContract({
          address: marketPlaceAddress,
          abi: nftMarketPlaceABI,
          functionName: "tokenURI",
          args: [i.tokenId],
        });

        let meta = await axios.get(tokenURI);
        meta = meta.data;
        console.log(meta);

        let price = formatEther(i.price.toString());
        let item = {
          price,
          tokenId: i.tokenId,
          seller: i.seller,
          owner: i.owner,
          image: meta.image, // Access the 'data' property of the 'meta' object to get the image property
          name: meta.name,
          description: meta.description,
        };

        return item;
      })
    );
    updateData(items);
    updateFetched(true);
  }
  if (!dataFetched) getNFTData();
  return (
    <div className="bg-gradient-to-r from-purple-950 to-violet-600  min-h-screen">
    <div className="flex flex-col items-center justify-center pt-24">
      <div className="md:text-xl font-bold text-white">Top NFTs</div>

      <div className="flex mt-5 flex-wrap justify-center items-center max-w-screen-xl pr-10">
        {data?.map((value, index) => {
          return <NFTCard data={value} key={index}></NFTCard>;
        })}
      </div>
    </div>
    </div>
  );
}
