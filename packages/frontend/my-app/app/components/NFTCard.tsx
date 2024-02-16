import React from "react";
import Link from "next/link";
import { GetIpfsUrlFromPinata } from "../utils/util";
import { useState } from "react";
const NFTCard = ({ data }: any) => {
  // console.log(data);
  const tO = {
    pathname: "/NftInfoPage/" + data.tokenId,
  };
  const IPFSUrl = GetIpfsUrlFromPinata(data.image);
  return (
    <Link href={tO}>
      <div
        className="   
      
      
      
        relative mb-12 ml-12 
        mt-5  flex cursor-pointer flex-col items-center rounded-[0.4em]  border-[black] text-lg font-black
 
      
         shadow-[0.1em_0.1em] hover:translate-x-[-0.05em] hover:translate-y-[-0.05em] hover:shadow-[0.30em_0.30em]  "
      >
        <img
          src={IPFSUrl}
          alt=""
          className="h-44 w-44 rounded-lg object-cover"
        />
        <div className="-mt-[108px] w-full rounded-lg bg-gradient-to-t from-[#454545] to-transparent p-2 pt-5 text-white ">
          <div className="text-overflow-ellipsis max-w-[15ch] overflow-hidden whitespace-nowrap">
            <strong className="text-xl">{data.name}</strong>
          </div>
          <p className="display-inline">{data.description}</p>
          <strong className="text-xl">{data.price} ETH</strong>
        </div>
      </div>
    </Link>
  );
};

export default NFTCard;
