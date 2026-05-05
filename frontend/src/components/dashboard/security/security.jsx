import React, { useState } from "react";
import "./security.css";

const LOGIN_HISTORY = [
  { device: "MacBook Air",   browser: "Chrome 122",  location: "Mumbai, IN", ip: "192.168.1.1",  time: "Today, 09:14",   status: "success" },
  { device: "iPhone 15 Pro", browser: "Safari 17",   location: "Mumbai, IN", ip: "192.168.1.2",  time: "Today, 07:32",   status: "success" },
  { device: "Unknown Device",browser: "Unknown",     location: "Delhi, IN",  ip: "103.21.58.12", time: "Yesterday",      status: "failed"  },
  { device: "Windows PC",    browser: "Firefox 123", location: "Pune, IN",   ip: "192.168.1.3",  time: "Feb 28",         status: "success" },
  { device: "MacBook Air",   browser: "Chrome 121",  location: "Mumbai, IN", ip: "192.168.1.1",  time: "Feb 27",         status: "success" },
];

const SECURITY_TIPS = [
  { tip: "Enable 2FA",             done: true  },
  { tip: "Set Transaction PIN",    done: false },
  { tip: "Set Anti-Phishing Code", done: false },
  { tip: "Strong Password",        done: true  },
  { tip: "Set Auto Logout Timer",  done: false },
];

const LOGOUT_TIMERS = ["5 minutes", "15 minutes", "30 minutes", "1 hour", "Never"];

