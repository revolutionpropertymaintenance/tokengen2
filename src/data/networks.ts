import { Network } from '../types';

export const mainnets: Network[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/',
    explorerUrl: 'https://etherscan.io',
    gasPrice: '0.015 ETH (~$35)'
  },
  {
    id: 'bsc',
    name: 'Binance Smart Chain',
    symbol: 'BNB',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    explorerUrl: 'https://bscscan.com',
    gasPrice: '0.003 BNB (~$2)'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com/',
    explorerUrl: 'https://polygonscan.com',
    gasPrice: '0.01 MATIC (~$0.01)'
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ETH',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    gasPrice: '0.0001 ETH (~$0.25)'
  },
  {
    id: 'fantom',
    name: 'Fantom',
    symbol: 'FTM',
    chainId: 250,
    rpcUrl: 'https://rpc.ftm.tools/',
    explorerUrl: 'https://ftmscan.com',
    gasPrice: '0.5 FTM (~$0.15)'
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    chainId: 43114,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
    gasPrice: '0.025 AVAX (~$0.75)'
  }
];

export const testnets: Network[] = [
  {
    id: 'estar-testnet',
    name: 'Estar Testnet',
    symbol: 'ESR',
    chainId: 25062019,
    rpcUrl: 'https://testnet.rpc.esrscan.com',
    explorerUrl: 'https://esrscan.com',
    gasPrice: '0.001 ESR (~$0.00)'
  },
  {
    id: 'goerli',
    name: 'Ethereum Goerli',
    symbol: 'ETH',
    chainId: 5,
    rpcUrl: 'https://goerli.infura.io/v3/',
    explorerUrl: 'https://goerli.etherscan.io',
    gasPrice: '0.001 ETH (~$0.00)'
  },
  {
    id: 'bsc-testnet',
    name: 'BSC Testnet',
    symbol: 'tBNB',
    chainId: 97,
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    explorerUrl: 'https://testnet.bscscan.com',
    gasPrice: '0.001 tBNB (~$0.00)'
  },
  {
    id: 'mumbai',
    name: 'Polygon Mumbai',
    symbol: 'MATIC',
    chainId: 80001,
    rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
    explorerUrl: 'https://mumbai.polygonscan.com',
    gasPrice: '0.001 MATIC (~$0.00)'
  },
  {
    id: 'arbitrum-sepolia',
    name: 'Arbitrum Sepolia',
    symbol: 'ETH',
    chainId: 421614,
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    explorerUrl: 'https://sepolia.arbiscan.io',
    gasPrice: '0.0001 ETH (~$0.00)'
  }
];

export const networks = [...mainnets, ...testnets];