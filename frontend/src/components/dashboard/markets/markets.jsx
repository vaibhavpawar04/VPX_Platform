import React, { useState, useEffect } from 'react';
import './markets.css';

const Markets = () => {
  const [activeTab, setActiveTab]   = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [coins, setCoins]           = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const res  = await fetch('http://localhost:8000/api/markets');
        const data = await res.json();
        if (data.success) {
          setCoins(data.data);
          setLoading(false);
        }
      } catch (err) {
        console.log('Markets fetch error:', err);
        setLoading(false);
      }
    };

    fetchMarkets();
    const interval = setInterval(fetchMarkets, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price) => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (price >= 1)    return `$${price.toFixed(2)}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(8)}`;
  };

  const formatVolume = (volume) => {
    if (volume >= 1000000000) return `$${(volume / 1000000000).toFixed(2)}B`;
    if (volume >= 1000000)    return `$${(volume / 1000000).toFixed(2)}M`;
    return `$${volume.toFixed(2)}`;
  };

  const filteredCoins = coins.filter(coin =>
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDisplayCoins = () => {
    if (activeTab === 'gainers') return [...filteredCoins].filter(c => c.change24h > 0).sort((a, b) => b.change24h - a.change24h);
    if (activeTab === 'losers')  return [...filteredCoins].filter(c => c.change24h < 0).sort((a, b) => a.change24h - b.change24h);
    if (activeTab === 'stable')  return filteredCoins.filter(c => c.category === 'stable');
    if (activeTab === 'meme')    return filteredCoins.filter(c => c.category === 'meme');
    if (activeTab === 'defi')    return filteredCoins.filter(c => c.category === 'defi');
    if (activeTab === 'layer1')  return filteredCoins.filter(c => c.category === 'layer1');
    return filteredCoins;
  };

  const displayCoins = getDisplayCoins();

  return (
    <div className="markets-container">
      <div className="markets-header">
        <h1>Markets</h1>
        <div className="market-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search coins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-btn">Search</button>
          </div>
        </div>
      </div>

      <div className="market-tabs">
        <button className={`tab ${activeTab === 'all'     ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All</button>
        <button className={`tab ${activeTab === 'gainers' ? 'active' : ''}`} onClick={() => setActiveTab('gainers')}>Top Gainers</button>
        <button className={`tab ${activeTab === 'losers'  ? 'active' : ''}`} onClick={() => setActiveTab('losers')}>Top Losers</button>
        <button className={`tab ${activeTab === 'layer1'  ? 'active' : ''}`} onClick={() => setActiveTab('layer1')}>Layer 1</button>
        <button className={`tab ${activeTab === 'defi'    ? 'active' : ''}`} onClick={() => setActiveTab('defi')}>DeFi</button>
        <button className={`tab ${activeTab === 'meme'    ? 'active' : ''}`} onClick={() => setActiveTab('meme')}>Meme</button>
        <button className={`tab ${activeTab === 'stable'  ? 'active' : ''}`} onClick={() => setActiveTab('stable')}>Stable</button>
      </div>

      <div className="market-table">
        {loading ? (
          <p style={{ color: '#888', padding: '20px', textAlign: 'center' }}>Loading markets...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Price</th>
                <th>24h Change</th>
                <th>24h Volume</th>
                <th>24h High</th>
                <th>24h Low</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayCoins.map((coin, index) => (
                <tr key={coin.symbol}>
                  <td>{index + 1}</td>
                  <td className="coin-info">
                    <span className="coin-name">{coin.name}</span>
                    <span className="coin-symbol">{coin.symbol}</span>
                  </td>
                  <td>{formatPrice(coin.price)}</td>
                  <td className={coin.change24h >= 0 ? 'positive' : 'negative'}>
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                  </td>
                  <td>{formatVolume(coin.volume24h)}</td>
                  <td>{formatPrice(coin.high24h)}</td>
                  <td>{formatPrice(coin.low24h)}</td>
                  <td>
                    <button className="trade-btn">Trade</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && displayCoins.length === 0 && (
        <div className="no-results">
          <p>No coins found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(Markets);