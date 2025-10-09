import { useState } from "react";
import { ethers } from "ethers";
import "../components/EndUserDemo.css";
import { formatTransactionReport, TransactionReport } from "../utils/transactionReporter";

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

const SEPOLIA_CHAIN_ID = "0xaa36a7";

// Mock transaction report for demo
const MOCK_REPORT: TransactionReport = {
  timestamp: Date.now(),
  config: {
    entryPoint: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
    paymaster: "0xBC56D82374c3CdF1234fa67E28AF9d3E31a9D445",
    treasury: "0x411BD567E46C0781248dbB6a9211891C032885e5",
    pntToken: "0xD14E87d8D8B69016Fcc08728c33799bD3F66F180",
    account: "0x94FC9B8B7cAb56C01f20A24E37C2433FCe88A10D",
    recipient: "0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA",
  },
  beforeState: {
    accountPNT: ethers.parseUnits("100", 18),
    recipientPNT: ethers.parseUnits("50", 18),
    treasuryPNT: ethers.parseUnits("1000", 18),
    accountETH: ethers.parseUnits("0.1", 18),
    allowance: ethers.MaxUint256,
  },
  afterState: {
    accountPNT: ethers.parseUnits("99.48", 18),
    recipientPNT: ethers.parseUnits("50.5", 18),
    treasuryPNT: ethers.parseUnits("1000.02", 18),
    accountETH: ethers.parseUnits("0.1", 18),
  },
  transaction: {
    hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    blockNumber: 5432100,
    gasUsed: 150000n,
    gasPrice: ethers.parseUnits("2", "gwei"),
    userOpHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  },
  gasConfig: {
    callGasLimit: 100000n,
    verificationGasLimit: 300000n,
    preVerificationGas: 100000n,
    maxFeePerGas: ethers.parseUnits("2.5", "gwei"),
    maxPriorityFeePerGas: ethers.parseUnits("0.1", "gwei"),
  },
  analysis: {
    pntSentToRecipient: ethers.parseUnits("0.5", 18),
    totalPNTSpent: ethers.parseUnits("0.52", 18),
    pntFee: ethers.parseUnits("0.02", 18),
    treasuryReceived: ethers.parseUnits("0.02", 18),
    ethGasUsed: 150000n * ethers.parseUnits("2", "gwei"),
    effectiveRate: 1.0667,
  },
};

interface WalletState {
  connected: boolean;
  address: string;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
}

