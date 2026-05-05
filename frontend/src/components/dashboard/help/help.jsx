import React, { useState } from "react";
import "./help.css";

const FAQS = [
  {
    category: "Trading",
    icon: "🔄",
    questions: [
      { q: "How do I place a buy order?",                 a: "Go to the Trade section, select your trading pair, enter the amount and price, then click the Buy button. Your order will be executed instantly at market price or when the limit price is reached." },
      { q: "What are the trading fees on VPX?",           a: "VPX charges a flat 0.1% fee on all trades. Pro account holders enjoy reduced fees of 0.05%. Fees are automatically deducted from your trade amount." },
      { q: "How do I set a limit order?",                 a: "In the Trade section, select 'Limit' from the order type options. Enter your desired price and amount, then confirm the order. It will execute when the market reaches your specified price." },
      { q: "What is the minimum trade amount?",           a: "The minimum trade amount is $10 or equivalent in any supported cryptocurrency. This applies to all trading pairs on the VPX platform." },
    ]
  },
  {
    category: "Wallet",
    icon: "👛",
    questions: [
      { q: "How do I connect my wallet?",                 a: "Click the 'Wallet' section in the sidebar, then click 'Connect Wallet'. Choose your preferred wallet extension (MetaMask, Phantom, etc.) and approve the connection request." },
      { q: "How do I deposit crypto?",                    a: "In the Wallet section after connecting, click the 'Deposit' button. Copy your wallet address or scan the QR code and send crypto from your external wallet to that address." },
      { q: "How long do withdrawals take?",               a: "Withdrawals are processed within 30 minutes for most cryptocurrencies. Network congestion may cause delays. You will receive a notification once the withdrawal is confirmed." },
      { q: "Is there a withdrawal limit?",                a: "Basic accounts have a daily withdrawal limit of ₹1,00,000. Pro accounts can withdraw up to ₹5,00,000 per day. Limits can be upgraded in the Account Limits section." },
    ]
  },
  {
    category: "POS Terminal",
    icon: "💳",
    questions: [
      { q: "How does the POS payment work?",              a: "The customer taps their crypto-linked card on the POS terminal. The system automatically converts the fiat amount to the equivalent crypto and deducts it from the customer's wallet." },
      { q: "Which cryptocurrencies are accepted?",        a: "VPX POS accepts BTC, ETH, SOL, BNB, USDT, XRP, ADA, DOGE, MATIC, and 40+ more cryptocurrencies. The list is updated regularly." },
      { q: "What happens if a payment fails?",            a: "If a payment fails, the customer will see an error on the terminal. No funds are deducted. The failed transaction will appear in your transaction history with a 'Failed' status." },
      { q: "Can I issue refunds via POS?",                a: "Refunds are processed manually through the support team. Contact us via Support Ticket with the transaction ID and refund amount. Refunds are processed within 24-48 hours." },
    ]
  },
  {
    category: "Security",
    icon: "🔒",
    questions: [
      { q: "How do I enable 2FA?",                        a: "Go to Security section, click on the '2FA' tab, and toggle the switch to enable. Scan the QR code with Google Authenticator or Authy and enter the 6-digit code to confirm." },
      { q: "What should I do if I suspect unauthorized access?", a: "Immediately go to Security > Connected Devices and remove any unknown devices. Change your password and enable 2FA if not already done. Contact support if needed." },
      { q: "How do I reset my Transaction PIN?",          a: "Go to Security > Transaction PIN tab and click 'Change PIN'. You will need to verify your identity via 2FA or email OTP before setting a new PIN." },
      { q: "Is my data safe on VPX?",                     a: "VPX uses bank-grade AES-256 encryption for all data. Private keys are stored in cold storage. We conduct regular security audits and penetration testing." },
    ]
  },
  {
    category: "Account",
    icon: "👤",
    questions: [
      { q: "How do I complete KYC verification?",         a: "Go to Profile > KYC tab. Upload your government ID and a selfie. Level 1 verification is instant. Level 2 takes 24-48 hours. Level 3 may take up to 5 business days." },
      { q: "How do I upgrade my account to Pro?",         a: "Go to Profile > Account Limits and click 'Upgrade' on the Pro plan. Complete the payment process. Your account will be upgraded instantly after payment confirmation." },
      { q: "Can I have multiple accounts?",               a: "No, VPX allows only one account per user. Creating multiple accounts violates our Terms of Service and may result in account suspension." },
      { q: "How do I close my account?",                  a: "To close your account, ensure all funds are withdrawn. Then contact our support team via Support Ticket with your account closure request. The process takes 3-5 business days." },
    ]
  },
];

