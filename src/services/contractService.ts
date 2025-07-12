import { TokenConfig, Network, VestingConfig } from '../types';
import { PresaleConfig } from '../types/presale';

export interface DeploymentResult {
  contractAddress: string;
  transactionHash: string;
  network: Network;
  explorerUrl: string;
  gasUsed: string;
  deploymentCost: string;
}

export class ContractService {
  private apiUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  async authenticate(address: string, signature: string, message: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, signature, message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication failed');
      }

      const data = await response.json();
      this.authToken = data.token;
      localStorage.setItem('authToken', data.token);
      return data.token;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  async getAuthMessage(address: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get auth message');
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Get auth message error:', error);
      throw error;
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.authToken || localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private getContractType(config: TokenConfig): string {
    const features = config.features;
    
    if (features.burnable && features.mintable && features.transferFees.enabled && features.holderRedistribution.enabled) {
      return 'AdvancedToken';
    } else if (features.burnable && features.mintable && features.transferFees.enabled) {
      return 'BurnableMintableFeeToken';
    } else if (features.burnable && features.mintable && features.holderRedistribution.enabled) {
      return 'BurnableMintableRedistributionToken';
    } else if (features.burnable && features.mintable) {
      return 'BurnableMintableToken';
    } else if (features.burnable) {
      return 'BurnableToken';
    } else if (features.mintable) {
      return 'MintableToken';
    } else if (features.transferFees.enabled) {
      return 'FeeToken';
    } else if (features.holderRedistribution.enabled) {
      return 'RedistributionToken';
    } else {
      return 'BasicToken';
    }
  }

  private getConstructorParams(config: TokenConfig): any[] {
    const contractType = this.getContractType(config);
    const baseParams = [
      config.name,
      config.symbol,
      config.decimals,
      config.initialSupply,
      config.maxSupply || '0',
    ];

    switch (contractType) {
      case 'FeeToken':
        return [
          ...baseParams,
          Math.floor(config.features.transferFees.percentage * 100),
          config.features.transferFees.recipient,
          'DEPLOYER_ADDRESS' // Will be replaced by backend
        ];
      case 'RedistributionToken':
        return [
          ...baseParams,
          Math.floor(config.features.holderRedistribution.percentage * 100),
          'DEPLOYER_ADDRESS'
        ];
      case 'AdvancedToken':
        return [
          ...baseParams,
          Math.floor(config.features.transferFees.percentage * 100),
          config.features.transferFees.recipient,
          Math.floor(config.features.holderRedistribution.percentage * 100),
          'DEPLOYER_ADDRESS'
        ];
      default:
        return [...baseParams, 'DEPLOYER_ADDRESS'];
    }
  }

  async estimateDeploymentCost(config: TokenConfig): Promise<{
    gasEstimate: string;
    gasCost: string;
    gasCostUsd: string;
    timeEstimate: string;
    useFactory: boolean;
  }> {
    try {
      const contractType = this.getContractType(config);
      const constructorParams = this.getConstructorParams(config);
      
      // Get gas estimate from web3Service
      const estimate = await web3Service.estimateTokenDeploymentGas(contractType, constructorParams);
      
      // Determine if factory should be used (cheaper for standard tokens)
      const useFactory = ['BasicToken', 'BurnableToken', 'MintableToken', 'BurnableMintableToken'].includes(contractType);
      
      // If using factory, reduce gas cost by approximately 30%
      const factoryDiscount = useFactory ? 0.7 : 1.0;
      
      return {
        gasEstimate: estimate.gasEstimate.toString(),
        gasCost: (parseFloat(estimate.gasCost) * factoryDiscount).toFixed(6),
        gasCostUsd: estimate.gasCostUsd,
        timeEstimate: estimate.timeEstimate,
        useFactory
      };
    } catch (error) {
      console.error('Error estimating deployment cost:', error);
      
      // Return fallback estimates
      return {
        gasEstimate: '0',
        gasCost: '0.0',
        gasCostUsd: '$0.00',
        timeEstimate: '1-3 minutes',
        useFactory: false
      };
    }
  }

  async deployToken(config: TokenConfig): Promise<DeploymentResult> {
    try {
      const contractType = this.getContractType(config);
      const constructorParams = this.getConstructorParams(config);
      const useFactory = config.useFactory !== undefined ? 
        config.useFactory : 
        ['BasicToken', 'BurnableToken', 'MintableToken', 'BurnableMintableToken'].includes(contractType);

      const response = await fetch(`${this.apiUrl}/api/deploy/token`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          contractType,
          constructorArgs: constructorParams,
          network: config.network.id,
          verify: true,
          useFactory
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Deployment failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          // If we can't parse the JSON, use the status text
          errorMessage = `Deployment failed: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      return {
        contractAddress: result.contractAddress,
        transactionHash: result.transactionHash,
        network: config.network,
        explorerUrl: `${config.network.explorerUrl}/token/${result.contractAddress}`,
        gasUsed: result.gasUsed,
        deploymentCost: result.deploymentCost
      };
    } catch (error) {
      console.error('Error deploying token:', error);
      throw error;
    }
  }

  async deployPresale(config: PresaleConfig): Promise<DeploymentResult> {
    try {
      const response = await fetch(`${this.apiUrl}/api/deploy/presale`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          presaleConfig: config,
          network: config.network.id,
          verify: true
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Presale deployment failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          // If we can't parse the JSON, use the status text
          errorMessage = `Presale deployment failed: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      return {
        contractAddress: result.contractAddress,
        transactionHash: result.transactionHash,
        network: config.network,
        explorerUrl: `${config.network.explorerUrl}/address/${result.contractAddress}`,
        gasUsed: result.gasUsed,
        deploymentCost: result.deploymentCost
      };
    } catch (error) {
      console.error('Error deploying presale contract:', error);
      throw error;
    }
  }

  async getDeployedTokens(): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiUrl}/api/contracts/deployed`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        console.error(`Failed to fetch deployed contracts: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      return data.tokens || [];
    } catch (error) {
      console.error('Error fetching deployed tokens:', error);
      return [];
    }
  }

  async getDeployedPresales(): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiUrl}/api/contracts/deployed`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        console.error(`Failed to fetch deployed presales: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      return data.presales || [];
    } catch (error) {
      console.error('Error fetching deployed presales:', error);
      return [];
    }
  }

  async getPublicPresales(): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiUrl}/api/contracts/presales/public`);

      if (!response.ok) {
        console.error(`Failed to fetch public presales: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching public presales:', error);
      return [];
    }
  }

  async checkESRBalance(address: string): Promise<number> {
    try {
      const response = await fetch(`${this.apiUrl}/api/esr/balance/${address}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        console.error(`Failed to fetch ESR balance: ${response.status} ${response.statusText}`);
        return 0;
      }

      const data = await response.json();
      return data.balance || 0;
    } catch (error) {
      console.error('Error fetching ESR balance:', error);
      return 0;
    }
  }

  async deductESRTokens(amount: number = 100): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/esr/deduct`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to deduct ESR tokens';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Failed to deduct ESR tokens: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.success || false;
    } catch (error) {
      console.error('Error deducting ESR tokens:', error);
      throw error;
    }
  }

  // Real data fetching methods
  async getTokenStatistics(contractAddress: string, network: Network): Promise<{
    holders: number;
    transfers: number;
    totalSupply: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/api/contracts/${contractAddress}/stats?network=${network.id}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        console.error(`Failed to fetch token statistics: ${response.status} ${response.statusText}`);
        // Return default values if API call fails
        return { holders: 0, transfers: 0, totalSupply: '0' };
      }

      const data = await response.json();
      
      // If there's an error in the response, log it and return defaults
      if (data.error) {
        console.error(`Error in token statistics response: ${data.error}`);
      }
      
      return {
        holders: data.holders || 0,
        transfers: data.transfers || 0,
        totalSupply: data.totalSupply || '0'
      };
    } catch (error) {
      console.error('Error fetching token statistics:', error);
      return { holders: 0, transfers: 0, totalSupply: '0' };
    }
  }

  async getSaleStatistics(contractAddress: string): Promise<{
    totalRaised: string;
    participantCount: number;
    status: 'upcoming' | 'live' | 'ended';
  }> {
    try {
      // Get current network from web3Service
      const network = await web3Service.getCurrentNetwork();
      const networkId = network?.id || 'ethereum';
      
      const response = await fetch(`${this.apiUrl}/api/contracts/presale/${contractAddress}/stats?network=${networkId}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        console.error(`Failed to fetch sale statistics: ${response.status} ${response.statusText}`);
        return { totalRaised: '0', participantCount: 0, status: 'upcoming' };
      }

      const data = await response.json();
      
      // If there's an error in the response, log it
      if (data.error) {
        console.error(`Error in sale statistics response: ${data.error}`);
      }
      
      return {
        totalRaised: data.totalRaised || '0',
        participantCount: data.participantCount || 0,
        status: data.status || 'upcoming'
      };
    } catch (error) {
      console.error('Error fetching sale statistics:', error);
      return { totalRaised: '0', participantCount: 0, status: 'upcoming' };
    }
  }
}

export const contractService = new ContractService();