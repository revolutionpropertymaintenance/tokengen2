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
  const [error, setError] = useState<string | null>(null);

  const checkBalance = useCallback(async (address: string) => {
    if (!address) {
      setBalance(0);
      setError(null);
      return;
    }
    
    if (ESR_TOKEN_ADDRESS === '0x0000000000000000000000000000000000000000') {
      console.warn('ESR Token address not configured');
      setBalance(0);
      setError('ESR Token address not configured. Please check your environment variables.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const provider = web3Service.getProvider();
      if (!provider) {
        throw new Error('Wallet provider not available. Please connect your wallet.');
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

      // Log balance for debugging
      console.log(`ESR Balance for ${address.slice(0, 6)}...${address.slice(-4)}: ${formattedBalance} ESR`);
    } catch (error) {
      const errorMessage = (error as Error).message || 'Unknown error';
      console.error('Error checking ESR balance:', errorMessage);
      setBalance(0);
      
      // Set a user-friendly error message
      setError(
        errorMessage.includes('network') ? 'Network error. Please check your connection.' :
        errorMessage.includes('wallet') ? errorMessage :
        'Failed to check ESR balance. Please try refreshing the page or reconnecting your wallet.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deductTokens = useCallback(async (address: string, amount: number) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }
    setError(null);
    
    if (ESR_TOKEN_ADDRESS === '0x0000000000000000000000000000000000000000') {
      throw new Error('ESR Token address not configured. Please check your environment variables.');
    }

    try {
      const signer = web3Service.getSigner();
      if (!signer) {
        const error = new Error('Wallet connection issue. Please reconnect your wallet.');
        setError(error.message);
        throw error;
      }
      
      // Create ESR token contract instance with signer
      const esrContract = new ethers.Contract(ESR_TOKEN_ADDRESS, ESR_TOKEN_ABI, signer);
      
      // Get token decimals
      const decimals = await esrContract.decimals();
      
      // Convert amount to wei
      const amountWei = ethers.parseUnits(amount.toString(), decimals);
      
      // Check current balance
      const currentBalance = await esrContract.balanceOf(address);
      const formattedBalance = ethers.formatUnits(currentBalance, decimals);
      const availableBalance = parseFloat(formattedBalance);
      if (availableBalance < amount) {
        throw new Error(`Insufficient ESR balance. Required: ${amount} ESR, Available: ${availableBalance.toFixed(2)} ESR`);
      }
      
      console.log(`Transferring ${amount} ESR tokens to platform wallet ${PLATFORM_WALLET.slice(0, 6)}...${PLATFORM_WALLET.slice(-4)}`);
      
      // Transfer ESR tokens to platform wallet
      const tx = await esrContract.transfer(PLATFORM_WALLET, amountWei);
      const txHash = tx.hash;
      
      console.log(`ESR transfer transaction sent: ${tx.hash}`);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log(`ESR transfer confirmed in block ${receipt.blockNumber}. Gas used: ${receipt.gasUsed.toString()}`);
        
        // Notify backend about the transaction
        try {
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/esr/deduct`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, txHash })
          });
        } catch (apiError) {
          console.error('Failed to notify backend about ESR deduction:', apiError);
          // Continue even if backend notification fails
        }
        
        // Update balance after successful transaction
        setTimeout(() => {
          checkBalance(address);
        }, 2000);
        
        return txHash;
      } else {
        throw new Error('ESR transfer transaction failed');
      }
    } catch (error) {
      console.error('Error deducting ESR tokens:', error);
      setError((error as Error).message);
      throw error;
    }
  }, [checkBalance]);

  return {
    balance,
    isLoading,
    error,
    checkBalance,
    deductTokens
  };
};