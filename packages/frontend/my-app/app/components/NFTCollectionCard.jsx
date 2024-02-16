
import React from "react";
import Link from "next/link";
import { GetIpfsUrlFromPinata } from "../utils/util";
import { useState } from "react";
const NFTCollectionCard = ({ data }) => {
  // console.log(data);
  const tO = {
    pathname: "/CollectionsInfoPage/" + data.address,
  };
  const IPFSUrl = GetIpfsUrlFromPinata(data.image);
  return (

      <div className="relative mb-12 ml-12 mt-5  flex cursor-pointer flex-col items-center 
      rounded-[0.4em] shadow-[0.25em_0.25em] hover:translate-x-[-0.05em] hover:translate-y-[-0.05em] 
      hover:shadow-[0.4em_0.4em] font-poppins font-bold text-lg ">
        <Link href={tO}>
        <img
          src={IPFSUrl}
          alt=""
          className="w-52 h-60 rounded-lg object-cover"
        /></Link>
        <div className="text-white w-full flex flex-col items-center text-center p-2 bg-gradient-to-t from-[#454545] to-transparent rounded-lg pt-5 -mt-20 ">
          <div className="overflow-hidden   max-w-[15ch]">
          <p className="">{data.name}</p>
          </div>
          <p className="">{data.description}</p>
        </div>
      </div>
    
  );
};

export default NFTCollectionCard;