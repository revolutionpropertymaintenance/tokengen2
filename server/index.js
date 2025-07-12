const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const deployRoutes = require('./api/deploy');
const authRoutes = require('./api/auth');
const contractRoutes = require('./api/contracts');
const connectDB = require('./db');
const applySecurityMiddleware = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 3001;

// Apply security middleware
applySecurityMiddleware(app);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/deploy', deployRoutes);
app.use('/api/contracts', contractRoutes);

// Serve deployment files
app.use('/deployments', express.static(path.join(__dirname, '..', 'deployments')));

// Connect to database
connectDB().then(() => {
  console.log('MongoDB connected successfully');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`TokenForge API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  
  // Log important configuration
  if (process.env.NODE_ENV === 'development') {
    console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log('Available API endpoints:');
    console.log('- /api/auth - Authentication endpoints');
    console.log('- /api/deploy - Deployment endpoints');
    console.log('- /api/contracts - Contract management endpoints');
  }
});