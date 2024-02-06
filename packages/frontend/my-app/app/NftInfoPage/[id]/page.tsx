"use client";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { GetIpfsUrlFromPinata } from "../../utils/util";
import axios from "axios";
import nftMarketPlaceABI from "../../abis/nftMarketPlaceABI.json";
import { readContract ,writeContract} from "wagmi/actions";
import { useAccount } from "wagmi";
import { formatEther, parseEther } from "viem";
const NftInfoPage = () => {
  const contractAddress = "0x424778313C58D929B8D948d28e4D70dBB742b135";
  const account = useAccount();
  const [data, updateData] = useState({});
const [dataFetched, updateDataFetched] = useState(false);
const [message, updateMessage] = useState("");
const [currAddress, updateCurrAddress] = useState("0x");
async function buyNFT(tokenId) {
    try {
        

        //Pull the deployed contract instance
        
        const salePrice = parseEther(data.price)
        updateMessage("Buying the NFT... Please Wait (Upto 5 mins)")
        //run the executeSale function
        await writeContract({
            address: contractAddress,
            abi: nftMarketPlaceABI,
            functionName: "executeSale",
            args: [tokenId],
            value: salePrice
        })

        alert('You successfully bought the NFT!');
        updateMessage("");
    }
    catch(e) {
        alert("Upload Error"+e)
    }
}  

async function getNFTData(tokenId) {
    console.log(tokenId)
    
    let tokenURI = await readContract({
      address: contractAddress,
      abi: nftMarketPlaceABI,
      functionName: "tokenURI",
      args: [2]
  })
  const listedNft = await readContract({
    address: contractAddress,
    abi: nftMarketPlaceABI,
    functionName: "getListedNftForId",
    args: [tokenId]
})
    tokenURI = GetIpfsUrlFromPinata(tokenURI);
    let meta = await axios.get(tokenURI);
    console.log(meta)
    meta = meta.data;
    

    let item = {
        price: meta.price,
        tokenId: tokenId,
        seller: listedNft.seller,
        owner: listedNft.owner,
        image: meta.image,
        name: meta.name,
        description: meta.description,
    }
    console.log(item);
    updateData(item);
    updateDataFetched(true);
    
    
}
console.log(data)
const params = useParams();
const tokenId = params.id;

if(!dataFetched)
    getNFTData(tokenId);
console.log(tokenId)
if(typeof data.image == "string")
    data.image = GetIpfsUrlFromPinata(data.image);
  
  
  
  return (
    <div className="flex ml-20 mt-20">
                <img src={data.image} alt="" className="w-2/5" />
                <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
                    <div>
                        Name: {data.name}
                    </div>
                    <div>
                        Description: {data.description}
                    </div>
                    <div>
                        Price: <span className="">{data.price + " ETH"}</span>
                    </div>
                    <div>
                        Owner: <span className="text-sm">{data.owner}</span>
                    </div>
                    <div>
                        Seller: <span className="text-sm">{data.seller}</span>
                    </div>
                    <div>
                    { currAddress != data.owner && currAddress != data.seller ?
                        <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => buyNFT(tokenId)}>Buy this NFT</button>
                        : <div className="text-emerald-700">You are the owner of this NFT</div>
                    }
                    
                    <div className="text-green text-center mt-3">{message}</div>
                    </div>
                </div>
            </div>
  );
};

export default NftInfoPage;
