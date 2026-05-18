import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  walletConnectWallet,
  rainbowWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { arcTestnet } from "./chain";

const projectId =
  process.env.NEXT_PUBLIC_WC_PROJECT_ID || "PLACEHOLDER_GET_ONE_AT_REOWN_CLOUD";

// NOTE: omitting metaMaskWallet on purpose — MetaMask SDK connector hangs on
// desktop with the new Smart Account / social-login MetaMask. The injectedWallet
// uses raw window.ethereum and auto-detects MetaMask via EIP-6963.
const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [injectedWallet, rainbowWallet, walletConnectWallet],
    },
  ],
  {
    appName: "ARC Mini Arcade",
    projectId,
  },
);

export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  transports: { [arcTestnet.id]: http() },
  connectors,
  ssr: true,
});
