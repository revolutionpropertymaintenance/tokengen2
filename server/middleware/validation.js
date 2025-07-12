const { ethers } = require('ethers');

function validateTokenConfig(req, res, next) {
  try {
    const { contractType, constructorArgs, network } = req.body;
    
    // Validate contract type
    const validContractTypes = [
      'BasicToken',
      'BurnableToken', 
      'MintableToken',
      'BurnableMintableToken',
      'FeeToken',
      'RedistributionToken',
      'AdvancedToken'
    ];
    
    if (!validContractTypes.includes(contractType)) {
      return res.status(400).json({ error: 'Invalid contract type' });
    }
    
    // Validate constructor arguments
    if (!Array.isArray(constructorArgs) || constructorArgs.length === 0) {
      return res.status(400).json({ error: 'Constructor arguments are required' });
    }
    
    // Basic validation for token parameters
    const [name, symbol, decimals, initialSupply, maxSupply] = constructorArgs;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Valid token name is required' });
    }
    
    if (!symbol || typeof symbol !== 'string' || symbol.trim().length === 0) {
      return res.status(400).json({ error: 'Valid token symbol is required' });
    }
    
    if (typeof decimals !== 'number' || decimals < 0 || decimals > 18) {
      return res.status(400).json({ error: 'Decimals must be between 0 and 18' });
    }
    
    // Validate network
    const validNetworks = [
      'ethereum', 'bsc', 'polygon', 'arbitrum', 'fantom', 'avalanche',
      'goerli', 'bsc-testnet', 'mumbai', 'arbitrum-sepolia', 'estar-testnet'
    ];
    
    if (!validNetworks.includes(network)) {
      return res.status(400).json({ error: 'Invalid network' });
    }
    
    next();
    
  } catch (error) {
    console.error('Token config validation error:', error);
    res.status(400).json({ error: 'Invalid token configuration' });
  }
}

function validatePresaleConfig(req, res, next) {
  try {
    const { presaleConfig, network } = req.body;
    
    if (!presaleConfig || typeof presaleConfig !== 'object') {
      return res.status(400).json({ error: 'Presale configuration is required' });
    }
    
    // Validate token info
    const { tokenInfo } = presaleConfig;
    if (!tokenInfo || !ethers.isAddress(tokenInfo.tokenAddress)) {
      return res.status(400).json({ error: 'Valid token address is required' });
    }
    
    // Validate sale configuration
    const { saleConfiguration } = presaleConfig;
    if (!saleConfiguration) {
      return res.status(400).json({ error: 'Sale configuration is required' });
    }
    
    const { softCap, hardCap, tokenPrice, minPurchase, maxPurchase, startDate, endDate } = saleConfiguration;
    
    if (!softCap || parseFloat(softCap) <= 0) {
      return res.status(400).json({ error: 'Valid soft cap is required' });
    }
    
    if (!hardCap || parseFloat(hardCap) <= 0) {
      return res.status(400).json({ error: 'Valid hard cap is required' });
    }
    
    if (parseFloat(softCap) >= parseFloat(hardCap)) {
      return res.status(400).json({ error: 'Hard cap must be greater than soft cap' });
    }
    
    if (!tokenPrice || parseFloat(tokenPrice) <= 0) {
      return res.status(400).json({ error: 'Valid token price is required' });
    }
    
    if (!minPurchase || parseFloat(minPurchase) <= 0) {
      return res.status(400).json({ error: 'Valid minimum purchase is required' });
    }
    
    if (!maxPurchase || parseFloat(maxPurchase) <= 0) {
      return res.status(400).json({ error: 'Valid maximum purchase is required' });
    }
    
    if (parseFloat(minPurchase) >= parseFloat(maxPurchase)) {
      return res.status(400).json({ error: 'Maximum purchase must be greater than minimum purchase' });
    }
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Valid start and end dates are required' });
    }
    
    if (start <= now) {
      return res.status(400).json({ error: 'Start date must be in the future' });
    }
    
    if (end <= start) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }
    
    // Validate wallet setup
    const { walletSetup } = presaleConfig;
    if (!walletSetup || !ethers.isAddress(walletSetup.saleReceiver) || !ethers.isAddress(walletSetup.refundWallet)) {
      return res.status(400).json({ error: 'Valid wallet addresses are required' });
    }
    
    // Validate network
    const validNetworks = [
      'ethereum', 'bsc', 'polygon', 'arbitrum', 'fantom', 'avalanche',
      'goerli', 'bsc-testnet', 'mumbai', 'arbitrum-sepolia', 'estar-testnet'
    ];
    
    if (!validNetworks.includes(network)) {
      return res.status(400).json({ error: 'Invalid network' });
    }
    
    next();
    
  } catch (error) {
    console.error('Presale config validation error:', error);
    res.status(400).json({ error: 'Invalid presale configuration' });
  }
}

module.exports = {
  validateTokenConfig,
  validatePresaleConfig
};