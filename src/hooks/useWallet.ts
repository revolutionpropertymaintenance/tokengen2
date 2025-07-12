import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
  error?: string | null;
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
    error: null
  });

  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setWallet(prev => ({
        ...prev, 
        isConnected: false,
        address: null,
        balance: null,
        chainId: null,
        error: 'No wallet detected. Please install MetaMask or another Web3 wallet.'
      }));
      setIsConnecting(false);
      return null;
    }
    
    try {
      setIsConnecting(true);
      setWallet(prev => ({...prev, error: null}));
      
      // Request account access
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      // Get network info
      const network = await provider.getNetwork();
      
      // Get balance
      const balance = await provider.getBalance(address);
      const formattedBalance = parseFloat(ethers.formatEther(balance)).toFixed(4);

      // Get chain ID
      const chainId = Number(network.chainId);
      
      // Store wallet info in localStorage for persistence
      localStorage.setItem('walletAddress', address);
      
      setWallet({
        isConnected: true,
        address: address,
        balance: formattedBalance,
        chainId: chainId,
        error: null
      });

      console.log(`Wallet connected: ${address} on chain ${chainId}`);
      return address;
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to connect wallet';
      console.error('Error connecting wallet:', errorMessage);
      setWallet({
        isConnected: false,
        address: null,
        balance: null,
        chainId: null,
        error: errorMessage.includes('rejected') ? 'User rejected the connection request' : errorMessage
      });
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    // Clear auth token
    localStorage.removeItem('authToken');
    localStorage.removeItem('walletAddress');
    
    setWallet(prev => ({
      isConnected: false,
      address: null,
      balance: null,
      chainId: null,
      error: null
    }));
  };

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      // Check if we have a stored wallet address and try to reconnect
      const attemptReconnect = async () => {
        const storedAddress = localStorage.getItem('walletAddress');
        if (storedAddress && !wallet.isConnected && !isConnecting) {
          try {
            await connectWallet();
          } catch (err) {
            console.error('Auto-reconnect failed:', err);
            // Clear stored address if reconnect fails
            localStorage.removeItem('walletAddress');
          }
        }
      }
      
      attemptReconnect();
      
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
        console.log(`Chain changed to: ${numericChainId}`);
        setWallet(prev => ({
          ...prev,
          ...prev,
          chainId: numericChainId
        }));
        
        // Refresh page on chain change to ensure all data is updated
        window.location.reload();
      };
      
      const handleDisconnect = (error: { code: number; message: string }) => {
        console.log('Wallet disconnected:', error);
        disconnectWallet();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      };
    }
  }, [wallet.isConnected, isConnecting]);
  
  // Update balance periodically when connected
  useEffect(() => {
    if (!wallet.isConnected || !wallet.address) return;
    
    const updateBalance = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(wallet.address);
        const formattedBalance = parseFloat(ethers.formatEther(balance)).toFixed(4);
        
        setWallet({
          ...prev,
          balance: formattedBalance
        });
      } catch (error) {
        console.error('Error updating balance:', error);
      }
    };
    
    // Update immediately and then every 30 seconds
    updateBalance();
    const interval = setInterval(updateBalance, 30000);
    
    return () => clearInterval(interval);
  }, [wallet.isConnected, wallet.address]);

  return {
    ...wallet,
    connectWallet,
    disconnectWallet,
    isConnecting
  };
};