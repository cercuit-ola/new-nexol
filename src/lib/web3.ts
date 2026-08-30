import { createConfig, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";
import type { Address } from "viem";

export const targetChain = process.env.NEXT_PUBLIC_CHAIN_ID === "8453" ? base : baseSepolia;

export const wagmiConfig = createConfig({
  chains: [baseSepolia, base],
  connectors: [
    injected(),
    coinbaseWallet({ appName: "Nexol", preference: "all" }),
  ],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org"),
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org"),
  },
  ssr: true,
});

const address = (value?: string) => /^0x[a-fA-F0-9]{40}$/.test(value || "") ? value as Address : undefined;

export const escrowAddress = address(process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS);
export const schedulerAddress = address(process.env.NEXT_PUBLIC_SCHEDULER_CONTRACT_ADDRESS);

export const tokenConfig = {
  USDC: {
    symbol: "USDC",
    decimals: 6,
    // Circle's official Base Sepolia USDC; override for mainnet or another deployment.
    address: address(process.env.NEXT_PUBLIC_USDC_ADDRESS || (targetChain.id === baseSepolia.id ? "0x036CbD53842c5426634e7929541eC2318f3dCF7e" : "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913")),
  },
  USDT: {
    symbol: "USDT",
    decimals: 6,
    address: address(process.env.NEXT_PUBLIC_USDT_ADDRESS),
  },
} as const;

export type TokenSymbol = keyof typeof tokenConfig;
export const configuredTokens = Object.entries(tokenConfig).filter((entry): entry is [TokenSymbol, typeof tokenConfig[TokenSymbol]] => Boolean(entry[1].address));
export const explorerUrl = targetChain.id === base.id ? "https://basescan.org" : "https://sepolia.basescan.org";
