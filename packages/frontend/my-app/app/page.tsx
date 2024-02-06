"use client";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import NFTCard from "./components/NFTCard";
import Link from "next/link";
import nftMarketPlaceABI from "./abis/nftMarketPlaceABI.json";
import { useState } from "react";
import { readContract } from "wagmi/actions";
import { formatEther } from "viem";
import axios from "axios";
export default function Home() {
  const [data, updateData] = useState([]);
  const [dataFetched, updateFetched] = useState(false);
  const contractAddress = "0xbB6EB8CfA4790Aeb1AA6258c5A03DBD4f3Ac2386";

  async function getNFTData() {
    let transaction = await readContract({
      address: contractAddress,
      abi: nftMarketPlaceABI,
      functionName: "getAllNFTs",
    });

    const items = await Promise.all(
      transaction.map(async (i) => {
        const tokenURI = await readContract({
          address: contractAddress,
          abi: nftMarketPlaceABI,
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
    <div className="flex flex-col place-items-center mt-20">
      <div className="md:text-xl font-bold text-white">Top NFTs</div>

      <Link href={"/NftInfoPage"} className="text-white">
        <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
          {data?.map((value, index) => {
            return <NFTCard data={value} key={index}></NFTCard>;
          })}
        </div>
      </Link>
    </div>
  );
}
