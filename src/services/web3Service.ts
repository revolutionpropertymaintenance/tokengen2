import { ethers } from 'ethers';
import { Network } from '../types';

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private network: Network | null = null;

  async connect(): Promise<string> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    try {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      await this.provider.send('eth_requestAccounts', []);
      this.signer = await this.provider.getSigner();
      
      // Get network information
      const network = await this.provider.getNetwork();
      this.network = {
        id: network.name,
        name: this.getNetworkName(Number(network.chainId)),
        symbol: this.getNetworkSymbol(Number(network.chainId)),
        chainId: Number(network.chainId),
        rpcUrl: window.ethereum.rpcUrls?.[0] || '',
        explorerUrl: this.getExplorerUrl(Number(network.chainId)),
        gasPrice: await this.getGasPrice()
      };
      
      return await this.signer.getAddress();
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      throw error;
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) throw new Error('Provider not connected');
    
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    if (!this.provider) throw new Error('Provider not connected');
    
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
        this.provider
      );
      
      const [balance, decimals] = await Promise.all([
        tokenContract.balanceOf(userAddress),
        tokenContract.decimals()
      ]);
      
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw error;
    }
  }

  async switchNetwork(network: Network): Promise<void> {
    if (!window.ethereum) throw new Error('MetaMask not found');
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${network.chainId.toString(16)}` }],
      });
      
      // Update current network
      this.network = network;
    } catch (error: any) {
      if (error.code === 4902) {
        await this.addNetwork(network);
      } else {
        throw error;
      }
    }
  }

  private async addNetwork(network: Network): Promise<void> {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${network.chainId.toString(16)}`,
        chainName: network.name,
        nativeCurrency: {
          name: network.symbol,
          symbol: network.symbol,
          decimals: 18,
        },
        rpcUrls: [network.rpcUrl],
        blockExplorerUrls: [network.explorerUrl],
      }],
    });
    
    // Update current network
    this.network = network;
  }

  async getCurrentNetwork(): Promise<Network | null> {
    if (!this.provider) {
      return null;
    }
    
    try {
      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);
      
      return {
        id: network.name,
        name: this.getNetworkName(chainId),
        symbol: this.getNetworkSymbol(chainId),
        chainId: chainId,
        rpcUrl: window.ethereum.rpcUrls?.[0] || '',
        explorerUrl: this.getExplorerUrl(chainId),
        gasPrice: await this.getGasPrice()
      };
    } catch (error) {
      console.error('Error getting current network:', error);
      return null;
    }
  }

  private getNetworkName(chainId: number): string {
    const networks: Record<number, string> = {
      1: 'Ethereum',
      5: 'Goerli',
      56: 'Binance Smart Chain',
      97: 'BSC Testnet',
      137: 'Polygon',
      80001: 'Mumbai',
      42161: 'Arbitrum',
      421614: 'Arbitrum Sepolia',
      250: 'Fantom',
      43114: 'Avalanche',
      25062019: 'Estar Testnet'
    };
    
    return networks[chainId] || `Chain ${chainId}`;
  }

  private getNetworkSymbol(chainId: number): string {
    const symbols: Record<number, string> = {
      1: 'ETH',
      5: 'ETH',
      56: 'BNB',
      97: 'tBNB',
      137: 'MATIC',
      80001: 'MATIC',
      42161: 'ETH',
      421614: 'ETH',
      250: 'FTM',
      43114: 'AVAX',
      25062019: 'ESR'
    };
    
    return symbols[chainId] || 'ETH';
  }

  private getExplorerUrl(chainId: number): string {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io',
      5: 'https://goerli.etherscan.io',
      56: 'https://bscscan.com',
      97: 'https://testnet.bscscan.com',
      137: 'https://polygonscan.com',
      80001: 'https://mumbai.polygonscan.com',
      42161: 'https://arbiscan.io',
      421614: 'https://sepolia.arbiscan.io',
      250: 'https://ftmscan.com',
      43114: 'https://snowtrace.io',
      25062019: 'https://esrscan.com'
    };
    
    return explorers[chainId] || 'https://etherscan.io';
  }

  async estimateGas(transaction: any): Promise<string> {
    if (!this.provider) throw new Error('Provider not connected');
    
    try {
      const gasEstimate = await this.provider.estimateGas(transaction);
      const gasPrice = await this.provider.getFeeData();
      
      const totalCost = gasEstimate * (gasPrice.gasPrice || 0n);
      return ethers.formatEther(totalCost);
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw error;
    }
  }

  async sendTransaction(transaction: any): Promise<string> {
    if (!this.signer) throw new Error('Signer not available');
    
    try {
      const tx = await this.signer.sendTransaction(transaction);
      return tx.hash;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }

  async waitForTransaction(txHash: string): Promise<ethers.TransactionReceipt> {
    if (!this.provider) throw new Error('Provider not connected');
    
    try {
      const receipt = await this.provider.waitForTransaction(txHash);
      if (!receipt) throw new Error('Transaction failed');
      
      return receipt;
    } catch (error) {
      console.error('Error waiting for transaction:', error);
      throw error;
    }
  }

  async getGasPrice(): Promise<string> {
    if (!this.provider) return '0.0';
    
    try {
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || 0n;
      
      // Format gas price to human-readable format
      const gasPriceInEth = ethers.formatEther(gasPrice);
      const gasPriceInGwei = ethers.formatUnits(gasPrice, 'gwei');
      
      return `${gasPriceInGwei} Gwei (${gasPriceInEth} ETH)`;
    } catch (error) {
      console.error('Error getting gas price:', error);
      return '0.0';
    }
  }

  getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }

  getSigner(): ethers.JsonRpcSigner | null {
    return this.signer;
  }

  getNetworkInfo(): Network | null {
    return this.network;
  }

  async compileContract(source: string, contractName: string): Promise<{abi: any, bytecode: string}> {
    try {
      // Use solc.js to compile the contract
      const solc = require('solc');
      
      const input = {
        language: 'Solidity',
        sources: {
          'contract.sol': {
            content: source
          }
        },
        settings: {
          outputSelection: {
            '*': {
              '*': ['abi', 'evm.bytecode']
            }
          },
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      };
      
      const output = JSON.parse(solc.compile(JSON.stringify(input)));
      
      if (output.errors) {
        const errors = output.errors.filter((error: any) => error.severity === 'error');
        if (errors.length > 0) {
          throw new Error(`Compilation errors: ${errors.map((e: any) => e.message).join(', ')}`);
        }
      }
      
      const contract = output.contracts['contract.sol'][contractName];
      
      return {
        abi: contract.abi,
        bytecode: contract.evm.bytecode.object
      };
    } catch (error) {
      console.error('Error compiling contract:', error);
      throw error;
    }
  }

  async deployContract(abi: any, bytecode: string, args: any[]): Promise<{address: string, txHash: string}> {
    if (!this.signer) throw new Error('Signer not available');
    
    try {
      // Create contract factory
      const factory = new ethers.ContractFactory(abi, bytecode, this.signer);
      
      // Deploy contract
      const contract = await factory.deploy(...args);
      await contract.waitForDeployment();
      
      const address = await contract.getAddress();
      const deploymentTx = contract.deploymentTransaction();
      
      if (!deploymentTx) throw new Error('Deployment transaction not found');
      
      return {
        address,
        txHash: deploymentTx.hash
      };
    } catch (error) {
      console.error('Error deploying contract:', error);
      throw error;
    }
  }

  async verifyContract(address: string, contractName: string, source: string, args: any[]): Promise<boolean> {
    // In a real implementation, this would call the explorer's API to verify the contract
    // For now, we'll just simulate a successful verification
    console.log(`Verifying contract ${contractName} at ${address}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return true;
  }

  disconnect(): void {
    this.provider = null;
    this.signer = null;
    this.network = null;
  }
}

export const web3Service = new Web3Service();