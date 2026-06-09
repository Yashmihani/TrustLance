// server.js
// Entry point — wires everything together

require('dotenv').config();   // load .env variables first
console.log('ENV CHECK - MONGODB_URI:', process.env.MONGODB_URI ? 'FOUND' : 'MISSING');
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');
const transactionRoutes = require('./src/routes/transactionRoutes');


// Import all routes
const authRoutes     = require('./src/routes/authRoutes');
const userRoutes     = require('./src/routes/userRoutes');
const projectRoutes  = require('./src/routes/projectRoutes');
const proposalRoutes = require('./src/routes/proposalRoutes');
const reviewRoutes   = require('./src/routes/reviewRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// ── Security middleware ──
app.use(helmet());   // sets secure HTTP headers

// ── CORS — only allow our frontend ──
// Replace cors config
app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://trustlance-red.vercel.app',
      process.env.CLIENT_URL,
    ].filter(Boolean);

    console.log('CORS request from:', origin);
    console.log('Allowed origins:', allowed);

    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ── Rate limiting — prevent brute force ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max:      100,              // max 100 requests per window
  message:  { success: false, message: 'Too many requests, slow down.' },
});
app.use('/api/', limiter);

// ── Body parser ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request logger (development only) ──
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Health check endpoint ──
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TrustLance API is running',
    env:     process.env.NODE_ENV,
    time:    new Date().toISOString(),
  });
});

// ── Mount all routes ──
app.use('/api/auth',      authRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/projects',  projectRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/reviews',   reviewRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/notifications', notificationRoutes);

// ── 404 handler ──
app.use('*path', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Central error handler (must be last) ──
app.use(errorHandler);

// ── Start server ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
});