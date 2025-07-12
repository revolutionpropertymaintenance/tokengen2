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
import { ModeBanner } from './components/ModeBanner';
import { TokenConfig, DeploymentResult, Step } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';

declare global {
  interface Window {
    ethereum?: any;
  }
}

function App() {
  const [currentStep, setCurrentStep] = useState<'landing' | 'builder' | 'vesting' | 'review' | 'success' | 'presale' | 'sales' | 'tokens' | 'sale' | 'explore' | 'manage'>('landing');
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
        <ErrorBoundary>
        <ModeBanner />
        <LandingPage 
          onGetStarted={handleGetStarted}
          onLaunchSale={handleLaunchSale}
          onViewSales={handleViewSales}
          onViewTokens={handleViewTokens}
          onExploreSales={handleExploreSales}
        />
        </ErrorBoundary>
      );
    
    case 'builder':
      return (
        <ErrorBoundary>
        <ModeBanner />
        <TokenBuilder
          onBack={goBack}
          onNext={handleTokenConfigComplete}
          initialConfig={tokenConfig || undefined}
        />
        </ErrorBoundary>
      );
    
    case 'vesting':
      return (
        <ErrorBoundary>
        <ModeBanner />
        <VestingConfiguration
          config={tokenConfig!}
          onBack={goBack}
          onNext={handleVestingComplete}
        />
        </ErrorBoundary>
      );
    
    case 'review':
      return (
        <ErrorBoundary>
        <ModeBanner />
        <ReviewDeploy
          config={tokenConfig!}
          onBack={goBack}
          onDeploy={handleDeploy}
        />
        </ErrorBoundary>
      );
    
    case 'success':
      return (
        <ErrorBoundary>
        <ModeBanner />
        <DeploymentSuccess
          result={deploymentResult!}
          onStartNew={handleStartNew}
        />
        </ErrorBoundary>
      );
    
    case 'presale':
      return (
        <ErrorBoundary>
        <ModeBanner />
        <PresaleWizard
          onBack={() => setCurrentStep('landing')}
        />
        </ErrorBoundary>
      );
    
    case 'sales':
      return <ErrorBoundary><ModeBanner /><MySales /></ErrorBoundary>;
    
    case 'tokens':
      return <ErrorBoundary><ModeBanner /><DeployedTokens /></ErrorBoundary>;
    
    case 'sale':
      return <ErrorBoundary><ModeBanner /><SaleRouter /></ErrorBoundary>;
    
    case 'explore':
      return <ErrorBoundary><ModeBanner /><SaleExplorer /></ErrorBoundary>;
    
    case 'manage':
      return <ErrorBoundary><ModeBanner /><TokenManagement /></ErrorBoundary>;
    
    default:
      return (
        <ErrorBoundary>
        <ModeBanner />
        <LandingPage 
          onGetStarted={handleGetStarted}
          onLaunchSale={handleLaunchSale}
          onViewSales={handleViewSales}
          onViewTokens={handleViewTokens}
          onExploreSales={handleExploreSales}
        />
        </ErrorBoundary>
      );
  }
}

export default App;