import { useEffect, useState } from 'react';

const TickerStrip = () => {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://vpx-backend.onrender.com/api/markets');
        const data = await res.json();
        if (data.success && data.data) {
          // Sort alphabetically by symbol
          const sorted = [...data.data].sort((a, b) => a.symbol.localeCompare(b.symbol));
          setCoins(sorted);
        }
      } catch (err) {
        console.log('Ticker fetch error:', err.message);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price) => {
    if (!price) return '---';
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(4)}`;
  };

  const tickerItems = [...coins, ...coins];

  if (coins.length === 0) return (
    <div style={{
      width: '100%',
      background: '#000000',
      borderBottom: '1px solid #1E2330',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <span style={{ color: '#6B7280', fontSize: '0.75rem' }}>Loading prices...</span>
    </div>
  );

  return (
    <div style={{
      width: '100%',
      background: '#000000',
      borderBottom: '1px solid #1E2330',
      overflow: 'hidden',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
    }}>
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          animation: ticker-scroll 200s linear infinite;
          white-space: nowrap;
          will-change: transform;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="ticker-track">
        {tickerItems.map((coin, i) => {
          const change = coin.change24h || 0;
          const isUp = change >= 0;

          return (
            <div key={`${coin.symbol}-${i}`} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 20px',
              borderRight: '1px solid #1a1a1a',
              height: '40px',
            }}>
              {/* Symbol */}
              <span style={{
                color: '#F9FAFB',
                fontSize: '0.78rem',
                fontWeight: '700',
                fontFamily: "'Space Grotesk', sans-serif",
              }}>{coin.symbol}</span>

              {/* Price */}
              <span style={{
                color: '#9CA3AF',
                fontSize: '0.78rem',
                fontFamily: "'Space Grotesk', sans-serif",
              }}>{formatPrice(coin.price)}</span>

              {/* Change */}
              <span style={{
                color: isUp ? '#10B981' : '#EF4444',
                fontSize: '0.73rem',
                fontWeight: '600',
              }}>
                {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TickerStrip;
