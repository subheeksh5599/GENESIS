import { NextResponse } from "next/server";
import { generateSolidity } from "@/lib/ai-gen";
import { deployContract, getBalance, estimateGas } from "@/lib/deployer";
import { saveAgent, getAgentCount } from "@/lib/store";
import { verifyContract } from "@/lib/verifier";
import { reviewContract, type SecurityReport } from "@/lib/security-review";
import solc from "solc";

const FAUCET_URL = "https://faucet.testnet.mantle.xyz";
const COMPILER_VERSION = "v0.8.35+commit.47b9dedd";

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
      return NextResponse.json({ error: "No wallet connected." }, { status: 400 });
    }

    // Derive deployer address
    let deployerAddress = "";
    try {
      const { privateKeyToAddress } = await import("viem/accounts");
      deployerAddress = privateKeyToAddress(privateKey as `0x${string}`);
    } catch { /* ignore */ }

    // ── STAGE 1: GENERATE ──
    const source = await generateSolidity(intent, true);

    // Validate: reject contracts with placeholder addresses
    if (source.match(/0x\.{2,}|0x[0]{10,}/)) {
      return NextResponse.json({
        error: "Generated contract contains placeholder addresses (0x...). The AI hallucinated invalid data. Please rephrase your intent or try again — the model sometimes inserts dummy values.",
        stage: "generate",
        source,
      }, { status: 400 });
    }

    // ── STAGE 2: SECURITY REVIEW ──
    const securityReport: SecurityReport = await reviewContract(source);

    if (securityReport.status === "rejected") {
      return NextResponse.json({
        error: "Security review rejected deployment.",
        stage: "review",
        source,
        securityReport,
      }, { status: 400 });
    }

    // ── STAGE 3: COMPILE ──
    const compilerInput = {
      language: "Solidity",
      sources: { "Strategy.sol": { content: source } },
      settings: {
        outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
        optimizer: { enabled: true, runs: 200 },
        evmVersion: "paris",
      },
    };

    const compiled = JSON.parse(solc.compile(JSON.stringify(compilerInput)));

    if (compiled.errors?.some((e: { severity: string }) => e.severity === "error")) {
      const errs = compiled.errors
        .filter((e: { severity: string }) => e.severity === "error")
        .map((e: { formattedMessage: string }) => e.formattedMessage)
        .join("\n");
      return NextResponse.json({
        error: `Compilation failed:\n${errs}`,
        stage: "compile",
        source,
        securityReport,
      }, { status: 400 });
    }

    const contractFile = compiled.contracts["Strategy.sol"];
    const contractName = Object.keys(contractFile)[0];
    const contract = contractFile[contractName];
    const bytecode = ("0x" + contract.evm.bytecode.object) as `0x${string}`;
    const abi = contract.abi;

    // ── STAGE 4: GAS ESTIMATE ──
    let gasEstimate;
    try {
      gasEstimate = await estimateGas(bytecode);
    } catch {
      gasEstimate = { gas: "~250,000", gasPrice: "0.02", costMNT: "0.005", costUSD: "~$0.004" };
    }

    // ── STAGE 5: CHECK BALANCE ──
    let balance = "0";
    try { balance = await getBalance(deployerAddress); } catch { /* ignore */ }

    if (parseFloat(balance) < parseFloat(gasEstimate.costMNT)) {
      return NextResponse.json({
        error: `Insufficient MNT for gas. Need ${gasEstimate.costMNT} MNT, have ${balance} MNT.`,
        stage: "preflight",
        source,
        securityReport,
        gasEstimate,
        balance,
        faucetUrl: FAUCET_URL,
      }, { status: 402 });
    }

    // ── STAGE 6: DEPLOY ──
    const { address: contractAddress, txHash } = await deployContract(bytecode, privateKey);

    // ── STAGE 7: SAVE + VERIFY ──
    const agentId = String(1000 + getAgentCount() + 1);
    saveAgent({
      id: agentId,
      name: intent.slice(0, 40).replace(/\n/g, " "),
      strategy: intent,
      protocols: protocols || [],
      contractAddress,
      deployerAddress,
      txHash,
      abi,
      source,
      verified: false,
      createdAt: new Date().toISOString(),
      deployedAt: Date.now(),
      status: "live",
      pnl: "0.00%",
      tvl: "$0",
    });

    // Fire-and-forget verification
    verifyContract(contractAddress, source, contractName, COMPILER_VERSION, 200)
      .then(async (result) => {
        if (result.verified) {
          const { updateAgent } = await import("@/lib/store");
          updateAgent(agentId, { verified: true });
        }
      })
      .catch(() => {});

    return NextResponse.json({
      success: true,
      agent: { id: agentId, contractAddress, txHash, verified: false },
      pipeline: {
        source,
        securityReport,
        gasEstimate,
        balance,
        abi,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : "Unknown error",
      stage: "deploy",
    }, { status: 500 });
  }
}
