import { ethers } from "ethers";

// Contract addresses from shared-config
export const CONTRACTS = {
  entryPoint: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
  paymasterV4: "0xBC56D82374c3CdF1234fa67E28AF9d3E31a9D445",
  pntToken: "0xD14E87d8D8B69016Fcc08728c33799bD3F66F180",
  usdtToken: "0x14EaC6C3D49AEDff3D59773A7d7bfb50182bCfDc",
};

// ABIs
const SimpleAccountABI = [
  "function execute(address dest, uint256 value, bytes calldata func) external",
  "function getNonce() public view returns (uint256)",
];

const ERC20ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
];

const EntryPointABI = [
  "function handleOps((address sender, uint256 nonce, bytes initCode, bytes callData, bytes32 accountGasLimits, uint256 preVerificationGas, bytes32 gasFees, bytes paymasterAndData, bytes signature)[] ops, address payable beneficiary) external",
  "function getUserOpHash((address sender, uint256 nonce, bytes initCode, bytes callData, bytes32 accountGasLimits, uint256 preVerificationGas, bytes32 gasFees, bytes paymasterAndData, bytes signature) userOp) external view returns (bytes32)",
];

export interface PackedUserOperation {
  sender: string;
  nonce: bigint;
  initCode: string;
  callData: string;
  accountGasLimits: string;
  preVerificationGas: bigint;
  gasFees: string;
  paymasterAndData: string;
  signature: string;
}

/**
 * Build UserOperation for USDT transfer via AA account
 */
export async function buildUserOp(
  aaAccount: string,
  recipient: string,
  amount: string,
  provider: ethers.BrowserProvider,
  _signer: ethers.Signer,
): Promise<PackedUserOperation> {
  const accountContract = new ethers.Contract(
    aaAccount,
    SimpleAccountABI,
    provider,
  );
  const usdtContract = new ethers.Contract(
    CONTRACTS.usdtToken,
    ERC20ABI,
    provider,
  );

  // Get nonce
  const nonce = await accountContract.getNonce();
  console.log("Nonce:", nonce.toString());

  // Construct calldata: transfer USDT
  const transferAmount = ethers.parseUnits(amount, 6); // USDT has 6 decimals
  const transferCalldata = usdtContract.interface.encodeFunctionData(
    "transfer",
    [recipient, transferAmount],
  );

  const executeCalldata = accountContract.interface.encodeFunctionData(
    "execute",
    [CONTRACTS.usdtToken, 0, transferCalldata],
  );

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

  // Pack gas limits (verificationGasLimit || callGasLimit)
  const accountGasLimits = ethers.concat([
    ethers.zeroPadValue(ethers.toBeHex(verificationGasLimit), 16),
    ethers.zeroPadValue(ethers.toBeHex(callGasLimit), 16),
  ]);

  // Pack gas fees (maxPriorityFeePerGas || maxFeePerGas)
  const gasFees = ethers.concat([
    ethers.zeroPadValue(ethers.toBeHex(maxPriorityFeePerGas), 16),
    ethers.zeroPadValue(ethers.toBeHex(maxFeePerGas), 16),
  ]);

  // Paymaster data (address || verificationGasLimit || postOpGasLimit || data)
  const paymasterAndData = ethers.concat([
    CONTRACTS.paymasterV4,
    ethers.zeroPadValue(ethers.toBeHex(200000n), 16), // paymasterVerificationGasLimit
    ethers.zeroPadValue(ethers.toBeHex(300000n), 16), // paymasterPostOpGasLimit
    "0x", // paymasterData (empty)
  ]);

  return {
    sender: aaAccount,
    nonce,
    initCode: "0x",
    callData: executeCalldata,
    accountGasLimits,
    preVerificationGas,
    gasFees,
    paymasterAndData,
    signature: "0x", // Will be filled after signing
  };
}

/**
 * Sign UserOperation hash directly with AA account owner's private key
 * Uses direct hash signing (not message signing like signMessage)
 */
export async function signUserOp(
  userOp: PackedUserOperation,
  rpcUrl: string,
  signer: ethers.Signer,
): Promise<string> {
  // Use independent RPC provider to get userOpHash
  const rpcProvider = new ethers.JsonRpcProvider(rpcUrl);
  const entryPoint = new ethers.Contract(
    CONTRACTS.entryPoint,
    EntryPointABI,
    rpcProvider,
  );

  // Get userOpHash from EntryPoint
  const userOpHash = await entryPoint.getUserOpHash(userOp);
  console.log("UserOpHash:", userOpHash);

  // Use signMessage (personal_sign) which adds Ethereum Signed Message prefix
  // This works with SimpleAccountV2 which supports MessageHashUtils.toEthSignedMessageHash()
  // If the AA account is still V1, it needs to be upgraded first
  const signature = await signer.signMessage(ethers.getBytes(userOpHash));
  console.log("Signature:", signature);

  return signature;
}

/**
 * Submit UserOperation via EntryPoint.handleOps using independent RPC
 */
export async function submitUserOp(
  userOp: PackedUserOperation,
  rpcUrl: string,
  beneficiary: string,
): Promise<ethers.TransactionReceipt> {
  // Use independent RPC provider to submit transaction
  const rpcProvider = new ethers.JsonRpcProvider(rpcUrl);

  // Get private key from environment (server-side execution would be better)
  // For now, we need to use a funded wallet to submit the transaction
  // This is a simplified approach - in production, use a relayer service
  const submitterPrivateKey = import.meta.env.VITE_SUBMITTER_PRIVATE_KEY;
  if (!submitterPrivateKey) {
    throw new Error("VITE_SUBMITTER_PRIVATE_KEY not configured");
  }

  const submitterWallet = new ethers.Wallet(submitterPrivateKey, rpcProvider);

  const entryPoint = new ethers.Contract(
    CONTRACTS.entryPoint,
    EntryPointABI,
    submitterWallet,
  );

  console.log("Submitting UserOp via EntryPoint.handleOps...");
  const tx = await entryPoint.handleOps([userOp], beneficiary, {
    gasLimit: 1000000n, // High gas limit for safety
  });

  console.log("Transaction hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ UserOp executed! Block:", receipt?.blockNumber);

  if (!receipt) {
    throw new Error("Transaction receipt is null");
  }

  return receipt;
}

/**
 * Complete flow: Build -> Sign -> Submit
 */
export async function sendGaslessTransaction(
  aaAccount: string,
  recipient: string,
  amount: string,
  provider: ethers.BrowserProvider,
  signer: ethers.Signer,
): Promise<{ txHash: string; blockNumber: number }> {
  const rpcUrl =
    import.meta.env.VITE_SEPOLIA_RPC_URL || "https://rpc.sepolia.org";

  // Beneficiary is the address that receives gas refund from EntryPoint
  // Should be the AA owner address (user's MetaMask address)
  const beneficiary = await signer.getAddress();

  // Step 1: Build UserOp
  const userOp = await buildUserOp(
    aaAccount,
    recipient,
    amount,
    provider,
    signer,
  );

  // Step 2: Sign UserOp hash with MetaMask (only signing, not submitting)
  const signature = await signUserOp(userOp, rpcUrl, signer);
  userOp.signature = signature;

  // Step 3: Submit UserOp using independent RPC provider (not MetaMask)
  const receipt = await submitUserOp(userOp, rpcUrl, beneficiary);

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}
