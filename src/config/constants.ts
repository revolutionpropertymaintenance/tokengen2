// ESR Token Configuration
export const ESR_TOKEN_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678'; // Replace with actual ESR token contract address

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

// API Configuration
export const API_ENDPOINTS = {
  DEPLOY_TOKEN: '/api/deploy-token',
  GET_DEPLOYED_TOKENS: '/api/deployed-tokens',
  VERIFY_CONTRACT: '/api/verify-contract'
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