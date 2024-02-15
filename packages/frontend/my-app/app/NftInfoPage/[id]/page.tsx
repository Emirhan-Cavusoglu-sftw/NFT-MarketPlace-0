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
    <div className="flex items-center justify-center mt-10">
      <div className="bg-gradient-to-r from-amber-600 to-amber-400  rounded-lg shadow-lg overflow-hidden">
        <img src={data.image} alt="" className="w-full h-64 object-cover" />
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold text-white mb-2">{data.name}</h2>
          <p className="text-white">{data.description}</p>
        </div>
        <div className="px-6 py-4">
          <div className="text-white">
            Price: <span className="font-semibold">{data.price} ETH</span>
          </div>
          <div className="text-white">
            Owner: <span className="font-semibold">{data.owner}</span>
          </div>
          <div className="text-white">
            Seller: <span className="font-semibold">{data.seller}</span>
          </div>
        </div>
        <div className="px-6 py-4 flex justify-center items-center">
          {currAddress !== data.owner && currAddress !== data.seller ? (
            <button
              className="bg-[#7D3799] hover:bg-purple-900 text-white font-bold py-2 px-4 rounded-full text-sm"
              onClick={() => buyNFT(tokenId)}
            >
              Buy this NFT
            </button>
          ) : (
            <div className="text-green-600 font-semibold">
              You are the owner of this NFT
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NftInfoPage;
