"use client"
import { darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  
  sepolia,
} from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

const { chains, publicClient } = configureChains(
    [sepolia],
    [
      alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_SEPOLIA_API_KEY }),
      publicProvider()
    ]
  );
  
  const { connectors } = getDefaultWallets({
    appName: 'My RainbowKit App',
    projectId: '8e3c26c24e7058275cb8c2b859655a3c',
    chains
  });
  
  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient
  })


export const ConnectProvider =({ children }) => {
    return (
        <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider modalSize="compact" theme={darkTheme({
        accentColor: '#7D3799',
        accentColorForeground: 'white',
        borderRadius: 'large',
      })} chains={chains}>{children}</RainbowKitProvider>
        </WagmiConfig>
    );
};