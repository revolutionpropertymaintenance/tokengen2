import { ethers } from 'ethers';
import { web3Service } from './web3Service';
import { TokenConfig, Network, VestingConfig } from '../types';
import { ESR_TOKEN_ADDRESS, PLATFORM_WALLET } from '../config/constants';

// Contract ABIs
import BasicTokenABI from '../abis/BasicToken.json';
import BurnableTokenABI from '../abis/BurnableToken.json';
import MintableTokenABI from '../abis/MintableToken.json';
import PresaleContractABI from '../abis/PresaleContract.json';
import TokenVestingABI from '../abis/TokenVesting.json';

// Contract source code
import { getContractSource } from './contractSource';

export interface DeploymentResult {
  contractAddress: string;
  transactionHash: string;
  network: Network;
  explorerUrl: string;
  gasUsed: string;
  deploymentCost: string;
}

export class ContractService {
  private getContractType(config: TokenConfig): string {
    const features = config.features;
    
    if (features.burnable && features.mintable && 
        (features.transferFees.enabled || features.holderRedistribution.enabled)) {
      return 'AdvancedToken';
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

  private getConstructorParams(config: TokenConfig, ownerAddress: string): any[] {
    const contractType = this.getContractType(config);
    const baseParams = [
      config.name,
      config.symbol,
      config.decimals,
      ethers.parseUnits(config.initialSupply, config.decimals),
      config.maxSupply ? ethers.parseUnits(config.maxSupply, config.decimals) : 0,
    ];

    switch (contractType) {
      case 'FeeToken':
        return [
          ...baseParams,
          Math.floor(config.features.transferFees.percentage * 100), // Convert to basis points
          config.features.transferFees.recipient,
          ownerAddress
        ];
      case 'RedistributionToken':
        return [
          ...baseParams,
          Math.floor(config.features.holderRedistribution.percentage * 100),
          ownerAddress
        ];
      case 'AdvancedToken':
        return [
          ...baseParams,
          Math.floor(config.features.transferFees.percentage * 100),
          config.features.transferFees.recipient,
          Math.floor(config.features.holderRedistribution.percentage * 100),
          ownerAddress
        ];
      default:
        return [...baseParams, ownerAddress];
    }
  }

  async deployToken(config: TokenConfig): Promise<DeploymentResult> {
    const signer = web3Service.getSigner();
    if (!signer) throw new Error('Wallet not connected');

    try {
      // Deduct ESR tokens first if not on testnet
      const network = web3Service.getNetworkInfo();
      if (network && !this.isTestnet(network.chainId)) {
        await this.deductESRTokens();
      }

      const contractType = this.getContractType(config);
      const ownerAddress = await signer.getAddress();
      const constructorParams = this.getConstructorParams(config, ownerAddress);

      // Get contract source code
      const source = getContractSource(contractType);
      
      // Compile contract
      console.log(`Compiling ${contractType}...`);
      const { abi, bytecode } = await web3Service.compileContract(source, contractType);
      
      // Deploy contract
      console.log(`Deploying ${contractType}...`);
      const { address, txHash } = await web3Service.deployContract(abi, bytecode, constructorParams);
      
      // Wait for transaction receipt
      const provider = web3Service.getProvider();
      if (!provider) throw new Error('Provider not connected');
      
      const receipt = await provider.waitForTransaction(txHash);
      if (!receipt) throw new Error('Transaction receipt not found');
      
      // Verify contract
      console.log(`Verifying ${contractType} at ${address}...`);
      await web3Service.verifyContract(address, contractType, source, constructorParams);
      
      // Deploy vesting contract if needed
      if (config.vesting.length > 0) {
        await this.deployVestingContract(address, config.vesting);
      }
      
      // Store deployment in local storage for history
      this.saveDeployment({
        contractAddress: address,
        contractType,
        name: config.name,
        symbol: config.symbol,
        network: network!,
        timestamp: Date.now()
      });
      
      return {
        contractAddress: address,
        transactionHash: txHash,
        network: network!,
        explorerUrl: `${network!.explorerUrl}/token/${address}`,
        gasUsed: receipt.gasUsed.toString(),
        deploymentCost: ethers.formatEther(receipt.gasUsed * (receipt.gasPrice || 0n))
      };
    } catch (error) {
      console.error('Error deploying token:', error);
      throw error;
    }
  }

  async deployVestingContract(tokenAddress: string, vestingConfigs: VestingConfig[]): Promise<string> {
    const signer = web3Service.getSigner();
    if (!signer) throw new Error('Wallet not connected');

    try {
      // Get contract source code
      const source = getContractSource('TokenVesting');
      
      // Compile contract
      console.log('Compiling TokenVesting...');
      const { abi, bytecode } = await web3Service.compileContract(source, 'TokenVesting');
      
      // Deploy contract
      console.log('Deploying TokenVesting...');
      const { address, txHash } = await web3Service.deployContract(abi, bytecode, [tokenAddress]);
      
      // Wait for transaction confirmation
      const provider = web3Service.getProvider();
      if (!provider) throw new Error('Provider not connected');
      await provider.waitForTransaction(txHash);
      
      // Create vesting schedules
      const vestingContract = new ethers.Contract(address, abi, signer);
      
      for (const vest of vestingConfigs) {
        if (!vest.enabled) continue;
        
        const startTime = Math.floor(new Date(vest.startDate).getTime() / 1000);
        const duration = vest.duration * 24 * 60 * 60; // Convert days to seconds
        const amount = ethers.parseUnits(
          ((parseInt(config.initialSupply) * vest.percentage) / 100).toString(),
          config.decimals
        );
        
        // Approve vesting contract to transfer tokens
        const tokenContract = new ethers.Contract(
          tokenAddress,
          ['function approve(address spender, uint256 amount) returns (bool)'],
          signer
        );
        
        await tokenContract.approve(address, amount);
        
        // Create vesting schedule
        await vestingContract.createVestingSchedule(
          await signer.getAddress(), // beneficiary
          amount,
          startTime,
          duration
        );
      }
      
      return address;
    } catch (error) {
      console.error('Error deploying vesting contract:', error);
      throw error;
    }
  }

  async deployPresale(config: any): Promise<DeploymentResult> {
    const signer = web3Service.getSigner();
    if (!signer) throw new Error('Wallet not connected');

    try {
      // Deduct ESR tokens first if not on testnet
      const network = web3Service.getNetworkInfo();
      if (network && !this.isTestnet(network.chainId)) {
        await this.deductESRTokens();
      }

      // Get contract source code
      const source = getContractSource('PresaleContract');
      
      // Compile contract
      console.log('Compiling PresaleContract...');
      const { abi, bytecode } = await web3Service.compileContract(source, 'PresaleContract');
      
      // Prepare sale info struct
      const saleInfo = {
        token: config.tokenInfo.tokenAddress,
        tokenPrice: ethers.parseUnits(config.saleConfiguration.tokenPrice, 18),
        softCap: ethers.parseEther(config.saleConfiguration.softCap),
        hardCap: ethers.parseEther(config.saleConfiguration.hardCap),
        minPurchase: ethers.parseEther(config.saleConfiguration.minPurchase),
        maxPurchase: ethers.parseEther(config.saleConfiguration.maxPurchase),
        startTime: Math.floor(new Date(config.saleConfiguration.startDate).getTime() / 1000),
        endTime: Math.floor(new Date(config.saleConfiguration.endDate).getTime() / 1000),
        whitelistEnabled: config.saleConfiguration.whitelistEnabled
      };

      // Prepare vesting info struct
      const vestingInfo = {
        enabled: config.vestingConfig.enabled,
        initialRelease: config.vestingConfig.initialRelease,
        vestingDuration: config.vestingConfig.duration * 24 * 60 * 60 // Convert days to seconds
      };

      // Deploy contract
      console.log('Deploying PresaleContract...');
      const { address, txHash } = await web3Service.deployContract(abi, bytecode, [
        saleInfo,
        vestingInfo,
        config.walletSetup.saleReceiver,
        config.walletSetup.refundWallet
      ]);
      
      // Wait for transaction receipt
      const provider = web3Service.getProvider();
      if (!provider) throw new Error('Provider not connected');
      
      const receipt = await provider.waitForTransaction(txHash);
      if (!receipt) throw new Error('Transaction receipt not found');
      
      // Verify contract
      console.log(`Verifying PresaleContract at ${address}...`);
      await web3Service.verifyContract(address, 'PresaleContract', source, [
        saleInfo,
        vestingInfo,
        config.walletSetup.saleReceiver,
        config.walletSetup.refundWallet
      ]);
      
      // Approve token transfer to presale contract
      const tokenContract = new ethers.Contract(
        config.tokenInfo.tokenAddress,
        ['function approve(address spender, uint256 amount) returns (bool)'],
        signer
      );
      
      const tokenAmount = ethers.parseUnits(config.tokenInfo.allocatedAmount, 18);
      await tokenContract.approve(address, tokenAmount);
      
      // Store deployment in local storage for history
      this.savePresaleDeployment({
        contractAddress: address,
        tokenAddress: config.tokenInfo.tokenAddress,
        tokenName: config.tokenInfo.tokenName,
        tokenSymbol: config.tokenInfo.tokenSymbol,
        saleName: config.saleConfiguration.saleName,
        network: network!,
        timestamp: Date.now(),
        status: 'upcoming'
      });
      
      return {
        contractAddress: address,
        transactionHash: txHash,
        network: network!,
        explorerUrl: `${network!.explorerUrl}/address/${address}`,
        gasUsed: receipt.gasUsed.toString(),
        deploymentCost: ethers.formatEther(receipt.gasUsed * (receipt.gasPrice || 0n))
      };
    } catch (error) {
      console.error('Error deploying presale contract:', error);
      throw error;
    }
  }

  async deductESRTokens(amount: number = 100): Promise<boolean> {
    const signer = web3Service.getSigner();
    if (!signer) throw new Error('Wallet not connected');

    try {
      const address = await signer.getAddress();
      
      // Create ESR token contract instance
      const esrContract = new ethers.Contract(
        ESR_TOKEN_ADDRESS,
        ['function transfer(address to, uint256 amount) returns (bool)'],
        signer
      );
      
      // Convert amount to wei (18 decimals)
      const amountWei = ethers.parseUnits(amount.toString(), 18);
      
      // Transfer ESR tokens to platform wallet
      const tx = await esrContract.transfer(PLATFORM_WALLET, amountWei);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error('Error deducting ESR tokens:', error);
      throw error;
    }
  }

  async checkESRBalance(address: string): Promise<number> {
    if (!address) return 0;
    
    try {
      // Create ESR token contract instance
      const provider = web3Service.getProvider();
      if (!provider) throw new Error('Provider not connected');
      
      const esrContract = new ethers.Contract(
        ESR_TOKEN_ADDRESS,
        ['function balanceOf(address) view returns (uint256)'],
        provider
      );
      
      // Get balance
      const balance = await esrContract.balanceOf(address);
      
      // Convert from wei to tokens
      return Number(ethers.formatUnits(balance, 18));
    } catch (error) {
      console.error('Error checking ESR balance:', error);
      return 0;
    }
  }

  private isTestnet(chainId: number): boolean {
    const testnets = [5, 97, 80001, 421614, 25062019];
    return testnets.includes(chainId);
  }

  private saveDeployment(deployment: any): void {
    try {
      // Get existing deployments from local storage
      const deploymentsStr = localStorage.getItem('tokenDeployments');
      const deployments = deploymentsStr ? JSON.parse(deploymentsStr) : [];
      
      // Add new deployment
      deployments.push(deployment);
      
      // Save back to local storage
      localStorage.setItem('tokenDeployments', JSON.stringify(deployments));
    } catch (error) {
      console.error('Error saving deployment to local storage:', error);
    }
  }

  private savePresaleDeployment(deployment: any): void {
    try {
      // Get existing deployments from local storage
      const deploymentsStr = localStorage.getItem('presaleDeployments');
      const deployments = deploymentsStr ? JSON.parse(deploymentsStr) : [];
      
      // Add new deployment
      deployments.push(deployment);
      
      // Save back to local storage
      localStorage.setItem('presaleDeployments', JSON.stringify(deployments));
    } catch (error) {
      console.error('Error saving presale deployment to local storage:', error);
    }
  }

  getDeployedTokens(): any[] {
    try {
      // Get deployments from local storage
      const deploymentsStr = localStorage.getItem('tokenDeployments');
      return deploymentsStr ? JSON.parse(deploymentsStr) : [];
    } catch (error) {
      console.error('Error getting deployments from local storage:', error);
      return [];
    }
  }

  getDeployedPresales(): any[] {
    try {
      // Get presale deployments from local storage
      const deploymentsStr = localStorage.getItem('presaleDeployments');
      return deploymentsStr ? JSON.parse(deploymentsStr) : [];
    } catch (error) {
      console.error('Error getting presale deployments from local storage:', error);
      return [];
    }
  }

  async getContract(address: string, abi: any[]): Promise<ethers.Contract> {
    const provider = web3Service.getProvider();
    if (!provider) throw new Error('Provider not connected');

    return new ethers.Contract(address, abi, provider);
  }

  async getContractWithSigner(address: string, abi: any[]): Promise<ethers.Contract> {
    const signer = web3Service.getSigner();
    if (!signer) throw new Error('Signer not available');

    return new ethers.Contract(address, abi, signer);
  }
}

export const contractService = new ContractService();