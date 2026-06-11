import { NextResponse } from "next/server";
import { generateSolidity } from "@/lib/ai-gen";
import { deployContract, getBalance } from "@/lib/deployer";
import { saveAgent, getAgentCount } from "@/lib/store";
import solc from "solc";

const FAUCET_URL = "https://faucet.testnet.mantle.xyz";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { intent, protocols, privateKey } = body as {
      intent: string;
      protocols?: string[];
      privateKey?: string;
    };

    if (!intent) {
      return NextResponse.json({ error: "Strategy description required" }, { status: 400 });
    }

    if (!privateKey) {
      return NextResponse.json({
        error: "No wallet connected. Generate or paste a private key in the Wallet panel first.",
      }, { status: 400 });
    }

    // Check balance
    let balance = "0";
    try {
      balance = await getBalance(privateKey);
    } catch {
      // will fail below
    }

    if (parseFloat(balance) < 0.0001) {
      return NextResponse.json({
        error: `Insufficient MNT balance (${balance} MNT). Get testnet tokens from the faucet.`,
        balance,
        faucetUrl: FAUCET_URL,
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

    // Deploy using user's private key
    const { address: contractAddress, txHash } = await deployContract(bytecode, privateKey);

    // Save agent record
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
      agent: { id: agentId, contractAddress, txHash },
      abi,
      source,
      balance,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
