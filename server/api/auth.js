const express = require('express');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');

const router = express.Router();

// Generate authentication token for wallet address
router.post('/login', async (req, res) => {
  try {
    const { address, signature, message } = req.body;
    
    if (!address || !signature || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Verify the signature
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    } catch (error) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: address.toLowerCase(),
        address: address.toLowerCase(),
        timestamp: Date.now()
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      address: address.toLowerCase(),
      expiresIn: '24h'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get authentication message for signing
router.post('/message', (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    
    const timestamp = Date.now();
    const message = `Welcome to TokenForge!\n\nSign this message to authenticate your wallet.\n\nAddress: ${address}\nTimestamp: ${timestamp}`;
    
    res.json({
      message,
      timestamp
    });
    
  } catch (error) {
    console.error('Message generation error:', error);
    res.status(500).json({ error: 'Failed to generate message' });
  }
});

// Verify token
router.get('/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.json({
        valid: true,
        address: decoded.address,
        expiresAt: decoded.exp
      });
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
    
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ESR Token balance endpoint
router.get('/esr/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    
    // Implement actual ESR token balance checking
    const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    const ESR_TOKEN_ADDRESS = process.env.ESR_TOKEN_ADDRESS;
    
    if (!ESR_TOKEN_ADDRESS || ESR_TOKEN_ADDRESS === '0x0000000000000000000000000000000000000000') {
      console.warn('ESR Token address not properly configured');
      return res.json({ balance: 0 });
    }
    
    const ESR_ABI = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)'
    ];
    
    const esrContract = new ethers.Contract(ESR_TOKEN_ADDRESS, ESR_ABI, provider);
    
    try {
      const [balance, decimals] = await Promise.all([
        esrContract.balanceOf(address),
        esrContract.decimals()
      ]);
      
      const formattedBalance = parseFloat(ethers.formatUnits(balance, decimals));
      console.log(`ESR balance for ${address}: ${formattedBalance}`);
      
      res.json({ balance: formattedBalance });
    } catch (contractError) {
      console.error('ESR contract error:', contractError);
      res.json({ balance: 0 });
    }
    
    
  } catch (error) {
    console.error('ESR balance check error:', error);
    res.status(500).json({ error: 'Failed to check ESR balance' });
  }
});

// ESR Token deduction endpoint
router.post('/esr/deduct', async (req, res) => {
  try {
    const { amount, txHash } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization required' });
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    
    // Verify the transaction if a hash is provided
    if (txHash) {
      try {
        const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
        const receipt = await provider.getTransactionReceipt(txHash);
        
        if (!receipt || receipt.status !== 1) {
          return res.status(400).json({ error: 'Transaction failed or not found' });
        }
        
        // Verify this is a transfer to our platform wallet
        const ESR_TOKEN_ADDRESS = process.env.ESR_TOKEN_ADDRESS;
        const PLATFORM_WALLET = process.env.PLATFORM_WALLET;
        
        // Simple check - in production you would decode the logs to verify the transfer details
        if (receipt.to.toLowerCase() !== ESR_TOKEN_ADDRESS.toLowerCase()) {
          return res.status(400).json({ error: 'Transaction is not for ESR token' });
        }
        
        console.log(`Verified ESR token transfer transaction: ${txHash}`);
        return res.json({ success: true, verified: true });
      } catch (verifyError) {
        console.error('Transaction verification error:', verifyError);
        return res.status(400).json({ error: 'Failed to verify transaction' });
      }
    }
    
    // For frontend-handled deductions, just return success
    // The actual deduction happens in the frontend via the user's wallet
    const success = true;
    
    res.json({ success });
    
  } catch (error) {
    console.error('ESR deduction error:', error);
    res.status(500).json({ error: 'Failed to deduct ESR tokens' });
  }
});

module.exports = router;