const Security = () => {
  const [twoFA, setTwoFA]                   = useState(true);
  const [showQR, setShowQR]                 = useState(false);
  const [logoutTimer, setLogoutTimer]       = useState("30 minutes");
  const [phishingCode, setPhishingCode]     = useState("VPX-SECURE-2024");
  const [editPhishing, setEditPhishing]     = useState(false);
  const [pin, setPin]                       = useState(["", "", "", "", "", ""]);
  const [pinSet, setPinSet]                 = useState(false);
  const [pinStep, setPinStep]               = useState("set");
  const [showPin, setShowPin]               = useState(false);
  const [activeTab, setActiveTab]           = useState("overview");

  const [passwords, setPasswords] = useState({
    current: "", newPass: "", confirm: ""
  });

  const [strength, setStrength] = useState(0);

  const checkStrength = (val) => {
    let score = 0;
    if (val.length >= 8)              score++;
    if (/[A-Z]/.test(val))            score++;
    if (/[0-9]/.test(val))            score++;
    if (/[^A-Za-z0-9]/.test(val))     score++;
    setStrength(score);
  };

  const handlePinChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 5) {
      document.getElementById(`pin-${index + 1}`)?.focus();
    }
  };

  const handlePinSet = () => {
    if (pin.every(p => p !== "")) {
      setPinSet(true);
      setPinStep("done");
    }
  };

  const scoreCount = SECURITY_TIPS.filter(t => t.done).length;
  const scoreTotal = SECURITY_TIPS.length;
  const scorePct   = Math.round((scoreCount / scoreTotal) * 100);
  const scoreColor = scorePct >= 80 ? "#26a69a" : scorePct >= 50 ? "#FF9800" : "#ef5350";
  const scoreLabel = scorePct >= 80 ? "Strong" : scorePct >= 50 ? "Medium" : "Weak";

  const TABS = [
    { id: "overview",  label: "Overview"      },
    { id: "password",  label: "Password"      },
    { id: "2fa",       label: "2FA"           },
    { id: "pin",       label: "Transaction PIN"},
    { id: "logout",    label: "Auto Logout"   },
    { id: "history",   label: "Login History" },
    { id: "phishing",  label: "Anti-Phishing" },
  ];

  return (
    <div className="security-container">

      {/* HERO */}
      <div className="security-hero">
        <div className="security-hero-left">
          <h1>Security Center</h1>
          <p>Manage your account security settings and monitor activity</p>
        </div>
        <div className="security-score-ring">
          <svg viewBox="0 0 100 100" className="score-ring-svg">
            <circle cx="50" cy="50" r="40" className="ring-bg" />
            <circle
              cx="50" cy="50" r="40"
              className="ring-fill"
              style={{
                stroke: scoreColor,
                strokeDasharray: `${scorePct * 2.51} 251`,
              }}
            />
          </svg>
          <div className="score-ring-content">
            <div className="score-number" style={{ color: scoreColor }}>{scorePct}</div>
            <div className="score-label" style={{ color: scoreColor }}>{scoreLabel}</div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="security-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`security-tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="tab-content">
          <div className="overview-grid">

            <div className="security-card">
              <div className="card-header">
                <h3>Security Checklist</h3>
                <span>{scoreCount}/{scoreTotal} completed</span>
              </div>
              <div className="checklist">
                {SECURITY_TIPS.map((t, i) => (
                  <div className={`checklist-item ${t.done ? "done" : ""}`} key={i}>
                    <span className="check-icon">{t.done ? "✓" : "○"}</span>
                    <span className="check-label">{t.tip}</span>
                    {!t.done && <span className="check-action">Set up →</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="security-card">
              <div className="card-header">
                <h3>Quick Status</h3>
              </div>
              <div className="status-list">
                {[
                  { label: "Two Factor Auth",    value: twoFA ? "Enabled" : "Disabled",   ok: twoFA       },
                  { label: "Transaction PIN",     value: pinSet ? "Set" : "Not Set",        ok: pinSet      },
                  { label: "Anti-Phishing Code", value: phishingCode ? "Set" : "Not Set",  ok: !!phishingCode },
                  { label: "Auto Logout",        value: logoutTimer,                        ok: logoutTimer !== "Never" },
                  { label: "Last Password Change",value: "14 days ago",                    ok: true        },
                  { label: "Active Sessions",    value: "2 devices",                        ok: true        },
                ].map((s, i) => (
                  <div className="status-item" key={i}>
                    <span className="status-label">{s.label}</span>
                    <span className={`status-value ${s.ok ? "ok" : "warn"}`}>
                      {s.ok ? "● " : "⚠ "}{s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PASSWORD TAB */}
      {activeTab === "password" && (
        <div className="tab-content">
          <div className="security-card max-600">
            <div className="card-header">
              <h3>Change Password</h3>
              <span>Last changed 14 days ago</span>
            </div>
            <div className="form-stack">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  className="sec-input"
                  placeholder="Enter current password"
                  value={passwords.current}
                  onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  className="sec-input"
                  placeholder="Enter new password"
                  value={passwords.newPass}
                  onChange={e => {
                    setPasswords(p => ({ ...p, newPass: e.target.value }));
                    checkStrength(e.target.value);
                  }}
                />
                {passwords.newPass && (
                  <div className="strength-wrapper">
                    <div className="strength-bar">
                      {[1,2,3,4].map(i => (
                        <div
                          key={i}
                          className="strength-segment"
                          style={{
                            background: i <= strength
                              ? strength <= 1 ? "#ef5350"
                              : strength <= 2 ? "#FF9800"
                              : strength <= 3 ? "#00F0FF"
                              : "#26a69a"
                              : "#2D2D2D"
                          }}
                        />
                      ))}
                    </div>
                    <span className="strength-label" style={{
                      color: strength <= 1 ? "#ef5350" : strength <= 2 ? "#FF9800" : strength <= 3 ? "#00F0FF" : "#26a69a"
                    }}>
                      {strength <= 1 ? "Weak" : strength <= 2 ? "Fair" : strength <= 3 ? "Good" : "Strong"}
                    </span>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  className="sec-input"
                  placeholder="Confirm new password"
                  value={passwords.confirm}
                  onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                />
                {passwords.confirm && passwords.newPass !== passwords.confirm && (
                  <span className="input-error">Passwords do not match</span>
                )}
              </div>
              <button className="sec-btn primary">Update Password</button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA TAB */}
      {activeTab === "2fa" && (
        <div className="tab-content">
          <div className="security-card max-600">
            <div className="card-header">
              <h3>Two Factor Authentication</h3>
              <span className={twoFA ? "status-ok" : "status-warn"}>{twoFA ? "● Enabled" : "⚠ Disabled"}</span>
            </div>
            <div className="twofa-toggle-row">
              <div>
                <div className="twofa-title">Authenticator App</div>
                <div className="twofa-desc">Use Google Authenticator or Authy to generate codes</div>
              </div>
              <div
                className={`toggle-switch ${twoFA ? "on" : ""}`}
                onClick={() => { setTwoFA(!twoFA); setShowQR(!twoFA); }}
              >
                <div className="toggle-thumb"></div>
              </div>
            </div>

            {twoFA && (
              <>
                <button className="sec-btn outline" onClick={() => setShowQR(!showQR)}>
                  {showQR ? "Hide QR Code" : "Show QR Code"}
                </button>
                {showQR && (
                  <div className="qr-section">
                    <div className="qr-placeholder">
                      <div className="qr-mock">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="qr-row">
                            {[...Array(6)].map((_, j) => (
                              <div key={j} className={`qr-cell ${(i+j) % 3 === 0 ? "filled" : ""}`}></div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="qr-info">
                      <p>Scan this QR code with your authenticator app</p>
                      <div className="backup-codes">
                        <div className="card-header" style={{ marginBottom: "12px" }}>
                          <h3>Backup Codes</h3>
                        </div>
                        <div className="codes-grid">
                          {["VPX-1A2B-3C4D", "VPX-5E6F-7G8H", "VPX-9I0J-1K2L", "VPX-3M4N-5O6P"].map((c, i) => (
                            <div className="backup-code" key={i}>{c}</div>
                          ))}
                        </div>
                        <p className="backup-note">Store these codes safely. Each can only be used once.</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* TRANSACTION PIN TAB */}
      {activeTab === "pin" && (
        <div className="tab-content">
          <div className="security-card max-600">
            <div className="card-header">
              <h3>Transaction PIN</h3>
              <span className={pinSet ? "status-ok" : "status-warn"}>{pinSet ? "● Set" : "⚠ Not Set"}</span>
            </div>
            <p className="card-desc">This PIN is required before every withdrawal or trade to add an extra layer of security.</p>

            {pinStep === "done" ? (
              <div className="pin-success">
                <div className="pin-success-icon">✓</div>
                <div className="pin-success-text">Transaction PIN set successfully</div>
                <button className="sec-btn outline" onClick={() => { setPinStep("set"); setPin(["","","","","",""]); setPinSet(false); }}>
                  Change PIN
                </button>
              </div>
            ) : (
              <>
                <label className="pin-label">
                  {pinStep === "set" ? "Enter a 6-digit PIN" : "Confirm your PIN"}
                </label>
                <div className="pin-inputs">
                  {pin.map((p, i) => (
                    <input
                      key={i}
                      id={`pin-${i}`}
                      type={showPin ? "text" : "password"}
                      maxLength={1}
                      className="pin-input"
                      value={p}
                      onChange={e => handlePinChange(i, e.target.value)}
                    />
                  ))}
                </div>
                <div className="pin-actions">
                  <button className="sec-btn outline small" onClick={() => setShowPin(!showPin)}>
                    {showPin ? "Hide" : "Show"} PIN
                  </button>
                  <button className="sec-btn primary" onClick={handlePinSet}>
                    {pinStep === "set" ? "Continue" : "Set PIN"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* AUTO LOGOUT TAB */}
      {activeTab === "logout" && (
        <div className="tab-content">
          <div className="security-card max-600">
            <div className="card-header">
              <h3>Auto Logout Timer</h3>
              <span className="status-ok">● Active</span>
            </div>
            <p className="card-desc">Automatically log out after a period of inactivity to protect your account.</p>
            <div className="logout-options">
              {LOGOUT_TIMERS.map(t => (
                <button
                  key={t}
                  className={`logout-option ${logoutTimer === t ? "active" : ""}`}
                  onClick={() => setLogoutTimer(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="logout-current">
              <span>Current setting:</span>
              <span className="logout-current-value">{logoutTimer}</span>
            </div>
            <button className="sec-btn primary">Save Setting</button>
          </div>
        </div>
      )}

      {/* LOGIN HISTORY TAB */}
      {activeTab === "history" && (
        <div className="tab-content">
          <div className="security-card">
            <div className="card-header">
              <h3>Login History</h3>
              <span>{LOGIN_HISTORY.length} recent logins</span>
            </div>
            <div className="history-list">
              {LOGIN_HISTORY.map((l, i) => (
                <div className="history-item" key={i}>
                  <div className={`history-status-dot ${l.status}`}></div>
                  <div className="history-icon">
                    {l.device.includes("iPhone") || l.device.includes("iPad") ? "📱" :
                     l.device.includes("Mac") ? "💻" : l.device.includes("Unknown") ? "⚠️" : "🖥️"}
                  </div>
                  <div className="history-info">
                    <div className="history-device">{l.device} · {l.browser}</div>
                    <div className="history-meta">{l.location} · {l.ip}</div>
                  </div>
                  <div className="history-right">
                    <div className="history-time">{l.time}</div>
                    <div className={`history-result ${l.status}`}>
                      {l.status === "success" ? "✓ Success" : "✕ Failed"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ANTI-PHISHING TAB */}
      {activeTab === "phishing" && (
        <div className="tab-content">
          <div className="security-card max-600">
            <div className="card-header">
              <h3>Anti-Phishing Code</h3>
              <span className={phishingCode ? "status-ok" : "status-warn"}>{phishingCode ? "● Active" : "⚠ Not Set"}</span>
            </div>
            <p className="card-desc">
              This code will appear in all official VPX emails. If you receive an email without this code, it may be a phishing attempt.
            </p>
            {editPhishing ? (
              <div className="form-stack">
                <div className="form-group">
                  <label>Your Anti-Phishing Code</label>
                  <input
                    className="sec-input"
                    value={phishingCode}
                    onChange={e => setPhishingCode(e.target.value)}
                    placeholder="Enter a memorable phrase"
                  />
                </div>
                <div className="btn-row">
                  <button className="sec-btn primary" onClick={() => setEditPhishing(false)}>Save Code</button>
                  <button className="sec-btn outline" onClick={() => setEditPhishing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="phishing-display">
                  <span className="phishing-code">{phishingCode}</span>
                </div>
                <button className="sec-btn outline" onClick={() => setEditPhishing(true)}>Change Code</button>
              </>
            )}
            <div className="phishing-example">
              <div className="example-label">How it appears in emails:</div>
              <div className="example-email">
                <div className="email-header">From: noreply@vpx.com</div>
                <div className="email-body">
                  Your security code: <span className="email-code">{phishingCode || "NOT SET"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default React.memo(Security);