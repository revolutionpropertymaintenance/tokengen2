import React, { useState } from 'react';
import { Network as NetworkIcon, Zap, Globe, Shield, Clock } from 'lucide-react';
import { Network } from '../types';
import { mainnets, testnets } from '../data/networks';
import { web3Service } from '../services/web3Service';
import { useNetworkMode } from '../hooks/useNetworkMode';

interface NetworkTabProps {
  selectedNetwork: Network;
  onNetworkSelect: (network: Network) => void;
  isTestnetMode: boolean;
  onModeChange: (isTestnet: boolean) => void;
}

export const NetworkTab: React.FC<NetworkTabProps> = ({
  selectedNetwork,
  onNetworkSelect,
  isTestnetMode: propIsTestnetMode,
  onModeChange
}) => {
  // Use the global network mode
  const { isTestnetMode } = useNetworkMode();
  
  // Initialize activeTab based on global network mode
  const [activeTab, setActiveTab] = useState<'mainnet' | 'testnet'>(isTestnetMode ? 'testnet' : 'mainnet');
  
  // Update activeTab when global network mode changes
  useEffect(() => {
    setActiveTab(isTestnetMode ? 'testnet' : 'mainnet');
    onModeChange(isTestnetMode);
    
    // Auto-select first network of the new tab
    const networks = isTestnetMode ? testnets : mainnets;
    if (networks.length > 0) {
      onNetworkSelect(networks[0]);
    }
  }, [isTestnetMode, onModeChange, onNetworkSelect]);

  const handleTabChange = (tab: 'mainnet' | 'testnet') => {
    setActiveTab(tab);
    onModeChange(tab === 'testnet');
    
    // Auto-select first network of the new tab
    const networks = tab === 'testnet' ? testnets : mainnets;
    if (networks.length > 0) {
      onNetworkSelect(networks[0]);
    }
  };
  
  // Handle network selection and switch network in wallet
  const handleNetworkSelect = async (network: Network) => {
    try {
      // Switch network in wallet
      await web3Service.switchNetwork(network);
      
      // Update selected network
      onNetworkSelect(network);
    } catch (error) {
      console.error('Error switching network:', error);
      // Still update UI even if wallet switch fails
      onNetworkSelect(network);
    }
  };

  const getNetworkIcon = (networkId: string) => {
    const icons: Record<string, string> = {
      'ethereum': '🔷',
      'bsc': '🟡',
      'polygon': '🟣',
      'arbitrum': '🔵',
      'fantom': '🌟',
      'avalanche': '🔺',
      'estar-testnet': '⚡',
      'goerli': '🔷',
      'bsc-testnet': '🟡',
      'mumbai': '🟣',
      'arbitrum-sepolia': '🔵'
    };
    return icons[networkId] || '🌐';
  };

  const getDeploymentCost = (network: Network) => {
    if (isTestnetMode) return 'Free';
    return network.gasPrice.includes('$') ? network.gasPrice.split('(')[1]?.replace(')', '') || '$25' : '$25';
  };

  const currentNetworks = activeTab === 'testnet' ? testnets : mainnets;

  return (
    <div className="space-y-6">
      {/* Tab Selector */}
      <div className="flex space-x-1 bg-white/5 backdrop-blur-sm rounded-xl p-1 border border-white/10">
        <button
          onClick={() => handleTabChange('mainnet')}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
            activeTab === 'mainnet'
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
              : 'text-gray-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Mainnet</span>
        </button>
        <button
          onClick={() => handleTabChange('testnet')}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
            activeTab === 'testnet'
              ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg'
              : 'text-gray-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Testnet</span>
        </button>
      </div>

      {/* Network Info Banner */}
      <div className={`rounded-xl p-6 border ${
        activeTab === 'testnet' 
          ? 'bg-green-500/20 border-green-500/50' 
          : 'bg-blue-500/20 border-blue-500/50'
      }`}>
        <div className="flex items-start space-x-3">
          {activeTab === 'testnet' ? (
            <Zap className="w-5 h-5 text-green-400 mt-0.5" />
          ) : (
            <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
          )}
          <div>
            <h3 className={`font-medium mb-1 ${
              activeTab === 'testnet' ? 'text-green-400' : 'text-blue-400'
            }`}>
              {activeTab === 'testnet' ? 'Testnet Deployment' : 'Mainnet Deployment'}
            </h3>
            <p className={`text-sm ${
              activeTab === 'testnet' ? 'text-green-300' : 'text-blue-300'
            }`}>
              {activeTab === 'testnet' 
                ? 'Deploy to test networks for free. Perfect for testing and development.'
                : 'Deploy to production networks. Requires ESR tokens and gas fees.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Network Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentNetworks.map((network) => (
          <div
            key={network.id}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
              selectedNetwork.id === network.id
                ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/25'
                : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
            }`}
            onClick={() => onNetworkSelect(network)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">{getNetworkIcon(network.id)}</div>
              {selectedNetwork.id === network.id && (
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </div>
            
            <h3 className="font-semibold text-white mb-2">{network.name}</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Symbol:</span>
                <span className="text-white font-medium">{network.symbol}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Chain ID:</span>
                <span className="text-white font-medium">{network.chainId}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Gas Cost:</span>
                <span className="text-white font-medium">{network.gasPrice.split(' ')[0]} {network.symbol}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Deploy Cost:</span>
                <span className={`font-medium ${
                  activeTab === 'testnet' ? 'text-green-400' : 'text-blue-400'
                }`}>
                  {getDeploymentCost(network)}
                </span>
              </div>
            </div>

            {/* Network Status */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">Active</span>
                <Clock className="w-3 h-3 text-gray-400 ml-auto" />
                <span className="text-xs text-gray-400">~2min</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Network Summary */}
      {selectedNetwork && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Selected Network</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-2xl">{getNetworkIcon(selectedNetwork.id)}</div>
                <div>
                  <h4 className="font-medium text-white">{selectedNetwork.name}</h4>
                  <p className="text-sm text-gray-300">Chain ID: {selectedNetwork.chainId}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">RPC URL:</span>
                  <span className="text-white font-mono text-xs">
                    {selectedNetwork.rpcUrl.slice(0, 30)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Explorer:</span>
                  <a 
                    href={selectedNetwork.explorerUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-xs"
                  >
                    View Explorer
                  </a>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-xs text-gray-300 mb-1">Estimated Gas</div>
                <div className="text-white font-medium">{selectedNetwork.gasPrice}</div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-xs text-gray-300 mb-1">Total Cost</div>
                <div className={`font-medium ${
                  activeTab === 'testnet' ? 'text-green-400' : 'text-blue-400'
                }`}>
                  {activeTab === 'testnet' ? 'Free (Testnet)' : '100 ESR + Gas'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};