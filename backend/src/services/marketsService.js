const https = require('https');
const REFRESH_INTERVAL = 60 * 1000; // 1 minute — CoinGecko free tier is generous, no weight-based bans
let marketsData = [];
const STABLE_COINS = ['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'USDP', 'USDD', 'GUSD'];
const MEME_COINS   = ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK', 'WIF', 'MEME', 'BABYDOGE'];
const DEFI_COINS   = ['UNI', 'AAVE', 'COMP', 'MKR', 'SNX', 'CRV', 'SUSHI', 'YFI', 'BAL'];
const LAYER1_COINS = ['BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'AVAX', 'DOT', 'NEAR', 'ATOM'];

const fetchMarkets = () => {
  const options = {
    hostname: 'api.coingecko.com',
    path: '/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h',
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'VPX-Platform/1.0 (https://vpx-platform.vercel.app)',
      'x-cg-demo-api-key': process.env.COINGECKO_API_KEY,
    }
  };
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);

        if (!Array.isArray(parsed)) {
          console.log('Error parsing markets: unexpected response shape');
          console.log('Raw CoinGecko response (first 300 chars):', data.slice(0, 300));
          return;
        }

        marketsData = parsed
          .filter(item => item.current_price > 0)
          .map(item => ({
            symbol:    item.symbol.toUpperCase(),
            id:        item.id,
            name:      item.name,
            price:     item.current_price,
            change24h: item.price_change_percentage_24h || 0,
            volume24h: item.total_volume,
            high24h:   item.high_24h,
            low24h:    item.low_24h,
            category:  getCategory(item.symbol.toUpperCase()),
          }))
          .sort((a, b) => b.volume24h - a.volume24h)
          .slice(0, 100);

        console.log(`Markets updated: ${marketsData.length} coins fetched`);
      } catch (err) {
        console.log('Error parsing markets:', err.message);
        console.log('Raw CoinGecko response (first 300 chars):', data.slice(0, 300));
      }
    });
  });
  req.on('error', (err) => {
    console.log('Error fetching markets:', err.message);
  });
  req.end();
};

const getCategory = (symbol) => {
  if (STABLE_COINS.includes(symbol)) return 'stable';
  if (MEME_COINS.includes(symbol))   return 'meme';
  if (DEFI_COINS.includes(symbol))   return 'defi';
  if (LAYER1_COINS.includes(symbol)) return 'layer1';
  return 'other';
};

const startMarketsService = () => {
  fetchMarkets();
  setInterval(fetchMarkets, REFRESH_INTERVAL);
  console.log('Markets service started - refreshing every 60 seconds (CoinGecko)');
};

const getMarkets = () => marketsData;
module.exports = { startMarketsService, getMarkets };

// --- OHLC (candlestick) data ---
const ohlcCache = {};
const OHLC_CACHE_TTL = 60 * 1000; // 1 minute

const getOHLC = (coinId, days = '1') => {
  return new Promise((resolve, reject) => {
    const cacheKey = `${coinId}_${days}`;
    const cached = ohlcCache[cacheKey];
    if (cached && (Date.now() - cached.timestamp) < OHLC_CACHE_TTL) {
      return resolve(cached.data);
    }

    const options = {
      hostname: 'api.coingecko.com',
      path: `/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'VPX-Platform/1.0 (https://vpx-platform.vercel.app)',
        'x-cg-demo-api-key': process.env.COINGECKO_API_KEY,
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (!Array.isArray(parsed)) {
            return reject(new Error('Unexpected OHLC response shape'));
          }
          const candles = parsed.map(c => ({
            time: c[0],
            open: c[1],
            high: c[2],
            low: c[3],
            close: c[4],
          }));
          ohlcCache[cacheKey] = { data: candles, timestamp: Date.now() };
          resolve(candles);
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
};

module.exports.getOHLC = getOHLC;