const VIDEOS = [
  { title: "Getting Started with VPX",      duration: "3:24", category: "Beginner",  icon: "🚀", desc: "A complete walkthrough of the VPX platform for new users"          },
  { title: "How to Place Your First Trade", duration: "4:12", category: "Trading",   icon: "🔄", desc: "Step by step guide to buying and selling crypto on VPX"            },
  { title: "Setting Up Your Wallet",        duration: "2:58", category: "Wallet",    icon: "👛", desc: "Connect your Web3 wallet and start managing your crypto assets"    },
  { title: "Using the POS Terminal",        duration: "5:01", category: "POS",       icon: "💳", desc: "Learn how to accept crypto payments using the VPX POS system"      },
  { title: "Enabling 2FA Security",         duration: "2:15", category: "Security",  icon: "🔒", desc: "Protect your account with two-factor authentication"               },
  { title: "KYC Verification Guide",        duration: "3:45", category: "Account",   icon: "🪪", desc: "Complete your identity verification to unlock higher limits"       },
  { title: "Understanding the Portfolio",   duration: "4:33", category: "Trading",   icon: "📊", desc: "Track your crypto holdings and analyze your performance"           },
  { title: "How to Withdraw Funds",         duration: "2:47", category: "Wallet",    icon: "⬆️", desc: "Safely withdraw your crypto to any external wallet address"        },
];

const SYSTEM_STATUS = [
  { service: "Trading Engine",    status: "operational", uptime: "99.98%" },
  { service: "Wallet Service",    status: "operational", uptime: "99.95%" },
  { service: "POS Terminal",      status: "operational", uptime: "99.99%" },
  { service: "Notifications",     status: "operational", uptime: "99.90%" },
  { service: "Authentication",    status: "operational", uptime: "100%"   },
];

const VIDEO_CATEGORIES = ["All", "Beginner", "Trading", "Wallet", "POS", "Security", "Account"];

