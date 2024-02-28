"use client";
import React, { useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import NFTCard from "../components/NFTCard";
import {
  marketPlaceAddress,
  collectionFactoryAddress,
} from "../utils/constants";
import nftMarketPlaceABI from "../abis/nftMarketPlaceABI.json";
import { useContractRead, useContractWrite, useAccount } from "wagmi";
import { readContract } from "wagmi/actions";
import { formatEther } from "viem";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import collectionFactoryABI from "../abis/collectionFactoryABI.json";
import collectionABI from "../abis/collectionABI.json";
import NFTCollectionCard from "../components/NFTCollectionCard";
import CollectionNftCard from "../components/CollectionNftCard";
const ProfilePage = () => {
  const [nftData, updateData] = useState([]);
  const [collectionNftData, updateCollectionNftData] = useState([]);
  const [collectionData, updateCollectionData] = useState([]);
  const [collectionArray, updateCollectionArray] = useState([]);
  const [collectionNFTArray, updateCollectionNFTArray] = useState([]);
  const [dataFetched, updateFetched] = useState(false);
  const [collectionDataFetched, collectionUpdateFetched] = useState(false);

  const [totalPrice, updateTotalPrice] = useState("0");
  const account = useAccount();

  useEffect(() => {
    const fetchData = async () => {
      if (!dataFetched && !collectionDataFetched) {
        await getNFTData();
        await getCollectionData();
        await getCollectionNFTData();
      }
    };

    fetchData();
  }, []);

  async function collectionNftArrayPush(i) {
    let collectionNFT = await readContract({
      address: collectionArray[i],
      abi: collectionABI,
      functionName: "getAllNFTs",
    });
    collectionNFTArray.push(
      collectionNFT.filter((i) => i.seller == account.address)
    );
  }

  async function getCollectionNFTData() {
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
      collectionArray.push(collectionAddress);

      await collectionNftArrayPush(i);

      console.log(collectionNFTArray);
    }
    // console.log(collectionArray);

    // updateCollectionNFTArray(collectionNFTArray.filter((i) => i.seller == account.address));
    // console.log(collectionNFTArray)

    const items = await Promise.all(
      collectionNFTArray.flat().map(async (i) => {
        const tokenURI = await readContract({
          address: i.owner,
          abi: collectionABI,
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
          image: meta.image,
          name: meta.name,
          description: meta.description,
        };

        return item;
      })
    );
    updateCollectionNftData(items);

    updateFetched(true);
  }
  console.log(collectionNftData);
  // console.log(collectionNftData)

  async function getNFTData() {
    let sumPrice = 0;

    let transaction = await readContract({
      address: marketPlaceAddress,
      abi: nftMarketPlaceABI,
      functionName: "getAllNFTs",
    });
    // console.log(transaction[0].seller);
    transaction = transaction.filter((i) => i.seller == account.address);

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
          image: meta.image,
          name: meta.name,
          description: meta.description,
        };
        sumPrice += Number(price);
        return item;
      })
    );
    updateData(items);
    updateFetched(true);

    updateTotalPrice(sumPrice.toPrecision(3));
  }

  async function getCollectionData() {
    const numberOfCollections = await readContract({
      address: collectionFactoryAddress,
      abi: collectionFactoryABI,
      functionName: "numberOfCreatedCollectionPerUser",
      args: [account.address],
      account: account.address,
    });

    const data = await readContract({
      address: collectionFactoryAddress,
      abi: collectionFactoryABI,
      functionName: "getUserCollection",
      account: account.address,
    });

    let items = await Promise.all(
      data.slice(0, Number(numberOfCollections)).map(async (i) => {
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

  return (
    <>
      <div className="bg-gradient-to-r from-purple-950 to-violet-600 min-h-screen">
        <div className="container mx-auto px-2 md:px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-center bg-amber-400 bg-clip-text text-transparent py-6 ">
            Your NFT Profile
          </h1>
  
          <div className="bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg p-4 mb-4">
            <h2 className="text-lg md:text-2xl font-bold mb-2 text-white text-center">
              Wallet Address
            </h2>
            <p className="text-sm md:text-lg text-white text-center">{account.address}</p>
          </div>
  
          <div className="bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg p-4 mb-4">
            <h2 className="text-lg md:text-2xl font-bold mb-2 text-white text-center">
              No. of NFTs
            </h2>
            <p className="text-lg md:text-2xl text-white text-center">{nftData.length}</p>
          </div>
  
          <div className="bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg p-4 mb-4">
            <h2 className="text-lg md:text-2xl font-bold mb-2 text-white text-center">
              Total Value
            </h2>
            <p className="text-lg md:text-2xl text-white text-center">{totalPrice} ETH</p>
          </div>
  
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center bg-amber-400 bg-clip-text text-transparent py-6">
            Your NFTs
          </h2>
          <div className="flex flex-wrap justify-center pr-10">
            {nftData.length > 0 ? (
              nftData.map((value, index) => (
                <NFTCard data={value} key={index} className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4" />
              ))
            ) : (
              <div className="flex items-center justify-center h-24 bg-gray-200 rounded-lg">
                <p className="text-lg">Loading your NFTs...</p>
              </div>
            )}
          </div>
  
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center bg-amber-400 bg-clip-text text-transparent py-6">
            Your Collection NFTs
          </h2>
          <div className="flex flex-wrap justify-center pr-10">
            {collectionNftData.length > 0 ? (
              collectionNftData.map((value, index) => (
                <CollectionNftCard data={value} key={index} className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4" />
              ))
            ) : (
              <div className="flex items-center justify-center h-24 bg-gray-200 rounded-lg">
                <p className="text-lg">Loading your NFTs...</p>
              </div>
            )}
          </div>
  
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center bg-amber-400 bg-clip-text text-transparent py-6">
            Your NFT Collections
          </h2>
          <div className="flex flex-wrap justify-center pr-10">
            {collectionData.length > 0 ? (
              collectionData.map((value, index) => (
                <NFTCollectionCard data={value} key={index} className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4" />
              ))
            ) : (
              <div className="flex items-center justify-center h-24 bg-gray-200 rounded-lg">
                <p className="text-lg">Loading your NFTs...</p>
              </div>
            )}
          </div>
  
          {nftData.length === 0 && (
            <p className="text-center mt-4 text-lg text-gray-500">
              No NFTs found in your collection. Connect your wallet or start
              exploring NFTs to add them here!
            </p>
          )}
        </div>
      </div>
    </>
  );
  
};

export default dynamic(() => Promise.resolve(ProfilePage), {
  ssr: false,
});
