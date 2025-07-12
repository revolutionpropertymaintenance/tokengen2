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

// Get token statistics from blockchain
router.get('/:address/stats', authenticate, async (req, res) => {
  try {
    const { address } = req.params;
    const userId = req.user.id;
    
    // Verify the contract belongs to the user
    const deploymentsDir = path.join(__dirname, '..', '..', 'deployments');
    let contractFound = false;
    
    if (fs.existsSync(deploymentsDir)) {
      const files = fs.readdirSync(deploymentsDir);
      
      for (const file of files) {
        if (file.includes(address.toLowerCase()) && file.endsWith('.json')) {
          try {
            const filePath = path.join(deploymentsDir, file);
            const deployment = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            if (deployment.deployer && deployment.deployer.toLowerCase() === userId.toLowerCase()) {
              contractFound = true;
              break;
            }
          } catch (error) {
            console.error(`Error reading deployment file ${file}:`, error);
          }
        }
      }
    }
    
    if (!contractFound) {
      return res.status(404).json({ error: 'Contract not found or access denied' });
    }
    
    // TODO: Implement actual blockchain queries for token statistics
    // This would involve:
    // 1. Connecting to the appropriate blockchain network
    // 2. Querying the token contract for holder count
    // 3. Querying blockchain for transfer events
    // 4. Calculating real statistics
    
    // For now, return structured response that can be easily replaced with real data
    const stats = {
      holders: 0, // await getTokenHolderCount(address, network)
      transfers: 0, // await getTokenTransferCount(address, network)
      totalSupply: '0', // await getTokenTotalSupply(address, network)
      lastUpdated: new Date().toISOString()
    };
    
    res.json(stats);
    
  } catch (error) {
    console.error('Error fetching token statistics:', error);
    res.status(500).json({ error: 'Failed to fetch token statistics' });
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
    
    // Verify the presale contract belongs to the user
    const deploymentsDir = path.join(__dirname, '..', '..', 'deployments');
    let presaleFound = false;
    let presaleConfig = null;
    
    if (fs.existsSync(deploymentsDir)) {
      const files = fs.readdirSync(deploymentsDir);
      
      for (const file of files) {
        if (file.includes(address.toLowerCase()) && file.includes('presale') && file.endsWith('.json')) {
          try {
            const filePath = path.join(deploymentsDir, file);
            const deployment = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            if (deployment.deployer && deployment.deployer.toLowerCase() === userId.toLowerCase()) {
              presaleFound = true;
              presaleConfig = deployment.presaleConfig;
              break;
            }
          } catch (error) {
            console.error(`Error reading presale deployment file ${file}:`, error);
          }
        }
      }
    }
    
    if (!presaleFound) {
      return res.status(404).json({ error: 'Presale contract not found or access denied' });
    }
    
    // Calculate status based on current time vs sale dates
    let status = 'upcoming';
    if (presaleConfig?.saleConfiguration) {
      const now = new Date();
      const startDate = new Date(presaleConfig.saleConfiguration.startDate);
      const endDate = new Date(presaleConfig.saleConfiguration.endDate);
      
      if (now >= startDate && now <= endDate) {
        status = 'live';
      } else if (now > endDate) {
        status = 'ended';
      }
    }
    
    // TODO: Implement actual presale contract queries
    // This would involve:
    // 1. Connecting to the blockchain network
    // 2. Querying the presale contract for current statistics
    // 3. Getting real-time data like totalRaised, participantCount, etc.
    
    const stats = {
      totalRaised: '0',
      participantCount: 0,
      totalTokensSold: '0',
      softCapReached: false,
      hardCapReached: false,
      status: status,
      lastUpdated: new Date().toISOString()
    };
    
    res.json(stats);
    
  } catch (error) {
    console.error('Error fetching presale stats:', error);
    res.status(500).json({ error: 'Failed to fetch presale statistics' });
  }
});

module.exports = router;