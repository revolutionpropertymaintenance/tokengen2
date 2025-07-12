// ESR Token Configuration
export const ESR_TOKEN_ADDRESS = import.meta.env.VITE_ESR_TOKEN_ADDRESS || '0x742d35Cc6634C0532925a3b8D4C9db96590c6C8C';

// Platform Configuration
export const PLATFORM_WALLET = '0x742d35Cc6634C0532925a3b8D4C9db96590c6C8C'; // Platform wallet for receiving ESR tokens

// Deployment Requirements
export const MAINNET_ESR_REQUIREMENT = 100; // ESR tokens required for mainnet deployment
export const TESTNET_ESR_REQUIREMENT = 0;   // ESR tokens required for testnet deployment (free)

// Network Configuration
export const SUPPORTED_NETWORKS = {
  MAINNET: [1, 56, 137, 42161, 250, 43114], // Ethereum, BSC, Polygon, Arbitrum, Fantom, Avalanche
  TESTNET: [25062019, 5, 97, 80001, 421614]  // Estar Testnet, Goerli, BSC Testnet, Mumbai, Arbitrum Sepolia
};

// UI Configuration
export const UI_CONFIG = {
  ITEMS_PER_PAGE: 10,
  SEARCH_DEBOUNCE_MS: 300,
  COPY_FEEDBACK_DURATION_MS: 2000
};

// Feature Flags
export const FEATURES = {
  ENABLE_TESTNET_MODE: true,
  ENABLE_TOKEN_DEDUCTION: true,
  ENABLE_CONTRACT_VERIFICATION: true,
  ENABLE_DEPLOYMENT_HISTORY: true
};

// RPC endpoints - Now uses environment variables with fallbacks
export const SELF_HOSTED_RPC = {
  // Mainnets
  1: import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo',
  56: import.meta.env.VITE_BSC_RPC_URL || 'https://bsc-dataseed.binance.org/',
  137: import.meta.env.VITE_POLYGON_RPC_URL || 'https://polygon-rpc.com/',
  42161: import.meta.env.VITE_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
  250: import.meta.env.VITE_FANTOM_RPC_URL || 'https://rpc.ftm.tools/',
  43114: import.meta.env.VITE_AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc',
  
  // Testnets
  25062019: import.meta.env.VITE_ESTAR_TESTNET_RPC_URL || 'https://testnet-rpc.estar.games/',
  5: import.meta.env.VITE_GOERLI_RPC_URL || 'https://eth-goerli.g.alchemy.com/v2/demo',
  97: import.meta.env.VITE_BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  80001: import.meta.env.VITE_MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com/',
  421614: import.meta.env.VITE_ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc'
};

// Network helpers
export const isTestnet = (chainId: number): boolean => {
  return SUPPORTED_NETWORKS.TESTNET.includes(chainId);
};

export const isMainnet = (chainId: number): boolean => {
  return SUPPORTED_NETWORKS.MAINNET.includes(chainId);
};

export const getESRRequirement = (chainId: number): number => {
  return isTestnet(chainId) ? TESTNET_ESR_REQUIREMENT : MAINNET_ESR_REQUIREMENT;
};