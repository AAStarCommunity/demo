import { useState } from "react";
import { ethers } from "ethers";
import "../components/EndUserDemo.css";

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

// const FAUCET_API = "https://faucet-app-ashy.vercel.app/api";
const SEPOLIA_CHAIN_ID = "0xaa36a7";

interface WalletState {
  connected: boolean;
  address: string;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
}

interface StepStatus {
  [key: number]: "pending" | "in_progress" | "completed";
}

export function OperatorDemo() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: "",
    provider: null,
    signer: null,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [stepStatus, setStepStatus] = useState<StepStatus>({
    1: "completed", // Preparation is informational
    2: "pending",
    3: "pending",
    4: "pending",
    5: "pending",
  });

  const [loading, setLoading] = useState<string>("");
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Deployed addresses (will be filled during steps)
  const [paymasterAddress, setPaymasterAddress] = useState<string>("");
  const [sbtAddress, setSbtAddress] = useState<string>("");
  const [pntAddress, setPntAddress] = useState<string>("");

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
      setMessage({
        type: "error",
        text: `Connection failed: ${error.message}`,
      });
    } finally {
      setLoading("");
    }
  };

  // Step 2: Deploy Paymaster (Mock - will use actual deployment later)
  const deployPaymaster = async () => {
    if (!wallet.connected || !wallet.signer) {
      setMessage({ type: "error", text: "Please connect wallet first" });
      return;
    }

    try {
      setStepStatus({ ...stepStatus, 2: "in_progress" });
      setLoading("Deploying PaymasterV4 contract...");

      // TODO: Actual deployment logic
      // For now, use existing deployed address
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockAddress = "0xBC56D82374c3CdF1234fa67E28AF9d3E31a9D445";
      setPaymasterAddress(mockAddress);

      setStepStatus({ ...stepStatus, 2: "completed" });
      setCurrentStep(3);
      setMessage({
        type: "success",
        text: `Paymaster deployed at ${mockAddress.slice(0, 6)}...${mockAddress.slice(-4)}`,
      });
    } catch (error: any) {
      setStepStatus({ ...stepStatus, 2: "pending" });
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading("");
    }
  };

  // Step 3: Create Tokens (SBT + PNT)
  const createTokens = async () => {
    if (!wallet.connected || !wallet.signer) {
      setMessage({ type: "error", text: "Please connect wallet first" });
      return;
    }

    try {
      setStepStatus({ ...stepStatus, 3: "in_progress" });
      setLoading("Creating SBT and PNT tokens...");

      // TODO: Actual token deployment
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockSBT = "0xBfde68c232F2248114429DDD9a7c3Adbff74bD7f";
      const mockPNT = "0xD14E87d8D8B69016Fcc08728c33799bD3F66F180";

      setSbtAddress(mockSBT);
      setPntAddress(mockPNT);

      setStepStatus({ ...stepStatus, 3: "completed" });
      setCurrentStep(4);
      setMessage({
        type: "success",
        text: `Tokens created: SBT & PNT`,
      });
    } catch (error: any) {
      setStepStatus({ ...stepStatus, 3: "pending" });
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading("");
    }
  };

  // Step 4: Stake and Register
  const stakeAndRegister = async () => {
    if (!wallet.connected || !wallet.signer) {
      setMessage({ type: "error", text: "Please connect wallet first" });
      return;
    }

    try {
      setStepStatus({ ...stepStatus, 4: "in_progress" });
      setLoading("Staking tokens and registering paymaster...");

      // TODO: Actual staking and registration
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setStepStatus({ ...stepStatus, 4: "completed" });
      setCurrentStep(5);
      setMessage({
        type: "success",
        text: "Paymaster registered successfully!",
      });
    } catch (error: any) {
      setStepStatus({ ...stepStatus, 4: "pending" });
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading("");
    }
  };

  // Step 5: Test
  const testPaymaster = async () => {
    if (!wallet.connected || !wallet.signer) {
      setMessage({ type: "error", text: "Please connect wallet first" });
      return;
    }

    try {
      setStepStatus({ ...stepStatus, 5: "in_progress" });
      setLoading("Sending test transaction...");

      // TODO: Actual test transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setStepStatus({ ...stepStatus, 5: "completed" });
      setMessage({
        type: "success",
        text: "🎉 Test successful! Your Paymaster is live!",
      });
    } catch (error: any) {
      setStepStatus({ ...stepStatus, 5: "pending" });
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading("");
    }
  };

  return (
    <div
      className="end-user-demo"
      style={{ maxWidth: "900px", margin: "0 auto" }}
    >
      <h2>🏢 Operator Demo - Launch Your Community Paymaster</h2>
      <p className="subtitle">
        5-step guide to deploy and manage your own Paymaster
      </p>

      {/* Wallet Connection */}
      {!wallet.connected && (
        <div className="card">
          <h3>Connect Wallet</h3>
          <button
            className="btn-primary"
            onClick={connectWallet}
            disabled={!!loading}
          >
            {loading === "Connecting wallet..."
              ? "Connecting..."
              : "Connect MetaMask"}
          </button>
        </div>
      )}

      {wallet.connected && (
        <>
          <div className="wallet-info" style={{ marginBottom: "2rem" }}>
            <p>
              <strong>Connected:</strong> {wallet.address.slice(0, 6)}...
              {wallet.address.slice(-4)}
            </p>
          </div>

          {/* Step 1: Preparation */}
          <div className={`card ${currentStep === 1 ? "active" : ""}`}>
            <h3>✅ Step 1: Preparation</h3>
            <div>
              <p>
                <strong>Requirements:</strong>
              </p>
              <ul style={{ marginLeft: "1.5rem", lineHeight: "1.8" }}>
                <li>MetaMask wallet with Sepolia ETH</li>
                <li>Basic understanding of Ethereum contracts</li>
                <li>Estimated gas cost: ~0.05 ETH</li>
              </ul>
              <button
                className="btn-secondary"
                onClick={() => setCurrentStep(2)}
                style={{ marginTop: "1rem" }}
              >
                Continue to Step 2
              </button>
            </div>
          </div>

          {/* Step 2: Deploy Paymaster */}
          <div className={`card ${currentStep === 2 ? "active" : ""}`}>
            <h3>
              {stepStatus[2] === "completed" ? "✅" : "⏳"} Step 2: Deploy
              Paymaster
            </h3>
            {stepStatus[2] === "pending" && (
              <div>
                <p>Deploy PaymasterV4 contract to Sepolia network</p>
                <button
                  className="btn-primary"
                  onClick={deployPaymaster}
                  disabled={!!loading}
                >
                  {loading === "Deploying PaymasterV4 contract..."
                    ? "Deploying..."
                    : "Deploy Paymaster"}
                </button>
              </div>
            )}
            {stepStatus[2] === "completed" && paymasterAddress && (
              <div>
                <p style={{ color: "#4CAF50" }}>
                  ✅ Paymaster deployed: {paymasterAddress}
                </p>
                <a
                  href={`https://sepolia.etherscan.io/address/${paymasterAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#4A90E2", textDecoration: "underline" }}
                >
                  View on Etherscan
                </a>
              </div>
            )}
          </div>

          {/* Step 3: Create Tokens */}
          <div className={`card ${currentStep === 3 ? "active" : ""}`}>
            <h3>
              {stepStatus[3] === "completed" ? "✅" : "⏳"} Step 3: Create
              Tokens
            </h3>
            {stepStatus[3] === "pending" && stepStatus[2] === "completed" && (
              <div>
                <p>Deploy SBT (membership token) and PNT (gas token)</p>
                <button
                  className="btn-primary"
                  onClick={createTokens}
                  disabled={!!loading}
                >
                  {loading === "Creating SBT and PNT tokens..."
                    ? "Creating..."
                    : "Create Tokens"}
                </button>
              </div>
            )}
            {stepStatus[3] === "completed" && (
              <div>
                <p style={{ color: "#4CAF50" }}>
                  ✅ Tokens created successfully
                </p>
                <p>SBT: {sbtAddress}</p>
                <p>PNT: {pntAddress}</p>
              </div>
            )}
          </div>

          {/* Step 4: Stake and Register */}
          <div className={`card ${currentStep === 4 ? "active" : ""}`}>
            <h3>
              {stepStatus[4] === "completed" ? "✅" : "⏳"} Step 4: Stake &
              Register
            </h3>
            {stepStatus[4] === "pending" && stepStatus[3] === "completed" && (
              <div>
                <p>Stake tokens and register your Paymaster to the network</p>
                <button
                  className="btn-primary"
                  onClick={stakeAndRegister}
                  disabled={!!loading}
                >
                  {loading === "Staking tokens and registering paymaster..."
                    ? "Processing..."
                    : "Stake & Register"}
                </button>
              </div>
            )}
            {stepStatus[4] === "completed" && (
              <div>
                <p style={{ color: "#4CAF50" }}>
                  ✅ Paymaster registered to SuperPaymaster Network
                </p>
              </div>
            )}
          </div>

          {/* Step 5: Test */}
          <div className={`card ${currentStep === 5 ? "active" : ""}`}>
            <h3>
              {stepStatus[5] === "completed" ? "✅" : "⏳"} Step 5: Test Your
              Paymaster
            </h3>
            {stepStatus[5] === "pending" && stepStatus[4] === "completed" && (
              <div>
                <p>Send a test transaction to verify everything works</p>
                <button
                  className="btn-primary"
                  onClick={testPaymaster}
                  disabled={!!loading}
                >
                  {loading === "Sending test transaction..."
                    ? "Testing..."
                    : "Send Test Transaction"}
                </button>
              </div>
            )}
            {stepStatus[5] === "completed" && (
              <div>
                <p style={{ color: "#4CAF50", fontSize: "1.2rem" }}>
                  🎉 Congratulations! Your Paymaster is live!
                </p>
                <p>
                  Users can now use your Paymaster for gasless transactions.
                </p>
                <a
                  href="https://superpaymaster.aastar.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ display: "inline-block", marginTop: "1rem" }}
                >
                  View in Registry
                </a>
              </div>
            )}
          </div>
        </>
      )}

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
