"use client";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <div>
      <nav className="w-screen ">
        <ul className="flex items-end justify-between py-3 bg-transparent text-white pr-5 bg-gradient-to-r from-stone-900 to-yellow-500 h-20">
          <li className="flex items-end ml-5 pb-1">
            <Image
              src={"/itüLogo.png"}
              alt=""
              width={50}
              height={20}
              className=" mt-2"
            ></Image>
          </li>
          <li className="flex items-end pb-4 ">
            <Link href="/">
              <div className="inline-block font-bold text-xl mr-[900px] pb-0">
                NFT Marketplace
              </div>
            </Link>
          </li>
          <li className="w-2/6 ">
            <ul className="lg:flex justify-between font-bold mr-14 pb-2 text-lg ">
              {pathname === "/" ? (
                <li className="border-b-2 ">
                  <Link href="/">Marketplace</Link>
                </li>
              ) : (
                <li className="hover:border-b-2 ">
                  <Link href="/">Marketplace</Link>
                </li>
              )}
              {pathname === "/BuySellNFT" ? (
                <li className="border-b-2 ">
                  <Link href="/BuySellNFT">Create My NFT</Link>
                </li>
              ) : (
                <li className="hover:border-b-2 ">
                  <Link href="/BuySellNFT">Create My NFT</Link>
                </li>
              )}
              {pathname === "/ProfilePage" ? (
                <li className="border-b-2 ">
                  <Link href="/ProfilePage">Profile</Link>
                </li>
              ) : (
                <li className="hover:border-b-2 ">
                  <Link href="/ProfilePage">Profile</Link>
                </li>
              )}
              <li className="">
                <ConnectButton />
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}