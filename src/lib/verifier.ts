const EXPLORER_API = "https://explorer.sepolia.mantle.xyz/api/v2";

export async function verifyContract(
  contractAddress: string,
  source: string,
  contractName: string,
  compilerVersion: string,
  optimizationRuns: number,
): Promise<{ verified: boolean; message: string }> {
  try {
    const standardInput = {
      language: "Solidity",
      sources: { "Strategy.sol": { content: source } },
      settings: {
        optimizer: { enabled: true, runs: optimizationRuns },
        outputSelection: { "*": { "*": ["*"] } },
      },
    };

    const body = {
      compiler_version: compilerVersion,
      license_type: "mit",
      contract_source_code: source,
      contract_name: contractName,
      compiler_settings: JSON.stringify(standardInput.settings),
      optimization_used: true,
      optimization_runs: optimizationRuns,
      evm_version: "paris",
      files: [{ name: "Strategy.sol", content: source }],
    };

    const res = await fetch(
      `${EXPLORER_API}/smart-contracts/${contractAddress}/verification/via/flattened-code`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    if (res.ok) {
      return { verified: true, message: "Contract verified on Mantle Explorer" };
    }

    const err = await res.text();
    return { verified: false, message: `Verification failed: ${err.slice(0, 200)}` };
  } catch (e) {
    return {
      verified: false,
      message: `Verification error: ${e instanceof Error ? e.message : "unknown"}`,
    };
  }
}
