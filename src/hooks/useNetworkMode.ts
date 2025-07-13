import { useState, useEffect, useCallback } from 'react';
import { MODE_STORAGE_KEY, DEFAULT_MODE } from '../config/constants';
import { useWallet } from './useWallet';
import { isMainnetChain, isTestnetChain } from '../config/chainConfig';

type NetworkMode = 'mainnet' | 'testnet';

export const useNetworkMode = () => {
  const { chainId, switchToCompatibleNetwork } = useWallet();
  
  // Initialize from localStorage or default
  const [mode, setMode] = useState<NetworkMode>(() => {
    const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
    return (savedMode === 'mainnet' || savedMode === 'testnet') 
      ? savedMode 
      : DEFAULT_MODE;
  });

  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');

  // Check if current chain matches mode
  useEffect(() => {
    if (chainId) {
      const isMainnet = isMainnetChain(chainId);
      const isTestnet = isTestnetChain(chainId);
      
      // If mode doesn't match chain type, show banner
      if ((mode === 'mainnet' && isTestnet) || (mode === 'testnet' && isMainnet)) {
        setBannerMessage(`Your wallet is connected to a ${isTestnet ? 'testnet' : 'mainnet'} but you're in ${mode} mode`);
        setShowBanner(true);
      }
    }
  }, [chainId, mode]);

  // Toggle between mainnet and testnet with network switching
  const toggleMode = useCallback(async () => {
    const newMode: NetworkMode = mode === 'mainnet' ? 'testnet' : 'mainnet';
    setMode(newMode);
    
    // Show banner notification
    setBannerMessage(`${newMode === 'mainnet' ? 'Mainnet' : 'Testnet'} Mode Activated`);
    setShowBanner(true);
    
    // Try to switch network if wallet is connected
    if (chainId && switchToCompatibleNetwork) {
      try {
        await switchToCompatibleNetwork();
      } catch (error) {
        console.error('Failed to switch network:', error);
      }
    }
    
    // Hide banner after 3 seconds
    setTimeout(() => {
      setShowBanner(false);
    }, 3000);
  }, [mode, chainId, switchToCompatibleNetwork]);

  // Save to localStorage whenever mode changes
  useEffect(() => {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  }, [mode]);

  // Check if we're in testnet mode
  const isTestnetMode = mode === 'testnet';

  return {
    mode,
    isTestnetMode,
    toggleMode,
    showBanner,
    bannerMessage,
    setShowBanner
  };
};