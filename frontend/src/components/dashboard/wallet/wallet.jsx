import React, { useState, useEffect } from "react";
import "./wallet.css";
import {
  getBalancesAPI,
  getTransactionsAPI,
  depositAPI,
  withdrawAPI,
  swapAPI,
  getDepositAddressAPI,
} from "../../../api";

const COIN_ICONS = {
  BTC: '₿', ETH: 'Ξ', SOL: '◎', BNB: 'B',
  USDT: '₮', XRP: 'X', ADA: 'A', DOGE: 'D',
};

const COIN_NAMES = {
  BTC: 'Bitcoin', ETH: 'Ethereum', SOL: 'Solana',
  BNB: 'BNB', USDT: 'Tether', XRP: 'XRP',
  ADA: 'Cardano', DOGE: 'Dogecoin',
};

const SUPPORTED_COINS = ['BTC', 'ETH', 'SOL', 'BNB', 'USDT', 'XRP', 'ADA', 'DOGE'];

const Wallet = () => {
  const [balances, setBalances] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [prices, setPrices] = useState({});
  const [pricesLoaded, setPricesLoaded] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const [showDeposit, setShowDeposit] = useState(false);
  const [depositCoin, setDepositCoin] = useState('ETH');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositMsg, setDepositMsg] = useState('');
  const [depositAddressData, setDepositAddressData] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawCoin, setWithdrawCoin] = useState('ETH');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState('');

  const [showSwap, setShowSwap] = useState(false);
  const [swapFrom, setSwapFrom] = useState('BTC');
  const [swapTo, setSwapTo] = useState('ETH');
  const [swapAmount, setSwapAmount] = useState('');
  const [swapLoading, setSwapLoading] = useState(false);
  const [swapMsg, setSwapMsg] = useState('');
  const [swapPreview, setSwapPreview] = useState(null);

  // Payment Preferences states
  const [showPreferences, setShowPreferences]     = useState(false);
  const [priorityOrder, setPriorityOrder]         = useState(SUPPORTED_COINS);
  const [excludedCoins, setExcludedCoins]         = useState([]);
  const [prefsLoading, setPrefsLoading]           = useState(false);
  const [prefsMsg, setPrefsMsg]                   = useState('');
  const [dragIndex, setDragIndex]                 = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchWalletData();
    const interval = setInterval(fetchWalletData, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://vpx-backend.onrender.com/api/prices');
        const data = await res.json();
        if (data.success) { setPrices(data.data); setPricesLoaded(true); }
      } catch (err) { console.log('Price fetch error:', err); }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 10 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch payment preferences
  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await fetch('https://vpx-backend.onrender.com/api/wallet/payment-preferences', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setPriorityOrder(data.data.priorityOrder || SUPPORTED_COINS);
          setExcludedCoins(data.data.excludedCoins || []);
        }
      } catch (err) { console.log('Fetch prefs error:', err); }
    };
    fetchPrefs();
  }, [token]);

  const fetchWalletData = async () => {
    try {
      setLoadingData(true);
      const [balRes, txRes] = await Promise.all([getBalancesAPI(), getTransactionsAPI()]);
      if (balRes.success) setBalances(balRes.data);
      if (txRes.success) setTransactions(txRes.data);
    } catch (err) {
      console.log('Fetch wallet data error:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const getTotalValue = () => {
    if (balances.length === 0 || !pricesLoaded) return '0.00';
    const total = balances.reduce((sum, b) => {
      const price = prices[b.coin]?.price || 0;
      return sum + (b.amount * price);
    }, 0);
    return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getHoldingUSDValue = (coin, amount) => {
    if (!pricesLoaded) return '---';
    const price = prices[coin]?.price || 0;
    return (amount * price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setDepositMsg('Please enter a valid amount.');
      return;
    }
    try {
      setDepositLoading(true);
      setDepositMsg('');
      const res = await depositAPI(depositCoin, parseFloat(depositAmount));
      if (res.success) {
        setDepositMsg(`✓ ${depositAmount} ${depositCoin} deposited successfully!`);
        setDepositAmount('');
        fetchWalletData();
        setTimeout(() => { setShowDeposit(false); setDepositMsg(''); }, 2000);
      } else {
        setDepositMsg(res.message || 'Deposit failed.');
      }
    } catch (err) {
      setDepositMsg('Deposit failed. Please try again.');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const finalAddress = withdrawAddress || localStorage.getItem('walletAddressFull') || '';
    if (!withdrawAmount || !finalAddress) {
      setWithdrawMsg('Please fill all fields.');
      return;
    }
    try {
      setWithdrawLoading(true);
      setWithdrawMsg('');
      const res = await withdrawAPI(withdrawCoin, parseFloat(withdrawAmount), finalAddress);
      if (res.success) {
        setWithdrawMsg(`✓ ${withdrawAmount} ${withdrawCoin} withdrawn successfully!`);
        setWithdrawAmount('');
        setWithdrawAddress('');
        fetchWalletData();
        setTimeout(() => { setShowWithdraw(false); setWithdrawMsg(''); }, 2000);
      } else {
        setWithdrawMsg(res.message || 'Withdrawal failed.');
      }
    } catch (err) {
      setWithdrawMsg('Withdrawal failed. Please try again.');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleSwapPreview = () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      setSwapMsg('Please enter a valid amount.');
      return;
    }
    if (swapFrom === swapTo) {
      setSwapMsg('Cannot swap same coin.');
      return;
    }
    const fromPrice = prices[swapFrom]?.price || 0;
    const toPrice = prices[swapTo]?.price || 0;
    if (!fromPrice || !toPrice) {
      setSwapMsg('Price not available.');
      return;
    }
    const fromUSD = parseFloat(swapAmount) * fromPrice;
    const toAmount = fromUSD / toPrice;
    setSwapPreview({ fromUSD, toAmount, rate: toPrice / fromPrice });
    setSwapMsg('');
  };

  const handleSwapConfirm = async () => {
    try {
      setSwapLoading(true);
      setSwapMsg('');
      const res = await swapAPI(swapFrom, swapTo, parseFloat(swapAmount));
      if (res.success) {
        setSwapMsg(`✓ Swapped ${swapAmount} ${swapFrom} → ${res.toAmount?.toFixed(6)} ${swapTo}`);
        setSwapAmount('');
        setSwapPreview(null);
        fetchWalletData();
        setTimeout(() => { setShowSwap(false); setSwapMsg(''); }, 2000);
      } else {
        setSwapMsg(res.message || 'Swap failed.');
      }
    } catch (err) {
      setSwapMsg('Swap failed. Please try again.');
    } finally {
      setSwapLoading(false);
    }
  };

  const handleMetaMaskDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setDepositMsg('Please enter a valid amount.');
      return;
    }
    try {
      setDepositLoading(true);
      setDepositMsg('');
      const res = await getDepositAddressAPI(depositCoin);
      if (!res.success) throw new Error('Failed to get deposit address');
      const vpxAddress = res.address;
      const amountInWei = (Math.floor(parseFloat(depositAmount) * 1e18)).toString(16);
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: localStorage.getItem('walletAddressFull'),
          to: vpxAddress,
          value: '0x' + amountInWei,
        }],
      });
      setDepositMsg(`✓ Transaction sent! Hash: ${txHash.slice(0, 20)}... Balance will update shortly.`);
      setDepositAmount('');
      setTimeout(() => fetchWalletData(), 30000);
    } catch (err) {
      if (err.code === 4001) {
        setDepositMsg('Transaction rejected by user.');
      } else {
        setDepositMsg('Transaction failed: ' + err.message);
      }
    } finally {
      setDepositLoading(false);
    }
  };

  // Payment Preferences handlers
  const handleSavePreferences = async () => {
    try {
      setPrefsLoading(true);
      setPrefsMsg('');
      const res = await fetch('https://vpx-backend.onrender.com/api/wallet/payment-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ priorityOrder, excludedCoins }),
      });
      const data = await res.json();
      if (data.success) {
        setPrefsMsg('✓ Payment preferences saved!');
        setTimeout(() => setPrefsMsg(''), 3000);
      } else {
        setPrefsMsg('Failed to save preferences.');
      }
    } catch (err) {
      setPrefsMsg('Error saving preferences.');
    } finally {
      setPrefsLoading(false);
    }
  };

  const toggleExclude = (coin) => {
    setExcludedCoins(prev =>
      prev.includes(coin) ? prev.filter(c => c !== coin) : [...prev, coin]
    );
  };

  const handleDragStart = (index) => setDragIndex(index);

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const newOrder = [...priorityOrder];
    const dragged = newOrder.splice(dragIndex, 1)[0];
    newOrder.splice(index, 0, dragged);
    setPriorityOrder(newOrder);
    setDragIndex(index);
  };

  const handleDragEnd = () => setDragIndex(null);

  const moveCoin = (index, direction) => {
    const newOrder = [...priorityOrder];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setPriorityOrder(newOrder);
  };

  const modalStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  };

  const modalCardStyle = {
    background: '#1E1E1E', border: '1px solid #333', borderRadius: '16px',
    padding: '28px', width: '420px', maxWidth: '90vw',
    maxHeight: '90vh', overflowY: 'auto',
  };

  const inputStyle = {
    width: '100%', background: '#2D2D2D', border: '1px solid #333',
    borderRadius: '10px', padding: '11px 14px', color: 'white',
    fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.9rem',
    marginBottom: '12px', boxSizing: 'border-box',
  };

  const selectStyle = { ...inputStyle };

  const btnStyle = (color) => ({
    background: color, borderRadius: '10px',
    padding: '12px 24px', color: color === 'transparent' ? '#AAA' : '#000',
    fontFamily: "'Space Grotesk', sans-serif", fontWeight: '700',
    fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
    border: color === 'transparent' ? '1px solid #333' : 'none',
  });

  const metaMaskConnected = !!localStorage.getItem('walletAddressFull');

  return (
    <div className="wallet-container">

      {/* WALLET HEADER */}
      <div className="wallet-header">
        <h1>My Wallet</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="wallet-address-badge">
            <span className="dot"></span>
            <span>{localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : 'VPX Wallet'}</span>
          </div>
        </div>
      </div>

      {/* BALANCE CARD */}
      <div className="balance-grid">
        <div className="balance-main-card">
          <div className="balance-label">Total Portfolio Value</div>
          <div className="balance-amount">
            {loadingData ? 'Loading...' : `$${getTotalValue()}`}
          </div>
          <span className="balance-change positive">▲ Live prices from Binance</span>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="wallet-actions">
        <button className="action-btn deposit" onClick={() => { setShowDeposit(true); setDepositMsg(''); setDepositAddressData(null); }}>⬇ Deposit</button>
        <button className="action-btn withdraw" onClick={() => { setShowWithdraw(true); setWithdrawMsg(''); }}>⬆ Withdraw</button>
        <button className="action-btn swap" onClick={() => { setShowSwap(true); setSwapMsg(''); setSwapPreview(null); }}>⇄ Swap</button>
      </div>

      {/* PAYMENT PREFERENCES */}
      <div style={{
        background: '#1E1E1E', border: '1px solid #333', borderRadius: '16px',
        padding: '20px', marginBottom: '24px',
      }}>
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => setShowPreferences(!showPreferences)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.1rem' }}>⚙️</span>
            <h3 style={{ margin: 0, color: 'white', fontSize: '1rem', fontWeight: '600' }}>Payment Preferences</h3>
            {excludedCoins.length > 0 && (
              <span style={{
                background: 'rgba(239,83,80,0.15)', color: '#ef5350',
                border: '1px solid rgba(239,83,80,0.3)', borderRadius: '20px',
                padding: '2px 8px', fontSize: '0.72rem',
              }}>
                {excludedCoins.length} excluded
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#888', fontSize: '0.78rem' }}>
              Priority: {priorityOrder.filter(c => !excludedCoins.includes(c)).slice(0, 3).join(' → ')}...
            </span>
            <span style={{ color: '#888', fontSize: '1rem' }}>{showPreferences ? '▲' : '▾'}</span>
          </div>
        </div>

        {showPreferences && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ color: '#888', fontSize: '0.82rem', marginBottom: '16px', lineHeight: '1.5' }}>
              Drag to reorder payment priority. Excluded coins will never be used for POS payments.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {priorityOrder.map((coin, index) => {
                const isExcluded = excludedCoins.includes(coin);
                return (
                  <div
                    key={coin}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      background: isExcluded ? 'rgba(239,83,80,0.05)' : '#2D2D2D',
                      border: `1px solid ${isExcluded ? 'rgba(239,83,80,0.2)' : '#444'}`,
                      borderRadius: '10px', padding: '10px 14px',
                      cursor: 'grab', opacity: isExcluded ? 0.5 : 1,
                      transition: 'all 0.2s',
                    }}
                  >
                    {/* Drag handle */}
                    <span style={{ color: '#555', fontSize: '0.9rem', cursor: 'grab' }}>⠿</span>

                    {/* Priority number */}
                    <span style={{
                      background: isExcluded ? '#333' : 'rgba(0,240,255,0.1)',
                      color: isExcluded ? '#555' : '#00F0FF',
                      border: `1px solid ${isExcluded ? '#444' : 'rgba(0,240,255,0.2)'}`,
                      borderRadius: '50%', width: '24px', height: '24px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.72rem', fontWeight: '700', flexShrink: 0,
                    }}>
                      {isExcluded ? '✕' : index + 1}
                    </span>

                    {/* Coin icon + name */}
                    <span style={{ fontSize: '1rem' }}>{COIN_ICONS[coin]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: isExcluded ? '#555' : 'white', fontSize: '0.88rem', fontWeight: '600' }}>
                        {coin}
                      </div>
                      <div style={{ color: '#666', fontSize: '0.72rem' }}>{COIN_NAMES[coin]}</div>
                    </div>

                    {/* Move up/down buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button
                        onClick={() => moveCoin(index, -1)}
                        disabled={index === 0}
                        style={{
                          background: 'none', border: '1px solid #444', borderRadius: '4px',
                          color: index === 0 ? '#444' : '#888', cursor: index === 0 ? 'not-allowed' : 'pointer',
                          padding: '1px 5px', fontSize: '0.6rem', lineHeight: 1,
                        }}
                      >▲</button>
                      <button
                        onClick={() => moveCoin(index, 1)}
                        disabled={index === priorityOrder.length - 1}
                        style={{
                          background: 'none', border: '1px solid #444', borderRadius: '4px',
                          color: index === priorityOrder.length - 1 ? '#444' : '#888',
                          cursor: index === priorityOrder.length - 1 ? 'not-allowed' : 'pointer',
                          padding: '1px 5px', fontSize: '0.6rem', lineHeight: 1,
                        }}
                      >▼</button>
                    </div>

                    {/* Exclude toggle */}
                    <button
                      onClick={() => toggleExclude(coin)}
                      style={{
                        background: isExcluded ? 'rgba(38,166,154,0.1)' : 'rgba(239,83,80,0.1)',
                        border: `1px solid ${isExcluded ? 'rgba(38,166,154,0.3)' : 'rgba(239,83,80,0.3)'}`,
                        borderRadius: '8px', padding: '4px 10px',
                        color: isExcluded ? '#26a69a' : '#ef5350',
                        cursor: 'pointer', fontSize: '0.72rem', fontWeight: '600',
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {isExcluded ? '+ Include' : '— Exclude'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Info box */}
            <div style={{
              background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.1)',
              borderRadius: '10px', padding: '12px', marginTop: '16px',
            }}>
              <div style={{ color: '#00F0FF', fontSize: '0.78rem', fontWeight: '600', marginBottom: '4px' }}>
                ℹ️ How it works
              </div>
              <div style={{ color: '#888', fontSize: '0.75rem', lineHeight: '1.5' }}>
                During POS payments, coins are used in priority order. If your #1 coin doesn't have enough balance, the system moves to #2, and so on. Excluded coins are never used.
              </div>
            </div>

            {/* Save button */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', alignItems: 'center' }}>
              <button
                style={{ ...btnStyle('linear-gradient(135deg, #00F0FF, #0096a8)'), flex: 1 }}
                onClick={handleSavePreferences}
                disabled={prefsLoading}
              >
                {prefsLoading ? 'Saving...' : '💾 Save Preferences'}
              </button>
            </div>

            {prefsMsg && (
              <div style={{
                padding: '10px', borderRadius: '8px', marginTop: '12px', fontSize: '0.85rem',
                background: prefsMsg.includes('✓') ? 'rgba(38,166,154,0.1)' : 'rgba(239,83,80,0.1)',
                color: prefsMsg.includes('✓') ? '#26a69a' : '#ef5350',
                border: `1px solid ${prefsMsg.includes('✓') ? 'rgba(38,166,154,0.3)' : 'rgba(239,83,80,0.3)'}`,
              }}>
                {prefsMsg}
              </div>
            )}
          </div>
        )}
      </div>

      {/* HOLDINGS + HISTORY */}
      <div className="wallet-bottom">
        <div className="holdings-section">
          <div className="section-header">
            <h3>Holdings</h3>
            <span>{balances.filter(b => b.amount > 0).length} assets</span>
          </div>
          <div className="holdings-list">
            {loadingData ? (
              <div style={{ color: '#888', padding: '20px', textAlign: 'center' }}>Loading balances...</div>
            ) : balances.filter(b => b.amount > 0).length === 0 ? (
              <div style={{ color: '#888', padding: '20px', textAlign: 'center' }}>No holdings yet. Make a deposit to get started.</div>
            ) : (
              balances.filter(b => b.amount > 0).map((b, i) => (
                <div className="holding-item" key={i}>
                  <div className="holding-left">
                    <div className="holding-icon">{COIN_ICONS[b.coin] || '🪙'}</div>
                    <div>
                      <div className="holding-name">{COIN_NAMES[b.coin] || b.coin}</div>
                      <div className="holding-symbol">{b.coin}</div>
                    </div>
                  </div>
                  <div className="holding-right">
                    <div className="holding-value">${getHoldingUSDValue(b.coin, b.amount)}</div>
                    <div className="holding-amount">{b.amount.toFixed(6)} {b.coin}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="history-section">
          <div className="section-header">
            <h3>Transaction History</h3>
            <span>{transactions.length} transactions</span>
          </div>
          <div className="history-list">
            {loadingData ? (
              <div style={{ color: '#888', padding: '20px', textAlign: 'center' }}>Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <div style={{ color: '#888', padding: '20px', textAlign: 'center' }}>No transactions yet.</div>
            ) : (
              transactions.map((tx, i) => (
                <div className="history-item" key={i}>
                  <div className="history-left">
                    <div className={`history-icon ${tx.type}`}>
                      {tx.type === 'deposit' ? '⬇' : tx.type === 'withdraw' ? '⬆' : '⇄'}
                    </div>
                    <div>
                      <div className="history-type">
                        {tx.type === 'swap'
                          ? `Swap ${tx.fromCoin} → ${tx.toCoin}`
                          : `${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} ${tx.coin}`}
                      </div>
                      <div className="history-date">{formatDate(tx.createdAt)}</div>
                    </div>
                  </div>
                  <div className="history-right">
                    <div className={`history-amount ${tx.type === 'deposit' ? 'positive' : tx.type === 'withdraw' ? 'negative' : 'neutral'}`}>
                      {tx.type === 'swap'
                        ? `${tx.fromAmount} ${tx.fromCoin}`
                        : `${tx.type === 'withdraw' ? '-' : '+'}${tx.amount} ${tx.coin}`}
                    </div>
                    <div className="history-usd">{tx.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* DEPOSIT MODAL */}
      {showDeposit && (
        <div style={modalStyle} onClick={() => { setShowDeposit(false); setDepositAddressData(null); setDepositMsg(''); }}>
          <div style={modalCardStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#00F0FF', margin: 0 }}>⬇ Deposit</h3>
              <button onClick={() => { setShowDeposit(false); setDepositAddressData(null); setDepositMsg(''); }} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            <label style={{ color: '#888', fontSize: '0.82rem', display: 'block', marginBottom: '6px' }}>Select Coin</label>
            <select
              style={selectStyle}
              value={depositCoin}
              onChange={e => { setDepositCoin(e.target.value); setDepositAddressData(null); setDepositMsg(''); }}
            >
              {SUPPORTED_COINS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {(depositCoin === 'ETH' || depositCoin === 'SOL') ? (
              <div>
                {metaMaskConnected && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ background: 'rgba(38,166,154,0.08)', border: '1px solid rgba(38,166,154,0.2)', borderRadius: '10px', padding: '12px', marginBottom: '10px' }}>
                      <div style={{ color: '#26a69a', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>🦊 MetaMask Connected</div>
                      <div style={{ color: '#888', fontSize: '0.78rem' }}>Send directly from MetaMask without copying address</div>
                    </div>
                    <input
                      style={inputStyle}
                      type="number"
                      placeholder="Enter amount to deposit"
                      value={depositAmount}
                      onChange={e => setDepositAmount(e.target.value)}
                    />
                    {depositAmount && pricesLoaded && (
                      <div style={{ color: '#888', fontSize: '0.82rem', marginBottom: '12px' }}>
                        ≈ ${((parseFloat(depositAmount) || 0) * (prices[depositCoin]?.price || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                      </div>
                    )}
                    <button
                      style={{ ...btnStyle('linear-gradient(135deg, #26a69a, #1e8a7a)'), width: '100%', marginBottom: '10px' }}
                      onClick={handleMetaMaskDeposit}
                      disabled={depositLoading}
                    >
                      {depositLoading ? 'Sending...' : '🦊 Send via MetaMask'}
                    </button>
                    <div style={{ textAlign: 'center', color: '#555', fontSize: '0.78rem', marginBottom: '10px' }}>— or copy address manually —</div>
                  </div>
                )}
                {!depositAddressData ? (
                  <button
                    style={{ ...btnStyle('linear-gradient(135deg, #00F0FF, #0096a8)'), width: '100%', marginBottom: '12px' }}
                    onClick={async () => {
                      setLoadingAddress(true);
                      const res = await getDepositAddressAPI(depositCoin);
                      if (res.success) setDepositAddressData(res);
                      setLoadingAddress(false);
                    }}
                    disabled={loadingAddress}
                  >
                    {loadingAddress ? 'Generating address...' : 'Get Deposit Address'}
                  </button>
                ) : (
                  <div>
                    <div style={{ background: '#2D2D2D', border: '1px solid #333', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
                      <div style={{ color: '#888', fontSize: '0.75rem', marginBottom: '6px' }}>{depositCoin === 'ETH' ? 'Your ETH Deposit Address (Sepolia Testnet)' : 'Your SOL Deposit Address (Solana Devnet)'}</div>
                      <div style={{ color: '#00F0FF', fontSize: '0.82rem', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                        {depositAddressData.address}
                      </div>
                      <button
                        onClick={() => { navigator.clipboard.writeText(depositAddressData.address); }}
                        style={{ marginTop: '10px', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(49, 66, 67, 0.2)', borderRadius: '8px', padding: '6px 14px', color: '#00F0FF', cursor: 'pointer', fontSize: '0.8rem', fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        📋 Copy Address
                      </button>
                    </div>
                    <div style={{ background: 'rgba(255,152,0,0.08)', border: '1px solid rgba(255,152,0,0.2)', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
                      <div style={{ color: '#FF9800', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>⚠️ Important</div>
                      <div style={{ color: '#888', fontSize: '0.78rem', lineHeight: '1.5' }}>
                        {depositCoin === 'ETH'
                          ? 'Only send ETH on Sepolia Testnet to this address.'
                          : 'Only send SOL on Solana Devnet to this address.'
                        }
                      </div>
                    </div>
                    <div style={{ color: '#888', fontSize: '0.78rem', textAlign: 'center' }}>
                      After sending, your balance will update automatically within 1-2 minutes.
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label style={{ color: '#888', fontSize: '0.82rem', display: 'block', marginBottom: '6px' }}>Amount</label>
                <input
                  style={inputStyle}
                  type="number"
                  placeholder={`Enter ${depositCoin} amount`}
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                />
                {depositAmount && pricesLoaded && (
                  <div style={{ color: '#888', fontSize: '0.82rem', marginBottom: '12px' }}>
                    ≈ ${((parseFloat(depositAmount) || 0) * (prices[depositCoin]?.price || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={btnStyle('transparent')} onClick={() => setShowDeposit(false)}>Cancel</button>
                  <button
                    style={{ ...btnStyle('linear-gradient(135deg, #00F0FF, #0096a8)'), flex: 1 }}
                    onClick={handleDeposit}
                    disabled={depositLoading}
                  >
                    {depositLoading ? 'Processing...' : 'Confirm Deposit'}
                  </button>
                </div>
              </div>
            )}
            {depositMsg && (
              <div style={{
                padding: '10px', borderRadius: '8px', marginTop: '12px', fontSize: '0.85rem',
                background: depositMsg.includes('✓') ? 'rgba(38,166,154,0.1)' : 'rgba(239,83,80,0.1)',
                color: depositMsg.includes('✓') ? '#26a69a' : '#ef5350',
                border: `1px solid ${depositMsg.includes('✓') ? 'rgba(38,166,154,0.3)' : 'rgba(239,83,80,0.3)'}`,
              }}>
                {depositMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}
      {showWithdraw && (
        <div style={modalStyle} onClick={() => setShowWithdraw(false)}>
          <div style={modalCardStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#FF9800', margin: 0 }}>⬆ Withdraw</h3>
              <button onClick={() => setShowWithdraw(false)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            <label style={{ color: '#888', fontSize: '0.82rem', display: 'block', marginBottom: '6px' }}>Select Coin</label>
            <select style={selectStyle} value={withdrawCoin} onChange={e => setWithdrawCoin(e.target.value)}>
              {SUPPORTED_COINS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label style={{ color: '#888', fontSize: '0.82rem', display: 'block', marginBottom: '6px' }}>Amount</label>
            <input
              style={inputStyle}
              type="number"
              placeholder={`Enter ${withdrawCoin} amount`}
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
            />
            <label style={{ color: '#888', fontSize: '0.82rem', display: 'block', marginBottom: '6px' }}>Destination Address</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="Enter wallet address"
              value={withdrawAddress || localStorage.getItem('walletAddressFull') || ''}
              onChange={e => setWithdrawAddress(e.target.value)}
            />
            {withdrawMsg && (
              <div style={{
                padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem',
                background: withdrawMsg.includes('✓') ? 'rgba(38,166,154,0.1)' : 'rgba(239,83,80,0.1)',
                color: withdrawMsg.includes('✓') ? '#26a69a' : '#ef5350',
                border: `1px solid ${withdrawMsg.includes('✓') ? 'rgba(38,166,154,0.3)' : 'rgba(239,83,80,0.3)'}`,
              }}>
                {withdrawMsg}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={btnStyle('transparent')} onClick={() => setShowWithdraw(false)}>Cancel</button>
              <button
                style={{ ...btnStyle('#FF9800'), flex: 1 }}
                onClick={handleWithdraw}
                disabled={withdrawLoading}
              >
                {withdrawLoading ? 'Processing...' : 'Confirm Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SWAP MODAL */}
      {showSwap && (
        <div style={modalStyle} onClick={() => setShowSwap(false)}>
          <div style={modalCardStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#FF9800', margin: 0 }}>⇄ Swap</h3>
              <button onClick={() => setShowSwap(false)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            <label style={{ color: '#888', fontSize: '0.82rem', display: 'block', marginBottom: '6px' }}>From</label>
            <select style={selectStyle} value={swapFrom} onChange={e => { setSwapFrom(e.target.value); setSwapPreview(null); }}>
              {SUPPORTED_COINS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label style={{ color: '#888', fontSize: '0.82rem', display: 'block', marginBottom: '6px' }}>To</label>
            <select style={selectStyle} value={swapTo} onChange={e => { setSwapTo(e.target.value); setSwapPreview(null); }}>
              {SUPPORTED_COINS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label style={{ color: '#888', fontSize: '0.82rem', display: 'block', marginBottom: '6px' }}>Amount ({swapFrom})</label>
            <input
              style={inputStyle}
              type="number"
              placeholder={`Enter ${swapFrom} amount`}
              value={swapAmount}
              onChange={e => { setSwapAmount(e.target.value); setSwapPreview(null); }}
            />
            {swapPreview && (
              <div style={{ background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
                <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '6px' }}>Swap Preview</div>
                <div style={{ color: 'white', fontWeight: '600' }}>
                  {swapAmount} {swapFrom} → {swapPreview.toAmount.toFixed(6)} {swapTo}
                </div>
                <div style={{ color: '#888', fontSize: '0.78rem', marginTop: '4px' }}>
                  ≈ ${swapPreview.fromUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </div>
              </div>
            )}
            {swapMsg && (
              <div style={{
                padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem',
                background: swapMsg.includes('✓') ? 'rgba(38,166,154,0.1)' : 'rgba(239,83,80,0.1)',
                color: swapMsg.includes('✓') ? '#26a69a' : '#ef5350',
                border: `1px solid ${swapMsg.includes('✓') ? 'rgba(38,166,154,0.3)' : 'rgba(239,83,80,0.3)'}`,
              }}>
                {swapMsg}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={btnStyle('transparent')} onClick={() => setShowSwap(false)}>Cancel</button>
              {!swapPreview ? (
                <button style={{ ...btnStyle('#FF9800'), flex: 1 }} onClick={handleSwapPreview}>
                  Preview Swap
                </button>
              ) : (
                <button
                  style={{ ...btnStyle('#FF9800'), flex: 1 }}
                  onClick={handleSwapConfirm}
                  disabled={swapLoading}
                >
                  {swapLoading ? 'Swapping...' : 'Confirm Swap'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default React.memo(Wallet);