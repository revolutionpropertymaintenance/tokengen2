import { Network } from '../types';

// Chain IDs in decimal format
export const CHAIN_IDS = {
  // Mainnets
  ETHEREUM: 1,
  BSC: 56,
  POLYGON: 137,
  ARBITRUM: 42161,
  FANTOM: 250,
  AVALANCHE: 43114,
  ESR: 25062019, // ESR Mainnet

  // Testnets
  GOERLI: 5,
  BSC_TESTNET: 97,
  MUMBAI: 80001,
  ARBITRUM_SEPOLIA: 421614,
  FANTOM_TESTNET: 4002,
  AVALANCHE_FUJI: 43113,
  ESR_TESTNET: 25062019 // ESR Testnet
};

// Chain IDs in hexadecimal format for MetaMask
export const CHAIN_IDS_HEX = {
  // Mainnets
  ETHEREUM: '0x1',
  BSC: '0x38',
  POLYGON: '0x89',
  ARBITRUM: '0xA4B1',
  FANTOM: '0xFA',
  AVALANCHE: '0xA86A',
  ESR: '0x17E5F13', // ESR Mainnet

  // Testnets
  GOERLI: '0x5',
  BSC_TESTNET: '0x61',
  MUMBAI: '0x13881',
  ARBITRUM_SEPOLIA: '0x66EEE',
  FANTOM_TESTNET: '0xFA2',
  AVALANCHE_FUJI: '0xA869',
  ESR_TESTNET: '0x17E5F13' // ESR Testnet
};

// Chain configuration for MetaMask
export const CHAIN_CONFIG = {
  // Mainnets
  [CHAIN_IDS.ETHEREUM]: {
    chainId: CHAIN_IDS_HEX.ETHEREUM,
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://rpc.ankr.com/eth'],
    blockExplorerUrls: ['https://etherscan.io']
  },
  [CHAIN_IDS.BSC]: {
    chainId: CHAIN_IDS_HEX.BSC,
    chainName: 'BNB Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    rpcUrls: ['https://bsc-dataseed1.binance.org'],
    blockExplorerUrls: ['https://bscscan.com']
  },
  [CHAIN_IDS.POLYGON]: {
    chainId: CHAIN_IDS_HEX.POLYGON,
    chainName: 'Polygon',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com']
  },
  [CHAIN_IDS.ARBITRUM]: {
    chainId: CHAIN_IDS_HEX.ARBITRUM,
    chainName: 'Arbitrum One',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io']
  },
  [CHAIN_IDS.FANTOM]: {
    chainId: CHAIN_IDS_HEX.FANTOM,
    chainName: 'Fantom Opera',
    nativeCurrency: {
      name: 'Fantom',
      symbol: 'FTM',
      decimals: 18
    },
    rpcUrls: ['https://rpc.ftm.tools'],
    blockExplorerUrls: ['https://ftmscan.com']
  },
  [CHAIN_IDS.AVALANCHE]: {
    chainId: CHAIN_IDS_HEX.AVALANCHE,
    chainName: 'Avalanche C-Chain',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18
    },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://snowtrace.io']
  },
  [CHAIN_IDS.ESR]: {
    chainId: CHAIN_IDS_HEX.ESR,
    chainName: 'ESR Mainnet',
    nativeCurrency: {
      name: 'ESR',
      symbol: 'ESR',
      decimals: 18
    },
    rpcUrls: ['https://rpc.esrscan.com'],
    blockExplorerUrls: ['https://esrscan.com']
  },

  // Testnets
  [CHAIN_IDS.GOERLI]: {
    chainId: CHAIN_IDS_HEX.GOERLI,
    chainName: 'Goerli Testnet',
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://rpc.ankr.com/eth_goerli'],
    blockExplorerUrls: ['https://goerli.etherscan.io']
  },
  [CHAIN_IDS.BSC_TESTNET]: {
    chainId: CHAIN_IDS_HEX.BSC_TESTNET,
    chainName: 'BSC Testnet',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    blockExplorerUrls: ['https://testnet.bscscan.com']
  },
  [CHAIN_IDS.MUMBAI]: {
    chainId: CHAIN_IDS_HEX.MUMBAI,
    chainName: 'Polygon Mumbai',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com']
  },
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: {
    chainId: CHAIN_IDS_HEX.ARBITRUM_SEPOLIA,
    chainName: 'Arbitrum Sepolia',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://sepolia.arbiscan.io']
  },
  [CHAIN_IDS.FANTOM_TESTNET]: {
    chainId: CHAIN_IDS_HEX.FANTOM_TESTNET,
    chainName: 'Fantom Testnet',
    nativeCurrency: {
      name: 'Fantom',
      symbol: 'FTM',
      decimals: 18
    },
    rpcUrls: ['https://rpc.testnet.fantom.network'],
    blockExplorerUrls: ['https://testnet.ftmscan.com']
  },
  [CHAIN_IDS.AVALANCHE_FUJI]: {
    chainId: CHAIN_IDS_HEX.AVALANCHE_FUJI,
    chainName: 'Avalanche Fuji',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18
    },
    rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://testnet.snowtrace.io']
  },
  [CHAIN_IDS.ESR_TESTNET]: {
    chainId: CHAIN_IDS_HEX.ESR_TESTNET,
    chainName: 'ESR Testnet',
    nativeCurrency: {
      name: 'ESR',
      symbol: 'ESR',
      decimals: 18
    },
    rpcUrls: ['https://testnet.rpc.esrscan.com'],
    blockExplorerUrls: ['https://testnet.esrscan.com']
  }
};

// Get mainnet chain IDs
export const getMainnetChainIds = (): number[] => [
  CHAIN_IDS.ETHEREUM,
  CHAIN_IDS.BSC,
  CHAIN_IDS.POLYGON,
  CHAIN_IDS.ARBITRUM,
  CHAIN_IDS.FANTOM,
  CHAIN_IDS.AVALANCHE,
  CHAIN_IDS.ESR
];

// Get testnet chain IDs
export const getTestnetChainIds = (): number[] => [
  CHAIN_IDS.GOERLI,
  CHAIN_IDS.BSC_TESTNET,
  CHAIN_IDS.MUMBAI,
  CHAIN_IDS.ARBITRUM_SEPOLIA,
  CHAIN_IDS.FANTOM_TESTNET,
  CHAIN_IDS.AVALANCHE_FUJI,
  CHAIN_IDS.ESR_TESTNET
];

// Check if a chain ID is a testnet
export const isTestnetChain = (chainId: number): boolean => {
  return getTestnetChainIds().includes(chainId);
};

// Check if a chain ID is a mainnet
export const isMainnetChain = (chainId: number): boolean => {
  return getMainnetChainIds().includes(chainId);
};

// Get chain config for a specific chain ID
export const getChainConfig = (chainId: number) => {
  return CHAIN_CONFIG[chainId];
};

// Map Network object to chain ID
export const getChainIdFromNetwork = (network: Network): number => {
  return network.chainId;
};

// Map chain ID to Network object
export const getNetworkFromChainId = (chainId: number, networks: Network[]): Network | undefined => {
  return networks.find(network => network.chainId === chainId);
};