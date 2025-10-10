/**
 * Test script for gasless transaction with SimpleAccountV2
 * Uses personal_sign (signMessage) instead of eth_sign
 */

import { ethers } from "ethers";

// Load from environment
const SEPOLIA_RPC_URL =
  process.env.VITE_SEPOLIA_RPC_URL ||
  "https://eth-sepolia.g.alchemy.com/v2/Bx4QRW1-vnwJUePSAAD7N";
const OWNER_PRIVATE_KEY =
  process.env.OWNER_PRIVATE_KEY ||
  "0x7c28d50030917fb555bb19ac888f973b28eff37a7853cdb2da46d23fb46e4724";
const SUBMITTER_PRIVATE_KEY =
  process.env.VITE_SUBMITTER_PRIVATE_KEY ||
  "0x7c28d50030917fb555bb19ac888f973b28eff37a7853cdb2da46d23fb46e4724";

// Contract addresses
const CONTRACTS = {
  entryPoint: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
  paymasterV4: "0xBC56D82374c3CdF1234fa67E28AF9d3E31a9D445",
  factoryV2: "0x8B516A71c134a4b5196775e63b944f88Cc637F2b",
  usdtToken: "0x14EaC6C3D49AEDff3D59773A7d7bfb50182bCfDc",
};

// ABIs
const SimpleAccountV2ABI = [
  "function execute(address dest, uint256 value, bytes calldata func) external",
  "function getNonce() public view returns (uint256)",
  "function owner() public view returns (address)",
  "function version() public pure returns (string memory)",
];

const SimpleAccountFactoryV2ABI = [
  "function createAccount(address owner, uint256 salt) external returns (address)",
  "function getAddress(address owner, uint256 salt) external view returns (address)",
];

const ERC20ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
];

const EntryPointABI = [
  "function handleOps((address sender, uint256 nonce, bytes initCode, bytes callData, bytes32 accountGasLimits, uint256 preVerificationGas, bytes32 gasFees, bytes paymasterAndData, bytes signature)[] ops, address payable beneficiary) external",
  "function getUserOpHash((address sender, uint256 nonce, bytes initCode, bytes callData, bytes32 accountGasLimits, uint256 preVerificationGas, bytes32 gasFees, bytes paymasterAndData, bytes signature) userOp) external view returns (bytes32)",
];

