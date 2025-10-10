import { ethers } from "ethers";

// SimpleAccountV2 implementation address on Sepolia
const SIMPLE_ACCOUNT_V2_IMPL = "0xd80c298084527B0c42f855439B8427F3A1C911ed";

const SimpleAccountABI = [
  "function version() public view returns (string)",
  "function upgradeTo(address newImplementation) external",
  "function owner() public view returns (address)",
];

/**
 * Check if an AA account needs to be upgraded to V2
 */
export async function checkAccountVersion(
  aaAccount: string,
  provider: ethers.Provider,
): Promise<{ version: string; needsUpgrade: boolean }> {
  const account = new ethers.Contract(aaAccount, SimpleAccountABI, provider);

  try {
    const version = await account.version();
    const needsUpgrade = version !== "2.0.0";
    return { version, needsUpgrade };
  } catch (e) {
    // V1 accounts don't have version() function
    return { version: "1.0.0", needsUpgrade: true };
  }
}

/**
 * Upgrade an AA account to SimpleAccountV2
 * Requires the account owner to sign the transaction
 */
export async function upgradeAccountToV2(
  aaAccount: string,
  signer: ethers.Signer,
): Promise<ethers.TransactionReceipt> {
  const account = new ethers.Contract(aaAccount, SimpleAccountABI, signer);

  // Verify owner
  const owner = await signer.getAddress();
  const accountOwner = await account.owner();

  if (owner.toLowerCase() !== accountOwner.toLowerCase()) {
    throw new Error(
      `You are not the owner of this account. Owner: ${accountOwner}`,
    );
  }

  console.log("Upgrading to SimpleAccountV2...");
  const tx = await account.upgradeTo(SIMPLE_ACCOUNT_V2_IMPL, {
    gasLimit: 200000,
  });

  console.log("Upgrade tx:", tx.hash);
  const receipt = await tx.wait();

  if (!receipt) {
    throw new Error("Upgrade transaction failed");
  }

  console.log("✅ Upgraded to V2! Block:", receipt.blockNumber);

  // Verify upgrade
  const newVersion = await account.version();
  console.log("New version:", newVersion);

  return receipt;
}
