const EXPLORER = "https://explorer.sepolia.mantle.xyz";

export interface VerificationInfo {
  explorerUrl: string;
  contractAddress: string;
  source: string;
  contractName: string;
  compilerVersion: string;
  optimizationRuns: number;
  manualSteps: string[];
}

export function getVerificationInfo(
  contractAddress: string,
  source: string,
  contractName: string,
  compilerVersion: string,
  optimizationRuns: number,
): VerificationInfo {
  return {
    explorerUrl: `${EXPLORER}/address/${contractAddress}`,
    contractAddress,
    source,
    contractName,
    compilerVersion,
    optimizationRuns,
    manualSteps: [
      `Open ${EXPLORER}/address/${contractAddress}`,
      "Click the 'Contract' tab",
      "Click 'Verify and Publish'",
      `Select compiler: ${compilerVersion}`,
      `Set optimization: ${optimizationRuns} runs`,
      "Paste the source code shown below",
      "Submit — done",
    ],
  };
}
