import { useState, useEffect } from 'react';
import { web3Service } from '../services/web3Service';

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
        // Connect using web3Service
        const address = await web3Service.connect();
        
        // Get network info
        const network = web3Service.getNetworkInfo();
        
        // Get balance
        const balance = await web3Service.getBalance(address);
        
        setWallet({
          isConnected: true,
          address: address,
          balance: parseFloat(balance).toFixed(4),
          chainId: network?.chainId || 0
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
    // Disconnect web3Service
    web3Service.disconnect();
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
          web3Service.disconnect();
          disconnectWallet();
        } else {
          setWallet(prev => ({
            ...prev,
            address: accounts[0]
          }));
        }
      };

      const handleChainChanged = (chainId: string) => {
        const numericChainId = parseInt(chainId, 16);
        setWallet(prev => ({
          ...prev,
          chainId: numericChainId
        }));
        
        // Refresh page on chain change to ensure all data is updated
        window.location.reload();
          chainId: parseInt(chainId, 16)
        }));
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