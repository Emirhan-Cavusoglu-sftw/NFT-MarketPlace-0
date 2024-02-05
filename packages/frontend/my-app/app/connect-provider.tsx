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
      alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
      publicProvider()
    ]
  );
  
  const { connectors } = getDefaultWallets({
    appName: 'My RainbowKit App',
    projectId: 'YOUR_PROJECT_ID',
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
        borderRadius: 'medium',
      })} chains={chains}>{children}</RainbowKitProvider>
        </WagmiConfig>
    );
};