import React from "react";
import Link from "next/link";
import { GetIpfsUrlFromPinata } from "../utils/util";
import { useState } from "react";
const NFTCard = ({ data }) => {
  // console.log(data);
  const tO = {
    pathname: "/NftInfoPage/" + data.tokenId,
  };
  const IPFSUrl = GetIpfsUrlFromPinata(data.image);
  return (
    <Link href={tO}>
      <div
        className="relative mb-12 ml-12 mt-5  flex cursor-pointer flex-col items-center 
        rounded-[0.4em] shadow-[0.25em_0.25em] hover:translate-x-[-0.05em] hover:translate-y-[-0.05em] 
        hover:shadow-[0.4em_0.4em] font-poppins font-bold text-lg "
      >
        <img
          src={IPFSUrl}
          alt=""
          className="h-60 w-52 rounded-lg   object-cover"
        />
        <div className="-mt-[80px] w-full flex flex-col items-center text-center rounded-lg bg-gradient-to-t from-[#454545] to-transparent p-2 pt-5 text-white ">
          <div className=" max-w-[15ch] overflow-hidden ">
            <p className="">{data.name}</p>
          </div>
          
          <p className="">{data.price} ETH</p>
        </div>
      </div>
    </Link>
  );
};

export default NFTCard;
