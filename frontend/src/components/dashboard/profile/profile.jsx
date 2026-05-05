import React, { useState } from "react";
import "./profile.css";

const DEVICES = [
  { id: 1, device: "MacBook Air", browser: "Chrome 122", location: "Mumbai, IN", lastActive: "Now", current: true },
  { id: 2, device: "iPhone 15 Pro", browser: "Safari 17", location: "Mumbai, IN", lastActive: "2 hours ago", current: false },
  { id: 3, device: "Windows PC", browser: "Firefox 123", location: "Delhi, IN", lastActive: "Yesterday", current: false },
  { id: 4, device: "iPad Pro", browser: "Chrome 121", location: "Pune, IN", lastActive: "3 days ago", current: false },
];

const BADGES = [
  { icon: "🏆", name: "First Trade", desc: "Completed your first trade", earned: true },
  { icon: "💎", name: "Diamond Hands", desc: "Held crypto for 30+ days", earned: true },
  { icon: "⚡", name: "Speed Trader", desc: "Completed 10 trades in a day", earned: true },
  { icon: "🌟", name: "Top Trader", desc: "Ranked in top 10% of traders", earned: false },
  { icon: "🔥", name: "100 Trades", desc: "Completed 100 trades", earned: false },
  { icon: "👑", name: "VPX Elite", desc: "Achieved Elite status", earned: false },
];

