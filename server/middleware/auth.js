const jwt = require('jsonwebtoken');
const { query } = require('../db');
const { verifyHash } = require('../utils/encryption');

// Authenticate user with JWT
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check token expiration
      if (decoded.exp < Date.now() / 1000) {
        return res.status(401).json({ error: 'Token expired' });
      }
      
      // Set user info in request
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      } else {
        console.error('Token verification error:', error);
        return res.status(500).json({ error: 'Authentication failed' });
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

// Verify signature for wallet authentication
async function verifySignature(req, res, next) {
  try {
    const { address, signature, message } = req.body;
    
    if (!address || !signature || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get user from database
    const userResult = await query(
      'SELECT * FROM users WHERE address = $1',
      [address.toLowerCase()]
    );
    
    const user = userResult.rows[0];
    
    if (!user) {
      // Create new user if not exists
      const nonce = require('crypto').randomBytes(16).toString('hex');
      await query(
        'INSERT INTO users (address, nonce) VALUES ($1, $2)',
        [address.toLowerCase(), nonce]
      );
      
      return res.status(400).json({ 
        error: 'User not found. New account created. Please request a new message and try again.' 
      });
    }
    
    // Verify the signature using ethers.js
    const ethers = require('ethers');
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    } catch (error) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }
    
    // Update last login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE address = $1',
      [address.toLowerCase()]
    );
    
    // Set user in request
    req.user = {
      id: address.toLowerCase(),
      address: address.toLowerCase()
    };
    
    next();
  } catch (error) {
    console.error('Signature verification error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// Check if user is admin
async function isAdmin(req, res, next) {
  try {
    const adminAddresses = (process.env.ADMIN_ADDRESSES || '').split(',').map(a => a.toLowerCase());
    
    if (!req.user || !adminAddresses.includes(req.user.address.toLowerCase())) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
}

module.exports = { 
  authenticate, 
  verifySignature,
  isAdmin
};