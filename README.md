# SuperPaymaster Demo Playground

Interactive showcase for ERC-4337 Account Abstraction and SuperPaymaster gasless transactions.

## 🎯 Features

### End User Experience
- **MetaMask Integration**: Connect your wallet to Sepolia testnet
- **AA Account Creation**: Create SimpleAccount smart contract accounts
- **Token Faucet**: Claim test tokens (PNT, SBT, USDT)
- **Gasless Transactions**: Send transactions without paying gas fees (Coming Soon)

### Operator Demo (Coming Soon)
- Manage Paymaster configurations
- Monitor gas sponsorship
- Earn fees from sponsored transactions

### Developer Demo (Coming Soon)
- Integration code examples
- API documentation
- SDK usage guides

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm
- MetaMask browser extension

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test
```

### Development

```bash
# Start dev server with hot reload
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run Playwright tests
pnpm exec playwright test

# Open test report
pnpm exec playwright show-report
```

## 📚 Usage Guide

### 1. Connect Wallet

Click "Connect MetaMask" and:
- Approve connection in MetaMask
- Switch to Sepolia testnet if prompted
- Your address will be displayed after connection

### 2. Create AA Account

Click "Create Account" to deploy a SimpleAccount:
- A random salt is generated
- Account is created via SimpleAccountFactory
- View your account on Etherscan

### 3. Claim Test Tokens

Click token buttons to claim:
- **PNT**: 100 tokens per request
- **SBT**: 1 token per request  
- **USDT**: 10 tokens per request

Rate limits apply:
- PNT: 5 requests/hour
- SBT: 3 requests/hour
- USDT: 5 requests/hour

### 4. Send Gasless Transaction (Coming Soon)

Send USDT without paying gas fees using SuperPaymaster.

## 🏗️ Architecture

### Tech Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Blockchain**: ethers.js v6
- **Testing**: Playwright
- **Styling**: CSS Modules

### Project Structure

```
demo/
├── src/
│   ├── components/
│   │   ├── EndUserDemo.tsx       # End user experience
│   │   └── EndUserDemo.css       # Styles
│   ├── App.tsx                   # Main app with role selector
│   ├── App.css                   # Global styles
│   └── main.tsx                  # Entry point
├── tests/
│   └── demo.spec.ts              # Playwright tests
├── playwright.config.ts          # Test configuration
└── vite.config.ts                # Vite configuration
```

### Contract Addresses (Sepolia)

| Contract | Address |
|----------|---------|
| EntryPoint v0.7 | `0x0000000071727De22E5E9d8BAf0edAc6f37da032` |
| PaymasterV4 | `0xBC56D82374c3CdF1234fa67E28AF9d3E31a9D445` |
| PNT Token | `0xD14E87d8D8B69016Fcc08728c33799bD3F66F180` |
| SBT Token | `0xBfde68c232F2248114429DDD9a7c3Adbff74bD7f` |
| USDT Token | `0x14EaC6C3D49AEDff3D59773A7d7bfb50182bCfDc` |
| SimpleAccountFactory | `0x9bD66892144FCf0BAF5B6946AEAFf38B0d967881` |
| SuperPaymasterRegistry | `0x838da93c815a6E45Aa50429529da9106C0621eF0` |

## 🧪 Testing

### Run All Tests

```bash
pnpm exec playwright test
```

### Run Specific Test

```bash
pnpm exec playwright test demo.spec.ts
```

### Debug Tests

```bash
pnpm exec playwright test --debug
```

### Test Coverage

- ✅ Page load and rendering
- ✅ Role tab switching
- ✅ Wallet connection UI
- ✅ Responsive design (mobile, tablet, desktop)
- ⏳ MetaMask integration (requires extension)
- ⏳ Token claiming flow
- ⏳ AA account creation

## 🌐 API Integration

Demo connects to Faucet API for token distribution:

**Base URL**: `https://faucet-app-ashy.vercel.app/api`

### Endpoints

```typescript
// Mint PNT or SBT
POST /mint
Body: { address: string, type: 'pnt' | 'sbt' }

// Mint USDT  
POST /mint-usdt
Body: { address: string }

// Create AA Account
POST /create-account
Body: { owner: string, salt: number }
```

## 🔧 Configuration

### Environment Variables

Create `.env.local`:

```bash
# API endpoint (optional, defaults to production)
VITE_FAUCET_API=https://faucet-app-ashy.vercel.app/api

# Network (optional, defaults to Sepolia)
VITE_CHAIN_ID=0xaa36a7
```

## 🐛 Troubleshooting

### MetaMask Not Detected

- Ensure MetaMask extension is installed
- Refresh the page after installing
- Check browser console for errors

### Transaction Fails

- Ensure you're on Sepolia testnet
- Check if you have enough tokens
- Verify contract addresses are correct

### Rate Limited

- Wait for the cooldown period
- Check faucet API status
- Try again after 1 hour

## 📖 Resources

- [ERC-4337 Documentation](https://eips.ethereum.org/EIPS/eip-4337)
- [SuperPaymaster GitHub](https://github.com/AAStarCommunity/SuperPaymaster)
- [Account Abstraction SDK](https://docs.alchemy.com/reference/account-abstraction-sdk)

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📧 Support

- GitHub Issues: [Report bugs](https://github.com/AAStarCommunity/SuperPaymaster/issues)
- Documentation: [Read the docs](https://github.com/AAStarCommunity/SuperPaymaster/tree/main/docs)
