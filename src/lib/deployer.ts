import { createPublicClient, createWalletClient, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mantleTestnet, MANTLE_RPC } from "./mantle";

const publicClient = createPublicClient({
  chain: mantleTestnet,
  transport: http(MANTLE_RPC),
});

function getWalletClient() {
  const pk = process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) throw new Error("DEPLOYER_PRIVATE_KEY not set in .env.local");
  const account = privateKeyToAccount(pk as Hex);
  return {
    client: createWalletClient({ chain: mantleTestnet, transport: http(MANTLE_RPC), account }),
    account,
  };
}

export async function getBalance(): Promise<{ balance: string; address: string }> {
  const pk = process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) return { balance: "0", address: "0x0000000000000000000000000000000000000000" };
  const account = privateKeyToAccount(pk as Hex);
  const balance = await publicClient.getBalance({ address: account.address });
  return {
    balance: (Number(balance) / 1e18).toFixed(6),
    address: account.address,
  };
}

export async function deployContract(
  bytecode: Hex,
  args: readonly unknown[] = [],
): Promise<{ address: string; txHash: string }> {
  const { client, account } = getWalletClient();

  const hash = await client.deployContract({
    abi: [],
    bytecode,
    args,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (!receipt.contractAddress) throw new Error("Deployment failed — no contract address");

  return {
    address: receipt.contractAddress,
    txHash: hash,
  };
}

export async function getDeployedAgents(agentAddresses: string[]): Promise<AgentInfo[]> {
  if (agentAddresses.length === 0) return [];

  const results = await Promise.allSettled(
    agentAddresses.map(async (addr) => {
      const balance = await publicClient.getBalance({ address: addr as Hex });
      return {
        address: addr,
        balance: (Number(balance) / 1e18).toFixed(4),
      };
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<{ address: string; balance: string }> => r.status === "fulfilled")
    .map((r) => r.value);
}

export interface AgentInfo {
  address: string;
  balance: string;
}