async function main() {
  console.log("🚀 Testing Gasless Transaction with SimpleAccountV2\n");

  // Setup provider and wallets
  const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
  const ownerWallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
  const submitterWallet = new ethers.Wallet(SUBMITTER_PRIVATE_KEY, provider);

  console.log("📝 Configuration:");
  console.log("Owner Address:", ownerWallet.address);
  console.log("Submitter Address:", submitterWallet.address);
  console.log("Factory V2:", CONTRACTS.factoryV2, "\n");

  // Step 1: Get or create AA account
  const factory = new ethers.Contract(
    CONTRACTS.factoryV2,
    SimpleAccountFactoryV2ABI,
    provider,
  );
  const salt = 0;
  const aaAccountAddress = await factory["getAddress(address,uint256)"](
    ownerWallet.address,
    salt,
  );

  console.log("🔑 AA Account Address:", aaAccountAddress);

  // Check if account exists
  const code = await provider.getCode(aaAccountAddress);
  if (code === "0x") {
    console.log("❌ Account not deployed yet. Creating account...");
    const createTx = await factory
      .connect(ownerWallet)
      .createAccount(ownerWallet.address, salt);
    await createTx.wait();
    console.log("✅ Account created!\n");
  } else {
    const account = new ethers.Contract(
      aaAccountAddress,
      SimpleAccountV2ABI,
      provider,
    );
    const version = await account.version();
    const owner = await account.owner();
    console.log("✅ Account exists!");
    console.log("   Version:", version);
    console.log("   Owner:", owner, "\n");
  }

  // Step 2: Build UserOperation
  const account = new ethers.Contract(
    aaAccountAddress,
    SimpleAccountV2ABI,
    provider,
  );
  const nonce = await account.getNonce();
  console.log("📊 Account Nonce:", nonce.toString());

  // USDT transfer calldata
  const usdtContract = new ethers.Contract(
    CONTRACTS.usdtToken,
    ERC20ABI,
    provider,
  );
  const recipient = "0xE3D28Aa77c95d5C098170698e5ba68824BFC008d"; // Test recipient
  const amount = ethers.parseUnits("1", 6); // 1 USDT (6 decimals)

  const transferCalldata = usdtContract.interface.encodeFunctionData(
    "transfer",
    [recipient, amount],
  );
  const executeCalldata = account.interface.encodeFunctionData("execute", [
    CONTRACTS.usdtToken,
    0,
    transferCalldata,
  ]);

  // Gas limits
  const callGasLimit = 100000n;
  const verificationGasLimit = 300000n;
  const preVerificationGas = 100000n;
  const maxPriorityFeePerGas = ethers.parseUnits("0.1", "gwei");

  const latestBlock = await provider.getBlock("latest");
  const baseFeePerGas =
    latestBlock?.baseFeePerGas || ethers.parseUnits("0.001", "gwei");
  const maxFeePerGas =
    baseFeePerGas + maxPriorityFeePerGas + ethers.parseUnits("0.001", "gwei");

  // Pack gas limits
  const accountGasLimits = ethers.concat([
    ethers.zeroPadValue(ethers.toBeHex(verificationGasLimit), 16),
    ethers.zeroPadValue(ethers.toBeHex(callGasLimit), 16),
  ]);

  const gasFees = ethers.concat([
    ethers.zeroPadValue(ethers.toBeHex(maxPriorityFeePerGas), 16),
    ethers.zeroPadValue(ethers.toBeHex(maxFeePerGas), 16),
  ]);

  // Paymaster data
  const paymasterAndData = ethers.concat([
    CONTRACTS.paymasterV4,
    ethers.zeroPadValue(ethers.toBeHex(200000n), 16),
    ethers.zeroPadValue(ethers.toBeHex(300000n), 16),
    "0x",
  ]);

  const userOp = {
    sender: aaAccountAddress,
    nonce,
    initCode: "0x",
    callData: executeCalldata,
    accountGasLimits,
    preVerificationGas,
    gasFees,
    paymasterAndData,
    signature: "0x",
  };

  console.log("\n📦 UserOperation built");

  // Step 3: Sign UserOperation with personal_sign (signMessage)
  const entryPoint = new ethers.Contract(
    CONTRACTS.entryPoint,
    EntryPointABI,
    provider,
  );
  const userOpHash = await entryPoint.getUserOpHash(userOp);
  console.log("🔐 UserOpHash:", userOpHash);

  // Use signMessage (personal_sign) - adds "\x19Ethereum Signed Message:\n32" prefix
  const signature = await ownerWallet.signMessage(ethers.getBytes(userOpHash));
  console.log("✍️  Signature:", signature);
  console.log("   Method: personal_sign (signMessage)");

  userOp.signature = signature;

  // Step 4: Submit UserOperation
  console.log("\n🚀 Submitting UserOperation to EntryPoint...");
  const beneficiary = ownerWallet.address; // AA owner receives gas refund

  const entryPointWithSigner = new ethers.Contract(
    CONTRACTS.entryPoint,
    EntryPointABI,
    submitterWallet,
  );
  const tx = await entryPointWithSigner.handleOps([userOp], beneficiary, {
    gasLimit: 1000000n,
  });

  console.log("📝 Transaction Hash:", tx.hash);
  console.log("⏳ Waiting for confirmation...");

  const receipt = await tx.wait();

  if (receipt.status === 1) {
    console.log("\n✅ SUCCESS!");
    console.log("   Block:", receipt.blockNumber);
    console.log("   Gas Used:", receipt.gasUsed.toString());
    console.log(
      "   Etherscan:",
      `https://sepolia.etherscan.io/tx/${receipt.hash}`,
    );
  } else {
    console.log("\n❌ FAILED!");
    console.log("   Transaction reverted");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  });
