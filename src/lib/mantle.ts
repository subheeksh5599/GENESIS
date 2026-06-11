import { defineChain } from "viem";

export const mantleTestnet = defineChain({
  id: 5003,
  name: "Mantle Sepolia Testnet",
  nativeCurrency: { name: "Mantle", symbol: "MNT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.sepolia.mantle.xyz"] },
  },
  blockExplorers: {
    default: { name: "Mantle Explorer", url: "https://explorer.sepolia.mantle.xyz" },
  },
  testnet: true,
});

export const MANTLE_RPC = process.env.MANTLE_RPC_URL || "https://rpc.sepolia.mantle.xyz";

export const PROTOCOLS = {
  mETH: {
    name: "mETH Protocol",
    address: "0xd5F7838F5C461fefF7FE49ea5ebaF7728bB0ADfa",
    type: "staking",
  },
  agni: {
    name: "Agni Finance",
    router: "0x", /* router address */
    factory: "0x", /* factory address */
    type: "dex",
  },
  merchantMoe: {
    name: "Merchant Moe",
    router: "0x", /* router address */
    type: "dex",
  },
  usdy: {
    name: "USDY",
    address: "0x", /* USDY token */
    type: "rwa",
  },
};

export const FAUCET_URL = "https://faucet.testnet.mantle.xyz";
export const EXPLORER_URL = "https://explorer.sepolia.mantle.xyz";
