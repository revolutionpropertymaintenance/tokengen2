import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractService } from '../services/contractService';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    chainId: null
  });

  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsConnecting(true);
        
        // Request account access
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        // Get network info
        const network = await provider.getNetwork();
        
        // Get balance
        const balance = await provider.getBalance(address);
        
        // Authenticate with backend
        try {
          const message = await contractService.getAuthMessage(address);
          const signature = await signer.signMessage(message);
          await contractService.authenticate(address, signature, message);
        } catch (authError) {
          console.error('Authentication failed:', authError);
          // Continue without authentication for now
        }
        
        setWallet({
          isConnected: true,
          address: address,
          balance: parseFloat(ethers.formatEther(balance)).toFixed(4),
          chainId: Number(network.chainId)
        });
      } catch (error) {
        console.error('Error connecting wallet:', error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert('Please install MetaMask to use this feature');
    }
  };

  const disconnectWallet = () => {
    // Clear auth token
    localStorage.removeItem('authToken');
    
    setWallet({
      isConnected: false,
      address: null,
      balance: null,
      chainId: null
    });
  };

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWallet(prev => {
            return {
            ...prev,
            address: accounts[0]
            };
          });
        }
      };

      const handleChainChanged = (chainId: string) => {
        const numericChainId = parseInt(chainId, 16);
        setWallet(prev => {
          return {
          ...prev,
          chainId: numericChainId
          };
        });
        
        // Refresh page on chain change to ensure all data is updated
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return {
    ...wallet,
    connectWallet,
    disconnectWallet,
    isConnecting
  };
};