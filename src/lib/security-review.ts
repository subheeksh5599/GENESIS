import OpenAI from "openai";

let _client: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!process.env.NVIDIA_API_KEY) return null;
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.NVIDIA_API_KEY,
      baseURL: "https://integrate.api.nvidia.com/v1",
    });
  }
  return _client;
}

const PRIMARY_MODEL = process.env.NVIDIA_MODEL || "nvidia/llama-3.1-nemotron-ultra-253b-v1";
const FALLBACK_MODEL = "deepseek-ai/deepseek-r1";

// Paschov vulnerability catalog — known patterns to scan for
const PASCHOV_PATTERNS = `
PASCHOV VULNERABILITY CATALOG (v1.0) — Smart Contract Security Review Framework

CRITICAL (must reject if found):
1. REENTRANCY — External call before state change (CEI violation). Any call to external contract before updating internal state. Check for transfer/send/call preceding state updates.
2. UNCHECKED EXTERNAL CALLS — low-level .call() without checking return value or using unchecked block around arithmetic.
3. UNPROTECTED SELFDESTRUCT — selfdestruct/delegatecall without access control.
4. STORAGE COLLISION — Upgradeable contracts with variables declared between inherited contracts that collide.
5. UNINITIALIZED PROXY — UUPS proxy missing _disableInitializers() in constructor or missing onlyProxy modifier.

HIGH (reject unless explicitly justified):
6. MISSING ACCESS CONTROL — Functions that transfer funds or change state without onlyOwner or role checks.
7. SLIPPAGE ABSENCE — Swap/AMM interactions without minAmountOut or deadline parameters.
8. TIMESTAMP DEPENDENCE — Using block.timestamp for critical logic without acceptable bounds.
9. FRONTRUNNABLE INITIALIZATION — initialize() function without access control (anyone can call it).
10. UNBOUNDED LOOPS — Loops over arrays that can be externally inflated (gas griefing).
11. MISSING EMERGENCY WITHDRAWAL — No function to recover stuck tokens in case of bug.
12. ORACLE MANIPULATION — Using spot DEX price as oracle without TWAP or safety checks.

MEDIUM (flag, allow with warning):
13. CENTRALIZATION RISK — Single owner/admin has unilateral power over user funds.
14. MISSING EVENTS — State changes without emitting events.
15. MAGIC NUMBERS — Hardcoded values without explanation or constant declaration.
16. FLOATING PRAGMA — Using ^0.8.0 instead of fixed 0.8.26.
17. UNUSED IMPORTS — Imported but unused OpenZeppelin contracts.
18. GAS OPTIMIZATION — Redundant storage reads, unchecked arithmetic where safe.

INFORMATIONAL:
19. NATSPEC COVERAGE — Functions missing @notice, @param, @return documentation.
20. LICENSE DECLARATION — Missing or incorrect SPDX license identifier.

SCORING:
- 0 critical + 0 high = APPROVED (score 80+)
- 0 critical + 1-2 high = WARNING (score 60-79)
- 1+ critical OR 3+ high = REJECTED (score < 60)
`;

export interface SecurityFinding {
  severity: "critical" | "high" | "medium" | "info";
  category: string;
  line: number;
  description: string;
  recommendation: string;
}

export interface SecurityReport {
  score: number;
  status: "approved" | "warning" | "rejected";
  findings: SecurityFinding[];
  summary: string;
  modelUsed: string;
}

