import React, { useState, useEffect, useCallback } from "react";
import "./portfolio.css";

const TIMEFRAMES   = ["1D", "1W", "1M", "3M", "1Y"];
const TRADE_FILTERS = ["All", "Buy", "Sell", "Swap"];

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString();
};

const formatUSD = (val) => {
  const num = parseFloat(val);
  if (isNaN(num)) return '$0.00';
  return '$' + Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const AllocationBar = ({ holdings }) => (
  <div className="allocation-bar">
    {holdings.map((h, i) => (
      <div
        key={i}
        className="allocation-segment"
        style={{ width: `${h.allocation}%` }}
        title={`${h.symbol}: ${h.allocation}%`}
      />
    ))}
  </div>
);

const Portfolio = () => {
  const [timeframe, setTimeframe]     = useState("1M");
  const [tradeFilter, setTradeFilter] = useState("All");
  const [holdings, setHoldings]       = useState([]);
  const [summary, setSummary]         = useState({
    totalValue: '0.00', totalInvested: '0.00',
    totalPL: '0.00', totalPLPct: '0.00',
    bestAsset: 'N/A', worstAsset: 'N/A', positive: true,
  });
  const [trades, setTrades]     = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading]   = useState(true);

  const token = localStorage.getItem('token');

  const fetchHoldings = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/portfolio/holdings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setHoldings(data.data);
    } catch (err) { console.log('Holdings error:', err); }
  }, [token]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/portfolio/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setSummary(data.data);
    } catch (err) { console.log('Summary error:', err); }
  }, [token]);

  const fetchTrades = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/portfolio/trades', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setTrades(data.data);
    } catch (err) { console.log('Trades error:', err); }
  }, [token]);

  const fetchWatchlist = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/portfolio/watchlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setWatchlist(data.data);
    } catch (err) { console.log('Watchlist error:', err); }
  }, [token]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchHoldings(), fetchSummary(), fetchTrades(), fetchWatchlist()]);
      setLoading(false);
    };
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchHoldings, fetchSummary, fetchTrades, fetchWatchlist]);

  const filteredTrades = trades.filter(tx => {
    if (tradeFilter === 'All') return true;
    return tx.type === tradeFilter.toUpperCase();
  });

  const removeFromWatchlist = (symbol) => {
    setWatchlist(prev => prev.filter(w => w.symbol !== symbol));
  };

  return (
    <div className="portfolio-container">

      {/* OVERVIEW */}
      <div className="portfolio-overview">
        <div className="overview-main">
          <div className="overview-label">Total Portfolio Value</div>
          <div className="overview-value">
            {loading ? 'Loading...' : formatUSD(summary.totalValue)}
          </div>
          <div className={`overview-pl ${summary.positive ? 'positive' : 'negative'}`}>
            {summary.positive ? '▲' : '▼'} {summary.positive ? '+' : '-'}{formatUSD(summary.totalPL)} ({summary.positive ? '+' : ''}{summary.totalPLPct}%) all time
          </div>
          <div className="timeframe-tabs">
            {TIMEFRAMES.map(t => (
              <button
                key={t}
                className={`timeframe-tab ${timeframe === t ? "active" : ""}`}
                onClick={() => setTimeframe(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="overview-stats">
          <div className="overview-stat">
            <div className="stat-label">Total Invested</div>
            <div className="stat-value">{formatUSD(summary.totalInvested)}</div>
          </div>
          <div className="overview-stat">
            <div className="stat-label">Total P&L</div>
            <div className={`stat-value ${summary.positive ? 'positive' : 'negative'}`}>
              {summary.positive ? '+' : '-'}{formatUSD(summary.totalPL)}
            </div>
          </div>
          <div className="overview-stat">
            <div className="stat-label">Best Performer</div>
            <div className="stat-value cyan">{summary.bestAsset}</div>
          </div>
          <div className="overview-stat">
            <div className="stat-label">Worst Performer</div>
            <div className="stat-value red">{summary.worstAsset}</div>
          </div>
        </div>
      </div>

      {/* ALLOCATION */}
      <div className="portfolio-allocation">
        <div className="section-header">
          <h3>Asset Allocation</h3>
          <span>{holdings.length} assets</span>
        </div>
        {holdings.length > 0 ? (
          <>
            <AllocationBar holdings={holdings} />
            <div className="allocation-legend">
              {holdings.map((h, i) => (
                <div className="legend-item" key={i}>
                  <div className="legend-dot" style={{ background: `hsl(${i * 60}, 70%, 55%)` }}></div>
                  <span className="legend-symbol">{h.symbol}</span>
                  <span className="legend-pct">{h.allocation}%</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ color: '#888', padding: '20px', textAlign: 'center' }}>
            No holdings yet
          </div>
        )}
      </div>

      {/* HOLDINGS TABLE */}
      <div className="portfolio-holdings">
        <div className="section-header">
          <h3>Holdings</h3>
        </div>
        <div className="holdings-table">
          <div className="holdings-header">
            <span>Asset</span>
            <span>Amount</span>
            <span>Avg Buy</span>
            <span>Current Price</span>
            <span>Value</span>
            <span>P&L</span>
          </div>
          {loading ? (
            <div style={{ color: '#888', padding: '20px', textAlign: 'center' }}>Loading...</div>
          ) : holdings.length === 0 ? (
            <div style={{ color: '#888', padding: '20px', textAlign: 'center' }}>No holdings yet</div>
          ) : (
            holdings.map((h, i) => (
              <div className="holdings-row" key={i}>
                <div className="asset-info">
                  <div className="asset-icon">{h.icon}</div>
                  <div>
                    <div className="asset-name">{h.name}</div>
                    <div className="asset-symbol">{h.symbol}</div>
                  </div>
                </div>
                <span className="holding-amount">{h.amount}</span>
                <span className="holding-avg">
                  ${h.avgBuyPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="holding-current">
                  ${h.currentPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="holding-value">{formatUSD(h.currentValue)}</span>
                <span className={`holding-pl ${h.positive ? 'positive' : 'negative'}`}>
                  {h.positive ? '+' : '-'}{formatUSD(h.pl)} ({h.positive ? '+' : ''}{h.plPct?.toFixed(2)}%)
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="portfolio-bottom">

        {/* TRADE HISTORY */}
        <div className="trade-history">
          <div className="section-header">
            <h3>Trade History</h3>
            <div className="filter-tabs">
              {TRADE_FILTERS.map(f => (
                <button
                  key={f}
                  className={`filter-tab ${tradeFilter === f ? "active" : ""}`}
                  onClick={() => setTradeFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="trade-list">
            {loading ? (
              <div style={{ color: '#888', padding: '20px', textAlign: 'center' }}>Loading...</div>
            ) : filteredTrades.length === 0 ? (
              <div style={{ color: '#888', padding: '20px', textAlign: 'center' }}>No trades yet</div>
            ) : (
              filteredTrades.map((tx, i) => (
                <div className="trade-item" key={i}>
                  <div className="trade-left">
                    <div className={`trade-type ${tx.type === 'BUY' ? 'buy' : tx.type === 'SELL' ? 'sell' : 'swap'}`}>
                      {tx.type}
                    </div>
                    <div>
                      <div className="trade-coin">{tx.coin}</div>
                      <div className="trade-date">{formatDate(tx.date)}</div>
                    </div>
                  </div>
                  <div className="trade-right">
                    <div className="trade-amount">{tx.amount}</div>
                    <div className="trade-price">{tx.price}</div>
                  </div>
                  <div className={`trade-total ${tx.type === 'BUY' ? 'negative' : 'positive'}`}>
                    {tx.type === 'BUY' ? '-' : '+'}{tx.total}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* WATCHLIST */}
        <div className="portfolio-watchlist">
          <div className="section-header">
            <h3>Watchlist</h3>
            <span>{watchlist.length} coins</span>
          </div>
          <div className="watchlist-list">
            {loading ? (
              <div style={{ color: '#888', padding: '20px', textAlign: 'center' }}>Loading...</div>
            ) : watchlist.length === 0 ? (
              <div style={{ color: '#888', padding: '20px', textAlign: 'center' }}>No watchlist data</div>
            ) : (
              watchlist.map((w, i) => (
                <div className="watchlist-item" key={i}>
                  <div className="watchlist-left">
                    <div className="watchlist-icon">{w.icon}</div>
                    <div>
                      <div className="watchlist-name">{w.name}</div>
                      <div className="watchlist-symbol">{w.symbol}</div>
                    </div>
                  </div>
                  <div className="watchlist-right">
                    <div className="watchlist-price">
                      ${w.price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </div>
                    <div className={`watchlist-change ${w.positive ? 'positive' : 'negative'}`}>
                      {w.positive ? '+' : ''}{w.change24h?.toFixed(2)}%
                    </div>
                  </div>
                  <button className="watchlist-remove" onClick={() => removeFromWatchlist(w.symbol)}>✕</button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default React.memo(Portfolio);