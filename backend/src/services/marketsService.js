const https = require('https');

const REFRESH_INTERVAL = 30 * 1000; // 30 seconds

let marketsData = [];

const STABLE_COINS = ['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'USDP', 'USDD', 'GUSD'];
const MEME_COINS   = ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK', 'WIF', 'MEME', 'BABYDOGE'];
const DEFI_COINS   = ['UNI', 'AAVE', 'COMP', 'MKR', 'SNX', 'CRV', 'SUSHI', 'YFI', 'BAL'];
const LAYER1_COINS = ['BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'AVAX', 'DOT', 'NEAR', 'ATOM'];

const fetchMarkets = () => {
  const options = {
    hostname: 'api.binance.com',
    path: '/api/v3/ticker/24hr',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json',
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

        // Filter only USDT pairs and format data
        marketsData = parsed
          .filter(item => item.symbol.endsWith('USDT'))
          .map(item => {
            const symbol = item.symbol.replace('USDT', '');
            return {
              symbol,
              name:      getName(symbol),
              price:     parseFloat(item.lastPrice),
              change24h: parseFloat(item.priceChangePercent),
              volume24h: parseFloat(item.quoteVolume),
              high24h:   parseFloat(item.highPrice),
              low24h:    parseFloat(item.lowPrice),
              category:  getCategory(symbol),
            };
          })
          .filter(item => item.price > 0)
          .sort((a, b) => b.volume24h - a.volume24h)
          .slice(0, 100); // Top 100 by volume

        console.log(`Markets updated: ${marketsData.length} coins fetched`);
      } catch (err) {
        console.log('Error parsing markets:', err.message);
      }
    });
  });

  req.on('error', (err) => {
    console.log('Error fetching markets:', err.message);
  });

  req.end();
};

const getName = (symbol) => {
  const names = {
    BTC: 'Bitcoin',     ETH: 'Ethereum',  SOL: 'Solana',
    BNB: 'BNB',         XRP: 'XRP',       ADA: 'Cardano',
    DOGE: 'Dogecoin',   SHIB: 'Shiba Inu',AVAX: 'Avalanche',
    DOT: 'Polkadot',    MATIC: 'Polygon', LINK: 'Chainlink',
    UNI: 'Uniswap',     ATOM: 'Cosmos',   LTC: 'Litecoin',
    NEAR: 'NEAR',       ALGO: 'Algorand', FTM: 'Fantom',
    AAVE: 'Aave',       MKR: 'Maker',     COMP: 'Compound',
    PEPE: 'Pepe',       FLOKI: 'Floki',   BONK: 'Bonk',
    WIF: 'dogwifhat',   USDT: 'Tether',   USDC: 'USD Coin',
    DAI: 'Dai',         BUSD: 'BUSD',     ARB: 'Arbitrum',
    OP: 'Optimism',     IMX: 'Immutable', APT: 'Aptos',
    SUI: 'Sui',         SEI: 'Sei',       TIA: 'Celestia',
    INJ: 'Injective',   FET: 'Fetch.ai',  RNDR: 'Render',
  };
  return names[symbol] || symbol;
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
  console.log('Markets service started - refreshing every 30 seconds');
};

const getMarkets = () => marketsData;

module.exports = { startMarketsService, getMarkets };