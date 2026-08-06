import React, { useState, useEffect, useRef } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import './trade.css';

const TIMEFRAME_TO_DAYS = { '1H': '1', '4H': '1', '1D': '1', '1W': '7', '1M': '30' };
const Trade = () => {
  const [activeTab, setActiveTab] = useState('buy');
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [timeframe, setTimeframe] = useState('1D');
  const [chartLoading, setChartLoading] = useState(true);

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  // Trading pairs mapped to their CoinGecko coin IDs (needed for OHLC data)
  const tradingPairs = [
    { pair: 'BTC/USDT', price: 63245, change: 2.4, volume: '28.5B', icon: 'BTC', coinId: 'bitcoin' },
    { pair: 'ETH/USDT', price: 3421, change: -1.2, volume: '15.2B', icon: 'ETH', coinId: 'ethereum' },
    { pair: 'SOL/USDT', price: 142, change: 5.7, volume: '3.2B', icon: 'SOL', coinId: 'solana' },
    { pair: 'ARB/USDT', price: 1.05, change: 3.1, volume: '0.8B', icon: 'ARB', coinId: 'arbitrum' },
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

  const currentCoinId = tradingPairs.find(p => p.pair === selectedPair)?.coinId || 'bitcoin';

  // Initialize chart once
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { color: 'transparent' }, textColor: '#9CA3AF' },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.05)' },
        horzLines: { color: 'rgba(255,255,255,0.05)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: { timeVisible: true, secondsVisible: false },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Fetch real OHLC data whenever the selected pair or timeframe changes, and refresh periodically
  useEffect(() => {
    const fetchOHLC = async () => {
      setChartLoading(true);
      try {
        const days = TIMEFRAME_TO_DAYS[timeframe] || '1';
        const res = await fetch(`https://vpx-backend.onrender.com/api/markets/ohlc/${currentCoinId}?days=${days}`);
        const data = await res.json();
        if (data.success && seriesRef.current) {
          const formatted = data.data.map(c => ({
            time: Math.floor(c.time / 1000),
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          }));
          seriesRef.current.setData(formatted);
          if (chartRef.current) chartRef.current.timeScale().fitContent();
        }
      } catch (err) {
        console.log('OHLC fetch error:', err);
      }
      setChartLoading(false);
    };

    fetchOHLC();
    const interval = setInterval(fetchOHLC, 90 * 1000); // refresh every 90 seconds
    return () => clearInterval(interval);
  }, [currentCoinId, timeframe]);

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
                <button
                  key={tf}
                  className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
                  onClick={() => setTimeframe(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-placeholder" style={{ position: 'relative' }}>
            {chartLoading && (
              <div style={{ position: 'absolute', top: '10px', left: '10px', color: '#6B7280', fontSize: '0.8rem', zIndex: 2 }}>
                Loading chart data...
              </div>
            )}
            <div ref={chartContainerRef} style={{ width: '100%', height: '400px' }} />
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
