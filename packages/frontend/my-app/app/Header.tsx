"use client";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Header = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsNavOpen(true);
      } else {
        setIsNavOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bg-gradient-to-r from-purple-950 to-yellow-500">
      <div className=" flex justify-between items-center h-20 mr-20 ml-5">
        <Link href="/">
          <div className="flex items-center ">
            <Image
              src="/itüLogo.png"
              alt=""
              width={50}
              height={20}
              className="mt-2"
            />
            <h1 className="text-white ml-2 font-bold text-xl pl-5">NFT Marketplace</h1>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center space-x-8 pl-[800px]">
          <Link href="/">
            <div className={pathname === "/" ? "border-b-2 text-white" : "text-white"}>
              Marketplace
            </div>
          </Link>
          <Link href="/CreateNFT">
            <div
              className={
                pathname === "/CreateNFT" ? "border-b-2 text-white" : "text-white"
              }
            >
              Create My NFT
            </div>
          </Link>
          <Link href="/CreateCollection">
            <div
              className={
                pathname === "/CreateCollection"
                  ? "border-b-2 text-white"
                  : "text-white"
              }
            >
              Create My Collection
            </div>
          </Link>
          <Link href="/ProfilePage">
            <div
              className={
                pathname === "/ProfilePage" ? "border-b-2 text-white" : "text-white"
              }
            >
              Profile
            </div>
          </Link>


        </nav>

        <div className="lg:hidden">
          <button
            className="p-2 text-white"
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            {isNavOpen ? "✕" : "☰"}
          </button>
        </div>

        {isNavOpen && (
          <nav className="lg:hidden absolute top-0 left-0 w-full h-full bg-gradient-to-r from-stone-900 to-yellow-500 z-10">
            <ul className="flex flex-col items-center justify-center h-full space-y-8">
              <Link href="/">
                 <div className="text-white text-xl">Marketplace</div>
              </Link>
              <Link href="/CreateNFT">
                <div className="text-white text-xl">Create My NFT</div>
              </Link>
              <Link href="/CreateCollection">
                <div className="text-white text-xl">Create My Collection</div>
              </Link>
              <Link href="/ProfilePage">
                <div className="text-white text-xl">Profile</div>
              </Link>
            </ul>
          </nav>
        )}

        <ConnectButton />
      </div>
    </div>
  );
};

export default Header;