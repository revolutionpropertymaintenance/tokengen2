import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Info, AlertCircle } from 'lucide-react';
import { TokenConfig, Network } from '../types';
import { networks } from '../data/networks';
import { contractService } from '../services/contractService';

interface TokenBuilderProps {
  onBack: () => void;
  onNext: (config: TokenConfig) => void;
  initialConfig?: Partial<TokenConfig>;
}

export const TokenBuilder: React.FC<TokenBuilderProps> = ({ onBack, onNext, initialConfig }) => {
  const [config, setConfig] = useState<TokenConfig>({
    name: '',
    symbol: '',
    decimals: 18,
    initialSupply: '',
    maxSupply: '',
    network: networks[0],
    useFactory: true,
    features: {
      burnable: false,
      mintable: false,
      transferFees: {
        enabled: false,
        percentage: 0,
        recipient: ''
      },
      holderRedistribution: {
        enabled: false,
        percentage: 0
      }
    },
    vesting: [],
    ...initialConfig
  });
  const [gasEstimate, setGasEstimate] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!config.name.trim()) {
      newErrors.name = 'Token name is required';
    }

    if (!config.symbol.trim()) {
      newErrors.symbol = 'Token symbol is required';
    } else if (config.symbol.length > 10) {
      newErrors.symbol = 'Symbol must be 10 characters or less';
    }

    if (!config.initialSupply || parseFloat(config.initialSupply) <= 0) {
      newErrors.initialSupply = 'Initial supply must be greater than 0';
    }

    if (config.features.transferFees.enabled && !config.features.transferFees.recipient.trim()) {
      newErrors.feeRecipient = 'Fee recipient address is required';
    }

    if (config.features.transferFees.enabled && (config.features.transferFees.percentage < 0 || config.features.transferFees.percentage > 10)) {
      newErrors.feePercentage = 'Fee percentage must be between 0 and 10';
    }

    if (config.features.holderRedistribution.enabled && (config.features.holderRedistribution.percentage < 0 || config.features.holderRedistribution.percentage > 5)) {
      newErrors.redistributionPercentage = 'Redistribution percentage must be between 0 and 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext(config);
    }
  };

  const updateConfig = (updates: Partial<TokenConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  // Update gas estimate when features change
  useEffect(() => {
    const updateGasEstimate = async () => {
      if (!config.name || !config.symbol || !config.initialSupply) {
        return; // Don't estimate until we have basic info
      }
      
      try {
        const estimate = await contractService.estimateDeploymentCost(config);
        setGasEstimate(`~${estimate.gasCost} ${config.network.symbol} (${estimate.gasCostUsd})`);
      } catch (error) {
        console.error('Error estimating gas:', error);
        setGasEstimate(null);
      }
    };
    
    updateGasEstimate();
  }, [config.features, config.network, config.initialSupply, config.name, config.symbol]);

  const updateFeatures = (updates: Partial<TokenConfig['features']>) => {
    setConfig(prev => ({
      ...prev,
      features: { ...prev.features, ...updates }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          
          <h1 className="text-3xl font-bold text-white mb-2">Token Builder</h1>
          <p className="text-gray-300">Configure your token parameters and features</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Token Info */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token Name
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => updateConfig({ name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., My Awesome Token"
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token Symbol
                </label>
                <input
                  type="text"
                  value={config.symbol}
                  onChange={(e) => updateConfig({ symbol: e.target.value.toUpperCase() })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., MAT"
                />
                {errors.symbol && <p className="text-red-400 text-sm mt-1">{errors.symbol}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Decimals
                </label>
                <select
                  value={config.decimals}
                  onChange={(e) => updateConfig({ decimals: parseInt(e.target.value) })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={18}>18 (Standard)</option>
                  <option value={8}>8</option>
                  <option value={6}>6</option>
                  <option value={0}>0</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Initial Supply
                </label>
                <input
                  type="number"
                  value={config.initialSupply}
                  onChange={(e) => updateConfig({ initialSupply: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1000000"
                />
                {errors.initialSupply && <p className="text-red-400 text-sm mt-1">{errors.initialSupply}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Supply (optional)
                </label>
                <input
                  type="number"
                  value={config.maxSupply}
                  onChange={(e) => updateConfig({ maxSupply: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Leave empty for unlimited supply"
                />
              </div>
            </div>
          </div>

          {/* Network Selection */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6">Network Selection</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {networks.map((network) => (
                <div
                  key={network.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    config.network.id === network.id
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                  onClick={() => updateConfig({ network })}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white">{network.name}</h3>
                    <span className="text-sm text-gray-300">{network.symbol}</span>
                  </div>
                  <p className="text-sm text-gray-400">Gas: {network.gasPrice}</p>
                </div>
              ))}
              {gasEstimate && (
                <div className="md:col-span-2 lg:col-span-3 mt-4 p-3 bg-blue-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-medium">Estimated Deployment Cost: {gasEstimate}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Token Features */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6">Token Features</h2>
            
            <div className="space-y-6">
              {/* Burnable */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="burnable"
                      checked={config.features.burnable}
                      onChange={(e) => updateFeatures({ burnable: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="burnable" className="text-white font-medium">
                      Burnable
                    </label>
                  </div>
                  <Info className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-sm text-gray-400">
                  Allow token holders to burn their tokens
                </span>
              </div>

              {/* Mintable */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="mintable"
                      checked={config.features.mintable}
                      onChange={(e) => updateFeatures({ mintable: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="mintable" className="text-white font-medium">
                      Mintable
                    </label>
                  </div>
                  <Info className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-sm text-gray-400">
                  Allow creating new tokens after deployment
                </span>
              </div>

              {/* Transfer Fees */}
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="transferFees"
                        checked={config.features.transferFees.enabled}
                        onChange={(e) => updateFeatures({
                          transferFees: { ...config.features.transferFees, enabled: e.target.checked }
                        })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="transferFees" className="text-white font-medium">
                        Transfer Fees
                      </label>
                    </div>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="text-sm text-gray-400">
                    Charge fees on token transfers
                  </span>
                </div>
                
                {config.features.transferFees.enabled && (
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Fee Percentage (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={config.features.transferFees.percentage}
                        onChange={(e) => updateFeatures({
                          transferFees: { ...config.features.transferFees, percentage: parseFloat(e.target.value) }
                        })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.feePercentage && <p className="text-red-400 text-sm mt-1">{errors.feePercentage}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Fee Recipient Address
                      </label>
                      <input
                        type="text"
                        value={config.features.transferFees.recipient}
                        onChange={(e) => updateFeatures({
                          transferFees: { ...config.features.transferFees, recipient: e.target.value }
                        })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0x..."
                      />
                      {errors.feeRecipient && <p className="text-red-400 text-sm mt-1">{errors.feeRecipient}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Holder Redistribution */}
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="holderRedistribution"
                        checked={config.features.holderRedistribution.enabled}
                        onChange={(e) => updateFeatures({
                          holderRedistribution: { ...config.features.holderRedistribution, enabled: e.target.checked }
                        })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="holderRedistribution" className="text-white font-medium">
                        Holder Redistribution
                      </label>
                    </div>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="text-sm text-gray-400">
                    Redistribute fees to token holders
                  </span>
                </div>
                
                {config.features.holderRedistribution.enabled && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Redistribution Percentage (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={config.features.holderRedistribution.percentage}
                      onChange={(e) => updateFeatures({
                        holderRedistribution: { ...config.features.holderRedistribution, percentage: parseFloat(e.target.value) }
                      })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.redistributionPercentage && <p className="text-red-400 text-sm mt-1">{errors.redistributionPercentage}</p>}
                  </div>
                )}
              </div>
            </div>
            
            {/* Factory Option */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useFactory"
                    checked={config.useFactory}
                    onChange={(e) => updateConfig({ useFactory: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="useFactory" className="text-white font-medium">
                    Use Token Factory
                  </label>
                </div>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-sm text-gray-400">
                Reduce gas costs by ~30% (recommended)
              </span>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-400 mb-1">Important Notice</h3>
                <p className="text-amber-300 text-sm">
                  Once deployed, token parameters cannot be changed. Please review all settings carefully 
                  before proceeding to the next step.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
            >
              Back
            </button>
            
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <span>Continue to Vesting</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};