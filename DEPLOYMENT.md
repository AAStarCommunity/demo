# Demo Deployment History

## Latest Deployment - 2025-01-10

### Faucet API V2 Factory Fix (Critical)

**Changes**:
- Fixed faucet API to use SimpleAccountFactoryV2 instead of V1
- Updated `vercel.json` with V2 factory address: `0x8B516A71c134a4b5196775e63b944f88Cc637F2b`
- All new accounts now created with V2 implementation: `0x174f4b95baf89E1295F1b3826a719F505caDD02A`

**Root Cause**:
- `vercel.json` had hardcoded V1 factory address
- Environment variable updates were being overridden by vercel.json
- Users were still getting V1 accounts even after clearing localStorage

**Fix**:
- Updated faucet `vercel.json` to use V2 factory
- Verified new accounts return `version() = "2.0.0"`
- Committed and deployed to production

**Verification**:
```bash
# New accounts are V2
curl -X POST https://faucet.aastar.io/api/create-account \
  -H "Content-Type: application/json" \
  -d '{"owner":"0x411BD567E46C0781248dbB6a9211891C032885e5","salt":666555}'

# Returns account: 0x7e03Beb1Ea9267e2f8cc4e3c7A50b23C74763dA6
# Version: "2.0.0" ✅
# Implementation: 0x174f4b95baf89E1295F1b3826a719F505caDD02A ✅
```

### Clear AA Account Feature

**Changes**:
- Added "Clear Account" button to remove AA accounts from localStorage
- Allows users to delete old V1 accounts and create fresh V2 accounts
- Includes confirmation dialog for safety

**Reason**: 
- Old V1 accounts incompatible with personal_sign signature format
- Users were stuck with accounts that caused transaction reverts
- Needed way to test with fresh SimpleAccountV2 accounts

**Deployment**:
```bash
cd /Users/jason/Dev/mycelium/my-exploration/projects/demo
pnpm build
vercel --prod
```

**URL**: https://demo-3o8j4r76j-jhfnetboys-projects.vercel.app

**Files Modified**:
- `src/components/EndUserDemo.tsx` - Added clear account functionality
- `docs/clear-account-feature.md` - Feature documentation

---

## Previous Deployment - Environment Variable Fix

### Changes

**Fixed**:
- Added `.trim()` to environment variable parsing to remove newlines
- Updated `VITE_SUBMITTER_PRIVATE_KEY` to use deployer account
- Removed and re-added Vercel environment variables

**Issues Resolved**:
- Invalid BytesLike value error from newline in private key
- Insufficient funds error (submitter had 0 ETH)

**Environment Variables**:
```
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/...
VITE_SUBMITTER_PRIVATE_KEY=0x2717524c39f8b8ab74c902dc712e590fee36993774119c1e06d31daa4b0fbc81
```

---

## Previous Deployment - eth_sign to personal_sign Migration

### Changes

**Updated Signature Method**:
- Changed from `eth_sign` to `personal_sign` (signMessage)
- SimpleAccountV2 supports personal_sign format natively
- Verified with test script before deployment

**Reason**:
- MetaMask disabled eth_sign method (security)
- Error: "The method 'eth_sign' does not exist / is not available"

**Test Script**: `test-gasless-v2.js`
- ✅ Success: Transaction `0xc0768c124190199f19f359bd0bf57e84eda991a9b4b8d387e9399c7dc2d9c473`
- Gas Used: 202,568

**Files Modified**:
- `src/utils/userOp.ts` - signUserOp() now uses signMessage()

---

## Previous Deployment - SimpleAccountFactoryV2

### Changes

**New Contracts**:
- Deployed SimpleAccountFactoryV2: `0x8B516A71c134a4b5196775e63b944f88Cc637F2b`
- Implementation: `0x174f4b95baf89E1295F1b3826a719F505caDD02A`

**Updated Configuration**:
- Demo now uses FactoryV2 (creates V2 accounts directly)
- Removed auto-upgrade logic
- Updated ContractInfo display

**Reason**:
- Avoid auto-upgrade flow (user feedback: "升级的方法不可行")
- Create V2 accounts directly using CREATE2
- Cleaner user experience

---

## Deployment Commands

### Full Deployment

```bash
# 1. Build
cd /Users/jason/Dev/mycelium/my-exploration/projects/demo
pnpm install
pnpm build

# 2. Test locally (optional)
pnpm preview

# 3. Deploy to Vercel
vercel --prod
```

### Update Environment Variables

```bash
# Remove old variable
vercel env rm VITE_SUBMITTER_PRIVATE_KEY production

# Add new variable (without newline!)
vercel env add VITE_SUBMITTER_PRIVATE_KEY production
# Paste value when prompted
```

### Verify Deployment

1. Visit https://demo-3o8j4r76j-jhfnetboys-projects.vercel.app
2. Check browser console for errors
3. Test wallet connection
4. Test AA account creation
5. Test gasless transaction

---

## Contract Addresses (Sepolia)

```
EntryPoint: 0x0000000071727De22E5E9d8BAf0edAc6f37da032
SimpleAccountFactoryV2: 0x8B516A71c134a4b5196775e63b944f88Cc637F2b
SimpleAccountV2 Implementation: 0x174f4b95baf89E1295F1b3826a719F505caDD02A
PaymasterV4: 0xBC56D82374c3CdF1234fa67E28AF9d3E31a9D445
PNT Token: 0xD14E87d8D8B69016Fcc08728c33799bD3F66F180
SBT Token: 0xBfde68c232F2248114429DDD9a7c3Adbff74bD7f
USDT Token: 0x14EaC6C3D49AEDff3D59773A7d7bfb50182bCfDc
```

---

## Account Balances

### Deployer (Submitter)
- Address: `0x411BD567E46C0781248dbB6a9211891C032885e5`
- Balance: ~1.37 ETH
- Role: Signs and submits handleOps transactions

### PaymasterV4
- Owner: Deployer
- EntryPoint Deposit: 0.5496 ETH
- Role: Sponsors UserOp gas fees

---

## Known Issues

### Resolved
- ✅ eth_sign not available → Use personal_sign
- ✅ Environment variable newlines → Added .trim()
- ✅ Submitter insufficient funds → Use deployer account
- ✅ PaymasterV4 low deposit → Added 0.5 ETH
- ✅ Cannot create new accounts → Added clear account feature

### Active
- None

---

## Rollback Procedure

If deployment fails:

```bash
# 1. Check Vercel deployment logs
vercel logs

# 2. Revert to previous deployment
vercel rollback

# 3. Or redeploy specific commit
git checkout <commit-hash>
pnpm build
vercel --prod
```
