import React, { useState } from 'react';
import './trade.css';

const Trade = () => {
  const [activeTab, setActiveTab] = useState('buy');
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');

  // Sample trading pairs
  const tradingPairs = [
    { pair: 'BTC/USDT', price: 63245, change: 2.4, volume: '28.5B', icon: '₿' },
    { pair: 'ETH/USDT', price: 3421, change: -1.2, volume: '15.2B', icon: 'Ξ' },
    { pair: 'SOL/USDT', price: 142, change: 5.7, volume: '3.2B', icon: '◎' },
    { pair: 'BNB/USDT', price: 578, change: 0.8, volume: '1.8B', icon: '⬤' },
  ];

  // Sample order book data
  const orderBook = {
    asks: [
      { price: 63250, amount: 1.2, total: 75900 },
      { price: 63248, amount: 0.8, total: 50598.4 },
      { price: 63245, amount: 2.5, total: 158112.5 },
      { price: 63242, amount: 1.5, total: 94863 },
      { price: 63240, amount: 3.0, total: 189720 },
    ],
    bids: [
      { price: 63238, amount: 2.1, total: 132799.8 },
      { price: 63235, amount: 1.7, total: 107499.5 },
      { price: 63232, amount: 0.9, total: 56908.8 },
      { price: 63230, amount: 2.8, total: 177044 },
      { price: 63228, amount: 1.3, total: 82196.4 },
    ],
  };

  // Sample recent trades
  const recentTrades = [
    { price: 63245, amount: 0.25, time: '12s ago', type: 'buy' },
    { price: 63242, amount: 0.12, time: '23s ago', type: 'sell' },
    { price: 63240, amount: 0.38, time: '35s ago', type: 'buy' },
    { price: 63238, amount: 0.15, time: '42s ago', type: 'buy' },
    { price: 63235, amount: 0.22, time: '51s ago', type: 'sell' },
    { price: 63232, amount: 0.18, time: '1m ago', type: 'sell' },
  ];

  return (
    <div className="trade-container">
      {/* Header with Trading Pair Selector */}
      <div className="trade-header">
        <div className="pair-selector">
          <div className="selected-pair">
            <span className="pair-icon">{tradingPairs.find(p => p.pair === selectedPair)?.icon}</span>
            <div className="pair-info">
              <span className="pair-name">{selectedPair}</span>
              <span className="pair-price">${tradingPairs.find(p => p.pair === selectedPair)?.price.toLocaleString()}</span>
            </div>
            <span className={`pair-change ${tradingPairs.find(p => p.pair === selectedPair)?.change >= 0 ? 'positive' : 'negative'}`}>
              {tradingPairs.find(p => p.pair === selectedPair)?.change >= 0 ? '+' : ''}
              {tradingPairs.find(p => p.pair === selectedPair)?.change}%
            </span>
          </div>
          <div className="pair-dropdown">
            {tradingPairs.map(pair => (
              <div 
                key={pair.pair} 
                className={`pair-option ${selectedPair === pair.pair ? 'active' : ''}`}
                onClick={() => setSelectedPair(pair.pair)}
              >
                <span className="pair-icon">{pair.icon}</span>
                <div className="pair-info">
                  <span className="pair-name">{pair.pair}</span>
                  <span className="pair-price">${pair.price.toLocaleString()}</span>
                </div>
                <span className={`pair-change ${pair.change >= 0 ? 'positive' : 'negative'}`}>
                  {pair.change >= 0 ? '+' : ''}{pair.change}%
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="market-stats">
          <div className="stat-item">
            <span className="stat-label">24h Volume</span>
            <span className="stat-value">$45.2B</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">24h High</span>
            <span className="stat-value">$64,230</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">24h Low</span>
            <span className="stat-value">$62,890</span>
          </div>
        </div>
      </div>

      {/* Main Trading Area */}
      <div className="trading-area">
        {/* Chart Section */}
        <div className="chart-section">
          <div className="chart-header">
            <div className="timeframes">
              {['1H', '4H', '1D', '1W', '1M'].map(tf => (
                <button key={tf} className="timeframe-btn">{tf}</button>
              ))}
            </div>
            <div className="chart-indicators">
              <span className="indicator">MA(7) 63,120</span>
              <span className="indicator">MA(25) 62,890</span>
            </div>
          </div>
          <div className="chart-placeholder">
            <div className="candlestick-chart">
              {/* Realistic candlestick patterns */}
              {[...Array(40)].map((_, i) => {
                // Generate realistic candle data
                const open = Math.random() * 40 + 30; // Open price position (30-70%)
                const close = Math.random() * 40 + 30; // Close price position (30-70%)
                const high = Math.max(open, close) + Math.random() * 15; // High above body
                const low = Math.min(open, close) - Math.random() * 15; // Low below body
                const isBullish = close > open;
                
                // Calculate positions
                const bodyTop = 100 - Math.max(open, close);
                const bodyBottom = 100 - Math.min(open, close);
                const bodyHeight = Math.abs(close - open);
                
                const wickTop = 100 - high;
                const wickTopHeight = Math.abs(high - Math.max(open, close));
                
                
                const wickBottomHeight = Math.abs(low - Math.min(open, close));
                
                return (
                  <div key={i} className="candle-wrapper">
                    {/* Upper wick */}
                    <div 
                      className="wick upper"
                      style={{
                        top: `${wickTop}%`,
                        height: `${wickTopHeight}%`,
                        animationDelay: `${i * 0.02}s`
                      }}
                    ></div>
                    
                    {/* Candle body */}
                    <div 
                      className={`candle-body ${isBullish ? 'bullish' : 'bearish'}`}
                      style={{
                        top: `${bodyTop}%`,
                        height: `${bodyHeight}%`,
                        animationDelay: `${i * 0.02}s`
                      }}
                    ></div>
                    
                    {/* Lower wick */}
                    <div 
                      className="wick lower"
                      style={{
                        top: `${bodyBottom}%`,
                        height: `${wickBottomHeight}%`,
                        animationDelay: `${i * 0.02}s`
                      }}
                    ></div>
                  </div>
                );
              })}
            </div>
            <div className="chart-overlay">
              <span className="current-price">$63,245</span>
              <span className="price-change positive">+2.4%</span>
            </div>
          </div>
        </div>

        {/* Order Form */}
        <div className="order-section">
          <div className="order-tabs">
            <button 
              className={`order-tab ${activeTab === 'buy' ? 'active' : ''}`}
              onClick={() => setActiveTab('buy')}
            >
              Buy
            </button>
            <button 
              className={`order-tab ${activeTab === 'sell' ? 'active' : ''}`}
              onClick={() => setActiveTab('sell')}
            >
              Sell
            </button>
          </div>

          <div className="order-form">
            <div className="balance-info">
              <span>Available Balance</span>
              <span className="balance-amount">0.0000 BTC</span>
            </div>

            <div className="order-type">
              <button className="type-btn active">Market</button>
              <button className="type-btn">Limit</button>
              <button className="type-btn">Stop</button>
            </div>

            <div className="input-group">
              <label>Amount (BTC)</label>
              <div className="input-wrapper">
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <span className="input-suffix">BTC</span>
              </div>
              <div className="percentage-btns">
                <button>25%</button>
                <button>50%</button>
                <button>75%</button>
                <button>100%</button>
              </div>
            </div>

            <div className="input-group">
              <label>Price (USDT)</label>
              <div className="input-wrapper">
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <span className="input-suffix">USDT</span>
              </div>
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Total</span>
                <span className="total-amount">
                  ${(parseFloat(amount || 0) * parseFloat(price || 63245)).toLocaleString()}
                </span>
              </div>
              <div className="summary-row">
                <span>Fee (0.1%)</span>
                <span>${((parseFloat(amount || 0) * parseFloat(price || 63245) * 0.001)).toLocaleString()}</span>
              </div>
            </div>

            <button className={`order-btn ${activeTab}`}>
              {activeTab === 'buy' ? 'Buy BTC' : 'Sell BTC'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-section">
        {/* Order Book */}
        <div className="order-book">
          <h3>Order Book</h3>
          <div className="order-book-header">
            <span>Price (USDT)</span>
            <span>Amount (BTC)</span>
            <span>Total</span>
          </div>
          
          {/* Asks (Sell orders) */}
          <div className="asks">
            {orderBook.asks.map((order, i) => (
              <div key={i} className="order-row ask">
                <span className="price">{order.price.toLocaleString()}</span>
                <span className="amount">{order.amount} BTC</span>
                <span className="total">${order.total.toLocaleString()}</span>
                <div className="depth-bar" style={{ width: `${(order.amount / 3) * 100}%` }}></div>
              </div>
            ))}
          </div>
          
          <div className="spread">
            <span>Spread</span>
            <span>$12 (0.02%)</span>
          </div>
          
          {/* Bids (Buy orders) */}
          <div className="bids">
            {orderBook.bids.map((order, i) => (
              <div key={i} className="order-row bid">
                <span className="price">{order.price.toLocaleString()}</span>
                <span className="amount">{order.amount} BTC</span>
                <span className="total">${order.total.toLocaleString()}</span>
                <div className="depth-bar" style={{ width: `${(order.amount / 3) * 100}%` }}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Trades */}
        <div className="recent-trades">
          <h3>Recent Trades</h3>
          <div className="trades-list">
            {recentTrades.map((trade, i) => (
              <div key={i} className="trade-row">
                <span className={`trade-price ${trade.type}`}>${trade.price.toLocaleString()}</span>
                <span className="trade-amount">{trade.amount} BTC</span>
                <span className="trade-time">{trade.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Open Orders */}
        <div className="open-orders">
          <h3>Open Orders</h3>
          <div className="no-orders">
            <span className="icon">📋</span>
            <p>No open orders</p>
            <span className="sub-text">Your orders will appear here</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Trade);