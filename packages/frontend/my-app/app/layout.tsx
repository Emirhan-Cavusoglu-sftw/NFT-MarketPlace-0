import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
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
        <div className="background">
          <ConnectProvider>
            <Header/>
            {children}
          </ConnectProvider>
        </div>
      </body>
    </html>
  );
}
