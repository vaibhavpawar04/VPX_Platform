import React, { useState, useEffect, useCallback } from "react";
import "./pos.css";

const FIAT_CURRENCIES = ["INR ₹", "USD $", "EUR €", "GBP £", "AED د.إ", "JPY ¥", "CAD $", "AUD $", "SGD $", "CHF ₣"];
const FILTER_OPTIONS  = ["All", "Confirmed", "Declined", "Failed"];

const CURRENCY_SYMBOLS = {
  "INR ₹":   { code: "INR", symbol: "₹"   },
  "USD $":   { code: "USD", symbol: "$"   },
  "EUR €":   { code: "EUR", symbol: "€"   },
  "GBP £":   { code: "GBP", symbol: "£"   },
  "AED د.إ": { code: "AED", symbol: "AED" },
  "JPY ¥":   { code: "JPY", symbol: "¥"   },
  "CAD $":   { code: "CAD", symbol: "CA$" },
  "AUD $":   { code: "AUD", symbol: "A$"  },
  "SGD $":   { code: "SGD", symbol: "S$"  },
  "CHF ₣":   { code: "CHF", symbol: "CHF" },
};

const FIAT_SYMBOLS = {
  USD: '$', GBP: '£', EUR: '€', INR: '₹',
  AED: 'AED', JPY: '¥', CAD: 'CA$', AUD: 'A$',
  SGD: 'S$', CHF: 'CHF',
};

const NetworkBadge = ({ status }) => {
  const config = {
    fast:   { color: "#26a69a", label: "Network: Fast"   },
    normal: { color: "#FF9800", label: "Network: Normal" },
    slow:   { color: "#ef5350", label: "Network: Slow"   },
  };
  const c = config[status] || config.normal;
  return (
    <span className="network-badge" style={{ color: c.color, borderColor: c.color }}>
      <span className="network-dot" style={{ background: c.color }}></span>
      {c.label}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    confirmed: { color: "#26a69a", label: "Confirmed" },
    pending:   { color: "#FF9800", label: "Pending"   },
    failed:    { color: "#ef5350", label: "Failed"    },
    declined:  { color: "#ef5350", label: "Declined"  },
  };
  const c = config[status] || config.pending;
  return (
    <span className="status-badge" style={{ color: c.color, background: `${c.color}18`, border: `1px solid ${c.color}40` }}>
      {c.label}
    </span>
  );
};

const getNetworkSpeed = (ms) => {
  if (!ms) return 'normal';
  if (ms < 2000) return 'fast';
  if (ms < 10000) return 'normal';
  return 'slow';
};

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

const formatCryptoBreakdown = (breakdown) => {
  if (!breakdown || breakdown.length === 0) return '—';
  return breakdown.map(b => `${b.cryptoAmount?.toFixed(6)} ${b.coin}`).join(' + ');
};

// Show original transaction fiat amount — no conversion
const formatTransactionAmount = (tx) => {
  if (!tx) return '—';
  const symbol = FIAT_SYMBOLS[tx.fiatCurrency] || tx.fiatCurrency || '$';
  return `${symbol}${tx.fiatAmount?.toFixed(2)}`;
};

