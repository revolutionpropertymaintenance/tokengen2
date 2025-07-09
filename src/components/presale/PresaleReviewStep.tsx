import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Clock, DollarSign, Users, Shield } from 'lucide-react';
import { PresaleConfig, PresaleDeploymentResult } from '../../types/presale';
import { ESRBalanceCheck } from '../ESRBalanceCheck';

interface PresaleReviewStepProps {
  config: PresaleConfig;
  onBack: () => void;
  onDeploy: (result: PresaleDeploymentResult) => void;
}

export const PresaleReviewStep: React.FC<PresaleReviewStepProps> = ({ config, onBack, onDeploy }) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [hasEnoughESR, setHasEnoughESR] = useState(false);

  const handleDeploy = async () => {
    if (!agreed || !hasEnoughESR) return;
    
    setIsDeploying(true);
    
    // Simulate deployment process
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Mock deployment result
    const result: PresaleDeploymentResult = {
      contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      network: config.network,
      explorerUrl: `${config.network.explorerUrl}/address/0xabcdef1234567890abcdef1234567890abcdef12`,
      gasUsed: '2,345,678',
      deploymentCost: '0.045',
      salePageUrl: `https://tokenforge.app/sale/${config.id || 'new-sale'}`
    };
    
    onDeploy(result);
  };

  const estimatedGas = {
    amount: '0.045',
    usd: '$95'
  };

  const getSaleTypeDisplay = () => {
    return config.saleType === 'presale' ? 'Public Presale' : 'Private Sale';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getSaleDuration = () => {
    const start = new Date(config.saleConfiguration.startDate);
    const end = new Date(config.saleConfiguration.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Review & Deploy</h2>
        <p className="text-gray-300">Review your sale configuration before deployment</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sale Overview */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Sale Overview</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Sale Name</label>
                <div className="text-white font-medium">{config.saleConfiguration.saleName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Sale Type</label>
                <div className="text-white font-medium">{getSaleTypeDisplay()}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Token</label>
                <div className="text-white font-medium">{config.tokenInfo.tokenName} ({config.tokenInfo.tokenSymbol})</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Network</label>
                <div className="text-white font-medium">{config.network.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Allocated Tokens</label>
                <div className="text-white font-medium">
                  {parseInt(config.tokenInfo.allocatedAmount).toLocaleString()} {config.tokenInfo.tokenSymbol}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Duration</label>
                <div className="text-white font-medium">{getSaleDuration()}</div>
              </div>
            </div>
          </div>

          {/* Sale Configuration */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Sale Configuration</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Soft Cap</label>
                <div className="text-white font-medium">{config.saleConfiguration.softCap} {config.network.symbol}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Hard Cap</label>
                <div className="text-white font-medium">{config.saleConfiguration.hardCap} {config.network.symbol}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Token Price</label>
                <div className="text-white font-medium">
                  {config.saleConfiguration.tokenPrice} {config.tokenInfo.tokenSymbol} per {config.network.symbol}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Purchase Limits</label>
                <div className="text-white font-medium">
                  {config.saleConfiguration.minPurchase} - {config.saleConfiguration.maxPurchase} {config.network.symbol}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                <div className="text-white font-medium">{formatDate(config.saleConfiguration.startDate)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                <div className="text-white font-medium">{formatDate(config.saleConfiguration.endDate)}</div>
              </div>
            </div>

            {config.saleType === 'private' && (
              <div className="mt-4 p-3 bg-purple-500/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 font-medium">
                    Whitelist: {config.saleConfiguration.whitelistEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Vesting Configuration */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Vesting Configuration</h3>
            
            {config.vestingConfig.enabled ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-white">Linear vesting enabled</span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Initial Release</label>
                    <div className="text-white font-medium">{config.vestingConfig.initialRelease}% at TGE</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Vesting Duration</label>
                    <div className="text-white font-medium">{config.vestingConfig.duration} days</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                <span className="text-gray-400">No vesting - tokens released immediately</span>
              </div>
            )}
          </div>

          {/* Wallet Configuration */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Wallet Configuration</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Sale Receiver</label>
                <code className="text-white font-mono text-sm bg-white/10 px-2 py-1 rounded">
                  {config.walletSetup.saleReceiver}
                </code>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Refund Wallet</label>
                <code className="text-white font-mono text-sm bg-white/10 px-2 py-1 rounded">
                  {config.walletSetup.refundWallet}
                </code>
              </div>
            </div>
          </div>

          {/* ESR Balance Check */}
          <ESRBalanceCheck 
            requiredAmount={100}
            isTestnet={config.network.chainId > 1000000}
            onBalanceChange={setHasEnoughESR}
          />

          {/* Terms */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Terms & Conditions</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="agree" className="text-white text-sm">
                  I understand that deployed sale contracts cannot be modified and I am responsible for the configuration
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Deployment Summary */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Deployment Summary</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Network</span>
                <span className="text-white font-medium">{config.network.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Estimated Gas</span>
                <span className="text-white font-medium">{estimatedGas.amount} {config.network.symbol}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">USD Cost</span>
                <span className="text-white font-medium">{estimatedGas.usd}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">ESR Fee</span>
                <span className="text-white font-medium">100 ESR</span>
              </div>
              <div className="border-t border-white/20 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Total Cost</span>
                  <span className="text-white font-bold">$120</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">What's Included</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-white text-sm">Audited sale contract</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm">Automatic timing controls</span>
              </div>
              <div className="flex items-center space-x-3">
                <DollarSign className="w-4 h-4 text-purple-400" />
                <span className="text-white text-sm">Refund mechanism</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4 text-orange-400" />
                <span className="text-white text-sm">Participant management</span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-400 mb-1">Final Warning</h3>
                <p className="text-amber-300 text-sm">
                  Once deployed, your sale contract cannot be modified. Please review all settings carefully.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
        >
          Back
        </button>
        
        <button
          onClick={handleDeploy}
          disabled={!agreed || !hasEnoughESR || isDeploying}
          className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeploying ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Deploying Sale...</span>
            </>
          ) : (
            <>
              <span>Deploy Sale</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};