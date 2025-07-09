import { useState, useCallback } from 'react';
import { Network } from '../types';

interface SaleData {
  saleName: string;
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string;
  saleType: 'presale' | 'private';
  tokenPrice: string;
  softCap: string;
  hardCap: string;
  minPurchase: string;
  maxPurchase: string;
  startTime: number;
  endTime: number;
  totalRaised: string;
  totalParticipants: number;
  networkSymbol: string;
  explorerUrl: string;
  vestingEnabled: boolean;
  initialRelease: number;
  vestingDuration: number;
  isFinalized: boolean;
}

interface UserInfo {
  contribution: string;
  tokenAmount: string;
  claimedTokens: string;
  claimableTokens: string;
  isWhitelisted: boolean;
}

interface SaleContractHook {
  saleData: SaleData | null;
  userInfo: UserInfo | null;
  isLoading: boolean;
  isWhitelisted: boolean;
  buyTokens: (amount: string) => Promise<void>;
  claimTokens: () => Promise<void>;
  loadSaleData: () => Promise<void>;
  loadUserInfo: (address: string) => Promise<void>;
}

export const useSaleContract = (contractAddress: string): SaleContractHook => {
  const [saleData, setSaleData] = useState<SaleData | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWhitelisted, setIsWhitelisted] = useState(false);

  const loadSaleData = useCallback(async () => {
    if (!contractAddress) return;
    
    setIsLoading(true);
    try {
      // Mock sale data - in production, this would call the smart contract
      const mockSaleData: SaleData = {
        saleName: 'My Awesome Token Presale',
        tokenName: 'My Awesome Token',
        tokenSymbol: 'MAT',
        tokenAddress: '0x1234567890abcdef1234567890abcdef12345678',
        saleType: 'presale',
        tokenPrice: '1000',
        softCap: '10',
        hardCap: '100',
        minPurchase: '0.1',
        maxPurchase: '10',
        startTime: Math.floor(Date.now() / 1000) - 86400, // Started 1 day ago
        endTime: Math.floor(Date.now() / 1000) + 86400 * 7, // Ends in 7 days
        totalRaised: '45.5',
        totalParticipants: 127,
        networkSymbol: 'ETH',
        explorerUrl: 'https://etherscan.io',
        vestingEnabled: true,
        initialRelease: 25,
        vestingDuration: 90,
        isFinalized: false
      };
      
      setSaleData(mockSaleData);
    } catch (error) {
      console.error('Error loading sale data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress]);

  const loadUserInfo = useCallback(async (address: string) => {
    if (!contractAddress || !address) return;
    
    try {
      // Mock user data - in production, this would call the smart contract
      const mockUserInfo: UserInfo = {
        contribution: '2.5',
        tokenAmount: '2500',
        claimedTokens: '625',
        claimableTokens: '125',
        isWhitelisted: true
      };
      
      setUserInfo(mockUserInfo);
      setIsWhitelisted(mockUserInfo.isWhitelisted);
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  }, [contractAddress]);

  const buyTokens = useCallback(async (amount: string) => {
    if (!contractAddress || typeof window.ethereum === 'undefined') {
      throw new Error('Wallet not connected');
    }

    try {
      // Convert amount to wei
      const amountWei = (parseFloat(amount) * Math.pow(10, 18)).toString(16);
      
      // Call buyTokens function on the contract
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          to: contractAddress,
          value: `0x${amountWei}`,
          data: '0xd0febe4c' // buyTokens() function selector
        }]
      });

      console.log('Purchase transaction:', txHash);
      
      // Wait for transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.error('Error buying tokens:', error);
      throw error;
    }
  }, [contractAddress]);

  const claimTokens = useCallback(async () => {
    if (!contractAddress || typeof window.ethereum === 'undefined') {
      throw new Error('Wallet not connected');
    }

    try {
      // Call claimTokens function on the contract
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          to: contractAddress,
          data: '0x48c54b9d' // claimTokens() function selector
        }]
      });

      console.log('Claim transaction:', txHash);
      
      // Wait for transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.error('Error claiming tokens:', error);
      throw error;
    }
  }, [contractAddress]);

  return {
    saleData,
    userInfo,
    isLoading,
    isWhitelisted,
    buyTokens,
    claimTokens,
    loadSaleData,
    loadUserInfo
  };
};