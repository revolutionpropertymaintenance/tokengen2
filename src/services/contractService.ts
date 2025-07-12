import { ethers } from 'ethers';
import { web3Service } from './web3Service';
import { TokenConfig, Network } from '../types';
import { contractBytecode } from './contractBytecode';

// Contract ABIs
import BasicTokenABI from '../abis/BasicToken.json';
import BurnableTokenABI from '../abis/BurnableToken.json';
import MintableTokenABI from '../abis/MintableToken.json';
import PresaleContractABI from '../abis/PresaleContract.json';
import TokenVestingABI from '../abis/TokenVesting.json';

export interface DeploymentResult {
  contractAddress: string;
  transactionHash: string;
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

    const contractType = this.getContractType(config);
    const ownerAddress = await signer.getAddress();
    const constructorParams = this.getConstructorParams(config, ownerAddress);

    // Get contract bytecode and ABI
    const bytecode = contractBytecode[contractType];
    if (!bytecode) throw new Error(`Bytecode not found for ${contractType}`);

    // Create contract factory
    const contractFactory = new ethers.ContractFactory(
      this.getABI(contractType),
      bytecode,
      signer
    );

    // Deploy contract
    const contract = await contractFactory.deploy(...constructorParams);
    await contract.waitForDeployment();

    const deploymentTx = contract.deploymentTransaction();
    if (!deploymentTx) throw new Error('Deployment transaction not found');

    const receipt = await deploymentTx.wait();
    if (!receipt) throw new Error('Deployment failed');

    return {
      contractAddress: await contract.getAddress(),
      transactionHash: deploymentTx.hash,
      gasUsed: receipt.gasUsed.toString(),
      deploymentCost: ethers.formatEther(receipt.gasUsed * deploymentTx.gasPrice)
    };
  }

  async deployPresale(config: any): Promise<DeploymentResult> {
    const signer = web3Service.getSigner();
    if (!signer) throw new Error('Wallet not connected');

    const ownerAddress = await signer.getAddress();
    
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

    const bytecode = contractBytecode['PresaleContract'];
    if (!bytecode) throw new Error('Presale contract bytecode not found');

    const contractFactory = new ethers.ContractFactory(
      PresaleContractABI,
      bytecode,
      signer
    );

    const contract = await contractFactory.deploy(
      saleInfo,
      vestingInfo,
      config.walletSetup.saleReceiver,
      config.walletSetup.refundWallet
    );

    await contract.waitForDeployment();

    const deploymentTx = contract.deploymentTransaction();
    if (!deploymentTx) throw new Error('Deployment transaction not found');

    const receipt = await deploymentTx.wait();
    if (!receipt) throw new Error('Deployment failed');

    return {
      contractAddress: await contract.getAddress(),
      transactionHash: deploymentTx.hash,
      gasUsed: receipt.gasUsed.toString(),
      deploymentCost: ethers.formatEther(receipt.gasUsed * deploymentTx.gasPrice)
    };
  }

  async deployVesting(tokenAddress: string): Promise<DeploymentResult> {
    const signer = web3Service.getSigner();
    if (!signer) throw new Error('Wallet not connected');

    const bytecode = contractBytecode['TokenVesting'];
    if (!bytecode) throw new Error('Vesting contract bytecode not found');

    const contractFactory = new ethers.ContractFactory(
      TokenVestingABI,
      bytecode,
      signer
    );

    const contract = await contractFactory.deploy(tokenAddress);
    await contract.waitForDeployment();

    const deploymentTx = contract.deploymentTransaction();
    if (!deploymentTx) throw new Error('Deployment transaction not found');

    const receipt = await deploymentTx.wait();
    if (!receipt) throw new Error('Deployment failed');

    return {
      contractAddress: await contract.getAddress(),
      transactionHash: deploymentTx.hash,
      gasUsed: receipt.gasUsed.toString(),
      deploymentCost: ethers.formatEther(receipt.gasUsed * deploymentTx.gasPrice)
    };
  }

  private getABI(contractType: string): any[] {
    switch (contractType) {
      case 'BasicToken':
      case 'FeeToken':
      case 'RedistributionToken':
        return BasicTokenABI;
      case 'BurnableToken':
        return BurnableTokenABI;
      case 'MintableToken':
      case 'BurnableMintableToken':
      case 'AdvancedToken':
        return MintableTokenABI;
      default:
        return BasicTokenABI;
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