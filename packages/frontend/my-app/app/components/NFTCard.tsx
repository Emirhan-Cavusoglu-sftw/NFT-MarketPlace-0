
import React from 'react'
import  Link  from 'next/link'
import {GetIpfsUrlFromPinata} from "../utils/util"
import { useState } from 'react'
const NFTCard = ({data}:any) => {
  console.log(data)
    // const IPFSUrl = GetIpfsUrlFromPinata(data.data.image);
  return (
    // <Link href={newTo}>
    //     <div className="border-2 ml-12 mt-5 mb-12 flex flex-col items-center rounded-lg w-48 md:w-72 shadow-2xl">
    //         <img src={IPFSUrl} alt="" className="w-72 h-80 rounded-lg object-cover" />
    //         <div className= "text-white w-full p-2 bg-gradient-to-t from-[#454545] to-transparent rounded-lg pt-5 -mt-20">
    //             <strong className="text-xl">{data.data.name}</strong>
    //             <p className="display-inline">
    //                 {data.data.description}
    //             </p>
    //         </div>
    //     </div>
    //     </Link>
   <>
   <div className='border-2 ml-12 mt-5 mb-12 flex flex-col items-center rounded-lg w-48 md:w-72 shadow-2xl"'>{data.name}</div>
   
   </>

  )
}

export default NFTCard