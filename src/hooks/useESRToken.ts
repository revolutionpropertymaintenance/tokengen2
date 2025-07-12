import { useState, useCallback } from 'react';
import { ESR_TOKEN_ADDRESS } from '../config/constants';
import { contractService } from '../services/contractService';

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

    setIsLoading(true);
    try {
      // Get ESR token balance using contractService
      const esrBalance = await contractService.checkESRBalance(address);
      setBalance(esrBalance);
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

    try {
      // Deduct ESR tokens using contractService
      await contractService.deductESRTokens(amount);
      
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