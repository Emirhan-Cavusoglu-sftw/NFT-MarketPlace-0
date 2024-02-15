import React from "react";
import { formatEther } from "viem";
import { writeContract } from "wagmi/actions";
import collectionABI from "../abis/collectionABI.json";
import { useAccount } from "wagmi";
//{ data }: any
const Offers = ({data,contractAddress}) => {
  const account = useAccount();
  console.log(account.address);
  // console.log(data);
  async function acceptOffer(contractAddress) {
    
    try {
      await writeContract({
        address: contractAddress,
        abi: collectionABI,
        functionName: "acceptOffer",
        args: [contractAddress],
        account: account.address,
       })
    } catch (e) {
      alert("Upload Error" + e);
    }
    
     
  }
  return (
    <div className="flex items-center justify-center ">
      <div className="bg-gradient-to-r from-amber-600 to-amber-400  rounded-lg shadow-lg  h-24 ">
        <div className="">Address: {data.address}   Offer Price: {formatEther(data.price)} </div>
        <button onClick={()=>acceptOffer(contractAddress)}>Accept This Offer</button>
      </div>
    </div>
  );
};

export default Offers;
