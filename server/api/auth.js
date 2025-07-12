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
    
    // TODO: Implement actual ESR token balance checking using ethers.js
    // Example implementation:
    // const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    // const esrContract = new ethers.Contract(ESR_TOKEN_ADDRESS, ESR_ABI, provider);
    // const balance = await esrContract.balanceOf(address);
    // const decimals = await esrContract.decimals();
    // const formattedBalance = parseFloat(ethers.formatUnits(balance, decimals));
    
    const balance = 0; // Placeholder - will be replaced with actual blockchain query
    
    res.json({ balance });
    
  } catch (error) {
    console.error('ESR balance check error:', error);
    res.status(500).json({ error: 'Failed to check ESR balance' });
  }
});

// ESR Token deduction endpoint
router.post('/esr/deduct', async (req, res) => {
  try {
    const { amount } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization required' });
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    
    // TODO: Implement actual ESR token deduction on the backend
    // Note: In practice, ESR token deduction should be handled on the frontend
    // using the user's wallet to sign the transaction. The backend should only
    // verify that the deduction transaction was successful.
    // 
    // Backend implementation would require:
    // 1. A backend wallet with ETH for gas fees
    // 2. User approval for the backend to spend their ESR tokens
    // 3. Backend calling transferFrom on the ESR token contract
    // 
    // Frontend implementation (recommended):
    // 1. User signs transaction to transfer ESR to platform wallet
    // 2. Backend verifies the transaction was successful
    // 3. Backend proceeds with deployment
    
    const success = true; // Placeholder - ESR deduction handled on frontend
    
    res.json({ success });
    
  } catch (error) {
    console.error('ESR deduction error:', error);
    res.status(500).json({ error: 'Failed to deduct ESR tokens' });
  }
});

module.exports = router;