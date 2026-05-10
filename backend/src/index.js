const dotenv = require('dotenv');
dotenv.config(); 

const session  = require('express-session');
const passport = require('passport');
require('./config/passport');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const { connectToBinance, addClient } = require('./services/binanceService');
const { startNewsService } = require('./services/newsService');
const { startMarketsService } = require('./services/marketsService');
const { startMonitoring } = require('./services/alchemyService');
const { startSolanaMonitoring } = require('./services/solanaService');

const priceRoutes   = require('./routes/priceRoutes');
const newsRoutes    = require('./routes/newsRoutes');
const marketsRoutes = require('./routes/marketsRoutes');
const authRoutes    = require('./routes/authRoutes');
const walletRoutes  = require('./routes/walletRoutes');
const posRoutes     = require('./routes/posRoutes');

const app    = express();
const server = http.createServer(app);
const wss    = new WebSocket.Server({ server });

app.use(cors({ origin: ['http://localhost:3000', 'https://vpx-platform.vercel.app'], credentials: true }));

app.use(session({
  secret:            process.env.SESSION_SECRET,
  resave:            false,
  saveUninitialized: false,
  cookie:            { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/pos/stripe-webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use('/api/prices',    priceRoutes);
app.use('/api/news',      newsRoutes);
app.use('/api/markets',   marketsRoutes);
app.use('/api/auth',      authRoutes);
app.use('/api/wallet',    walletRoutes);
app.use('/api/pos',       posRoutes);
app.use('/api/portfolio', require('./routes/portfolioRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'VPX Backend is running' });
});

wss.on('connection', (ws) => { addClient(ws); });

const PORT = process.env.PORT || 8000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => {
      console.log(`VPX Backend running on port ${PORT}`);
      connectToBinance();
      startNewsService();
      startMarketsService();
      startMonitoring();
      startSolanaMonitoring();
    });
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err);
  });