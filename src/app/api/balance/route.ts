import { NextResponse } from "next/server";
import { getBalance } from "@/lib/deployer";

const FAUCET_URL = "https://faucet.testnet.mantle.xyz";
const EXPLORER_URL = "https://explorer.sepolia.mantle.xyz";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address") || "";

  if (!address) {
    return NextResponse.json({
      balance: "0",
      address: "",
      needsFaucet: true,
      faucetUrl: FAUCET_URL,
      message: "No wallet connected. Generate or paste a key in the Wallet panel.",
    });
  }

  const balance = await getBalance(address);
  const bal = parseFloat(balance);

  return NextResponse.json({
    balance,
    address,
    needsFaucet: bal < 0.01,
    faucetUrl: FAUCET_URL,
    explorerUrl: EXPLORER_URL,
    message: bal < 0.01 ? "Get testnet MNT from the faucet to deploy." : "Ready to deploy.",
  });
}
