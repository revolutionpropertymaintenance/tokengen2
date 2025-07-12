import { ethers } from 'ethers';
import { Network } from '../types';

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  async connect(): Promise<string> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    await this.provider.send('eth_requestAccounts', []);
    this.signer = await this.provider.getSigner();
    
    return await this.signer.getAddress();
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) throw new Error('Provider not connected');
    
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    if (!this.provider) throw new Error('Provider not connected');
    
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
  }

  async switchNetwork(network: Network): Promise<void> {
    if (!window.ethereum) throw new Error('MetaMask not found');
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${network.chainId.toString(16)}` }],
      });
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
  }

  async getCurrentNetwork(): Promise<number> {
    if (!this.provider) throw new Error('Provider not connected');
    
    const network = await this.provider.getNetwork();
    return Number(network.chainId);
  }

  async estimateGas(transaction: any): Promise<string> {
    if (!this.provider) throw new Error('Provider not connected');
    
    const gasEstimate = await this.provider.estimateGas(transaction);
    const gasPrice = await this.provider.getFeeData();
    
    const totalCost = gasEstimate * (gasPrice.gasPrice || 0n);
    return ethers.formatEther(totalCost);
  }

  async sendTransaction(transaction: any): Promise<string> {
    if (!this.signer) throw new Error('Signer not available');
    
    const tx = await this.signer.sendTransaction(transaction);
    return tx.hash;
  }

  async waitForTransaction(txHash: string): Promise<ethers.TransactionReceipt> {
    if (!this.provider) throw new Error('Provider not connected');
    
    const receipt = await this.provider.waitForTransaction(txHash);
    if (!receipt) throw new Error('Transaction failed');
    
    return receipt;
  }

  getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }

  getSigner(): ethers.JsonRpcSigner | null {
    return this.signer;
  }
}

export const web3Service = new Web3Service();