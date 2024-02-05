import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <div id="home" className="flex justify-between" style={{backgroundColor:"purple", height: "100vh"}}>
      
        <div className="ml-auto mr-5 mt-2 ">
          <ConnectButton />
        </div>
     
    </div>
  );
}