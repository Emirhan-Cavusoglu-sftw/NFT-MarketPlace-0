// "use client";
// import { useParams } from "next/navigation";
// import React, { useState } from "react";
// import { GetIpfsUrlFromPinata } from "../utils/util";
// import axios from "axios";
// import nftMarketPlaceABI from "../abis/nftMarketPlaceABI.json";
// import { readContract } from "wagmi/actions";
// import { useAccount } from "wagmi";
// const NftInfoPage = () => {
//   const contractAddress = "0x424778313C58D929B8D948d28e4D70dBB742b135";
//   const account = useAccount();
//   const [data, updateData] = useState({});
// const [dataFetched, updateDataFetched] = useState(false);
// const [message, updateMessage] = useState("");
// const [currAddress, updateCurrAddress] = useState("0x");
//   async function getNFTData(tokenId) {
    
//     let tokenId = ""; // Add this line to define the tokenId variable
//     if (params && params.tokenId) {
//       tokenId = params.tokenId;
//     }

//     let tokenURI = await readContract({
//       address: contractAddress,
//       abi: nftMarketPlaceABI,
//       functionName: "tokenURI",
//       args: [tokenId]
//     });
//     const listedNft = await readContract({
//       address: contractAddress,
//       abi: nftMarketPlaceABI,
//       functionName: "getListedNftForId",
//       args: [tokenId]
//     });
//     tokenURI = GetIpfsUrlFromPinata(tokenURI);
//     let meta = await axios.get(tokenURI);
//     meta = meta.data;
//     console.log(listedToken);

//     let item = {
//         price: meta.price,
//         tokenId: tokenId,
//         seller: listedNft.seller,
//         owner: listedNft.owner,
//         image: meta.image,
//         name: meta.name,
//         description: meta.description,
//     }
//     console.log(item);
//     updateData(item);
//     updateDataFetched(true);
    
    
// }

// const params = useParams();
// const tokenId = params.tokenId;
// if(!dataFetched)
//     getNFTData(tokenId);
// if(typeof data.image == "string")
//     data.image = GetIpfsUrlFromPinata(data.image);
  
  
  
//   return (
//     <div className="flex ml-20 mt-20">
//                 <img src={data.image} alt="" className="w-2/5" />
//                 <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
//                     <div>
//                         Name: {data.name}
//                     </div>
//                     <div>
//                         Description: {data.description}
//                     </div>
//                     <div>
//                         Price: <span className="">{data.price + " ETH"}</span>
//                     </div>
//                     <div>
//                         Owner: <span className="text-sm">{data.owner}</span>
//                     </div>
//                     <div>
//                         Seller: <span className="text-sm">{data.seller}</span>
//                     </div>
//                     <div>
//                     { currAddress != data.owner && currAddress != data.seller ?
//                         <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => buyNFT(tokenId)}>Buy this NFT</button>
//                         : <div className="text-emerald-700">You are the owner of this NFT</div>
//                     }
                    
//                     <div className="text-green text-center mt-3">{message}</div>
//                     </div>
//                 </div>
//             </div>
//   );
// };

// export default NftInfoPage;
