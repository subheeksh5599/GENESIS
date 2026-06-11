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

export async function estimateGas(bytecode: Hex): Promise<{
  gas: string;
  gasPrice: string;
  costMNT: string;
  costUSD: string;
}> {
  try {
    const gasPrice = await publicClient.getGasPrice();
    const estimated = await publicClient.estimateGas({ data: bytecode });

    const gasNum = Number(estimated);
    const priceNum = Number(gasPrice);
    const costWei = BigInt(gasNum) * gasPrice;
    const costMNT = Number(costWei) / 1e18;

    // Rough USD estimate (MNT ~$0.80)
    const costUSD = costMNT * 0.80;

    return {
      gas: gasNum.toLocaleString(),
      gasPrice: (priceNum / 1e9).toFixed(2),
      costMNT: costMNT.toFixed(6),
      costUSD: `$${costUSD.toFixed(4)}`,
    };
  } catch {
    return {
      gas: "~250,000",
      gasPrice: "0.02",
      costMNT: "0.005",
      costUSD: "~$0.004",
    };
  }
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
