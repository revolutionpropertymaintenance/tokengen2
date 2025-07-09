import { useState, useEffect } from 'react';

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
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        const chainId = await window.ethereum.request({
          method: 'eth_chainId'
        });

        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest']
        });

        setWallet({
          isConnected: true,
          address: accounts[0],
          balance: (parseInt(balance, 16) / 1e18).toFixed(4),
          chainId: parseInt(chainId, 16)
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
          setWallet(prev => ({
            ...prev,
            address: accounts[0]
          }));
        }
      };

      const handleChainChanged = (chainId: string) => {
        setWallet(prev => ({
          ...prev,
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