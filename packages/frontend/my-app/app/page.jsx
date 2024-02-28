"use client";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import NFTCard from "./components/NFTCard";
import Link from "next/link";
import {
  collectionFactoryAddress,
  marketPlaceAddress,
} from "./utils/constants";
import nftMarketPlaceABI from "./abis/nftMarketPlaceABI.json";
import collectionFactoryABI from "./abis/collectionFactoryABI.json";
import collectionABI from "./abis/collectionABI.json";

import { useEffect, useState } from "react";
import { readContract } from "wagmi/actions";
import { formatEther } from "viem";
import axios from "axios";
import NFTCollectionCard from "./components/NFTCollectionCard";

export default function Home() {
  const [data, updateData] = useState([]);
  const [dataFetched, updateFetched] = useState(false);
  const array = [];
  const [collectionData, updateCollectionData] = useState([]);
  const [collectionArray, updateCollectionArray] = useState([]);
  const [collectionDataFetched, collectionUpdateFetched] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!dataFetched && !collectionDataFetched) {
        await getCollectionData();
        await getNFTData();
      }
    };

    fetchData();
  }, []);

  async function getCollectionData() {
    let sumPrice = 0;
    console.log("Getting Collection Data");
    let numberOfCollections = await readContract({
      address: collectionFactoryAddress,
      abi: collectionFactoryABI,
      functionName: "numberOfCreatedCollection",
    });
    console.log(Number(numberOfCollections));
    for (let i = 0; i < Number(numberOfCollections); i++) {
      let collectionAddress = await readContract({
        address: collectionFactoryAddress,
        abi: collectionFactoryABI,
        functionName: "listOfNFTCollectionContracts",
        args: [i],
      });
      array.push(collectionAddress);
      console.log(array);
      collectionArray.push(array.pop());
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
          image: meta.image,
          name: meta.name,
          description: meta.description,
        };

        return item;
      })
    );
    updateCollectionData(items);
    collectionUpdateFetched(true);
  }
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
    updateData(items.slice(0, 10));
    updateFetched(true);
  }

  return (
    <div className="bg-gradient-to-r from-purple-950 to-violet-600  min-h-screen">
      <div className="flex flex-col items-center justify-center py-12">
        <Link href={"/TopNFTs"}>
          <div className="text-xl font-bold text-white mb-4 cursor-pointer">Top NFTs</div>
        </Link>

        <div className="flex justify-center flex-wrap max-w-screen-2xl pr-10">
          {data?.map((value, index) => {
            return <NFTCard data={value} key={index}></NFTCard>;
          })}
        </div>

        <Link href={"/TopCollections"}>
          <div className="text-xl font-bold text-white mt-5 cursor-pointer">Top Collections</div>
        </Link>

        <div className="flex justify-center flex-wrap max-w-screen-2xl pr-10">
          {collectionData?.map((value, index) => {
            return <NFTCollectionCard data={value} key={index}></NFTCollectionCard>;
          })}
        </div>
      </div>
    </div>
  );
}
