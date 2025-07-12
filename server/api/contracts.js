const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get user's deployed contracts
router.get('/deployed', authenticate, (req, res) => {
  try {
    const userId = req.user.id;
    const deploymentsDir = path.join(__dirname, '..', '..', 'deployments');
    
    if (!fs.existsSync(deploymentsDir)) {
      return res.json({ tokens: [], presales: [] });
    }
    
    const files = fs.readdirSync(deploymentsDir);
    const tokens = [];
    const presales = [];
    
    files.forEach(file => {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(deploymentsDir, file);
          const deployment = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          // Check if this deployment belongs to the user
          if (deployment.deployer && deployment.deployer.toLowerCase() === userId.toLowerCase()) {
            if (deployment.contractType === 'PresaleContract') {
              presales.push({
                id: deployment.contractAddress,
                contractAddress: deployment.contractAddress,
                transactionHash: deployment.transactionHash,
                network: deployment.network,
                timestamp: deployment.timestamp,
                verified: deployment.verified || false,
                presaleConfig: deployment.presaleConfig,
                tokenName: deployment.presaleConfig?.tokenInfo?.tokenName || 'Unknown',
                tokenSymbol: deployment.presaleConfig?.tokenInfo?.tokenSymbol || 'UNK',
                saleName: deployment.presaleConfig?.saleConfiguration?.saleName || 'Unknown Sale',
                saleType: deployment.presaleConfig?.saleType || 'presale',
                status: 'upcoming' // This would be calculated based on start/end dates
              });
            } else {
              tokens.push({
                id: deployment.contractAddress,
                contractAddress: deployment.contractAddress,
                transactionHash: deployment.transactionHash,
                contractType: deployment.contractType,
                network: deployment.network,
                timestamp: deployment.timestamp,
                verified: deployment.verified || false,
                name: deployment.constructorArgs?.[0] || 'Unknown Token',
                symbol: deployment.constructorArgs?.[1] || 'UNK',
                decimals: deployment.constructorArgs?.[2] || 18,
                totalSupply: deployment.constructorArgs?.[3] || '0',
                maxSupply: deployment.constructorArgs?.[4] || '0'
              });
            }
          }
        } catch (error) {
          console.error(`Error reading deployment file ${file}:`, error);
        }
      }
    });
    
    res.json({
      tokens: tokens.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
      presales: presales.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    });
    
  } catch (error) {
    console.error('Error fetching deployed contracts:', error);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

// Get specific contract details
router.get('/:address', authenticate, (req, res) => {
  try {
    const { address } = req.params;
    const userId = req.user.id;
    const deploymentsDir = path.join(__dirname, '..', '..', 'deployments');
    
    if (!fs.existsSync(deploymentsDir)) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    const files = fs.readdirSync(deploymentsDir);
    
    for (const file of files) {
      if (file.includes(address.toLowerCase()) && file.endsWith('.json')) {
        try {
          const filePath = path.join(deploymentsDir, file);
          const deployment = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          // Check if this deployment belongs to the user
          if (deployment.deployer && deployment.deployer.toLowerCase() === userId.toLowerCase()) {
            return res.json(deployment);
          }
        } catch (error) {
          console.error(`Error reading deployment file ${file}:`, error);
        }
      }
    }
    
    res.status(404).json({ error: 'Contract not found' });
    
  } catch (error) {
    console.error('Error fetching contract details:', error);
    res.status(500).json({ error: 'Failed to fetch contract details' });
  }
});

// Get all public presales (for explorer)
router.get('/presales/public', (req, res) => {
  try {
    const deploymentsDir = path.join(__dirname, '..', '..', 'deployments');
    
    if (!fs.existsSync(deploymentsDir)) {
      return res.json([]);
    }
    
    const files = fs.readdirSync(deploymentsDir);
    const presales = [];
    
    files.forEach(file => {
      if (file.includes('presale') && file.endsWith('.json')) {
        try {
          const filePath = path.join(deploymentsDir, file);
          const deployment = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          if (deployment.contractType === 'PresaleContract') {
            // Only include public presales (not private sales)
            if (deployment.presaleConfig?.saleType === 'presale') {
              presales.push({
                id: deployment.contractAddress,
                contractAddress: deployment.contractAddress,
                network: deployment.network,
                timestamp: deployment.timestamp,
                tokenName: deployment.presaleConfig?.tokenInfo?.tokenName || 'Unknown',
                tokenSymbol: deployment.presaleConfig?.tokenInfo?.tokenSymbol || 'UNK',
                saleName: deployment.presaleConfig?.saleConfiguration?.saleName || 'Unknown Sale',
                saleType: deployment.presaleConfig?.saleType || 'presale',
                softCap: deployment.presaleConfig?.saleConfiguration?.softCap || '0',
                hardCap: deployment.presaleConfig?.saleConfiguration?.hardCap || '0',
                tokenPrice: deployment.presaleConfig?.saleConfiguration?.tokenPrice || '0',
                startDate: deployment.presaleConfig?.saleConfiguration?.startDate,
                endDate: deployment.presaleConfig?.saleConfiguration?.endDate,
                status: 'upcoming' // This would be calculated based on current time vs start/end dates
              });
            }
          }
        } catch (error) {
          console.error(`Error reading presale deployment file ${file}:`, error);
        }
      }
    });
    
    res.json(presales.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    
  } catch (error) {
    console.error('Error fetching public presales:', error);
    res.status(500).json({ error: 'Failed to fetch presales' });
  }
});

// Get presale contract statistics
router.get('/presale/:address/stats', authenticate, async (req, res) => {
  try {
    const { address } = req.params;
    const userId = req.user.id;
    
    // In a real implementation, you would query the presale contract
    // For now, return basic stats structure
    res.json({
      totalRaised: '0',
      participantCount: 0,
      totalTokensSold: '0',
      softCapReached: false,
      hardCapReached: false
    });
    
  } catch (error) {
    console.error('Error fetching presale stats:', error);
    res.status(500).json({ error: 'Failed to fetch presale statistics' });
  }
});

module.exports = router;