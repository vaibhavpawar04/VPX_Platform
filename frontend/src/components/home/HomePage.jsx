import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import TickerStrip from './TickerStrip';
import VPXLogo from '../common/VPXLogo';

const HomePage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const chains = [
    { name: 'Ethereum', symbol: 'ETH', color: '#627EEA', network: 'Sepolia', dex: 'Uniswap V3' },
    { name: 'Solana', symbol: 'SOL', color: '#9945FF', network: 'Devnet', dex: 'Orca Whirlpools' },
    { name: 'Base', symbol: 'BASE', color: '#0052FF', network: 'Base Sepolia', dex: 'Uniswap V3' },
    { name: 'Arbitrum', symbol: 'ARB', color: '#12AAFF', network: 'Arb Sepolia', dex: 'Uniswap V3' },
  ];

  const SettlementIcon = () => (
    <svg width='40' height='40' viewBox='-36 -36 72 72' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <polyline points='-8,-24 -8,-4 4,-4 4,4 -16,4 -16,24 8,24' stroke='#00F0FF' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
      <circle cx='12' cy='-20' r='4' stroke='#00F0FF' strokeWidth='1.5'/>
      <line x1='12' y1='-16' x2='12' y2='-8' stroke='#00F0FF' strokeWidth='1.5'/>
      <circle cx='-20' cy='20' r='4' stroke='#00F0FF' strokeWidth='1.5'/>
    </svg>
  );
  const SwapIcon = () => (
    <svg width='40' height='40' viewBox='-36 -36 72 72' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M -16,-8 A 20,20 0 0,1 16,-8' stroke='#4D7EFF' strokeWidth='2' strokeLinecap='round'/>
      <polyline points='10,-16 16,-8 8,-4' stroke='#4D7EFF' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
      <path d='M 16,8 A 20,20 0 0,1 -16,8' stroke='#4D7EFF' strokeWidth='2' strokeLinecap='round'/>
      <polyline points='-10,16 -16,8 -8,4' stroke='#4D7EFF' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
      <circle cx='-22' cy='-8' r='5' fill='#4D7EFF' fillOpacity='0.15' stroke='#4D7EFF' strokeWidth='1.5'/>
      <circle cx='22' cy='8' r='5' fill='#4D7EFF' fillOpacity='0.15' stroke='#4D7EFF' strokeWidth='1.5'/>
    </svg>
  );
  const GlobalIcon = () => (
    <svg width='40' height='40' viewBox='-36 -36 72 72' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='0' cy='0' r='20' stroke='#10B981' strokeWidth='1.5'/>
      <ellipse cx='0' cy='0' rx='10' ry='20' stroke='#10B981' strokeWidth='1' strokeDasharray='3,2'/>
      <line x1='-20' y1='0' x2='20' y2='0' stroke='#10B981' strokeWidth='1' strokeDasharray='3,2'/>
      <line x1='-18' y1='-9' x2='18' y2='-9' stroke='#10B981' strokeWidth='1' strokeDasharray='3,2'/>
      <line x1='-18' y1='9' x2='18' y2='9' stroke='#10B981' strokeWidth='1' strokeDasharray='3,2'/>
      <circle cx='14' cy='-14' r='5' fill='#10B981' fillOpacity='0.2' stroke='#10B981' strokeWidth='1.5'/>
    </svg>
  );
  const PrefsIcon = () => (
    <svg width='40' height='40' viewBox='-36 -36 72 72' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <line x1='-20' y1='-14' x2='20' y2='-14' stroke='#F59E0B' strokeWidth='1.5' strokeLinecap='round'/>
      <circle cx='4' cy='-14' r='5' fill='#12151C' stroke='#F59E0B' strokeWidth='2'/>
      <line x1='-20' y1='0' x2='20' y2='0' stroke='#F59E0B' strokeWidth='1.5' strokeLinecap='round'/>
      <circle cx='-6' cy='0' r='5' fill='#12151C' stroke='#F59E0B' strokeWidth='2'/>
      <line x1='-20' y1='14' x2='20' y2='14' stroke='#F59E0B' strokeWidth='1.5' strokeLinecap='round'/>
      <circle cx='10' cy='14' r='5' fill='#12151C' stroke='#F59E0B' strokeWidth='2'/>
    </svg>
  );
  const ChainIcon = () => (
    <svg width='40' height='40' viewBox='-36 -36 72 72' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <rect x='-20' y='-16' width='16' height='10' rx='5' stroke='#8B5CF6' strokeWidth='1.8'/>
      <rect x='4' y='-16' width='16' height='10' rx='5' stroke='#8B5CF6' strokeWidth='1.8'/>
      <rect x='-12' y='6' width='16' height='10' rx='5' stroke='#8B5CF6' strokeWidth='1.8'/>
      <line x1='-4' y1='-11' x2='4' y2='-11' stroke='#8B5CF6' strokeWidth='1.8'/>
      <line x1='-12' y1='-11' x2='-12' y2='6' stroke='#8B5CF6' strokeWidth='1.8' strokeDasharray='2,2'/>
      <polyline points='-6,20 -2,24 8,16' stroke='#10B981' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round'/>
    </svg>
  );
  const MultiChainIcon = () => (
    <svg width='40' height='40' viewBox='-36 -36 72 72' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <polygon points='0,-22 10,-16 10,-4 0,2 -10,-4 -10,-16' stroke='#EF4444' strokeWidth='1.5' strokeOpacity='0.4'/>
      <polygon points='0,-12 12,-5 12,10 0,17 -12,10 -12,-5' stroke='#EF4444' strokeWidth='1.5' strokeOpacity='0.6'/>
      <polygon points='0,-2 14,6 14,22 0,30 -14,22 -14,6' stroke='#EF4444' strokeWidth='2'/>
      <circle cx='0' cy='14' r='3' fill='#EF4444' fillOpacity='0.5'/>
    </svg>
  );
  const SplitPaymentIcon = () => (
    <svg width="40" height="40" viewBox="-36 -36 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="0" cy="-20" r="4" stroke="#EC4899" strokeWidth="2"/>
      <path d="M 0,-16 L 0,-4" stroke="#EC4899" strokeWidth="2"/>
      <path d="M 0,-4 L -16,10" stroke="#EC4899" strokeWidth="2"/>
      <path d="M 0,-4 L 0,10" stroke="#EC4899" strokeWidth="2"/>
      <path d="M 0,-4 L 16,10" stroke="#EC4899" strokeWidth="2"/>
      <circle cx="-16" cy="16" r="4" stroke="#EC4899" strokeWidth="2" fill="#EC489920"/>
      <circle cx="0" cy="16" r="4" stroke="#EC4899" strokeWidth="2" fill="#EC489920"/>
      <circle cx="16" cy="16" r="4" stroke="#EC4899" strokeWidth="2" fill="#EC489920"/>
    </svg>
  );
  const PortfolioTrackingIcon = () => (
    <svg width="40" height="40" viewBox="-36 -36 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M -20,20 L -20,-18" stroke="#22D3EE" strokeWidth="1.5" strokeOpacity="0.4"/>
      <path d="M -20,20 L 20,20" stroke="#22D3EE" strokeWidth="1.5" strokeOpacity="0.4"/>
      <polyline points="-18,10 -8,0 2,6 18,-16" stroke="#22D3EE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="10,-16 18,-16 18,-8" stroke="#22D3EE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  const WatchlistIcon = () => (
    <svg width="40" height="40" viewBox="-36 -36 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M -22,0 C -16,-14 16,-14 22,0 C 16,14 -16,14 -22,0 Z" stroke="#A78BFA" strokeWidth="2"/>
      <circle cx="0" cy="0" r="7" stroke="#A78BFA" strokeWidth="2"/>
      <circle cx="0" cy="0" r="2.5" fill="#A78BFA"/>
    </svg>
  );

  const features = [
    { icon: <SettlementIcon />, title: 'Sub-2s Settlement', desc: 'Faster than traditional card networks. Every payment confirmed and settled in under 2 seconds via real DEX swaps.', color: '#00F0FF' },
    { icon: <SwapIcon />, title: 'Auto DEX Liquidation', desc: 'Crypto is automatically swapped to USDC via Uniswap V3 and Orca Whirlpools — no manual steps.', color: '#4D7EFF' },
    { icon: <GlobalIcon />, title: '20+ Fiat Currencies', desc: 'Merchants receive GBP, EUR, USD, INR and 17 more currencies via live exchange rates.', color: '#10B981' },
    { icon: <PrefsIcon />, title: 'Payment Preferences', desc: 'Choose which coins get spent first, or exclude specific assets entirely from payments.', color: '#F59E0B' },
    { icon: <ChainIcon />, title: 'On-Chain Proof', desc: 'Every transaction produces a verifiable hash on Etherscan or Solscan. Fully transparent.', color: '#8B5CF6' },
    { icon: <MultiChainIcon />, title: 'Multi-Chain Wallet', desc: 'One wallet, four blockchains. ETH, SOL, BASE and ARB — auto-generated on signup.', color: '#EF4444' },
    { icon: <SplitPaymentIcon />, title: 'Flexible Payment Splitting', desc: 'Pay with priority order, portfolio-weighted split, or send crypto directly to merchants who accept it.', color: '#EC4899' },
    { icon: <PortfolioTrackingIcon />, title: 'Live Portfolio Tracking', desc: 'Track P&L across 1D, 1W, 1M, 3M and 1Y with real historical snapshots — not estimates.', color: '#22D3EE' },
    { icon: <WatchlistIcon />, title: 'Custom Watchlist', desc: 'Track any coin you care about — add or remove instantly, saved to your account.', color: '#A78BFA' },
  ];

  const steps = [
    { icon: (
        <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
          <rect x='2' y='5' width='20' height='14' rx='2'/><line x1='2' y1='10' x2='22' y2='10'/>
          <line x1='6' y1='15' x2='10' y2='15'/>
        </svg>
      ), title: 'Customer Taps', desc: 'VPX card at any NFC terminal worldwide', color: '#00F0FF' },
    { icon: (
        <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
          <polyline points='13 2 13 9 22 9'/><polyline points='11 22 11 15 2 15'/>
          <path d='M22 9L13 2 2 9'/><path d='M2 15l9 7 11-7'/>
        </svg>
      ), title: 'Crypto Deducted', desc: 'Split by priority, portfolio weight, or your custom preference', color: '#4D7EFF' },
    { icon: (
        <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
          <path d='M3 8 A11 11 0 0 1 21 8'/><polyline points='17 4 21 8 17 12'/>
          <path d='M21 16 A11 11 0 0 1 3 16'/><polyline points='7 20 3 16 7 12'/>
        </svg>
      ), title: 'DEX Swap or Direct', desc: 'Auto-swapped via Uniswap/Orca, or sent as crypto if merchant accepts it', color: '#8B5CF6' },
    { icon: (
        <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
          <rect x='2' y='7' width='20' height='14' rx='2'/>
          <path d='M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2'/>
          <line x1='12' y1='12' x2='12' y2='16'/><line x1='10' y1='14' x2='14' y2='14'/>
        </svg>
      ), title: 'Merchant Paid', desc: 'Fiat in their local currency instantly', color: '#10B981' },
  ];

  const techStack = [
    { name: 'Uniswap V3', role: 'ETH DEX', color: '#FF007A' },
    { name: 'Orca', role: 'SOL DEX', color: '#00C2B4' },
    { name: 'Alchemy', role: 'ETH RPC', color: '#4D7EFF' },
    { name: 'Helius', role: 'SOL RPC', color: '#9945FF' },
    { name: 'Stripe', role: 'Payments', color: '#635BFF' },
    { name: 'MongoDB', role: 'Database', color: '#10B981' },
  ];

  const stats = [
    { value: '<2s', label: 'Settlement Time' },
    { value: '~0.4%', label: 'Total Fees' },
    { value: '20+', label: 'Fiat Currencies' },
    { value: '4', label: 'Blockchains' },
  ];

  return (
    <div style={{ background: '#070A0F', color: '#F9FAFB', fontFamily: "'Space Grotesk', sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 48px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(7, 10, 15, 0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <VPXLogo size="md" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {[['Features', '#features'], ['How It Works', '#how-it-works'], ['Chains', '#chains']].map(([label, href]) => (
            <a key={label} href={href} style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#F9FAFB'}
              onMouseLeave={e => e.target.style.color = '#9CA3AF'}
            >{label}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/login')} style={{ padding: '8px 18px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#9CA3AF', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.target.style.borderColor = 'rgba(255,255,255,0.3)'; e.target.style.color = '#F9FAFB'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.color = '#9CA3AF'; }}
          >Log in</button>
          <button onClick={() => navigate('/register')} style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #00F0FF, #4D7EFF)', border: 'none', borderRadius: '8px', color: '#000', fontSize: '0.875rem', fontWeight: '700', cursor: 'pointer' }}>Get Started</button>
        </div>
      </nav>

      <div style={{ marginTop: '64px' }}>
        <TickerStrip />
      </div>

      <section style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', padding: '60px 48px', maxWidth: '1280px', margin: '0 auto', gap: '80px' }}>
        <div style={{ flex: '1', minWidth: '0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 240, 255, 0.06)', border: '1px solid rgba(0, 240, 255, 0.15)', borderRadius: '100px', padding: '5px 14px', marginBottom: '28px', fontSize: '0.78rem', color: '#00F0FF', fontWeight: '600' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00F0FF', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Live on 4 blockchains
          </div>
          <h1 style={{ fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)', fontWeight: '800', lineHeight: '1.08', marginBottom: '20px', letterSpacing: '-1.5px' }}>
            Crypto Payments,<br />
            <span style={{ background: 'linear-gradient(135deg, #00F0FF 0%, #4D7EFF 50%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Settled Instantly</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#6B7280', lineHeight: '1.7', marginBottom: '36px', maxWidth: '480px' }}>
            VPX auto-liquidates your crypto and pays merchants in their local currency — under 2 seconds, at a fraction of card fees.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '48px', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} style={{ padding: '13px 28px', background: 'linear-gradient(135deg, #00F0FF, #4D7EFF)', border: 'none', borderRadius: '10px', color: '#000', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer' }}>Start for Free →</button>
            <button onClick={() => navigate('/login')} style={{ padding: '13px 28px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F9FAFB', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' }}>Sign In</button>
          </div>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            {stats.map(({ value, label }) => (
              <div key={label}>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#00F0FF', lineHeight: '1' }}>{value}</div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '4px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: '1', minWidth: '0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '460px' }}>
            <div style={{ position: 'absolute', inset: '-40px', background: 'radial-gradient(ellipse at center, rgba(77, 126, 255, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ background: 'linear-gradient(135deg, #12151C, #0D1017)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>Processing Payment</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#F9FAFB' }}>$10.00</div>
                </div>
                <div style={{ background: activeStep === 3 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${activeStep === 3 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '8px', padding: '6px 12px', fontSize: '0.78rem', color: activeStep === 3 ? '#10B981' : '#4B5563', fontWeight: '600', transition: 'all 0.4s' }}>{activeStep === 3 ? '✓ Confirmed' : 'Processing...'}</div>
              </div>
              {steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < steps.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: activeStep === i ? `${step.color}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${activeStep === i ? step.color : 'rgba(255,255,255,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.4s', color: activeStep === i ? step.color : '#6B7280' }}>{step.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '600', color: activeStep === i ? '#F9FAFB' : '#6B7280', transition: 'color 0.4s' }}>{step.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#4B5563' }}>{step.desc}</div>
                  </div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeStep > i ? '#10B981' : activeStep === i ? step.color : 'rgba(255,255,255,0.1)', transition: 'all 0.4s' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {chains.map(({ name, symbol, color }) => (
                <div key={name} style={{ background: '#12151C', border: `1px solid ${color}30`, borderRadius: '8px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: '600' }}>{symbol}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" style={{ padding: '80px 48px', background: '#0A0D12', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px' }}>
            <div style={{ fontSize: '0.75rem', color: '#00F0FF', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Features</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: '800', letterSpacing: '-0.5px', maxWidth: '500px' }}>Everything you need to spend crypto</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' }}>
            {features.map(({ icon, title, desc, color }) => (
              <div key={title} style={{ background: '#0A0D12', padding: '28px', transition: 'background 0.3s', cursor: 'default', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                onMouseEnter={e => e.currentTarget.style.background = '#0F1318'}
                onMouseLeave={e => e.currentTarget.style.background = '#0A0D12'}
              >
                <div style={{ marginBottom: '14px' }}>{icon}</div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color, marginBottom: '8px' }}>{title}</h3>
                <p style={{ color: '#6B7280', lineHeight: '1.6', fontSize: '0.875rem', margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px' }}>
            <div style={{ fontSize: '0.75rem', color: '#4D7EFF', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>How It Works</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: '800', letterSpacing: '-0.5px' }}>Tap. Swap. Settle. Done.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '28px', left: '12.5%', right: '12.5%', height: '1px', background: 'linear-gradient(90deg, #00F0FF, #4D7EFF, #8B5CF6, #10B981)', opacity: 0.3, zIndex: 0 }} />
            <div style={{ position: 'absolute', top: '25px', width: '8px', height: '8px', borderRadius: '50%', background: '#00F0FF', boxShadow: '0 0 12px 2px #00F0FF', zIndex: 1, animation: 'flowLine 3s linear infinite' }} />
            {steps.map(({ icon, title, desc, color }, i) => (
              <div key={i} style={{ padding: '0 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${color}12`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.3rem' }}>{icon}</div>
                <div style={{ fontSize: '0.7rem', color, fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Step {i + 1}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '8px', color: '#F9FAFB' }}>{title}</h3>
                <p style={{ color: '#6B7280', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '100px', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10B981' }}>{'<'}2s</span>
              <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>total processing time — faster than traditional card networks</span>
            </div>
          </div>
        </div>
      </section>

      <section id="chains" style={{ padding: '80px 48px', background: '#0A0D12', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px' }}>
            <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Supported Chains</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: '800', letterSpacing: '-0.5px' }}>Real DEX settlement, four chains</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {chains.map(({ name, symbol, color, network, dex }) => (
              <div key={name} style={{ background: '#070A0F', border: `1px solid ${color}20`, borderRadius: '16px', padding: '24px', transition: 'border-color 0.3s, transform 0.3s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}60`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${color}20`; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '800', color }}>{symbol[0]}</div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '6px', padding: '3px 8px', fontSize: '0.7rem', color: '#10B981', fontWeight: '600' }}>✓ Live</div>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color, marginBottom: '4px' }}>{name}</h3>
                <div style={{ fontSize: '0.78rem', color: '#4B5563', marginBottom: '12px' }}>{network}</div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', padding: '6px 10px' }}>DEX: {dex}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#4B5563', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '28px' }}>Powered by</div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {techStack.map(({ name, role, color }) => (
              <div key={name} style={{ background: '#0A0D12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#F9FAFB' }}>{name}</span>
                <span style={{ fontSize: '0.75rem', color: '#4B5563' }}>{role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 48px', background: '#0A0D12', borderTop: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '16px' }}>Ready to spend your crypto?</h2>
          <p style={{ color: '#6B7280', fontSize: '1rem', lineHeight: '1.7', marginBottom: '36px' }}>Create your account in seconds. Wallets are auto-generated — no setup required.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => navigate('/register')} style={{ padding: '13px 32px', background: 'linear-gradient(135deg, #00F0FF, #4D7EFF)', border: 'none', borderRadius: '10px', color: '#000', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer' }}>Create Free Account</button>
            <button onClick={() => navigate('/login')} style={{ padding: '13px 32px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F9FAFB', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' }}>Sign In</button>
          </div>
        </div>
      </section>

      <footer style={{ padding: '28px 48px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <VPXLogo size="sm" />
          <span style={{ color: '#4B5563', fontSize: '0.8rem' }}>© 2026 VPX</span>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Privacy', 'Terms', 'GitHub'].map(link => (
            <a key={link} href="#" style={{ color: '#4B5563', textDecoration: 'none', fontSize: '0.8rem', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#9CA3AF'}
              onMouseLeave={e => e.target.style.color = '#4B5563'}
            >{link}</a>
          ))}
        </div>
      </footer>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } } @keyframes flowLine { 0% { left: 12.5%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { left: 87.5%; opacity: 0; } }`}</style>
    </div>
  );
};

export default HomePage;
