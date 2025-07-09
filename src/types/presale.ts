export interface PresaleConfig {
  id?: string;
  saleType: 'presale' | 'private';
  tokenInfo: {
    tokenAddress: string;
    tokenName: string;
    tokenSymbol: string;
    maxSupply: string;
    allocatedAmount: string;
  };
  saleConfiguration: {
    saleName: string;
    softCap: string;
    hardCap: string;
    tokenPrice: string; // How many tokens per 1 native token
    minPurchase: string;
    maxPurchase: string;
    startDate: string;
    endDate: string;
    whitelistEnabled: boolean;
  };
  vestingConfig: {
    enabled: boolean;
    duration: number; // in days
    initialRelease: number; // percentage released at TGE
  };
  walletSetup: {
    saleReceiver: string;
    refundWallet: string;
  };
  network: Network;
  status?: 'upcoming' | 'live' | 'ended' | 'cancelled' | 'finalized';
  contractAddress?: string;
  transactionHash?: string;
  totalRaised?: string;
  participantCount?: number;
  createdAt?: string;
}

export interface PresaleDeploymentResult {
  contractAddress: string;
  transactionHash: string;
  network: Network;
  explorerUrl: string;
  gasUsed: string;
  deploymentCost: string;
  salePageUrl: string;
}

export interface SaleParticipant {
  address: string;
  amount: string;
  tokenAmount: string;
  timestamp: string;
  isWhitelisted: boolean;
}

export type PresaleStep = 'type' | 'token' | 'config' | 'vesting' | 'wallet' | 'review' | 'success';