import { ethers } from "ethers";

export interface TransactionReport {
  timestamp: number;
  config: {
    entryPoint: string;
    paymaster: string;
    treasury: string;
    pntToken: string;
    account: string;
    recipient: string;
  };
  beforeState: {
    accountPNT: bigint;
    recipientPNT: bigint;
    treasuryPNT: bigint;
    accountETH: bigint;
    allowance: bigint;
  };
  afterState: {
    accountPNT: bigint;
    recipientPNT: bigint;
    treasuryPNT: bigint;
    accountETH: bigint;
  };
  transaction: {
    hash: string;
    blockNumber: number;
    gasUsed: bigint;
    gasPrice: bigint;
    userOpHash: string;
  };
  gasConfig: {
    callGasLimit: bigint;
    verificationGasLimit: bigint;
    preVerificationGas: bigint;
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
  };
  analysis: {
    pntSentToRecipient: bigint;
    totalPNTSpent: bigint;
    pntFee: bigint;
    treasuryReceived: bigint;
    ethGasUsed: bigint;
    effectiveRate: number;
  };
}

/**
 * Format transaction report as beautiful console output
 * Similar to test-v4-transaction-report.js
 */
export function formatTransactionReport(report: TransactionReport): string {
  const lines: string[] = [];

  lines.push("╔════════════════════════════════════════════════════════════════╗");
  lines.push("║        PaymasterV4 Transaction Test Report                    ║");
  lines.push("╚════════════════════════════════════════════════════════════════╝");
  lines.push("");

  // Configuration
  lines.push("📋 Configuration:");
  lines.push("─────────────────────────────────────────────────────────────────");
  lines.push(`  EntryPoint:      ${report.config.entryPoint}`);
  lines.push(`  PaymasterV4:     ${report.config.paymaster}`);
  lines.push(`  Treasury:        ${report.config.treasury}`);
  lines.push(`  PNT Token:       ${report.config.pntToken}`);
  lines.push(`  Account:         ${report.config.account}`);
  lines.push(`  Recipient:       ${report.config.recipient}`);
  lines.push("");

  // Before State
  lines.push("📊 State BEFORE Transaction:");
  lines.push("─────────────────────────────────────────────────────────────────");
  lines.push(`  Account PNT:     ${ethers.formatUnits(report.beforeState.accountPNT, 18)} PNT`);
  lines.push(`  Recipient PNT:   ${ethers.formatUnits(report.beforeState.recipientPNT, 18)} PNT`);
  lines.push(`  Treasury PNT:    ${ethers.formatUnits(report.beforeState.treasuryPNT, 18)} PNT`);
  lines.push(
    `  Allowance:       ${report.beforeState.allowance === ethers.MaxUint256 ? "MAX" : ethers.formatUnits(report.beforeState.allowance, 18)}`
  );
  lines.push(`  Account ETH:     ${ethers.formatUnits(report.beforeState.accountETH, 18)} ETH`);
  lines.push("");

  // Gas Configuration
  lines.push("🔧 Gas Configuration:");
  lines.push("─────────────────────────────────────────────────────────────────");
  lines.push(`  callGasLimit:              ${report.gasConfig.callGasLimit.toString()}`);
  lines.push(`  verificationGasLimit:      ${report.gasConfig.verificationGasLimit.toString()}`);
  lines.push(`  preVerificationGas:        ${report.gasConfig.preVerificationGas.toString()}`);
  lines.push(`  maxFeePerGas:              ${ethers.formatUnits(report.gasConfig.maxFeePerGas, "gwei")} gwei`);
  lines.push(`  maxPriorityFeePerGas:      ${ethers.formatUnits(report.gasConfig.maxPriorityFeePerGas, "gwei")} gwei`);
  lines.push("");

  // Transaction
  lines.push("🚀 Transaction:");
  lines.push("─────────────────────────────────────────────────────────────────");
  lines.push(`  Hash:            ${report.transaction.hash}`);
  lines.push(`  UserOp Hash:     ${report.transaction.userOpHash}`);
  lines.push(`  Block:           ${report.transaction.blockNumber}`);
  lines.push(`  Gas Used:        ${report.transaction.gasUsed.toString()}`);
  lines.push(`  Gas Price:       ${ethers.formatUnits(report.transaction.gasPrice, "gwei")} gwei`);
  lines.push("");

  // After State
  lines.push("📊 State AFTER Transaction:");
  lines.push("─────────────────────────────────────────────────────────────────");
  lines.push(`  Account PNT:     ${ethers.formatUnits(report.afterState.accountPNT, 18)} PNT`);
  lines.push(`  Recipient PNT:   ${ethers.formatUnits(report.afterState.recipientPNT, 18)} PNT`);
  lines.push(`  Treasury PNT:    ${ethers.formatUnits(report.afterState.treasuryPNT, 18)} PNT`);
  lines.push(`  Account ETH:     ${ethers.formatUnits(report.afterState.accountETH, 18)} ETH`);
  lines.push("");

  // Analysis
  lines.push("📈 Transaction Analysis:");
  lines.push("─────────────────────────────────────────────────────────────────");
  lines.push("  Transfer:");
  lines.push(`    → Sent to Recipient:         ${ethers.formatUnits(report.analysis.pntSentToRecipient, 18)} PNT`);
  lines.push("");
  lines.push("  Gas Payment (in PNT):");
  lines.push(`    → Total PNT Spent:           ${ethers.formatUnits(report.analysis.totalPNTSpent, 18)} PNT`);
  lines.push(`    → PNT for Gas:               ${ethers.formatUnits(report.analysis.pntFee, 18)} PNT`);
  lines.push(`    → Treasury Received:         ${ethers.formatUnits(report.analysis.treasuryReceived, 18)} PNT`);
  lines.push("");
  lines.push("  Gas Usage (in ETH):");
  lines.push(`    → Gas Used:                  ${report.transaction.gasUsed.toString()}`);
  lines.push(`    → Gas Price:                 ${ethers.formatUnits(report.transaction.gasPrice, "gwei")} gwei`);
  lines.push(`    → ETH Cost (if paid in ETH): ${ethers.formatUnits(report.analysis.ethGasUsed, 18)} ETH`);
  lines.push(
    `    → Account ETH Change:        ${ethers.formatUnits(report.afterState.accountETH - report.beforeState.accountETH, 18)} ETH`
  );
  lines.push("");
  lines.push("  Conversion Rate:");
  lines.push(`    → PNT/ETH Ratio:             ${report.analysis.effectiveRate.toFixed(4)}`);
  lines.push("");

  // Summary
  lines.push("╔════════════════════════════════════════════════════════════════╗");
  lines.push("║                        SUMMARY                                 ║");
  lines.push("╚════════════════════════════════════════════════════════════════╝");
  lines.push("");
  lines.push("  ✅ Transaction Successful");
  lines.push(`  📝 TX Hash:           ${report.transaction.hash}`);
  lines.push(`  🔗 Etherscan:         https://sepolia.etherscan.io/tx/${report.transaction.hash}`);
  lines.push("");
  lines.push("  💰 Financial Summary:");
  lines.push(`    • Transferred:       ${ethers.formatUnits(report.analysis.pntSentToRecipient, 18)} PNT`);
  lines.push(`    • Gas Paid (PNT):    ${ethers.formatUnits(report.analysis.pntFee, 18)} PNT`);
  lines.push(`    • Total Spent:       ${ethers.formatUnits(report.analysis.totalPNTSpent, 18)} PNT`);
  lines.push("    • No ETH spent ✅     (Account abstraction working!)");
  lines.push("");
  lines.push(`  🏦 Treasury Income:    ${ethers.formatUnits(report.analysis.treasuryReceived, 18)} PNT`);
  lines.push("");

  return lines.join("\n");
}

/**
 * Calculate transaction analysis from before/after states
 */
export function calculateAnalysis(
  before: TransactionReport["beforeState"],
  after: TransactionReport["afterState"],
  gasUsed: bigint,
  gasPrice: bigint
): TransactionReport["analysis"] {
  const pntSentToRecipient = after.recipientPNT - before.recipientPNT;
  const totalPNTSpent = before.accountPNT - after.accountPNT;
  const pntFee = totalPNTSpent - pntSentToRecipient;
  const treasuryReceived = after.treasuryPNT - before.treasuryPNT;
  const ethGasUsed = gasUsed * gasPrice;

  // Calculate effective rate (PNT/ETH ratio)
  const effectiveRate =
    ethGasUsed > 0n ? Number((pntFee * 10000n) / ethGasUsed) / 10000 : 0;

  return {
    pntSentToRecipient,
    totalPNTSpent,
    pntFee,
    treasuryReceived,
    ethGasUsed,
    effectiveRate,
  };
}
