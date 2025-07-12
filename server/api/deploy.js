const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');
const { validateTokenConfig, validatePresaleConfig } = require('../middleware/validation');

const router = express.Router();

// Network mapping for Hardhat
const NETWORK_MAPPING = {
  'ethereum': 'ethereum',
  'bsc': 'bsc',
  'polygon': 'polygon',
  'arbitrum': 'arbitrum',
  'fantom': 'fantom',
  'avalanche': 'avalanche',
  'goerli': 'goerli',
  'bsc-testnet': 'bscTestnet',
  'mumbai': 'mumbai',
  'arbitrum-sepolia': 'arbitrumSepolia',
  'estar-testnet': 'estarTestnet'
};

// Deploy token contract
router.post('/token', authenticate, validateTokenConfig, async (req, res) => {
  try {
    const { contractType, constructorArgs, network, verify = true } = req.body;
    const userId = req.user.id;
    
    console.log(`Deploying ${contractType} for user ${userId} on ${network}`);
    
    // Map network name to Hardhat network
    const hardhatNetwork = NETWORK_MAPPING[network];
    if (!hardhatNetwork) {
      return res.status(400).json({ error: `Unsupported network: ${network}` });
    }
    
    // Set environment variables for the deployment script
    const env = {
      ...process.env,
      CONTRACT_TYPE: contractType,
      CONSTRUCTOR_ARGS: JSON.stringify(constructorArgs),
      VERIFY: verify ? "true" : "false"
    };
    
    // Run Hardhat deployment script
    const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'deploy-token.js');
    const command = `npx hardhat run ${scriptPath} --network ${hardhatNetwork}`;
    
    console.log(`Executing: ${command}`);
    
    exec(command, { env, cwd: path.join(__dirname, '..', '..') }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Deployment error: ${error}`);
        console.error(`stderr: ${stderr}`);
        return res.status(500).json({ 
          error: 'Deployment failed', 
          details: error.message,
          stderr: stderr
        });
      }
      
      try {
        // Parse deployment result from stdout
        const lines = stdout.split('\n');
        const resultLine = lines.find(line => line.includes('Deployment result:'));
        
        if (!resultLine) {
          throw new Error('No deployment result found in output');
        }
        
        const result = JSON.parse(resultLine.replace('Deployment result:', '').trim());
        
        if (!result.success) {
          return res.status(500).json({ 
            error: 'Deployment failed', 
            details: result.error 
          });
        }
        
        // Return deployment details
        res.json({
          success: true,
          contractAddress: result.contractAddress,
          transactionHash: result.transactionHash,
          gasUsed: result.gasUsed,
          deploymentCost: result.deploymentCost,
          network: hardhatNetwork,
          verified: result.verified,
          timestamp: new Date().toISOString()
        });
        
      } catch (parseError) {
        console.error('Error parsing deployment result:', parseError);
        console.error('stdout:', stdout);
        res.status(500).json({ 
          error: 'Failed to parse deployment result',
          details: parseError.message
        });
      }
    });
    
  } catch (error) {
    console.error('Token deployment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Deploy presale contract
router.post('/presale', authenticate, validatePresaleConfig, async (req, res) => {
  try {
    const { presaleConfig, network, verify = true } = req.body;
    const userId = req.user.id;
    
    console.log(`Deploying presale for user ${userId} on ${network}`);
    
    // Map network name to Hardhat network
    const hardhatNetwork = NETWORK_MAPPING[network];
    if (!hardhatNetwork) {
      return res.status(400).json({ error: `Unsupported network: ${network}` });
    }
    
    // Set environment variables for the deployment script
    const env = {
      ...process.env,
      PRESALE_CONFIG: JSON.stringify(presaleConfig),
      VERIFY: verify ? "true" : "false"
    };
    
    // Run Hardhat deployment script
    const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'deploy-presale.js');
    const command = `npx hardhat run ${scriptPath} --network ${hardhatNetwork}`;
    
    console.log(`Executing: ${command}`);
    
    exec(command, { env, cwd: path.join(__dirname, '..', '..') }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Presale deployment error: ${error}`);
        console.error(`stderr: ${stderr}`);
        return res.status(500).json({ 
          error: 'Presale deployment failed', 
          details: error.message,
          stderr: stderr
        });
      }
      
      try {
        // Parse deployment result from stdout
        const lines = stdout.split('\n');
        const resultLine = lines.find(line => line.includes('Deployment result:'));
        
        if (!resultLine) {
          throw new Error('No deployment result found in output');
        }
        
        const result = JSON.parse(resultLine.replace('Deployment result:', '').trim());
        
        if (!result.success) {
          return res.status(500).json({ 
            error: 'Presale deployment failed', 
            details: result.error 
          });
        }
        
        // Return deployment details
        res.json({
          success: true,
          contractAddress: result.contractAddress,
          transactionHash: result.transactionHash,
          gasUsed: result.gasUsed,
          deploymentCost: result.deploymentCost,
          network: hardhatNetwork,
          verified: result.verified,
          salePageUrl: result.salePageUrl,
          timestamp: new Date().toISOString()
        });
        
      } catch (parseError) {
        console.error('Error parsing presale deployment result:', parseError);
        console.error('stdout:', stdout);
        res.status(500).json({ 
          error: 'Failed to parse presale deployment result',
          details: parseError.message
        });
      }
    });
    
  } catch (error) {
    console.error('Presale deployment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get deployment status
router.get('/status/:txHash', authenticate, (req, res) => {
  try {
    const { txHash } = req.params;
    
    // In a real implementation, you would check the transaction status on the blockchain
    // For now, we'll return a simple response
    res.json({
      transactionHash: txHash,
      status: 'confirmed',
      confirmations: 12
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;