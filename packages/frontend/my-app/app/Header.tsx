"use client";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <div className="bg-black">
      <nav className="w-screen">
        <ul className="flex items-end justify-between py-3 bg-transparent text-white pr-5">
          <li className="flex items-end ml-5 pb-2">
          <Image
                  src={"/İTÜ Blockchain.png"}
                  alt=""
                  width={100}
                  height={50}
                  className=" mt-2"
                ></Image>
          </li>
          <li className="flex items-end pb-4">
            <Link href="/">
              <div className="inline-block font-bold text-xl mr-[900px] pb-7 ">
              NFT Marketplace
              </div>
            </Link>
          </li>
          <li className="w-2/6">
            <ul className="lg:flex justify-between font-bold mr-10 pb-10 text-lg">
              {pathname === "/" ? (
                <li className="border-b-2 hover:pb-0 p-2">
                  <Link href="/">Marketplace</Link>
                </li>
              ) : (
                <li className="hover:border-b-2 hover:pb-0 p-2">
                  <Link href="/">Marketplace</Link>
                </li>
              )}
              {pathname === "/" ? (
                <li className="border-b-2 hover:pb-0 p-2">
                  <Link href="/BuySellNFT">List My NFT</Link>
                </li>
              ) : (
                <li className="hover:border-b-2 hover:pb-0 p-2">
                  <Link href="/BuySellNFT">List My NFT</Link>
                </li>
              )}
              {pathname === "/" ? (
                <li className="border-b-2 hover:pb-0 p-2">
                  <Link href="/ProfilePage">Profile</Link>
                </li>
              ) : (
                <li className="hover:border-b-2 hover:pb-0 p-2">
                  <Link href="/ProfilePage">Profile</Link>
                </li>
              )}
              <li>
                <ConnectButton />
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}