const COUNTRIES = ["India", "United States", "United Kingdom", "UAE", "Singapore", "Germany", "Japan", "Canada", "Australia"];
const CURRENCIES = ["INR ₹", "USD $", "EUR €", "GBP £", "AED د.إ", "JPY ¥"];
const LANGUAGES = ["English", "Hindi", "Arabic", "German", "Japanese", "French"];
const TIMEZONES = ["IST (UTC+5:30)", "UTC+0", "EST (UTC-5)", "PST (UTC-8)", "GST (UTC+4)", "JST (UTC+9)"];

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [devices, setDevices] = useState(DEVICES);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [form, setForm] = useState({
    name: "Vaibhav Pawar",
    email: "vaibhav@vpx.com",
    phone: "+91 98765 43210",
    dob: "1998-05-15",
    country: "India",
    username: "vaibhav_vpx",
    currency: "INR ₹",
    language: "English",
    timezone: "IST (UTC+5:30)",
    twitter: "@vaibhav_vpx",
    telegram: "@vaibhav_vpx",
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText("https://vpx.com/ref/VPX-VAI-2024");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveDevice = (id) => {
    setDevices(prev => prev.filter(d => d.id !== id));
  };

  const TABS = [
    { id: "profile", label: "Profile" },
    { id: "kyc", label: "KYC" },
    { id: "referral", label: "Referral" },
    { id: "devices", label: "Devices" },
    { id: "limits", label: "Account Limits" },
    { id: "badges", label: "Badges" },
  ];

  return (
    <div className="profile-container">

      {/* PROFILE HERO */}
      <div className="profile-hero">
        <div className="profile-hero-left">
          <div className="avatar-wrapper">
            <div className="avatar">VP</div>
            <div className="avatar-status"></div>
          </div>
          <div className="profile-hero-info">
            <h2>{form.name}</h2>
            <span className="username">@{form.username}</span>
            <div className="hero-badges">
              <span className="account-type pro">PRO</span>
              <span className="kyc-badge verified">✓ KYC Verified</span>
              <span className="member-since">Member since Jan 2024</span>
            </div>
          </div>
        </div>
        <div className="profile-hero-right">
          <div className="hero-stat">
            <div className="hero-stat-value">47</div>
            <div className="hero-stat-label">Trades</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">3</div>
            <div className="hero-stat-label">Referrals</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">3</div>
            <div className="hero-stat-label">Badges</div>
          </div>
          <button
            className={`edit-btn ${isEditing ? "save" : ""}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "✓ Save Changes" : "✎ Edit Profile"}
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="profile-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`profile-tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* PROFILE TAB */}
      {activeTab === "profile" && (
        <div className="tab-content">
          <div className="profile-grid">

            {/* Personal Info */}
            <div className="profile-card">
              <div className="card-header">
                <h3>Personal Information</h3>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  {isEditing ? (
                    <input name="name" value={form.name} onChange={handleChange} className="form-input" />
                  ) : (
                    <div className="form-value">{form.name}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  {isEditing ? (
                    <input name="email" value={form.email} onChange={handleChange} className="form-input" />
                  ) : (
                    <div className="form-value">{form.email}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  {isEditing ? (
                    <input name="phone" value={form.phone} onChange={handleChange} className="form-input" />
                  ) : (
                    <div className="form-value">{form.phone}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  {isEditing ? (
                    <input name="dob" type="date" value={form.dob} onChange={handleChange} className="form-input" />
                  ) : (
                    <div className="form-value">{form.dob}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>Country</label>
                  {isEditing ? (
                    <select name="country" value={form.country} onChange={handleChange} className="form-input">
                      {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  ) : (
                    <div className="form-value">{form.country}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>Username</label>
                  {isEditing ? (
                    <input name="username" value={form.username} onChange={handleChange} className="form-input" />
                  ) : (
                    <div className="form-value">@{form.username}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="profile-card">
              <div className="card-header">
                <h3>Account Details</h3>
              </div>
              <div className="account-details">
                <div className="detail-item">
                  <span className="detail-label">Account ID</span>
                  <span className="detail-value cyan">VPX-2024-00142</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Account Type</span>
                  <span className="account-type pro">PRO</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Member Since</span>
                  <span className="detail-value">January 2024</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Login</span>
                  <span className="detail-value">Today, 09:14 AM</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">2FA Status</span>
                  <span className="status-enabled">● Enabled</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email Verified</span>
                  <span className="status-enabled">● Verified</span>
                </div>
              </div>

              <div className="card-header" style={{ marginTop: "24px" }}>
                <h3>Social Links</h3>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Twitter</label>
                  {isEditing ? (
                    <input name="twitter" value={form.twitter} onChange={handleChange} className="form-input" />
                  ) : (
                    <div className="form-value">{form.twitter}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>Telegram</label>
                  {isEditing ? (
                    <input name="telegram" value={form.telegram} onChange={handleChange} className="form-input" />
                  ) : (
                    <div className="form-value">{form.telegram}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="profile-card full-width">
              <div className="card-header">
                <h3>Preferences</h3>
              </div>
              <div className="form-grid three-col">
                <div className="form-group">
                  <label>Default Currency</label>
                  {isEditing ? (
                    <select name="currency" value={form.currency} onChange={handleChange} className="form-input">
                      {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  ) : (
                    <div className="form-value">{form.currency}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>Language</label>
                  {isEditing ? (
                    <select name="language" value={form.language} onChange={handleChange} className="form-input">
                      {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                    </select>
                  ) : (
                    <div className="form-value">{form.language}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>Timezone</label>
                  {isEditing ? (
                    <select name="timezone" value={form.timezone} onChange={handleChange} className="form-input">
                      {TIMEZONES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  ) : (
                    <div className="form-value">{form.timezone}</div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* KYC TAB */}
      {activeTab === "kyc" && (
        <div className="tab-content">
          <div className="kyc-grid">
            <div className="kyc-level-card completed">
              <div className="kyc-level-icon">✓</div>
              <div className="kyc-level-info">
                <h4>Level 1 - Basic</h4>
                <p>Email & Phone Verified</p>
                <span className="kyc-status verified">Completed</span>
              </div>
            </div>
            <div className="kyc-level-card completed">
              <div className="kyc-level-icon">✓</div>
              <div className="kyc-level-info">
                <h4>Level 2 - Identity</h4>
                <p>Government ID Verified</p>
                <span className="kyc-status verified">Completed</span>
              </div>
            </div>
            <div className="kyc-level-card pending">
              <div className="kyc-level-icon">⏳</div>
              <div className="kyc-level-info">
                <h4>Level 3 - Advanced</h4>
                <p>Address & Bank Verification</p>
                <span className="kyc-status pending">In Progress</span>
              </div>
            </div>
          </div>

          <div className="profile-card" style={{ marginTop: "20px" }}>
            <div className="card-header">
              <h3>Upload Documents</h3>
            </div>
            <div className="doc-upload-grid">
              <div className="doc-upload-card uploaded">
                <div className="doc-icon">🪪</div>
                <div className="doc-info">
                  <h4>Government ID</h4>
                  <p>Passport / Aadhar / Driver's License</p>
                </div>
                <span className="doc-status uploaded">✓ Uploaded</span>
              </div>
              <div className="doc-upload-card uploaded">
                <div className="doc-icon">🤳</div>
                <div className="doc-info">
                  <h4>Selfie Verification</h4>
                  <p>Photo with ID card</p>
                </div>
                <span className="doc-status uploaded">✓ Uploaded</span>
              </div>
              <div className="doc-upload-card pending">
                <div className="doc-icon">🏠</div>
                <div className="doc-info">
                  <h4>Address Proof</h4>
                  <p>Utility bill / Bank statement</p>
                </div>
                <button className="upload-btn">⬆ Upload</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REFERRAL TAB */}
      {activeTab === "referral" && (
        <div className="tab-content">
          <div className="referral-grid">
            <div className="profile-card">
              <div className="card-header">
                <h3>Your Referral Program</h3>
              </div>
              <div className="referral-stats">
                <div className="referral-stat">
                  <div className="referral-stat-value">3</div>
                  <div className="referral-stat-label">Total Referred</div>
                </div>
                <div className="referral-stat">
                  <div className="referral-stat-value cyan">₹450</div>
                  <div className="referral-stat-label">Rewards Earned</div>
                </div>
                <div className="referral-stat">
                  <div className="referral-stat-value orange">₹150</div>
                  <div className="referral-stat-label">Per Referral</div>
                </div>
              </div>
              <div className="referral-code-section">
                <label>Your Referral Code</label>
                <div className="referral-code-box">
                  <span className="referral-code">VPX-VAI-2024</span>
                  <button
                    className={`copy-btn ${copied ? "copied" : ""}`}
                    onClick={handleCopyReferral}
                  >
                    {copied ? "✓ Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>
              <div className="referral-link">
                <label>Referral Link</label>
                <div className="referral-link-box">
                  https://vpx.com/ref/VPX-VAI-2024
                </div>
              </div>
            </div>

            <div className="profile-card">
              <div className="card-header">
                <h3>Referred Users</h3>
              </div>
              <div className="referred-list">
                {[
                  { name: "Rohit S.", date: "Feb 15, 2024", reward: "₹150", status: "active" },
                  { name: "Priya M.", date: "Mar 01, 2024", reward: "₹150", status: "active" },
                  { name: "Amit K.", date: "Mar 05, 2024", reward: "₹150", status: "pending" },
                ].map((r, i) => (
                  <div className="referred-item" key={i}>
                    <div className="referred-avatar">{r.name[0]}</div>
                    <div className="referred-info">
                      <div className="referred-name">{r.name}</div>
                      <div className="referred-date">{r.date}</div>
                    </div>
                    <div className="referred-right">
                      <div className="referred-reward">{r.reward}</div>
                      <div className={`referred-status ${r.status}`}>{r.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEVICES TAB */}
      {activeTab === "devices" && (
        <div className="tab-content">
          <div className="profile-card">
            <div className="card-header">
              <h3>Connected Devices</h3>
              <span>{devices.length} devices</span>
            </div>
            <div className="devices-list">
              {devices.map(d => (
                <div className="device-item" key={d.id}>
                  <div className="device-icon">
                    {d.device.includes("iPhone") || d.device.includes("iPad") ? "📱" :
                      d.device.includes("Mac") ? "💻" : "🖥️"}
                  </div>
                  <div className="device-info">
                    <div className="device-name">
                      {d.device}
                      {d.current && <span className="current-device">Current</span>}
                    </div>
                    <div className="device-meta">{d.browser} · {d.location}</div>
                    <div className="device-last">Last active: {d.lastActive}</div>
                  </div>
                  {!d.current && (
                    <button className="remove-device-btn" onClick={() => handleRemoveDevice(d.id)}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LIMITS TAB */}
      {activeTab === "limits" && (
        <div className="tab-content">
          <div className="limits-grid">
            {[
              { label: "Daily Withdrawal Limit", used: "₹25,000", total: "₹1,00,000", pct: 25, color: "#26a69a" },
              { label: "Daily Trading Limit", used: "₹80,000", total: "₹5,00,000", pct: 16, color: "#00F0FF" },
              { label: "Monthly Trading Limit", used: "₹3,20,000", total: "₹20,00,000", pct: 16, color: "#FF9800" },
              { label: "Monthly Withdrawal Limit", used: "₹75,000", total: "₹5,00,000", pct: 15, color: "#26a69a" },
            ].map((l, i) => (
              <div className="limit-card" key={i}>
                <div className="limit-header">
                  <span className="limit-label">{l.label}</span>
                  <span className="limit-pct" style={{ color: l.color }}>{l.pct}% used</span>
                </div>
                <div className="limit-bar-bg">
                  <div className="limit-bar-fill" style={{ width: `${l.pct}%`, background: l.color }}></div>
                </div>
                <div className="limit-amounts">
                  <span className="limit-used">{l.used} used</span>
                  <span className="limit-total">{l.total} limit</span>
                </div>
              </div>
            ))}
          </div>
          <div className="profile-card" style={{ marginTop: "20px" }}>
            <div className="card-header">
              <h3>Upgrade Your Limits</h3>
            </div>
            <div className="upgrade-grid">
              {[
                { plan: "Basic", limits: "₹1L/day withdrawal · ₹5L/day trading", active: false },
                { plan: "Pro", limits: "₹5L/day withdrawal · ₹20L/day trading", active: true },
                { plan: "Enterprise", limits: "Unlimited withdrawal · Unlimited trading", active: false },
              ].map((p, i) => (
                <div className={`upgrade-card ${p.active ? "active" : ""}`} key={i}>
                  <div className="upgrade-plan">{p.plan}</div>
                  <div className="upgrade-limits">{p.limits}</div>
                  {p.active ? (
                    <span className="current-plan">Current Plan</span>
                  ) : (
                    <button className="upgrade-btn">Upgrade</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BADGES TAB */}
      {activeTab === "badges" && (
        <div className="tab-content">
          <div className="profile-card">
            <div className="card-header">
              <h3>Achievements</h3>
              <span>{BADGES.filter(b => b.earned).length} / {BADGES.length} earned</span>
            </div>
            <div className="progress-bar-wrapper">
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${(BADGES.filter(b => b.earned).length / BADGES.length) * 100}%` }}
                ></div>
              </div>
              <span className="progress-label">
                {Math.round((BADGES.filter(b => b.earned).length / BADGES.length) * 100)}% complete
              </span>
            </div>
            <div className="badges-grid">
              {BADGES.map((b, i) => (
                <div className={`badge-card ${b.earned ? "earned" : "locked"}`} key={i}>
                  <div className="badge-icon">{b.earned ? b.icon : "🔒"}</div>
                  <div className="badge-name">{b.name}</div>
                  <div className="badge-desc">{b.desc}</div>
                  {b.earned && <div className="badge-earned-tag">✓ Earned</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT SECTION */}
      <div className="profile-card" style={{ marginTop: "20px", borderColor: "rgba(239,83,80,0.3)" }}>
        <div className="card-header">
          <h3 style={{ color: "#ef5350" }}>Danger Zone</h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
          <div>
            <div style={{ color: "white", fontWeight: "600", marginBottom: "4px" }}>Logout</div>
            <div style={{ color: "#888", fontSize: "0.85rem" }}>Sign out of your VPX account on this device</div>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              window.history.pushState(null, '', '/');
              window.location.replace('/');
            }}
            style={{
              background: "transparent",
              border: "1px solid #ef5350",
              color: "#ef5350",
              padding: "10px 24px",
              borderRadius: "10px",
              cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: "600",
              fontSize: "0.9rem",
              transition: "all 0.2s",
            }}
            onMouseOver={e => { e.target.style.background = "#ef5350"; e.target.style.color = "white"; }}
            onMouseOut={e => { e.target.style.background = "transparent"; e.target.style.color = "#ef5350"; }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

    </div>
  );
};

export default React.memo(Profile);