"use client";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import NFTCard from "../components/NFTCard";
import Link from "next/link";
import {
  collectionFactoryAddress,
  marketPlaceAddress,
} from "../utils/constants";
import nftMarketPlaceABI from "../abis/nftMarketPlaceABI.json";
import collectionFactoryABI from "../abis/collectionFactoryABI.json";
import collectionABI from "../abis/collectionABI.json";

import { useEffect, useState } from "react";
import { readContract } from "wagmi/actions";
import { formatEther } from "viem";
import axios from "axios";
import NFTCollectionCard from "../components/NFTCollectionCard";
export default function Home() {
  const [collectionData, updateCollectionData] = useState([]);
  const [collectionArray, updateCollectionArray] = useState([]);
  const [collectionDataFetched, collectionUpdateFetched] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!collectionDataFetched) {
        await getCollectionData();
      }
    };

    fetchData();
  }, []);

  async function getCollectionData() {
    let sumPrice = 0;

    let numberOfCollections = await readContract({
      address: collectionFactoryAddress,
      abi: collectionFactoryABI,
      functionName: "numberOfCreatedCollection",
    });

    for (let i = 0; i < Number(numberOfCollections); i++) {
      let collectionAddress = await readContract({
        address: collectionFactoryAddress,
        abi: collectionFactoryABI,
        functionName: "listOfNFTCollectionContracts",
        args: [i],
      });
      collectionArray.push(...collectionArray, collectionAddress);
      console.log(collectionArray);
    }

    const items = await Promise.all(
      collectionArray.map(async (i) => {
        const tokenURI = await readContract({
          address: i,
          abi: collectionABI,
          functionName: "collectionURI",
        });

        let meta = await axios.get(tokenURI);
        meta = meta.data;

        let item = {
          address: i,
          image: meta.image, // Access the 'data' property of the 'meta' object to get the image property
          name: meta.name,
          description: meta.description,
        };

        return item;
      })
    );
    updateCollectionData(items);
    collectionUpdateFetched(true);
  }
  console.log(collectionData);
  return (
<div className="bg-gradient-to-r from-purple-950 to-violet-600 min-h-screen">
  <div className="flex flex-col items-center justify-center pt-24">
    <div className="md:text-xl font-bold text-white">Top Collections</div>
    <div className="flex mt-5 justify-center items-center flex-wrap max-w-screen-xl pr-10">
      {collectionData?.map((value, index) => {
        return (
          <NFTCollectionCard data={value} key={index}></NFTCollectionCard>
        );
      })}
    </div>
  </div>
</div>

  );
}
