import { NextResponse } from "next/server";
import { getBalance } from "@/lib/deployer";

const FAUCET_URL = "https://faucet.testnet.mantle.xyz";
const EXPLORER_URL = "https://explorer.sepolia.mantle.xyz";

export async function GET() {
  const { balance, address } = await getBalance();
  const needsFaucet = parseFloat(balance) < 0.01;

  return NextResponse.json({
    balance,
    address,
    needsFaucet,
    faucetUrl: FAUCET_URL,
    explorerUrl: EXPLORER_URL,
    message: needsFaucet
      ? `Insufficient MNT for gas. Visit the faucet to get testnet tokens.`
      : `Ready to deploy.`,
  });
}