const POS = () => {
  const [selectedFiat, setSelectedFiat]         = useState(localStorage.getItem('posFiatCurrency') || "INR ₹");
  const [filter, setFilter]                     = useState("All");
  const [showFiatDropdown, setShowFiatDropdown] = useState(false);
  const [transactions, setTransactions]         = useState([]);
  const [summary, setSummary]                   = useState({ totalTodayUSD: '0.00', transactionsToday: 0, failedCount: 0, mostUsed: 'N/A' });
  const [exchangeRates, setExchangeRates]       = useState({});
  const [loading, setLoading]                   = useState(false);

  const token = localStorage.getItem('token');

  // Fetch live exchange rates — only used for summary total conversion
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await res.json();
        setExchangeRates(data.rates);
      } catch (err) {
        console.log('Exchange rate fetch error:', err);
      }
    };
    fetchRates();
  }, []);

  // Convert USD to selected fiat — only for summary total
  const convertUSDToSelected = (usdAmount) => {
    if (!usdAmount) return '0.00';
    const currencyCode = CURRENCY_SYMBOLS[selectedFiat]?.code || 'USD';
    const rate = exchangeRates[currencyCode] || 1;
    const converted = parseFloat(usdAmount) * rate;
    return converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const currencySymbol = CURRENCY_SYMBOLS[selectedFiat]?.symbol || '$';

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/pos/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setTransactions(data.data);
    } catch (err) {
      console.log('Fetch POS transactions error:', err);
    }
  }, [token]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/pos/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setSummary(data.data);
    } catch (err) {
      console.log('Fetch POS summary error:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
    const interval = setInterval(() => {
      fetchTransactions();
      fetchSummary();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchTransactions, fetchSummary]);

  const lastTransaction = transactions[0] || null;

  const filteredTxns = transactions.filter(tx => {
    if (filter === 'All') return true;
    return tx.status === filter.toLowerCase();
  });

  const handleFiatChange = (f) => {
    setSelectedFiat(f);
    localStorage.setItem('posFiatCurrency', f);
    setShowFiatDropdown(false);
  };

  const handleDownloadReceipt = (tx) => {
    const breakdownRows = tx.breakdown?.map(b => `
      <div class="row">
        <span class="label">${b.coin} Deducted</span>
        <span class="value">${b.cryptoAmount?.toFixed(8)} ${b.coin} ($${b.usdValue?.toFixed(2)})</span>
      </div>
      ${b.txHash ? `
      <div class="row">
        <span class="label">${b.coin} TxHash</span>
        <span class="value" style="font-size:0.7rem; word-break:break-all">
          <a href="${b.explorer}" target="_blank" style="color:#00F0FF">${b.txHash.slice(0, 20)}...</a>
        </span>
      </div>` : ''}
    `).join('') || '';

    const content = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>VPX Receipt - ${tx._id}</title>
          <style>
            body { font-family: 'Arial', sans-serif; background: #0A0A0A; color: white; padding: 40px; }
            .receipt { max-width: 500px; margin: 0 auto; background: #1E1E1E; border-radius: 16px; padding: 30px; border: 1px solid #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #FF9800; padding-bottom: 20px; }
            .header h1 { color: #00F0FF; margin: 0 0 5px 0; font-size: 1.8rem; }
            .header p { color: #888; margin: 0; font-size: 0.9rem; }
            .amount { text-align: center; margin: 20px 0; }
            .amount h2 { font-size: 3rem; color: white; margin: 0; }
            .amount p { color: #26a69a; font-size: 1rem; margin: 5px 0 0 0; }
            .details { background: #2D2D2D; border-radius: 10px; padding: 20px; margin: 20px 0; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #333; font-size: 0.9rem; }
            .row:last-child { border-bottom: none; }
            .label { color: #888; }
            .value { color: white; font-weight: 600; }
            .status { color: #26a69a; }
            .footer { text-align: center; margin-top: 20px; color: #888; font-size: 0.85rem; }
            .footer span { color: #FF9800; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1>VPX Platform</h1>
              <p>Payment Receipt</p>
            </div>
            <div class="amount">
              <h2>${formatTransactionAmount(tx)}</h2>
              <p>≈ $${tx.usdAmount?.toFixed(2)} USD</p>
            </div>
            <div class="details">
              <div class="row"><span class="label">Transaction ID</span><span class="value">${tx._id?.slice(-8).toUpperCase()}</span></div>
              <div class="row"><span class="label">Stripe Payment ID</span><span class="value" style="font-size:0.75rem">${tx.stripePaymentId || '—'}</span></div>
              <div class="row"><span class="label">Status</span><span class="value status">✓ ${tx.status?.toUpperCase()}</span></div>
              <div class="row"><span class="label">Processing Time</span><span class="value">${tx.processingTimeMs}ms</span></div>
              <div class="row"><span class="label">Time</span><span class="value">${formatDate(tx.createdAt)}</span></div>
              ${breakdownRows}
            </div>
            <div class="footer">
              <p>Thank you for using <span>VPX</span></p>
            </div>
          </div>
        </body>
      </html>
    `;

    const blob   = new Blob([content], { type: "text/html" });
    const url    = URL.createObjectURL(blob);
    const newTab = window.open(url, "_blank");
    newTab.onload = () => { newTab.print(); URL.revokeObjectURL(url); };
  };

  return (
    <div className="pos-container">

      {/* TOP BAR */}
      <div className="pos-topbar">
        <div className="pos-topbar-left">
          <h1>POS Terminal</h1>
          <NetworkBadge status="fast" />
        </div>
        <div className="pos-topbar-right">
          <div className="fiat-selector" onClick={() => setShowFiatDropdown(!showFiatDropdown)}>
            <span>🌐</span>
            <span>{selectedFiat}</span>
            <span className="dropdown-arrow">▾</span>
            {showFiatDropdown && (
              <div className="fiat-dropdown">
                {FIAT_CURRENCIES.map(f => (
                  <div
                    key={f}
                    className={`fiat-option ${selectedFiat === f ? "active" : ""}`}
                    onClick={() => handleFiatChange(f)}
                  >
                    {f}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DAILY SUMMARY */}
      <div className="pos-summary">
        <div className="summary-card">
          <div className="summary-icon">💸</div>
          <div className="summary-info">
            <div className="summary-label">Total Spent Today</div>
            <div className="summary-value">{currencySymbol}{convertUSDToSelected(summary.totalTodayUSD)}</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">🔢</div>
          <div className="summary-info">
            <div className="summary-label">Transactions Today</div>
            <div className="summary-value">{summary.transactionsToday}</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">⭐</div>
          <div className="summary-info">
            <div className="summary-label">Most Used Crypto</div>
            <div className="summary-value">{summary.mostUsed}</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">❌</div>
          <div className="summary-info">
            <div className="summary-label">Failed Transactions</div>
            <div className="summary-value" style={{ color: summary.failedCount > 0 ? "#ef5350" : "#26a69a" }}>
              {summary.failedCount}
            </div>
          </div>
        </div>
      </div>

      {/* LAST PAYMENT STATUS */}
      <div className="pos-last-payment">
        <div className="last-payment-header">
          <h3>Last Payment</h3>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {lastTransaction && <StatusBadge status={lastTransaction.status} />}
            {lastTransaction?.status === "confirmed" && (
              <button className="receipt-btn" onClick={() => handleDownloadReceipt(lastTransaction)}>
                ⬇ Receipt
              </button>
            )}
          </div>
        </div>
        <div className="last-payment-body">
          {lastTransaction ? (
            <>
              <div className="last-payment-main">
                <div className="last-payment-fiat">
                  {formatTransactionAmount(lastTransaction)}
                </div>
                <div className="last-payment-crypto">
                  <span className="crypto-deducted">
                    {formatCryptoBreakdown(lastTransaction.breakdown)} deducted
                  </span>
                </div>
              </div>
              <div className="last-payment-details">
                <div className="detail-row">
                  <span className="detail-label">Transaction ID</span>
                  <span className="detail-value">{lastTransaction._id?.slice(-8).toUpperCase()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">USD Value</span>
                  <span className="detail-value">${lastTransaction.usdAmount?.toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Processing Time</span>
                  <span className="detail-value" style={{ color: '#00F0FF' }}>
                    {lastTransaction.processingTimeMs}ms
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Time</span>
                  <span className="detail-value">{formatDate(lastTransaction.createdAt)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Network</span>
                  <span className="detail-value">
                    <NetworkBadge status={getNetworkSpeed(lastTransaction.processingTimeMs)} />
                  </span>
                </div>
                {lastTransaction.breakdown?.filter(b => b.txHash).map((b, i) => (
                  <div className="detail-row" key={i}>
                    <span className="detail-label">{b.coin} Explorer</span>
                    <span className="detail-value">
                      <a href={b.explorer} target="_blank" rel="noreferrer"
                        style={{ color: '#00F0FF', fontSize: '0.75rem' }}>
                        {b.txHash?.slice(0, 16)}...
                      </a>
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ color: '#888', padding: '20px', textAlign: 'center' }}>
              No transactions yet
            </div>
          )}
        </div>
      </div>

      {/* TRANSACTION HISTORY */}
      <div className="pos-history">
        <div className="history-header">
          <h3>Transaction History</h3>
          <div className="filter-tabs">
            {FILTER_OPTIONS.map(f => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="history-table">
          <div className="table-header">
            <span>TXN ID</span>
            <span>Amount</span>
            <span>Crypto Deducted</span>
            <span>Status</span>
            <span>Network</span>
            <span>Time</span>
            <span>Receipt</span>
          </div>
          {loading ? (
            <div className="no-txns">Loading...</div>
          ) : filteredTxns.length === 0 ? (
            <div className="no-txns">No transactions found</div>
          ) : (
            filteredTxns.map((tx, i) => (
              <div className="table-row" key={i}>
                <span className="txn-id">{tx._id?.slice(-8).toUpperCase()}</span>
                <span className="txn-fiat">{formatTransactionAmount(tx)}</span>
                <span className="txn-crypto">{formatCryptoBreakdown(tx.breakdown)}</span>
                <span><StatusBadge status={tx.status} /></span>
                <span><NetworkBadge status={getNetworkSpeed(tx.processingTimeMs)} /></span>
                <span className="txn-time">{formatDate(tx.createdAt)}</span>
                <span>
                  {tx.status === "confirmed" ? (
                    <button className="receipt-btn" onClick={() => handleDownloadReceipt(tx)}>
                      ⬇ Receipt
                    </button>
                  ) : (
                    <span className="no-receipt">—</span>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FAILED ALERT */}
      {summary.failedCount > 0 && (
        <div className="failed-alert">
          <span>⚠️</span>
          <span>{summary.failedCount} failed transaction detected. Please check transaction history.</span>
        </div>
      )}

    </div>
  );
};

export default React.memo(POS);