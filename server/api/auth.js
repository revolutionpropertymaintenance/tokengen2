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

module.exports = router;