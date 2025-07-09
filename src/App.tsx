import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { TokenBuilder } from './components/TokenBuilder';
import { VestingConfiguration } from './components/VestingConfiguration';
import { ReviewDeploy } from './components/ReviewDeploy';
import { DeploymentSuccess } from './components/DeploymentSuccess';
import { TokenConfig, DeploymentResult, Step } from './types';

declare global {
  interface Window {
    ethereum?: any;
  }
}

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('landing');
  const [tokenConfig, setTokenConfig] = useState<TokenConfig | null>(null);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);

  const handleGetStarted = () => {
    setCurrentStep('builder');
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
      return <LandingPage onGetStarted={handleGetStarted} />;
    
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
    
    default:
      return <LandingPage onGetStarted={handleGetStarted} />;
  }
}

export default App;