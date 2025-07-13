import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { TokenBuilder } from './components/TokenBuilder';
import { VestingConfiguration } from './components/VestingConfiguration';
import { ReviewDeploy } from './components/ReviewDeploy';
import { DeploymentSuccess } from './components/DeploymentSuccess';
import { PresaleWizard } from './components/PresaleWizard';
import { MySales } from './components/MySales';
import { DeployedTokens } from './components/DeployedTokens';
import { SaleRouter } from './components/SaleRouter';
import { SaleExplorer } from './components/SaleExplorer';
import { TokenManagement } from './components/TokenManagement';
import { LiquidityLock } from './components/LiquidityLock';
import { Airdrop } from './components/Airdrop';
import { NotFound } from './components/NotFound';
import { TokenConfig, DeploymentResult, Step } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useNetworkMode } from './hooks/useNetworkMode';

declare global {
  interface Window {
    ethereum?: any;
  }
}

function App() {
  const { isTestnetMode } = useNetworkMode();
  const [currentStep, setCurrentStep] = useState<'landing' | 'builder' | 'vesting' | 'review' | 'success' | 'presale' | 'sales' | 'tokens' | 'sale' | 'explore' | 'manage' | 'liquidity-lock' | 'airdrop'>('landing');
  const [tokenConfig, setTokenConfig] = useState<TokenConfig | null>(null);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);

  const handleGetStarted = () => {
    setCurrentStep('builder');
  };

  const handleLaunchSale = () => {
    setCurrentStep('presale');
  };

  const handleViewSales = () => {
    setCurrentStep('sales');
  };

  const handleViewTokens = () => {
    setCurrentStep('tokens');
  };

  const handleExploreSales = () => {
    setCurrentStep('explore');
  };
  
  const handleLiquidityLock = () => {
    setCurrentStep('liquidity-lock');
  };
  
  const handleAirdrop = () => {
    setCurrentStep('airdrop');
  };

  const handleTokenConfigComplete = (config: TokenConfig) => {
    setTokenConfig(config);
    setCurrentStep('vesting');
  };

  const handleVestingComplete = (config: TokenConfig) => {
    setTokenConfig(config);
    setCurrentStep('review');
  };

  const handleDeploy = (result: DeploymentResult) => {
    setDeploymentResult(result);
    setCurrentStep('success');
  };

  const handleStartNew = () => {
    setCurrentStep('landing');
    setTokenConfig(null);
    setDeploymentResult(null);
  };

  const goBack = () => {
    switch (currentStep) {
      case 'builder':
        setCurrentStep('landing');
        break;
      case 'vesting':
        setCurrentStep('builder');
        break;
      case 'review':
        setCurrentStep('vesting');
        break;
      default:
        setCurrentStep('landing');
    }
  };

  switch (currentStep) {
    case 'landing':
      return (
        <LandingPage 
          onGetStarted={handleGetStarted}
          onLaunchSale={handleLaunchSale}
          onViewSales={handleViewSales}
          onViewTokens={handleViewTokens}
          onExploreSales={handleExploreSales} 
          onLiquidityLock={handleLiquidityLock}
          onAirdrop={handleAirdrop}
          onLiquidityLock={handleLiquidityLock}
          onAirdrop={handleAirdrop}
        />
      );
    
    case 'builder':
      return (
        <TokenBuilder
          onBack={goBack}
          onNext={handleTokenConfigComplete}
          initialConfig={tokenConfig || undefined}
        />
      );
    
    case 'vesting':
      return (
        <VestingConfiguration
          config={tokenConfig!}
          onBack={goBack}
          onNext={handleVestingComplete}
        />
      );
    
    case 'review':
      return (
        <ReviewDeploy
          config={tokenConfig!}
          onBack={goBack}
          onDeploy={handleDeploy}
        />
      );
    
    case 'success':
      return (
        <DeploymentSuccess
          result={deploymentResult!}
          onStartNew={handleStartNew}
        />
      );
    
    case 'presale':
      return (
        <PresaleWizard
          onBack={() => setCurrentStep('landing')}
        />
      );
    
    case 'sales':
      return <MySales />;
    
    case 'tokens':
      return <DeployedTokens />;
    
    case 'sale':
      return <SaleRouter />;
    
    case 'explore':
      return <SaleExplorer />;
    
    case 'manage':
      return <TokenManagement />;
    
    case 'liquidity-lock':
      return <LiquidityLock />;
      
    case 'airdrop':
      return <Airdrop />;
    
    case '404':
      return <NotFound />;
    
    default:
      // Check if this is a valid route
      const validRoutes = ['landing', 'builder', 'vesting', 'review', 'success', 'presale', 'sales', 'tokens', 'sale', 'explore', 'manage', 'liquidity-lock', 'airdrop'];
      if (!validRoutes.includes(currentStep)) {
        return <NotFound />;
      } else {
        return (
          <LandingPage 
            onGetStarted={handleGetStarted}
            onLaunchSale={handleLaunchSale}
            onViewSales={handleViewSales}
            onViewTokens={handleViewTokens}
            onExploreSales={handleExploreSales}
          />
        );
      }
  }
}

export default App;