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
    const networkParam = req.query.network;
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
    
    // Get network information from deployment file or use default
    let networkInfo;
    try {
      const deploymentFiles = fs.readdirSync(deploymentsDir);
      for (const file of deploymentFiles) {
        if (file.includes(address.toLowerCase()) && file.endsWith('.json')) {
          const filePath = path.join(deploymentsDir, file);
          const deployment = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          networkInfo = deployment.network;
          break;
        }
      }
    } catch (error) {
      console.error('Error reading deployment files:', error);
    }
    
    const networkName = networkInfo || networkParam || 'ethereum';
    
    // Connect to the appropriate blockchain network
    const rpcUrl = process.env[`${networkName.toUpperCase()}_RPC_URL`];
    if (!rpcUrl) {
      return res.status(400).json({ error: `RPC URL not configured for network: ${networkName}` });
    }
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Basic ERC20 ABI for statistics
    const tokenABI = [
      'function totalSupply() view returns (uint256)',
      'function balanceOf(address) view returns (uint256)',
      'function decimals() view returns (uint8)'
    ];
    
    const tokenContract = new ethers.Contract(address, tokenABI, provider);
    
    // Get token data
    try {
      const [totalSupply, decimals] = await Promise.all([
        tokenContract.totalSupply(),
        tokenContract.decimals()
      ]);
      
      // Get transfer events to estimate holder count
      // This is a simplified approach - a full implementation would use indexing
      const transferFilter = {
        address: address,
        topics: [ethers.id('Transfer(address,address,uint256)')]
      };
      
      const events = await provider.getLogs({
        ...transferFilter,
        fromBlock: -10000, // Last 10000 blocks, adjust based on network
        toBlock: 'latest'
      });
      
      // Estimate unique addresses from transfer events
      const uniqueAddresses = new Set();
      events.forEach(event => {
        if (event.topics.length >= 3) {
          // Extract addresses from topics (sender and receiver)
          const from = '0x' + event.topics[1].slice(26);
          const to = '0x' + event.topics[2].slice(26);
          if (from !== ethers.ZeroAddress) uniqueAddresses.add(from.toLowerCase());
          if (to !== ethers.ZeroAddress) uniqueAddresses.add(to.toLowerCase());
        }
      });
      
      // Return token statistics
      const stats = {
        holders: uniqueAddresses.size,
        transfers: events.length,
        totalSupply: ethers.formatUnits(totalSupply, decimals),
        lastUpdated: new Date().toISOString()
      };
      
      res.json(stats);
    } catch (contractError) {
      console.error('Error querying token contract:', contractError);
      
      // Return structured response with default values if contract query fails
      const stats = {
        holders: 0,
        transfers: 0,
        totalSupply: '0',
        lastUpdated: new Date().toISOString(),
        error: 'Failed to query contract data'
      };
      
      res.json(stats);
    }
    
    
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
    const networkParam = req.query.network;
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
    
    // Get network information from deployment file or use default
    let networkInfo;
    try {
      const deploymentFiles = fs.readdirSync(deploymentsDir);
      for (const file of deploymentFiles) {
        if (file.includes(address.toLowerCase()) && file.endsWith('.json')) {
          const filePath = path.join(deploymentsDir, file);
          const deployment = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          networkInfo = deployment.network;
          break;
        }
      }
    } catch (error) {
      console.error('Error reading deployment files:', error);
    }
    
    const networkName = networkInfo || networkParam || 'ethereum';
    
    // Connect to the appropriate blockchain network
    const rpcUrl = process.env[`${networkName.toUpperCase()}_RPC_URL`];
    if (!rpcUrl) {
      return res.status(400).json({ error: `RPC URL not configured for network: ${networkName}` });
    }
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Presale contract ABI for statistics
    const presaleABI = [
      'function getSaleStats() view returns (uint256 _totalRaised, uint256 _totalParticipants, uint256 _totalTokensSold, bool _softCapReached, bool _hardCapReached, uint256 _timeRemaining)',
      'function saleInfo() view returns (address token, uint256 tokenPrice, uint256 softCap, uint256 hardCap, uint256 minPurchase, uint256 maxPurchase, uint256 startTime, uint256 endTime, bool whitelistEnabled)',
      'function saleFinalized() view returns (bool)'
    ];
    
    const presaleContract = new ethers.Contract(address, presaleABI, provider);
    
    try {
      // Get presale data
      const [saleStats, saleInfo, isFinalized] = await Promise.all([
        presaleContract.getSaleStats(),
        presaleContract.saleInfo(),
        presaleContract.saleFinalized()
      ]);
      
      // Calculate status based on contract data
      const now = Math.floor(Date.now() / 1000);
      let status = 'upcoming';
      
      if (isFinalized) {
        status = 'ended';
      } else if (now >= Number(saleInfo.startTime) && now <= Number(saleInfo.endTime)) {
        status = 'live';
      } else if (now > Number(saleInfo.endTime)) {
        status = 'ended';
      }
      
      // Return presale statistics
      const stats = {
        totalRaised: ethers.formatEther(saleStats[0]),
        participantCount: Number(saleStats[1]),
        totalTokensSold: ethers.formatEther(saleStats[2]),
        softCapReached: saleStats[3],
        hardCapReached: saleStats[4],
        status: status,
        lastUpdated: new Date().toISOString()
      };
      
      res.json(stats);
    } catch (contractError) {
      console.error('Error querying presale contract:', contractError);
      
      // Calculate status based on dates from stored config as fallback
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
      
      // Return fallback statistics
      const stats = {
        totalRaised: '0',
        participantCount: 0,
        totalTokensSold: '0',
        softCapReached: false,
        hardCapReached: false,
        status: status,
        lastUpdated: new Date().toISOString(),
        error: 'Failed to query contract data'
      };
      
      res.json(stats);
    }
    
    
  } catch (error) {
    console.error('Error fetching presale stats:', error);
    res.status(500).json({ error: 'Failed to fetch presale statistics' });
  }
});

module.exports = router;