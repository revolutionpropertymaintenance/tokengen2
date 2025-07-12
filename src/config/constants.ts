// ESR Token Configuration - DEPLOY THIS CONTRACT FIRST
export const ESR_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000'; // UPDATE AFTER ESR TOKEN DEPLOYMENT

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

// Self-hosted RPC endpoints - UPDATE THESE WITH YOUR OWN NODES
export const SELF_HOSTED_RPC = {
  1: 'http://localhost:8545', // Your Ethereum node
  56: 'http://localhost:8546', // Your BSC node
  137: 'http://localhost:8547', // Your Polygon node
  42161: 'http://localhost:8548', // Your Arbitrum node
  250: 'http://localhost:8549', // Your Fantom node
  43114: 'http://localhost:8550', // Your Avalanche node
  25062019: 'http://localhost:8551', // Your Estar testnet node
  5: 'http://localhost:8552', // Your Goerli node
  97: 'http://localhost:8553', // Your BSC testnet node
  80001: 'http://localhost:8554', // Your Mumbai node
  421614: 'http://localhost:8555' // Your Arbitrum Sepolia node
};