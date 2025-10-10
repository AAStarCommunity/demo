import { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./ContractInfo.css";

interface Contract {
  name: string;
  address: string;
  description: string;
  type: "ERC-4337" | "ERC-20" | "ERC-721" | "Factory" | "Registry";
  hasOwner?: boolean;
}

const CONTRACTS: Contract[] = [
  {
    name: "EntryPoint v0.7",
    address: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
    description: "Official ERC-4337 entry point",
    type: "ERC-4337",
    hasOwner: false,
  },
  {
    name: "PaymasterV4",
    address: "0xBC56D82374c3CdF1234fa67E28AF9d3E31a9D445",
    description: "Gas sponsorship contract",
    type: "ERC-4337",
    hasOwner: true,
  },
  {
    name: "SuperPaymaster Registry v1.2",
    address: "0x838da93c815a6E45Aa50429529da9106C0621eF0",
    description: "Paymaster registration system",
    type: "Registry",
    hasOwner: true,
  },
  {
    name: "GasTokenV2 (PNT)",
    address: "0xD14E87d8D8B69016Fcc08728c33799bD3F66F180",
    description: "Points token for gas payment",
    type: "ERC-20",
    hasOwner: true,
  },
  {
    name: "GasTokenFactoryV2",
    address: "0x6720Dc8ce5021bC6F3F126054556b5d3C125101F",
    description: "Factory for creating GasTokens",
    type: "Factory",
    hasOwner: true,
  },
  {
    name: "SBT Token",
    address: "0xBfde68c232F2248114429DDD9a7c3Adbff74bD7f",
    description: "Soul Bound Token (non-transferable)",
    type: "ERC-721",
    hasOwner: true,
  },
  {
    name: "SimpleAccountFactory",
    address: "0x9bD66892144FCf0BAF5B6946AEAFf38B0d967881",
    description: "Smart account factory",
    type: "Factory",
    hasOwner: false,
  },
  {
    name: "MockUSDT",
    address: "0x14EaC6C3D49AEDff3D59773A7d7bfb50182bCfDc",
    description: "Test USDT (6 decimals)",
    type: "ERC-20",
    hasOwner: true,
  },
];

const SEPOLIA_RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/Bx4QRW1-vnwJUePSAAD7N";

export function ContractInfo() {
  const [owners, setOwners] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOwners();
  }, []);

  const loadOwners = async () => {
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    const ownerData: Record<string, string> = {};

    for (const contract of CONTRACTS) {
      if (contract.hasOwner) {
        try {
          const code = await provider.getCode(contract.address);
          if (code !== "0x") {
            // Try to get owner
            const ownerAbi = ["function owner() view returns (address)"];
            const contractInstance = new ethers.Contract(
              contract.address,
              ownerAbi,
              provider
            );
            const owner = await contractInstance.owner();
            ownerData[contract.address] = owner;
          }
        } catch (error) {
          console.log(`No owner for ${contract.name}`);
        }
      }
    }

    setOwners(ownerData);
    setLoading(false);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTypeColor = (type: Contract["type"]) => {
    switch (type) {
      case "ERC-4337":
        return "#667eea";
      case "ERC-20":
        return "#f093fb";
      case "ERC-721":
        return "#4facfe";
      case "Factory":
        return "#43e97b";
      case "Registry":
        return "#ff9800";
      default:
        return "#666";
    }
  };

  return (
    <div className="contract-info-container">
      <h3>📋 Smart Contract Addresses</h3>
      <p className="contract-info-subtitle">
        All deployed contracts on Sepolia testnet
      </p>

      <div className="contracts-grid">
        {CONTRACTS.map((contract) => (
          <div key={contract.address} className="contract-card">
            <div className="contract-card-header">
              <div className="contract-card-title">
                <span className="contract-name">{contract.name}</span>
                <span
                  className="contract-type-badge"
                  style={{ backgroundColor: getTypeColor(contract.type) }}
                >
                  {contract.type}
                </span>
              </div>
              <p className="contract-description">{contract.description}</p>
            </div>

            <div className="contract-card-body">
              <div className="contract-detail-row">
                <span className="contract-detail-label">Address:</span>
                <div className="contract-detail-value">
                  <code className="contract-address">
                    {formatAddress(contract.address)}
                  </code>
                  <a
                    href={`https://sepolia.etherscan.io/address/${contract.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="etherscan-link-btn"
                    title="View on Etherscan"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              </div>

              {contract.hasOwner && (
                <div className="contract-detail-row">
                  <span className="contract-detail-label">Owner:</span>
                  <div className="contract-detail-value">
                    {loading ? (
                      <span className="loading-text">Loading...</span>
                    ) : owners[contract.address] ? (
                      <>
                        <code className="contract-address">
                          {formatAddress(owners[contract.address])}
                        </code>
                        <a
                          href={`https://sepolia.etherscan.io/address/${owners[contract.address]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="etherscan-link-btn"
                          title="View on Etherscan"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                      </>
                    ) : (
                      <span className="na-text">N/A</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="contract-info-footer">
        <p>
          💡 <strong>Note:</strong> All contracts are deployed on Sepolia
          testnet. Click the links to view on Etherscan.
        </p>
      </div>
    </div>
  );
}
