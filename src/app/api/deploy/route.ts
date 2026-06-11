import { NextResponse } from "next/server";
import { generateSolidity } from "@/lib/ai-gen";
import { deployContract, getBalance } from "@/lib/deployer";
import { saveAgent, getAgentCount } from "@/lib/store";
import solc from "solc";

const FAUCET_URL = "https://faucet.testnet.mantle.xyz";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { intent, protocols } = body as { intent: string; protocols?: string[] };

    if (!intent) {
      return NextResponse.json({ error: "Strategy description required" }, { status: 400 });
    }

    // Check deployer balance
    const { balance, address } = await getBalance();
    if (parseFloat(balance) < 0.001) {
      return NextResponse.json({
        error: "Insufficient MNT balance for gas",
        balance,
        walletAddress: address,
        faucetUrl: FAUCET_URL,
        hint: `Please send testnet MNT to ${address} or visit the faucet`,
      }, { status: 402 });
    }

    // Generate Solidity
    const source = await generateSolidity(intent);

    // Compile
    const compilerInput = {
      language: "Solidity",
      sources: { "Strategy.sol": { content: source } },
      settings: {
        outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
        optimizer: { enabled: true, runs: 200 },
        evmVersion: "paris",
      },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(compilerInput)));

    if (output.errors?.some((e: { severity: string }) => e.severity === "error")) {
      const errs = output.errors
        .filter((e: { severity: string }) => e.severity === "error")
        .map((e: { formattedMessage: string }) => e.formattedMessage)
        .join("\n");
      return NextResponse.json({ error: `Compilation failed:\n${errs}` }, { status: 400 });
    }

    const contractFile = output.contracts["Strategy.sol"];
    const contractName = Object.keys(contractFile)[0];
    const contract = contractFile[contractName];
    const bytecode = ("0x" + contract.evm.bytecode.object) as `0x${string}`;
    const abi = contract.abi;

    // Deploy
    const { address: contractAddress, txHash } = await deployContract(bytecode);

    // Save agent
    const agentId = String(1000 + getAgentCount() + 1);
    saveAgent({
      id: agentId,
      name: intent.slice(0, 40).replace(/\n/g, " "),
      strategy: intent,
      protocols: protocols || [],
      contractAddress,
      txHash,
      createdAt: new Date().toISOString(),
      deployedAt: Date.now(),
      status: "live",
      pnl: "0.00%",
      tvl: "$0",
    });

    return NextResponse.json({
      success: true,
      agent: {
        id: agentId,
        contractAddress,
        txHash,
        balance,
      },
      abi,
      source,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
