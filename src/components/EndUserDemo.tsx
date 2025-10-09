import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './EndUserDemo.css';

const FAUCET_API = 'https://faucet-app-ashy.vercel.app/api';
const SEPOLIA_CHAIN_ID = '0xaa36a7';

interface WalletState {
  connected: boolean;
  address: string;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
}

export function EndUserDemo() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: '',
    provider: null,
    signer: null,
  });

  const [aaAccount, setAaAccount] = useState<string>('');
  const [loading, setLoading] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [balances, setBalances] = useState<{ pnt: string; sbt: string; usdt: string }>({
    pnt: '0',
    sbt: '0',
    usdt: '0',
  });

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined';
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      setMessage({ type: 'error', text: 'Please install MetaMask first!' });
      return;
    }

    try {
      setLoading('Connecting wallet...');
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Request accounts
      await provider.send('eth_requestAccounts', []);

      // Switch to Sepolia if needed
      try {
        await provider.send('wallet_switchEthereumChain', [{ chainId: SEPOLIA_CHAIN_ID }]);
      } catch (switchError: any) {
        // Chain not added, add it
        if (switchError.code === 4902) {
          await provider.send('wallet_addEthereumChain', [{
            chainId: SEPOLIA_CHAIN_ID,
            chainName: 'Sepolia Testnet',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://rpc.sepolia.org'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          }]);
        }
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setWallet({
        connected: true,
        address,
        provider,
        signer,
      });

      setMessage({ type: 'success', text: `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` });
    } catch (error: any) {
      setMessage({ type: 'error', text: `Connection failed: ${error.message}` });
    } finally {
      setLoading('');
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWallet({
      connected: false,
      address: '',
      provider: null,
      signer: null,
    });
    setAaAccount('');
    setMessage({ type: 'info', text: 'Wallet disconnected' });
  };

  // Create AA Account
  const createAaAccount = async () => {
    if (!wallet.connected) {
      setMessage({ type: 'error', text: 'Please connect wallet first' });
      return;
    }

    try {
      setLoading('Creating AA account...');
      const salt = Math.floor(Math.random() * 1000000);

      const response = await fetch(`${FAUCET_API}/create-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: wallet.address,
          salt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      setAaAccount(data.accountAddress);
      setMessage({
        type: 'success',
        text: `AA Account created: ${data.accountAddress.slice(0, 6)}...${data.accountAddress.slice(-4)}`
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading('');
    }
  };

  // Claim tokens
  const claimTokens = async (tokenType: 'pnt' | 'sbt' | 'usdt') => {
    if (!wallet.connected) {
      setMessage({ type: 'error', text: 'Please connect wallet first' });
      return;
    }

    const endpoint = tokenType === 'usdt' ? '/mint-usdt' : '/mint';
    const body = tokenType === 'usdt'
      ? { address: wallet.address }
      : { address: wallet.address, type: tokenType };

    try {
      setLoading(`Claiming ${tokenType.toUpperCase()}...`);

      const response = await fetch(`${FAUCET_API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim tokens');
      }

      setMessage({
        type: 'success',
        text: `Successfully claimed ${tokenType.toUpperCase()}! TX: ${data.txHash.slice(0, 10)}...`
      });

      // Refresh balances
      await loadBalances();
    } catch (error: any) {
      if (error.message.includes('429')) {
        setMessage({ type: 'error', text: 'Rate limited. Please try again later.' });
      } else {
        setMessage({ type: 'error', text: error.message });
      }
    } finally {
      setLoading('');
    }
  };

  // Load token balances
  const loadBalances = async () => {
    if (!wallet.connected || !wallet.provider) return;

    try {
      // Contract addresses from shared-config
      const PNT_TOKEN = '0xD14E87d8D8B69016Fcc08728c33799bD3F66F180';
      const SBT_TOKEN = '0xBfde68c232F2248114429DDD9a7c3Adbff74bD7f';
      const USDT_TOKEN = '0x14EaC6C3D49AEDff3D59773A7d7bfb50182bCfDc';

      const erc20Abi = ['function balanceOf(address) view returns (uint256)'];

      const pntContract = new ethers.Contract(PNT_TOKEN, erc20Abi, wallet.provider);
      const sbtContract = new ethers.Contract(SBT_TOKEN, erc20Abi, wallet.provider);
      const usdtContract = new ethers.Contract(USDT_TOKEN, erc20Abi, wallet.provider);

      const [pntBal, sbtBal, usdtBal] = await Promise.all([
        pntContract.balanceOf(wallet.address),
        sbtContract.balanceOf(wallet.address),
        usdtContract.balanceOf(wallet.address),
      ]);

      setBalances({
        pnt: ethers.formatEther(pntBal),
        sbt: ethers.formatEther(sbtBal),
        usdt: ethers.formatUnits(usdtBal, 6), // USDT has 6 decimals
      });
    } catch (error) {
      console.error('Failed to load balances:', error);
    }
  };

  // Load balances when wallet connects
  useEffect(() => {
    if (wallet.connected) {
      loadBalances();
      const interval = setInterval(loadBalances, 10000); // Refresh every 10s
      return () => clearInterval(interval);
    }
  }, [wallet.connected, wallet.address]);

  return (
    <div className="end-user-demo">
      <h2>🚀 End User Experience</h2>
      <p className="subtitle">Experience gasless transactions with Account Abstraction</p>

      {/* Wallet Connection */}
      <div className="card">
        <h3>1. Connect Wallet</h3>
        {!wallet.connected ? (
          <button className="btn-primary" onClick={connectWallet} disabled={!!loading}>
            {loading === 'Connecting wallet...' ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        ) : (
          <div className="wallet-info">
            <p><strong>Connected:</strong> {wallet.address}</p>
            <button className="btn-secondary" onClick={disconnectWallet}>Disconnect</button>
          </div>
        )}
      </div>

      {/* Create AA Account */}
      {wallet.connected && (
        <div className="card">
          <h3>2. Create AA Account</h3>
          {!aaAccount ? (
            <button className="btn-primary" onClick={createAaAccount} disabled={!!loading}>
              {loading === 'Creating AA account...' ? 'Creating...' : 'Create Account'}
            </button>
          ) : (
            <div className="account-info">
              <p><strong>AA Account:</strong> {aaAccount}</p>
              <a
                href={`https://sepolia.etherscan.io/address/${aaAccount}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link"
              >
                View on Etherscan →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Claim Tokens */}
      {wallet.connected && (
        <div className="card">
          <h3>3. Claim Test Tokens</h3>
          <div className="balances">
            <div className="balance-item">
              <span>PNT:</span>
              <strong>{parseFloat(balances.pnt).toFixed(2)}</strong>
            </div>
            <div className="balance-item">
              <span>SBT:</span>
              <strong>{parseFloat(balances.sbt).toFixed(2)}</strong>
            </div>
            <div className="balance-item">
              <span>USDT:</span>
              <strong>{parseFloat(balances.usdt).toFixed(2)}</strong>
            </div>
          </div>
          <div className="token-buttons">
            <button
              className="btn-token btn-pnt"
              onClick={() => claimTokens('pnt')}
              disabled={!!loading}
            >
              Claim 100 PNT
            </button>
            <button
              className="btn-token btn-sbt"
              onClick={() => claimTokens('sbt')}
              disabled={!!loading}
            >
              Claim 1 SBT
            </button>
            <button
              className="btn-token btn-usdt"
              onClick={() => claimTokens('usdt')}
              disabled={!!loading}
            >
              Claim 10 USDT
            </button>
          </div>
        </div>
      )}

      {/* Gasless Transaction (Coming Soon) */}
      {wallet.connected && aaAccount && (
        <div className="card coming-soon">
          <h3>4. Send Gasless Transaction</h3>
          <p>Send USDT without paying gas fees!</p>
          <button className="btn-primary" disabled>
            Coming Soon
          </button>
        </div>
      )}

      {/* Status Message */}
      {loading && (
        <div className="status-message loading">
          <span className="spinner"></span>
          {loading}
        </div>
      )}

      {message && !loading && (
        <div className={`status-message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
