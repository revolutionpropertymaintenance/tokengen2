import { Network } from '../types';
import { SELF_HOSTED_RPC } from '../config/constants';

export const mainnets: Network[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    chainId: 1,
    rpcUrl: SELF_HOSTED_RPC[1],
    explorerUrl: 'https://etherscan.io',
    gasPrice: '0.015 ETH (~$35)'
  },
  {
    id: 'bsc',
    name: 'Binance Smart Chain',
    symbol: 'BNB',
    chainId: 56,
    rpcUrl: SELF_HOSTED_RPC[56],
    explorerUrl: 'https://bscscan.com',
    gasPrice: '0.003 BNB (~$2)'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    chainId: 137,
    rpcUrl: SELF_HOSTED_RPC[137],
    explorerUrl: 'https://polygonscan.com',
    gasPrice: '0.01 MATIC (~$0.01)'
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ETH',
    chainId: 42161,
    rpcUrl: SELF_HOSTED_RPC[42161],
    explorerUrl: 'https://arbiscan.io',
    gasPrice: '0.0001 ETH (~$0.25)'
  },
  {
    id: 'fantom',
    name: 'Fantom',
    symbol: 'FTM',
    chainId: 250,
    rpcUrl: SELF_HOSTED_RPC[250],
    explorerUrl: 'https://ftmscan.com',
    gasPrice: '0.5 FTM (~$0.15)'
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    chainId: 43114,
    rpcUrl: SELF_HOSTED_RPC[43114],
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
    rpcUrl: SELF_HOSTED_RPC[25062019],
    explorerUrl: 'https://esrscan.com',
    gasPrice: '0.001 ESR (~$0.00)'
  },
  {
    id: 'goerli',
    name: 'Ethereum Goerli',
    symbol: 'ETH',
    chainId: 5,
    rpcUrl: SELF_HOSTED_RPC[5],
    explorerUrl: 'https://goerli.etherscan.io',
    gasPrice: '0.001 ETH (~$0.00)'
  },
  {
    id: 'bsc-testnet',
    name: 'BSC Testnet',
    symbol: 'tBNB',
    chainId: 97,
    rpcUrl: SELF_HOSTED_RPC[97],
    explorerUrl: 'https://testnet.bscscan.com',
    gasPrice: '0.001 tBNB (~$0.00)'
  },
  {
    id: 'mumbai',
    name: 'Polygon Mumbai',
    symbol: 'MATIC',
    chainId: 80001,
    rpcUrl: SELF_HOSTED_RPC[80001],
    explorerUrl: 'https://mumbai.polygonscan.com',
    gasPrice: '0.001 MATIC (~$0.00)'
  },
  {
    id: 'arbitrum-sepolia',
    name: 'Arbitrum Sepolia',
    symbol: 'ETH',
    chainId: 421614,
    rpcUrl: SELF_HOSTED_RPC[421614],
    explorerUrl: 'https://sepolia.arbiscan.io',
    gasPrice: '0.0001 ETH (~$0.00)'
  }
];

export const networks = [...mainnets, ...testnets];