import { NextResponse } from "next/server";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const FAUCET_URL = "https://faucet.testnet.mantle.xyz";

export async function GET() {
  const pk = generatePrivateKey();
  const account = privateKeyToAccount(pk);

  return NextResponse.json({
    privateKey: pk,
    address: account.address,
    faucetUrl: FAUCET_URL,
    instructions: [
      `1. Save this private key securely (it will not be shown again)`,
      `2. Add it to .env.local as DEPLOYER_PRIVATE_KEY`,
      `3. Visit the faucet to get testnet MNT`,
      `4. Restart the dev server`,
    ],
  });
}