export function DeveloperDemo() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: "",
    provider: null,
    signer: null,
  });

  const [activeTab, setActiveTab] = useState<"quickstart" | "userOp" | "report">("quickstart");
  const [loading, setLoading] = useState<string>("");
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setMessage({ type: "error", text: "Please install MetaMask first!" });
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    try {
      setLoading("Connecting wallet...");
      const provider = new ethers.BrowserProvider(window.ethereum);

      await provider.send("eth_requestAccounts", []);

      // Switch to Sepolia
      try {
        await provider.send("wallet_switchEthereumChain", [
          { chainId: SEPOLIA_CHAIN_ID },
        ]);
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await provider.send("wallet_addEthereumChain", [
            {
              chainId: SEPOLIA_CHAIN_ID,
              chainName: "Sepolia Testnet",
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://rpc.sepolia.org"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ]);
        }
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setWallet({ connected: true, address, provider, signer });
      setMessage({
        type: "success",
        text: `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error: any) {
      setMessage({ type: "error", text: `Connection failed: ${error.message}` });
    } finally {
      setLoading("");
    }
  };

  const quickstartCode = `// 1. Install dependencies
npm install ethers @account-abstraction/contracts

// 2. Import contracts
import { ethers } from "ethers";
const PAYMASTER_V4 = "0xBC56D82374c3CdF1234fa67E28AF9d3E31a9D445";
const PNT_TOKEN = "0xD14E87d8D8B69016Fcc08728c33799bD3F66F180";

// 3. Construct paymasterAndData
const paymasterAndData = ethers.concat([
  PAYMASTER_V4,
  ethers.zeroPadValue(ethers.toBeHex(200000n), 16), // verification gas
  ethers.zeroPadValue(ethers.toBeHex(100000n), 16), // postOp gas
  PNT_TOKEN, // gas token address
]);

// 4. Build UserOperation
const userOp = {
  sender: simpleAccountAddress,
  nonce: await account.getNonce(),
  initCode: "0x",
  callData: executeCalldata,
  accountGasLimits,
  preVerificationGas,
  gasFees,
  paymasterAndData, // ← SuperPaymaster handles gas payment
  signature: "0x", // sign after
};

// 5. Submit via EntryPoint
const tx = await entryPoint.handleOps([userOp], beneficiary);`;

  const userOpCode = `// Complete UserOperation v0.7 Structure
interface PackedUserOperation {
  sender: string;           // AA account address
  nonce: bigint;            // Anti-replay nonce
  initCode: string;         // Factory call (if deploying)
  callData: string;         // Actual transaction data
  accountGasLimits: string; // Packed: [verificationGas, callGas]
  preVerificationGas: bigint;
  gasFees: string;          // Packed: [maxPriorityFee, maxFee]
  paymasterAndData: string; // Paymaster info + gas token
  signature: string;        // Owner signature
}

// Gas Limits Packing (v0.7)
const accountGasLimits = ethers.concat([
  ethers.zeroPadValue(ethers.toBeHex(verificationGasLimit), 16),
  ethers.zeroPadValue(ethers.toBeHex(callGasLimit), 16),
]);

// Gas Fees Packing (v0.7)
const gasFees = ethers.concat([
  ethers.zeroPadValue(ethers.toBeHex(maxPriorityFeePerGas), 16),
  ethers.zeroPadValue(ethers.toBeHex(maxFeePerGas), 16),
]);

// PaymasterAndData Structure
const paymasterAndData = ethers.concat([
  PAYMASTER_ADDRESS,                                    // 20 bytes
  ethers.zeroPadValue(ethers.toBeHex(200000n), 16),   // 16 bytes (verification gas)
  ethers.zeroPadValue(ethers.toBeHex(100000n), 16),   // 16 bytes (postOp gas)
  GAS_TOKEN_ADDRESS,                                    // 20 bytes (user-specified token)
]);`;

  const reportText = formatTransactionReport(MOCK_REPORT);

  return (
    <div className="end-user-demo" style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <h2>👨‍💻 Developer Demo - Integrate SuperPaymaster</h2>
      <p className="subtitle">Code examples, UserOp structure, and transaction reports</p>

      {/* Wallet Connection */}
      {!wallet.connected && (
        <div className="card">
          <h3>Connect Wallet (Optional)</h3>
          <p style={{ color: "#666", marginBottom: "1rem" }}>
            Connect to test transactions or view the code examples below
          </p>
          <button
            className="btn-primary"
            onClick={connectWallet}
            disabled={!!loading}
          >
            {loading === "Connecting wallet..." ? "Connecting..." : "Connect MetaMask"}
          </button>
        </div>
      )}

      {wallet.connected && (
        <div className="wallet-info" style={{ marginBottom: "2rem" }}>
          <p>
            <strong>Connected:</strong> {wallet.address.slice(0, 6)}...
            {wallet.address.slice(-4)}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: "2rem" }}>
        <button
          className={activeTab === "quickstart" ? "tab-active" : "tab"}
          onClick={() => setActiveTab("quickstart")}
        >
          Quick Start
        </button>
        <button
          className={activeTab === "userOp" ? "tab-active" : "tab"}
          onClick={() => setActiveTab("userOp")}
        >
          UserOp Structure
        </button>
        <button
          className={activeTab === "report" ? "tab-active" : "tab"}
          onClick={() => setActiveTab("report")}
        >
          Transaction Report
        </button>
      </div>

      {/* Quick Start Tab */}
      {activeTab === "quickstart" && (
        <div className="card">
          <h3>🚀 Quick Start Guide</h3>
          <p style={{ marginBottom: "1rem" }}>
            Integrate SuperPaymaster in 5 steps to enable gasless transactions
          </p>
          <pre
            style={{
              background: "#1e1e1e",
              color: "#d4d4d4",
              padding: "1.5rem",
              borderRadius: "8px",
              overflow: "auto",
              fontSize: "0.9rem",
              lineHeight: "1.6",
            }}
          >
            <code>{quickstartCode}</code>
          </pre>
          <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#e3f2fd", borderRadius: "8px" }}>
            <p style={{ margin: 0 }}>
              💡 <strong>Key Point:</strong> SuperPaymaster automatically converts PNT tokens to pay for gas.
              Users never need to hold ETH!
            </p>
          </div>
        </div>
      )}

      {/* UserOp Structure Tab */}
      {activeTab === "userOp" && (
        <div className="card">
          <h3>📋 UserOperation v0.7 Structure</h3>
          <p style={{ marginBottom: "1rem" }}>
            Complete TypeScript interface and packing logic for ERC-4337 v0.7
          </p>
          <pre
            style={{
              background: "#1e1e1e",
              color: "#d4d4d4",
              padding: "1.5rem",
              borderRadius: "8px",
              overflow: "auto",
              fontSize: "0.9rem",
              lineHeight: "1.6",
            }}
          >
            <code>{userOpCode}</code>
          </pre>
          <div style={{ marginTop: "1.5rem" }}>
            <h4>Key Differences from v0.6</h4>
            <ul style={{ lineHeight: "1.8", marginLeft: "1.5rem" }}>
              <li>
                <strong>Packed Gas Limits:</strong> <code>accountGasLimits</code> combines verification and call gas
              </li>
              <li>
                <strong>Packed Gas Fees:</strong> <code>gasFees</code> combines priority fee and max fee
              </li>
              <li>
                <strong>Simplified Paymaster Data:</strong> Fixed 72-byte structure
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Transaction Report Tab */}
      {activeTab === "report" && (
        <div className="card">
          <h3>📊 Transaction Report Example</h3>
          <p style={{ marginBottom: "1rem" }}>
            Detailed analysis of a gasless transaction using SuperPaymaster
          </p>
          <pre
            style={{
              background: "#1e1e1e",
              color: "#d4d4d4",
              padding: "1.5rem",
              borderRadius: "8px",
              overflow: "auto",
              fontSize: "0.85rem",
              lineHeight: "1.5",
              maxHeight: "600px",
            }}
          >
            <code>{reportText}</code>
          </pre>
          <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#e8f5e9", borderRadius: "8px" }}>
            <p style={{ margin: 0 }}>
              ✅ <strong>Success:</strong> The account spent 0.52 PNT total (0.5 transferred + 0.02 gas fee).
              No ETH was spent - Account Abstraction is working!
            </p>
          </div>
        </div>
      )}

      {/* Resources Section */}
      <div className="card" style={{ marginTop: "2rem" }}>
        <h3>📚 Additional Resources</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1rem", background: "#f5f5f5", borderRadius: "8px" }}>
            <h4>📖 Documentation</h4>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>
              Complete API reference and integration guides
            </p>
            <a
              href="https://docs.aastar.io"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#4A90E2", textDecoration: "underline" }}
            >
              Read Docs →
            </a>
          </div>
          <div style={{ padding: "1rem", background: "#f5f5f5", borderRadius: "8px" }}>
            <h4>💻 GitHub</h4>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>
              Open source contracts and SDKs
            </p>
            <a
              href="https://github.com/AAStarCommunity"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#4A90E2", textDecoration: "underline" }}
            >
              View on GitHub →
            </a>
          </div>
          <div style={{ padding: "1rem", background: "#f5f5f5", borderRadius: "8px" }}>
            <h4>🎮 Try Demo</h4>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>
              Test gasless transactions as an end user
            </p>
            <a
              href="/"
              style={{ color: "#4A90E2", textDecoration: "underline" }}
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = "#user";
              }}
            >
              Try Now →
            </a>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div
          style={{
            padding: "1rem",
            margin: "1rem 0",
            borderRadius: "8px",
            backgroundColor:
              message.type === "success"
                ? "#d4edda"
                : message.type === "error"
                ? "#f8d7da"
                : "#d1ecf1",
            color:
              message.type === "success"
                ? "#155724"
                : message.type === "error"
                ? "#721c24"
                : "#0c5460",
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