const Help = () => {
  const [searchQuery, setSearchQuery]       = useState("");
  const [openFaq, setOpenFaq]               = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [videoCategory, setVideoCategory]   = useState("All");
  const [activeTab, setActiveTab]           = useState("faq");

  const TABS = [
    { id: "faq",     label: "FAQ",            emoji: "❓" },
    { id: "videos",  label: "Video Tutorials", emoji: "🎬" },
    { id: "status",  label: "System Status",   emoji: "🟢" },
  ];

  const faqCategories = ["All", ...FAQS.map(f => f.category)];

  const filteredFaqs = FAQS.map(section => ({
    ...section,
    questions: section.questions.filter(q =>
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section =>
    (activeCategory === "All" || section.category === activeCategory) &&
    section.questions.length > 0
  );

  const filteredVideos = VIDEOS.filter(v =>
    (videoCategory === "All" || v.category === videoCategory) &&
    (v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     v.desc.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const overallStatus = SYSTEM_STATUS.every(s => s.status === "operational")
    ? "operational"
    : SYSTEM_STATUS.some(s => s.status === "down")
    ? "down"
    : "degraded";

  return (
    <div className="help-container">

      {/* HERO */}
      <div className="help-hero">
        <div className="help-hero-content">
          <h1>How can we help you?</h1>
          <p>Search our knowledge base or browse topics below</p>
          <div className="help-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="help-search-input"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery("")}>✕</button>
            )}
          </div>
        </div>
        <div className="help-hero-stats">
          <div className="help-hero-stat">
            <div className="help-hero-stat-value">50+</div>
            <div className="help-hero-stat-label">Help Articles</div>
          </div>
          <div className="help-hero-stat">
            <div className="help-hero-stat-value">8</div>
            <div className="help-hero-stat-label">Video Tutorials</div>
          </div>
          <div className="help-hero-stat">
            <div className="help-hero-stat-value" style={{ color: "#26a69a" }}>99.9%</div>
            <div className="help-hero-stat-label">Uptime</div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="help-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`help-tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span>{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* FAQ TAB */}
      {activeTab === "faq" && (
        <div className="tab-content">
          <div className="faq-categories">
            {faqCategories.map(c => (
              <button
                key={c}
                className={`category-btn ${activeCategory === c ? "active" : ""}`}
                onClick={() => setActiveCategory(c)}
              >
                {c !== "All" && FAQS.find(f => f.category === c)?.icon} {c}
              </button>
            ))}
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="help-empty">
              <div className="help-empty-icon">🔍</div>
              <div className="help-empty-title">No results found</div>
              <div className="help-empty-sub">Try a different search term</div>
            </div>
          ) : (
            <div className="faq-sections">
              {filteredFaqs.map((section, si) => (
                <div className="faq-section" key={si}>
                  <div className="faq-section-header">
                    <span className="faq-section-icon">{section.icon}</span>
                    <h3>{section.category}</h3>
                    <span className="faq-count">{section.questions.length} articles</span>
                  </div>
                  <div className="faq-list">
                    {section.questions.map((item, qi) => {
                      const key = `${si}-${qi}`;
                      return (
                        <div
                          className={`faq-item ${openFaq === key ? "open" : ""}`}
                          key={qi}
                          onClick={() => setOpenFaq(openFaq === key ? null : key)}
                        >
                          <div className="faq-question">
                            <span>{item.q}</span>
                            <span className="faq-arrow">{openFaq === key ? "▲" : "▼"}</span>
                          </div>
                          {openFaq === key && (
                            <div className="faq-answer">{item.a}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIDEOS TAB */}
      {activeTab === "videos" && (
        <div className="tab-content">
          <div className="video-categories">
            {VIDEO_CATEGORIES.map(c => (
              <button
                key={c}
                className={`category-btn ${videoCategory === c ? "active" : ""}`}
                onClick={() => setVideoCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="videos-grid">
            {filteredVideos.map((v, i) => (
              <div className="video-card" key={i}>
                <div className="video-thumbnail">
                  <span className="video-thumb-icon">{v.icon}</span>
                  <div className="video-play-btn">▶</div>
                  <span className="video-duration">{v.duration}</span>
                </div>
                <div className="video-info">
                  <div className="video-category-tag">{v.category}</div>
                  <div className="video-title">{v.title}</div>
                  <div className="video-desc">{v.desc}</div>
                </div>
              </div>
            ))}
          </div>
          {filteredVideos.length === 0 && (
            <div className="help-empty">
              <div className="help-empty-icon">🎬</div>
              <div className="help-empty-title">No videos found</div>
              <div className="help-empty-sub">Try a different category or search term</div>
            </div>
          )}
        </div>
      )}

      {/* SYSTEM STATUS TAB */}
      {activeTab === "status" && (
        <div className="tab-content">
          <div className={`status-banner ${overallStatus}`}>
            <span className="status-banner-icon">
              {overallStatus === "operational" ? "✓" : overallStatus === "degraded" ? "⚠" : "✕"}
            </span>
            <div>
              <div className="status-banner-title">
                {overallStatus === "operational"
                  ? "All Systems Operational"
                  : overallStatus === "degraded"
                  ? "Some Systems Degraded"
                  : "System Outage Detected"}
              </div>
              <div className="status-banner-sub">Last checked: just now</div>
            </div>
          </div>

          <div className="status-list">
            {SYSTEM_STATUS.map((s, i) => (
              <div className="status-item" key={i}>
                <div className="status-item-left">
                  <div className={`status-dot ${s.status}`}></div>
                  <span className="status-service">{s.service}</span>
                </div>
                <div className="status-item-right">
                  <span className="status-uptime">{s.uptime} uptime</span>
                  <span className={`status-label ${s.status}`}>
                    {s.status === "operational" ? "Operational" :
                     s.status === "degraded"    ? "Degraded"    : "Down"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="incidents-section">
            <h3>Recent Incidents</h3>
            <div className="incident-item resolved">
              <div className="incident-header">
                <span className="incident-title">API Gateway Latency</span>
                <span className="incident-status resolved">Monitoring</span>
              </div>
              <div className="incident-desc">Some users may experience slower API response times. Our team is investigating.</div>
              <div className="incident-time">Mar 06, 2026 · 08:30 AM</div>
            </div>
            <div className="incident-item resolved">
              <div className="incident-header">
                <span className="incident-title">Scheduled Maintenance Completed</span>
                <span className="incident-status resolved">Resolved</span>
              </div>
              <div className="incident-desc">Scheduled maintenance was completed successfully. All systems are back to normal.</div>
              <div className="incident-time">Mar 01, 2026 · 02:00 AM</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default React.memo(Help);