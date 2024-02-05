import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WagmiConfig } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import {ConnectProvider} from "./connect-provider";
import Header from "./Header";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NFT Marketplace",
  description: "A simple NFT marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div>
          <ConnectProvider>
            <Header />
            {children}
          </ConnectProvider>
        </div>
      </body>
    </html>
  );
}
