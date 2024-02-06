"use client"
import React from "react";
import axios from "axios";
import { useState } from "react";
import NFTCard from "../components/NFTCard";
import nftMarketPlaceABI from "../abis/nftMarketPlaceABI.json";
import { useContractRead, useContractWrite, useAccount } from "wagmi";
import { readContract } from "wagmi/actions";
import { formatEther } from 'viem'
import { useParams } from "next/navigation";

const ProfilePage = () => {
    const contractAddress = "0x424778313C58D929B8D948d28e4D70dBB742b135";
    const [data, updateData] = useState([]);
    const [dataFetched, updateFetched] = useState(false);
    const [address, updateAddress] = useState("0x");
    const [totalPrice, updateTotalPrice] = useState("0");
    const account  = useAccount();

    const { data: listingPrice } = useContractRead({
        address: contractAddress,
        abi: nftMarketPlaceABI,
        functionName: "getAllNFTs",
      });

      
    
      async function getNFTData(tokenId) {
        // const ethers = require("ethers");
        let sumPrice = 0;
        // //After adding your Hardhat network to your metamask, this code will get providers and signers
        // const provider = new ethers.providers.Web3Provider(window.ethereum);
        // const signer = provider.getSigner();
        // const addr = await signer.getAddress();

        //Pull the deployed contract instance
        // let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)

        //create an NFT Token
        // let transaction = await contract.getMyNFTs()

        /*
        * Below function takes the metadata from tokenURI and the data returned by getMyNFTs() contract function
        * and creates an object of information that is to be displayed
        */
       let transaction = await readContract({
        address: contractAddress,
        abi: nftMarketPlaceABI,
        functionName: "getAllNFTs",
       })
       console.log(transaction[0].seller);
       transaction = transaction.filter(i => i.seller == account.address);
        
        const items = await Promise.all(transaction.map(async i => {
            const tokenURI = await readContract({
                address: contractAddress,
                abi: nftMarketPlaceABI,
                functionName: "tokenURI",
                args: [i.tokenId]
            })

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
            }
            sumPrice += Number(price);
            return item;
        }))
        updateData(items);
        updateFetched(true);
        
        updateTotalPrice(sumPrice.toPrecision(3));
        
    }
  
  
  
  
  
  
  
  
  
    const params = useParams();
    const tokenId = params.tokenId;
    if(!dataFetched)
    getNFTData(tokenId);
  
  
  
  
  
  
    return (
        
            <> 
        <div className="profileClass">
        <div className="flex text-center flex-col mt-11 md:text-2xl text-white">
            <div className="mb-5">
                <h2 className="font-bold">Wallet Address</h2>  
                {account.address}
            </div>
        </div>
        <div className="flex flex-row text-center justify-center mt-10 md:text-2xl text-white">
                <div>
                    <h2 className="font-bold">No. of NFTs</h2>
                    {data.length}
                </div>
                <div className="ml-20">
                    <h2 className="font-bold">Total Value</h2>
                    {totalPrice} ETH
                </div>
        </div>
        <div className="flex flex-col text-center items-center mt-11 text-white">
            <h2 className="font-bold">Your NFTs</h2>
            <div className="flex justify-center flex-wrap max-w-screen-xl">
                {data.map((value, index) => {
                return <NFTCard data={value} key={index}></NFTCard>;
                })}
            </div>
            <div className="mt-10 text-xl">
                {data.length == 0 ? "Oops, No NFT data to display (Are you logged in?)":""}
            </div>
        </div>
        </div>
    
            </>
  );
};

export default ProfilePage;
