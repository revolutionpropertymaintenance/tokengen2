import { useState, useCallback } from 'react';
import { ESR_TOKEN_ADDRESS, PLATFORM_WALLET } from '../config/constants';
import { ethers } from 'ethers';
import { web3Service } from '../services/web3Service';

// ESR Token ABI (ERC-20 standard methods)
const ESR_TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)'
];

interface ESRTokenHook {
  balance: number;
  isLoading: boolean;
  checkBalance: (address: string) => Promise<void>;
  deductTokens: (address: string, amount: number) => Promise<void>;
}

export const useESRToken = (): ESRTokenHook => {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const checkBalance = useCallback(async (address: string) => {
    if (!address) {
      setBalance(0);
      return;
    }
    
    if (ESR_TOKEN_ADDRESS === '0x0000000000000000000000000000000000000000') {
      console.warn('ESR Token address not configured');
      setBalance(0);
      return;
    }

    setIsLoading(true);
    try {
      const provider = web3Service.getProvider();
      if (!provider) {
        throw new Error('Provider not available');
      }
      
      // Create ESR token contract instance
      const esrContract = new ethers.Contract(ESR_TOKEN_ADDRESS, ESR_TOKEN_ABI, provider);
      
      // Get balance and decimals in parallel
      const [balanceWei, decimals] = await Promise.all([
        esrContract.balanceOf(address),
        esrContract.decimals()
      ]);
      
      // Format balance from wei to human readable
      const formattedBalance = parseFloat(ethers.formatUnits(balanceWei, decimals));
      setBalance(formattedBalance);
      
      console.log(`ESR Balance for ${address}: ${formattedBalance} ESR`);
    } catch (error) {
      console.error('Error checking ESR balance:', error);
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deductTokens = useCallback(async (address: string, amount: number) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }
    
    if (ESR_TOKEN_ADDRESS === '0x0000000000000000000000000000000000000000') {
      throw new Error('ESR Token address not configured');
    }

    try {
      const signer = web3Service.getSigner();
      if (!signer) {
        throw new Error('Signer not available');
      }
      
      // Create ESR token contract instance with signer
      const esrContract = new ethers.Contract(ESR_TOKEN_ADDRESS, ESR_TOKEN_ABI, signer);
      
      // Get token decimals
      const decimals = await esrContract.decimals();
      
      // Convert amount to wei
      const amountWei = ethers.parseUnits(amount.toString(), decimals);
      
      // Check current balance
      const currentBalance = await esrContract.balanceOf(address);
      if (currentBalance < amountWei) {
        throw new Error(`Insufficient ESR balance. Required: ${amount} ESR, Available: ${ethers.formatUnits(currentBalance, decimals)} ESR`);
      }
      
      console.log(`Transferring ${amount} ESR tokens to platform wallet...`);
      
      // Transfer ESR tokens to platform wallet
      const tx = await esrContract.transfer(PLATFORM_WALLET, amountWei);
      
      console.log(`ESR transfer transaction sent: ${tx.hash}`);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log(`ESR transfer confirmed in block ${receipt.blockNumber}`);
        
        // Update balance after successful transaction
        setTimeout(() => {
          checkBalance(address);
        }, 2000);
      } else {
        throw new Error('ESR transfer transaction failed');
      }
      
    } catch (error) {
      console.error('Error deducting ESR tokens:', error);
      throw error;
    }
  }, [checkBalance]);

  return {
    balance,
    isLoading,
    checkBalance,
    deductTokens
  };
};