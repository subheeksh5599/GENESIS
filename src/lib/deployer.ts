import { createPublicClient, createWalletClient, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mantleTestnet, MANTLE_RPC } from "./mantle";

const publicClient = createPublicClient({
  chain: mantleTestnet,
  transport: http(MANTLE_RPC),
});

function getAccount(privateKey: string) {
  return privateKeyToAccount(privateKey as Hex);
}

export async function getBalance(address: string): Promise<string> {
  if (!address) return "0";
  const balance = await publicClient.getBalance({ address: address as Hex });
  return (Number(balance) / 1e18).toFixed(6);
}

export async function deployContract(
  bytecode: Hex,
  privateKey: string,
): Promise<{ address: string; txHash: string }> {
  const account = getAccount(privateKey);

  const walletClient = createWalletClient({
    chain: mantleTestnet,
    transport: http(MANTLE_RPC),
    account,
  });

  const hash = await walletClient.deployContract({
    abi: [],
    bytecode,
    args: [],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (!receipt.contractAddress) throw new Error("Deployment failed — no contract address");

  return {
    address: receipt.contractAddress,
    txHash: hash,
  };
}
