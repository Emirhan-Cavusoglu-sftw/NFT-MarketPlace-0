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

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <div className="bg-gradient-to-r border-b-black border-b-4 from-purple-950 to-yellow-500 font-carterone text-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center">
              <Image
                src="/itüLogo.png"
                alt=""
                width={50}
                height={20}
                className="mt-2"
              />
              <h1 className="text-white ml-2 pl-5">NFT Marketplace</h1>
            </div>
          </Link>
        </div>
        <div className="lg:hidden">
          <button className="p-2 text-white" onClick={toggleNav}>
            {isNavOpen ? "✕" : "☰"}
          </button>
        </div>
        {isNavOpen && (
          <div className="lg:hidden absolute top-20 left-0 w-full bg-gradient-to-r from-purple-950 to-yellow-500 text-white py-4 z-10">
            <div className="flex flex-col items-center">
              <Link href="/">
                <div className={pathname === "/" ? "border-b-4 border-purple-700 text-white" : "text-white"} onClick={toggleNav}>
                  Marketplace
                </div>
              </Link>
              <Link href="/CreateNFT">
                <div className={pathname === "/CreateNFT" ? "border-b-4 border-purple-700 text-white" : "text-white"} onClick={toggleNav}>
                  Create My NFT
                </div>
              </Link>
              <Link href="/CreateCollection">
                <div className={pathname === "/CreateCollection" ? "border-b-4 border-purple-700 text-white" : "text-white"} onClick={toggleNav}>
                  Create My Collection
                </div>
              </Link>
              <Link href="/ProfilePage">
                <div className={pathname === "/ProfilePage" ? "border-b-4 border-purple-700 text-white" : "text-white"} onClick={toggleNav}>
                  Profile
                </div>
              </Link>
            </div>
          </div>
        )}
        <nav className="hidden lg:flex lg:justify-evenly lg:items-center lg:space-x-24">
          <Link href="/">
            <div className={pathname === "/" ? "border-b-4 border-purple-700 text-white" : "text-white"}>
              Marketplace
            </div>
          </Link>
          <Link href="/CreateNFT">
            <div className={pathname === "/CreateNFT" ? "border-b-4 border-purple-700 text-white" : "text-white"}>
              Create My NFT
            </div>
          </Link>
          <Link href="/CreateCollection">
            <div className={pathname === "/CreateCollection" ? "border-b-4 border-purple-700 text-white" : "text-white"}>
              Create My Collection
            </div>
          </Link>
          <Link href="/ProfilePage">
            <div className={pathname === "/ProfilePage" ? "border-b-4 border-purple-700 text-white" : "text-white"}>
              Profile
            </div>
          </Link>
        </nav>
        <ConnectButton />
      </div>
    </div>
  );
};

export default Header;
