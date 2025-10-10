# SimpleAccountV2 Migration Guide

## Overview

All AA accounts are now created using **SimpleAccountFactoryV2**, which creates **SimpleAccountV2** instances that support both personal_sign and raw signature formats.

## Why Migrate?

### V1 Account Issues
- ❌ Only supports raw signatures from `eth_sign`
- ❌ MetaMask disabled `eth_sign` for security
- ❌ Transactions fail with "method does not exist" error
- ❌ No `version()` function

### V2 Account Benefits
- ✅ Supports `personal_sign` (signMessage) - MetaMask's preferred method
- ✅ Also supports raw signatures for compatibility
- ✅ Includes `version()` function returning "2.0.0"
- ✅ Better security and MetaMask compatibility
- ✅ Works with gasless transactions

## How to Migrate

### Step 1: Clear Old Account

1. Visit https://demo-3o8j4r76j-jhfnetboys-projects.vercel.app
2. Connect your MetaMask wallet
3. If you see an existing AA account, click **"Clear Account"** button
4. Confirm in the dialog

### Step 2: Create New V2 Account

1. Click **"Create Account"** button
2. Wait for transaction confirmation
3. Your new V2 account will be displayed

### Step 3: Verify V2 Account

You can verify your account is V2 using cast:

```bash
# Check version (should return "2.0.0")
cast call <YOUR_AA_ACCOUNT> "version()(string)" --rpc-url https://eth-sepolia.g.alchemy.com/v2/...

# Check implementation (should be 0x174f4b95baf89E1295F1b3826a719F505caDD02A)
cast storage <YOUR_AA_ACCOUNT> 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc --rpc-url https://eth-sepolia.g.alchemy.com/v2/...
```

### Step 4: Claim Tokens and Test

1. Click **"Claim 100 PNT"**, **"Claim 1 SBT"**, **"Claim 10 USDT"**
2. Wait for confirmations
3. Enter a recipient address and amount
4. Click **"Send Gasless Transaction"**
5. **Only sign once in MetaMask** (using personal_sign)
6. Transaction should succeed! 🎉

## Technical Details

### V1 vs V2 Comparison

| Feature | V1 Account | V2 Account |
|---------|------------|------------|
| Factory | `0x9bD6...7881` | `0x8B51...7F2b` |
| Implementation | `0xe451...FE47` | `0x174f...D02A` |
| Signature Method | eth_sign only | personal_sign + eth_sign |
| Version Function | ❌ No | ✅ Yes ("2.0.0") |
| MetaMask Compatible | ❌ No | ✅ Yes |

### Signature Format

**V1 (eth_sign)**:
```typescript
// Direct hash signing (disabled in MetaMask)
const signature = await provider.send("eth_sign", [address, hash]);
```

**V2 (personal_sign)**:
```typescript
// Adds "\x19Ethereum Signed Message:\n32" prefix
const signature = await signer.signMessage(ethers.getBytes(hash));
```

V2's `validateUserOp()` automatically detects and handles both formats:
- If signature uses personal_sign format, it reconstructs the hash with `MessageHashUtils.toEthSignedMessageHash()`
- If signature is raw, it uses the hash directly
- This allows maximum compatibility

## Troubleshooting

### Error: "eth_sign does not exist"
- **Cause**: Using V1 account with new code
- **Fix**: Clear account and create new V2 account

### Error: "transaction execution reverted"
- **Cause**: V1 account with personal_sign signature
- **Fix**: Clear account and create new V2 account

### Error: "version() execution reverted"
- **Cause**: Checking V1 account (no version function)
- **Note**: This confirms it's V1, create new account

### Transaction Succeeds but No Confirmation
- **Cause**: May need to refresh balances
- **Fix**: Wait 3-10 seconds, balances auto-refresh

## Contract Addresses (Sepolia)

```
SimpleAccountFactoryV2: 0x8B516A71c134a4b5196775e63b944f88Cc637F2b
SimpleAccountV2 Implementation: 0x174f4b95baf89E1295F1b3826a719F505caDD02A
EntryPoint: 0x0000000071727De22E5E9d8BAf0edAc6f37da032
PaymasterV4: 0xBC56D82374c3CdF1234fa67E28AF9d3E31a9D445
```

## Support

If you encounter issues:
1. Check browser console for detailed error messages
2. Verify you're using a V2 account (check version)
3. Ensure MetaMask is on Sepolia testnet
4. Try clearing account and creating a new one
5. Contact support with transaction hash for debugging

## Example: Successful V2 Transaction

```
User: 0x411BD567E46C0781248dbB6a9211891C032885e5
AA Account: 0x7e03Beb1Ea9267e2f8cc4e3c7A50b23C74763dA6
Version: "2.0.0" ✅

Transaction Flow:
1. User signs with personal_sign in MetaMask
2. Signature: 0xb35675c84fcf59632da02e97dcd80cddcc8bb2795586f5654b7c1c4260a690f86a4d6ca7494e8dd00c886664d6e6505bc17f799b8a927c54be37834fbf8817e91c
3. Submitter sends handleOps to EntryPoint
4. EntryPoint validates signature in SimpleAccountV2
5. PaymasterV4 sponsors gas fees
6. Transaction executes successfully
7. User pays 0 gas! 🎉
```

## Migration Checklist

- [ ] Clear old V1 account from demo
- [ ] Create new V2 account
- [ ] Verify account version is "2.0.0"
- [ ] Claim test tokens (PNT, SBT, USDT)
- [ ] Test gasless transaction
- [ ] Verify transaction on Etherscan
- [ ] Check recipient received tokens

Welcome to the future of Account Abstraction with SimpleAccountV2! 🚀
