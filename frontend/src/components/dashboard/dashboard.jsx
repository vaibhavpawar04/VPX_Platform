import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './sidebar/sidebar';
import Markets from './markets/markets';
import Trade from './trade/trade';
import Wallet from './wallet/wallet';
import POS from './pos/pos';
import Portfolio from './portfolio/portfolio';
import Profile from './profile/profile';
import Security from './security/security';
import Notifications from './notifications/notifications';
import Help from './help/help';
import Ticket from './ticket/ticket';
import './dashboard.css';

const Dashboard = () => {
  const location = useLocation();

  const [news, setNews] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState(() => localStorage.getItem('walletAddress') || '');
  const [walletName, setWalletName] = useState(() => localStorage.getItem('walletName') || '');
  const [connectingWallet, setConnectingWallet] = useState(null);
  const [walletError, setWalletError] = useState('');

  const detectWallets = () => {
    const wallets = [];
    if (window.ethereum) {
      if (window.ethereum.isRabby) {
        wallets.push({ id: 'rabby', name: 'Rabby Wallet', icon: '🐰', type: 'ethereum' });
      } else if (window.ethereum.isCoinbaseWallet) {
        wallets.push({ id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵', type: 'ethereum' });
      } else if (window.ethereum.isTrust) {
        wallets.push({ id: 'trustwallet', name: 'Trust Wallet', icon: '🛡️', type: 'ethereum' });
      } else if (window.ethereum.isMetaMask) {
        wallets.push({ id: 'metamask', name: 'MetaMask', icon: '🦊', type: 'ethereum' });
      }
    }
    if (window.solana?.isPhantom) {
      wallets.push({ id: 'phantom', name: 'Phantom', icon: '👻', type: 'solana' });
    }
    return wallets;
  };

  const connectEthereum = async (wallet) => {
    try {
      setConnectingWallet(wallet.id);
      setWalletError('');

      // Force MetaMask to show account selector
      try {
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch (e) {
        // ignore if not supported
      }

      // Request permissions to show account picker
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0xaa36a7') {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }],
          });
        } catch (switchErr) {
          setConnectingWallet(null);
          setWalletError('Please switch MetaMask to Sepolia Testnet and try again.');
          return;
        }
      }

      const address = accounts[0];
      const short = `${address.slice(0, 6)}...${address.slice(-4)}`;

      localStorage.setItem('walletAddress', short);
      localStorage.setItem('walletAddressFull', address);
      localStorage.setItem('walletName', wallet.name);
      localStorage.setItem('walletNetwork', 'sepolia');

      setWalletAddress(short);
      setWalletName(wallet.name);
      setConnectingWallet(null);
      setShowWalletModal(false);

    } catch (err) {
      setConnectingWallet(null);
      setWalletError(err.code === 4001 ? 'Connection rejected.' : 'Failed to connect.');
    }
  };

  const connectSolana = async (wallet) => {
    try {
      setConnectingWallet(wallet.id);
      setWalletError('');
      const response = await window.solana.connect();
      const address = response.publicKey.toString();
      const short = `${address.slice(0, 6)}...${address.slice(-4)}`;
      localStorage.setItem('walletAddress', short);
      localStorage.setItem('walletAddressFull', address);
      localStorage.setItem('walletName', wallet.name);
      localStorage.setItem('walletNetwork', 'solana');
      setWalletAddress(short);
      setWalletName(wallet.name);
      setConnectingWallet(null);
      setShowWalletModal(false);
    } catch (err) {
      setConnectingWallet(null);
      setWalletError(err.code === 4001 ? 'Connection rejected.' : 'Failed to connect.');
    }
  };

  const handleWalletConnect = (wallet) => {
    if (wallet.type === 'ethereum') connectEthereum(wallet);
    else if (wallet.type === 'solana') connectSolana(wallet);
  };

  const handleWalletDisconnect = () => {
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletAddressFull');
    localStorage.removeItem('walletName');
    localStorage.removeItem('walletNetwork');
    setWalletAddress('');
    setWalletName('');
  };


  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('https://vpx-backend.onrender.com/api/news');
        const data = await res.json();
        if (data.success) setNews(data.data);
      } catch (err) {
        console.log('News fetch error:', err);
      }
    };
    fetchNews();
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const res = await fetch("https://vpx-backend.onrender.com/api/portfolio/watchlist", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setWatchlist(data.data);
      } catch (err) {
        console.log("Watchlist fetch error:", err);
      }
    };
    fetchWatchlist();
    const interval = setInterval(fetchWatchlist, 30 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  const formatPrice = (symbol, price) => {
    if (price === null) return '---';
    if (price >= 1000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${price.toFixed(2)}`;
  };

  const getPageTitle = () => {
    if (location.pathname.includes('/markets')) return 'Markets';
    if (location.pathname.includes('/trade')) return 'Trade';
    if (location.pathname.includes('/wallet')) return 'Wallet';
    if (location.pathname.includes('/pos')) return 'POS Terminal';
    if (location.pathname.includes('/portfolio')) return 'Portfolio';
    if (location.pathname.includes('/profile')) return 'Profile';
    if (location.pathname.includes('/security')) return 'Security';
    if (location.pathname.includes('/notifications')) return 'Notifications';
    if (location.pathname.includes('/help')) return 'Help Center';
    if (location.pathname.includes('/ticket')) return 'Support Ticket';
    return 'Home';
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <div className="content-header">
          <h1>{getPageTitle()}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'rgba(0,240,255,0.08)',
              border: '1px solid rgba(0,240,255,0.2)',
              borderRadius: '10px',
              padding: '8px 16px',
              color: '#00F0FF',
              fontSize: '0.85rem',
              fontWeight: '600',
            }}>
              👤 {user.name || 'VPX User'}
            </div>
            {walletAddress ? (
              <button
                className="connect-btn"
                onClick={handleWalletDisconnect}
                style={{ background: 'rgba(38,166,154,0.1)', border: '1px solid #26a69a', color: '#26a69a' }}
              >
                🟢 {walletName} · {walletAddress}
              </button>
            ) : (
              <button
                className="connect-btn"
                onClick={() => { setShowWalletModal(true); setWalletError(''); }}
              >
                🔗 Connect Wallet
              </button>
            )}
          </div>
        </div>

        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/trade" element={<Trade />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/security" element={<Security />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/help" element={<Help />} />
          <Route path="/ticket" element={<Ticket />} />
        </Routes>
      </div>

      <div className="right-sidebar">
        <div className="prices-section">
          <h3>Watchlist</h3>
          {watchlist.length === 0 ? (
            <div className="price-item"><span>Loading...</span></div>
          ) : (
            watchlist.map((coin) => (
              <div className="price-item" key={coin.symbol}>
                <span>{coin.symbol}</span>
                <span>{formatPrice(coin.symbol, coin.price)}</span>
                <span style={{ color: coin.positive ? "#10B981" : "#FF3B3B" }}>
                  {coin.positive ? "\u25b2" : "\u25bc"}
                </span>
              </div>
            ))
          )}
        </div>
        <div className="news-section">
          <h3>Latest News</h3>
          {news.length === 0 ? (
            <div className="news-item"><p>Loading news...</p></div>
          ) : (
            news.map((item, i) => (
              <div className="news-item" key={i}>
                <p>{item.title}</p>
                <span style={{ color: '#FF9800', fontSize: '0.8rem' }}>{item.time} · {item.source}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* WALLET CONNECT MODAL */}
      {showWalletModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setShowWalletModal(false)}>
          <div style={{
            background: '#1E1E1E', border: '1px solid #333', borderRadius: '16px',
            padding: '28px', width: '380px', maxWidth: '90vw',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: 'white', margin: 0 }}>Connect Wallet</h3>
              <button onClick={() => setShowWalletModal(false)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {walletError && (
              <div style={{
                padding: '10px', borderRadius: '8px', marginBottom: '12px',
                background: 'rgba(239,83,80,0.1)', border: '1px solid rgba(239,83,80,0.3)',
                color: '#ef5350', fontSize: '0.82rem'
              }}>
                {walletError}
              </div>
            )}

            {detectWallets().length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
                <div style={{ color: 'white', fontWeight: '600', marginBottom: '8px' }}>No Wallets Detected</div>
                <div style={{ color: '#888', fontSize: '0.85rem' }}>Please install MetaMask or Phantom to continue</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {detectWallets().map(wallet => (
                  <button
                    key={wallet.id}
                    onClick={() => handleWalletConnect(wallet)}
                    disabled={!!connectingWallet}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '14px 16px', background: '#2D2D2D',
                      border: '1px solid #333', borderRadius: '12px',
                      color: 'white', cursor: 'pointer', width: '100%',
                      fontFamily: "'Space Grotesk', sans-serif",
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{wallet.icon}</span>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{wallet.name}</div>
                      <div style={{ color: '#26a69a', fontSize: '0.75rem' }}>
                        {connectingWallet === wallet.id ? 'Connecting...' : 'Detected · Ready to connect'}
                      </div>
                    </div>
                    <span style={{ color: '#555' }}>
                      {connectingWallet === wallet.id ? '⏳' : '›'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;