export async function reviewContract(source: string): Promise<SecurityReport> {
  const client = getClient();

  if (!client) {
    return offlineReview(source);
  }

  // Try primary model first, fallback to DeepSeek
  for (const model of [PRIMARY_MODEL, FALLBACK_MODEL]) {
    try {
      const response = await client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: `You are a world-class Solidity security auditor. Review the provided smart contract against the Paschov Vulnerability Catalog below.

Return a JSON object with this structure (no other text):
{
  "score": <0-100>,
  "findings": [
    {
      "severity": "critical|high|medium|info",
      "category": "<pattern name from catalog>",
      "line": <line number or 0 if not line-specific>,
      "description": "<what you found>",
      "recommendation": "<how to fix>"
    }
  ],
  "summary": "<one sentence verdict>"
}

SCORING RULES: -10 per critical, -7 per high, -3 per medium, -1 per info.
STATUS: score >= 80 = "approved", 60-79 = "warning", <60 = "rejected".

${PASCHOV_PATTERNS}`,
          },
          {
            role: "user",
            content: `Review this Solidity contract for security vulnerabilities:\n\n\`\`\`solidity\n${source}\n\`\`\``,
          },
        ],
        temperature: 0.1,
        max_tokens: 2048,
      });

      const text = response.choices[0]?.message?.content || "";
      const parsed = parseResponse(text);

      return {
        ...parsed,
        modelUsed: model,
        status:
          parsed.score >= 80 ? "approved" : parsed.score >= 60 ? "warning" : "rejected",
      };
    } catch {
      // fall through to next model or offline
    }
  }

  return offlineReview(source);
}

function parseResponse(text: string): Omit<SecurityReport, "modelUsed"> {
  try {
    // Try direct JSON parse
    const jsonStr = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const data = JSON.parse(jsonStr);
    return {
      score: Math.max(0, Math.min(100, data.score || 70)),
      status: "warning",
      findings: Array.isArray(data.findings) ? data.findings : [],
      summary: data.summary || "Security review completed.",
    };
  } catch {
    // Fallback: extract score from text
    const scoreMatch = text.match(/score.*?(\d{1,3})/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 70;
    return {
      score,
      status: score >= 80 ? "approved" : score >= 60 ? "warning" : "rejected",
      findings: [],
      summary: "Review completed but response parsing failed. Score estimated from raw output.",
    };
  }
}

function offlineReview(source: string): SecurityReport {
  // Static analysis fallback (no LLM needed)
  const findings: SecurityFinding[] = [];

  // Check for common patterns
  if (!source.includes("ReentrancyGuard") && !source.includes("nonReentrant")) {
    findings.push({
      severity: "high",
      category: "REENTRANCY",
      line: 0,
      description: "No ReentrancyGuard used on state-modifying functions.",
      recommendation: "Add ReentrancyGuard from OpenZeppelin and use nonReentrant modifier.",
    });
  }

  if (!source.includes("Ownable") && !source.includes("onlyOwner")) {
    findings.push({
      severity: "critical",
      category: "MISSING ACCESS CONTROL",
      line: 0,
      description: "No access control pattern detected.",
      recommendation: "Use OpenZeppelin Ownable and add onlyOwner to sensitive functions.",
    });
  }

  if (source.includes(".call{") && !source.includes("require(success")) {
    findings.push({
      severity: "high",
      category: "UNCHECKED EXTERNAL CALLS",
      line: 0,
      description: "Low-level .call() without checking return value.",
      recommendation: "Require successful return from all low-level calls.",
    });
  }

  if (!source.includes("emergency") && !source.includes("Emergency")) {
    findings.push({
      severity: "medium",
      category: "MISSING EMERGENCY WITHDRAWAL",
      line: 0,
      description: "No emergency withdrawal function found.",
      recommendation: "Add an onlyOwner emergencyWithdraw() to recover stuck funds.",
    });
  }

  if (source.includes("^0.8")) {
    findings.push({
      severity: "info",
      category: "FLOATING PRAGMA",
      line: 0,
      description: "Floating pragma (^0.8.x) used instead of fixed version.",
      recommendation: "Use fixed pragma: pragma solidity 0.8.26;",
    });
  }

  const criticals = findings.filter((f) => f.severity === "critical").length;
  const highs = findings.filter((f) => f.severity === "high").length;
  const score = Math.max(0, 100 - criticals * 10 - highs * 7);

  return {
    score,
    status: score >= 80 ? "approved" : score >= 60 ? "warning" : "rejected",
    findings,
    summary: findings.length > 0
      ? `Found ${findings.length} issue(s): ${criticals} critical, ${highs} high.`
      : "No critical issues detected in static analysis.",
    modelUsed: "static-analysis",
  };
}
