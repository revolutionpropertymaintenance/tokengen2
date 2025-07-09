import { useState, useCallback } from 'react';
import { ESR_TOKEN_ADDRESS } from '../config/constants';

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
    if (!address || typeof window.ethereum === 'undefined') {
      setBalance(0);
      return;
    }

    setIsLoading(true);
    try {
      // ERC20 balanceOf function call
      const balanceHex = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: ESR_TOKEN_ADDRESS,
          data: `0x70a08231000000000000000000000000${address.slice(2)}` // balanceOf(address)
        }, 'latest']
      });

      // Convert hex to decimal and adjust for 18 decimals
      const balanceWei = parseInt(balanceHex, 16);
      const balanceTokens = balanceWei / Math.pow(10, 18);
      
      setBalance(Math.floor(balanceTokens));
    } catch (error) {
      console.error('Error checking ESR balance:', error);
      // For demo purposes, set a mock balance
      setBalance(150); // Mock balance for testing
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deductTokens = useCallback(async (address: string, amount: number) => {
    if (!address || typeof window.ethereum === 'undefined') {
      throw new Error('Wallet not connected');
    }

    try {
      // Convert amount to wei (18 decimals)
      const amountWei = (amount * Math.pow(10, 18)).toString(16);
      
      // ERC20 transfer function call to platform wallet
      const platformWallet = '0x742d35Cc6634C0532925a3b8D4C9db96590c6C8C'; // Platform wallet address
      
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: address,
          to: ESR_TOKEN_ADDRESS,
          data: `0xa9059cbb000000000000000000000000${platformWallet.slice(2)}${'0'.repeat(64 - amountWei.length)}${amountWei}` // transfer(to, amount)
        }]
      });

      console.log('Token deduction transaction:', txHash);
      
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