# Clear AA Account Feature

## Overview

Added functionality to clear/delete AA accounts from localStorage, allowing users to create fresh V2 accounts for testing.

## Problem Solved

- **Issue**: Old V1 accounts stored in localStorage were incompatible with new personal_sign signature format
- **User Impact**: Users couldn't create new AA accounts, stuck with old accounts that caused transaction reverts
- **Error**: Transaction reverted when using V1 accounts with personal_sign signatures

## Implementation

### UI Changes

Added "Clear Account" button in the AA Account section:

```tsx
<button
  className="btn-secondary"
  onClick={() => {
    if (confirm("Are you sure you want to clear this AA account? You can create a new one afterwards.")) {
      setAaAccount("");
      localStorage.removeItem("demo_aa_account");
      setMessage({
        type: "info",
        text: "AA account cleared. You can create a new one now.",
      });
    }
  }}
  disabled={!!loading}
>
  Clear Account
</button>
```

### User Flow

1. **View Existing Account**: User sees their current AA account address
2. **Click "Clear Account"**: Confirmation dialog appears
3. **Confirm**: AA account is removed from localStorage and state
4. **Create New**: "Create Account" button becomes available again
5. **New V2 Account**: User creates fresh SimpleAccountV2 with personal_sign support

## Benefits

- ✅ Removes incompatible V1 accounts
- ✅ Allows testing with fresh V2 accounts
- ✅ Supports personal_sign signature method
- ✅ Prevents transaction revert errors
- ✅ User-friendly with confirmation dialog

## Testing

1. Connect MetaMask wallet
2. If old AA account exists, click "Clear Account"
3. Confirm in dialog
4. Create new AA account
5. Test gasless transaction flow

## Related Changes

- **File**: `/Users/jason/Dev/mycelium/my-exploration/projects/demo/src/components/EndUserDemo.tsx`
- **Commit**: Add clear account functionality for V2 testing
- **Deployment**: https://demo-3o8j4r76j-jhfnetboys-projects.vercel.app

## Technical Details

### V1 vs V2 Account Differences

**V1 Accounts**:
- Expect raw signatures from eth_sign
- Don't have version() function
- Incompatible with personal_sign format

**V2 Accounts**:
- Support both raw and personal_sign signatures
- Created by SimpleAccountFactoryV2
- Include version() function returning "2"
- Use MessageHashUtils.toEthSignedMessageHash() for verification

### Signature Format

```typescript
// personal_sign adds this prefix:
// "\x19Ethereum Signed Message:\n32" + hash

// V2 accounts detect and handle this automatically in validateUserOp()
```

## Next Steps

Users can now:
1. Clear old V1 accounts
2. Create new V2 accounts  
3. Successfully test gasless transactions with personal_sign
4. Verify transactions on Sepolia Etherscan
