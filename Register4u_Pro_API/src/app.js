const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

const app = express();

// CORS Configuration (MUST be FIRST - before other middleware!)
app.use(cors({
  origin: '*', // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Handle preflight requests
app.options('*', cors());

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
})); // Security headers
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Files - Uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
const routes = require('./routes');
app.use('/api/v1', routes);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Register4u Pro API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Register4u Pro API',
    version: '1.0.0',
    documentation: '/api/v1/docs'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;

