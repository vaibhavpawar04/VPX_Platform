const WebSocket = require('ws');

const COINS = ['btcusdt', 'ethusdt', 'solusdt', 'bnbusdt', 'xrpusdt'];

// Store latest prices in memory
const latestPrices = {
  BTC: { price: null, dir: null },
  ETH: { price: null, dir: null },
  SOL: { price: null, dir: null },
  BNB: { price: null, dir: null },
  XRP: { price: null, dir: null },
};

// Store all connected frontend clients
const clients = new Set();

// Connect to Binance WebSocket
const connectToBinance = () => {
  const streams = COINS.map(c => `${c}@miniTicker`).join('/');
  const binanceWs = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

  binanceWs.on('open', () => {
    console.log('Connected to Binance WebSocket');
  });

  binanceWs.on('message', (data) => {
    const parsed = JSON.parse(data);
    const ticker = parsed.data;
    const symbol = ticker.s.replace('USDT', '');
    const newPrice = parseFloat(ticker.c);
    const oldPrice = latestPrices[symbol]?.price;

    // Update price and direction
    latestPrices[symbol] = {
      price: newPrice,
      dir: oldPrice === null ? null : newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : latestPrices[symbol].dir,
    };

    // Broadcast to all connected frontend clients
    const message = JSON.stringify({ type: 'PRICE_UPDATE', data: latestPrices });
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  binanceWs.on('close', () => {
    console.log('Binance WebSocket closed. Reconnecting in 5 seconds...');
    setTimeout(connectToBinance, 5000);
  });

  binanceWs.on('error', (err) => {
    console.log('Binance WebSocket error:', err.message);
    binanceWs.close();
  });
};

// Add a new frontend client
const addClient = (ws) => {
  clients.add(ws);
  console.log(`Client connected. Total clients: ${clients.size}`);

  // Send current prices immediately on connect
  ws.send(JSON.stringify({ type: 'PRICE_UPDATE', data: latestPrices }));

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`Client disconnected. Total clients: ${clients.size}`);
  });
};

const getLatestPrices = () => latestPrices;

module.exports = { connectToBinance, addClient, getLatestPrices };