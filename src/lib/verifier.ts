const EXPLORER_URL = "https://explorer.sepolia.mantle.xyz";

const API_URLS = [
  "https://explorer.sepolia.mantle.xyz/api/v2",
  "https://sepolia.mantlescan.xyz/api/v2",
];

export async function verifyContract(
  contractAddress: string,
  source: string,
  contractName: string,
  compilerVersion: string,
  optimizationRuns: number,
): Promise<{ verified: boolean; message: string; explorerUrl: string }> {
  const compilerInput = {
    language: "Solidity",
    sources: { "Strategy.sol": { content: source } },
    settings: {
      optimizer: { enabled: true, runs: optimizationRuns },
      outputSelection: { "*": { "*": ["*"] } },
      evmVersion: "paris",
    },
  };

  // Standard Blockscout verification via standard-input
  const body = {
    compiler_version: compilerVersion,
    license_type: "mit",
    contract_source_code: source,
    contract_name: contractName,
    compiler_settings: JSON.stringify(compilerInput.settings),
    optimization_used: true,
    optimization_runs: optimizationRuns,
    evm_version: "paris",
    files: [{ name: "Strategy.sol", content: source }],
  };

  for (const apiUrl of API_URLS) {
    try {
      const res = await fetch(
        `${apiUrl}/smart-contracts/${contractAddress}/verification/via/standard-input`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      if (res.ok) {
        return {
          verified: true,
          message: "Contract verified on Mantle Explorer",
          explorerUrl: `${EXPLORER_URL}/address/${contractAddress}`,
        };
      }

      const errText = await res.text();
      // If this API returns anything but 503, log it and try next
      if (errText.includes("503")) continue;
    } catch {
      // try next API URL
    }
  }

  // All verifications failed — still return the explorer URL so user can verify manually
  return {
    verified: false,
    message: `Auto-verification unavailable. Verify manually at ${EXPLORER_URL}/address/${contractAddress}`,
    explorerUrl: `${EXPLORER_URL}/address/${contractAddress}`,
  };
}
