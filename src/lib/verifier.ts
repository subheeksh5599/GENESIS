const EXPLORER_URL = "https://explorer.sepolia.mantle.xyz";

export async function verifyContract(
  contractAddress: string,
  source: string,
  contractName: string,
  compilerVersion: string,
  optimizationRuns: number,
): Promise<{ verified: boolean; message: string }> {
  const body = {
    compiler_version: compilerVersion,
    license_type: "mit",
    contract_source_code: source,
    contract_name: contractName,
    compiler_settings: JSON.stringify({
      optimizer: { enabled: true, runs: optimizationRuns },
      outputSelection: { "*": { "*": ["*"] } },
      evmVersion: "paris",
    }),
    optimization_used: true,
    optimization_runs: optimizationRuns,
    evm_version: "paris",
    files: [{ name: "Strategy.sol", content: source }],
  };

  for (const apiUrl of [
    "https://explorer.sepolia.mantle.xyz/api/v2",
    "https://sepolia.mantlescan.xyz/api/v2",
  ]) {
    try {
      const res = await fetch(
        `${apiUrl}/smart-contracts/${contractAddress}/verification/via/standard-input`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(10000),
        },
      );

      if (res.ok) {
        return { verified: true, message: "Contract verified on Mantle Explorer" };
      }
    } catch {
      // try next
    }
  }

  return {
    verified: false,
    message: `Manual verification available at ${EXPLORER_URL}/address/${contractAddress}`,
  };
}
