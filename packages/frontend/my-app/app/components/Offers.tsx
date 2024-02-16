import React from "react";
import { formatEther } from "viem";
import { writeContract } from "wagmi/actions";
import collectionABI from "../abis/collectionABI.json";
import { useAccount } from "wagmi";
//{ data }: any
const Offers = ({data,contractAddress,collectionOwner}) => {
  const account = useAccount();
  console.log(account.address);
  // console.log(data);
  async function acceptOffer(contractAddress) {
    
    try {
      await writeContract({
        address: contractAddress,
        abi: collectionABI,
        functionName: "acceptOffer",
        args: [data.address],
        account: account.address,
       })
    } catch (e) {
      alert("Upload Error" + e);
    }
    
     
  }
  return (
    
    <div className="flex flex-col justify-center text-center items-center bg-gradient-to-r from-amber-600 to-amber-400 rounded-2xl">
        <h2 className="">Address: {data.address}   Offer Price: {formatEther(data.price)} </h2>
        {collectionOwner == account.address &&(

          
          <button className="bg-gradient-to-r from-purple-900 to-violet-400 text-white font-bold py-2 px-4 rounded-full w-44 " 
          onClick={()=>acceptOffer(contractAddress)}>Accept This Offer</button>
          )
        }             
        </div>
      
    
  );
};

export default Offers;
