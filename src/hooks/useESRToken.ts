import { useState, useCallback } from 'react';
import { ESR_TOKEN_ADDRESS, PLATFORM_WALLET } from '../config/constants';
import { ethers } from 'ethers';
import { web3Service } from '../services/web3Service';

// ESR Token ABI (ERC-20 standard methods)
const ESR_TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)'
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
      
      const esrContract = new ethers.Contract(ESR_TOKEN_ADDRESS, ESR_TOKEN_ABI, provider);
      const [balance, decimals] = await Promise.all([
        esrContract.balanceOf(address),
        esrContract.decimals()
      ]);
      
      const formattedBalance = parseFloat(ethers.formatUnits(balance, decimals));
      setBalance(formattedBalance);
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
      
      const esrContract = new ethers.Contract(ESR_TOKEN_ADDRESS, ESR_TOKEN_ABI, signer);
      const decimals = await esrContract.decimals();
      const amountWei = ethers.parseUnits(amount.toString(), decimals);
      
      // Transfer ESR tokens to platform wallet
      const tx = await esrContract.transfer(PLATFORM_WALLET, amountWei);
      await tx.wait();
      
      // Update balance after successful transaction
      setTimeout(() => {
        checkBalance(address);
      }, 2000);
      
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