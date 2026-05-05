import React, { useState } from "react";
import "./ticket.css";

const TICKETS = [
  { id: "TKT-001", subject: "Withdrawal not processed",      category: "Wallet",  priority: "High",   status: "open",        date: "Today, 09:14",   messages: [
    { from: "user",    text: "I submitted a withdrawal 2 hours ago but it still shows pending. Transaction ID: TXN006.",          time: "Today, 09:14" },
    { from: "support", text: "Thank you for reaching out. We are investigating the issue and will update you within 30 minutes.", time: "Today, 09:45" },
  ]},
  { id: "TKT-002", subject: "Trade order not executing",      category: "Trading", priority: "Urgent", status: "in-progress",  date: "Today, 07:30",   messages: [
    { from: "user",    text: "My limit order for BTC has been sitting for 3 hours even though the price hit my target.",          time: "Today, 07:30" },
    { from: "support", text: "We have escalated this to our trading engine team. You will hear back within 15 minutes.",          time: "Today, 07:50" },
    { from: "user",    text: "Still not resolved. Please expedite.",                                                              time: "Today, 08:30" },
  ]},
  { id: "TKT-003", subject: "KYC verification stuck",         category: "Account", priority: "Medium", status: "resolved",     date: "Feb 28",         messages: [
    { from: "user",    text: "My KYC Level 2 has been pending for 5 days. Please check.",                                        time: "Feb 28, 10:00" },
    { from: "support", text: "We have manually reviewed your documents. Your KYC Level 2 has been approved.",                    time: "Feb 28, 14:00" },
  ]},
  { id: "TKT-004", subject: "POS payment showing failed",     category: "POS",     priority: "High",   status: "resolved",     date: "Feb 25",         messages: [
    { from: "user",    text: "Customer paid but transaction shows failed. Amount was deducted from their wallet.",                time: "Feb 25, 11:00" },
    { from: "support", text: "We have verified the transaction. The funds will be credited to your account within 2 hours.",      time: "Feb 25, 12:30" },
  ]},
  { id: "TKT-005", subject: "2FA not working after reset",    category: "Security",priority: "Medium", status: "closed",       date: "Feb 20",         messages: [
    { from: "user",    text: "After resetting my phone, the 2FA codes are no longer working.",                                   time: "Feb 20, 09:00" },
    { from: "support", text: "Please use your backup codes to login. Then disable and re-enable 2FA in the security settings.",  time: "Feb 20, 09:30" },
    { from: "user",    text: "That worked, thank you!",                                                                          time: "Feb 20, 10:00" },
    { from: "support", text: "Great! Let us know if you need any further assistance. Closing this ticket.",                      time: "Feb 20, 10:05" },
  ]},
];

const CATEGORIES = ["Trading", "Wallet", "POS Terminal", "Security", "Account", "Other"];
const PRIORITIES  = ["Low", "Medium", "High", "Urgent"];
const FILTERS     = ["All", "Open", "In Progress", "Resolved", "Closed"];

const STATUS_CONFIG = {
  "open":        { color: "#00F0FF", bg: "rgba(0,240,255,0.1)",   label: "Open"        },
  "in-progress": { color: "#FF9800", bg: "rgba(255,152,0,0.1)",   label: "In Progress" },
  "resolved":    { color: "#26a69a", bg: "rgba(38,166,154,0.1)",  label: "Resolved"    },
  "closed":      { color: "#555",    bg: "rgba(85,85,85,0.1)",    label: "Closed"      },
};

const PRIORITY_CONFIG = {
  "Low":    { color: "#555",    bg: "rgba(85,85,85,0.1)"    },
  "Medium": { color: "#FF9800", bg: "rgba(255,152,0,0.1)"   },
  "High":   { color: "#ef5350", bg: "rgba(239,83,80,0.1)"   },
  "Urgent": { color: "#ef5350", bg: "rgba(239,83,80,0.15)",  pulse: true },
};

const Ticket = () => {
  const [activeTab, setActiveTab]       = useState("tickets");
  const [filter, setFilter]             = useState("All");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText]       = useState("");
  const [tickets, setTickets]           = useState(TICKETS);

  const [form, setForm] = useState({
    subject: "", category: "Trading", priority: "Medium", description: "", attachment: null
  });

  const [submitted, setSubmitted] = useState(false);

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!form.subject || !form.description) return;
    const newTicket = {
      id:       `TKT-00${tickets.length + 1}`,
      subject:  form.subject,
      category: form.category,
      priority: form.priority,
      status:   "open",
      date:     "Just now",
      messages: [{ from: "user", text: form.description, time: "Just now" }],
    };
    setTickets(prev => [newTicket, ...prev]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ subject: "", category: "Trading", priority: "Medium", description: "", attachment: null });
      setActiveTab("tickets");
    }, 2000);
  };

  const handleReply = () => {
    if (!replyText.trim()) return;
    setTickets(prev => prev.map(t =>
      t.id === selectedTicket.id
        ? { ...t, messages: [...t.messages, { from: "user", text: replyText, time: "Just now" }] }
        : t
    ));
    setSelectedTicket(prev => ({
      ...prev,
      messages: [...prev.messages, { from: "user", text: replyText, time: "Just now" }]
    }));
    setReplyText("");
  };

  const handleCloseTicket = () => {
    setTickets(prev => prev.map(t =>
      t.id === selectedTicket.id ? { ...t, status: "closed" } : t
    ));
    setSelectedTicket(null);
  };

  const filteredTickets = tickets.filter(t =>
    filter === "All" ? true :
    filter === "In Progress" ? t.status === "in-progress" :
    t.status === filter.toLowerCase()
  );

  const openCount      = tickets.filter(t => t.status === "open").length;
  const inProgCount    = tickets.filter(t => t.status === "in-progress").length;
  const resolvedCount  = tickets.filter(t => t.status === "resolved").length;

  const TABS = [
    { id: "tickets", label: "My Tickets"       },
    { id: "new",     label: "+ New Ticket"     },
  ];

  return (
    <div className="ticket-container">

      {/* HEADER */}
      <div className="ticket-header">
        <div className="ticket-header-left">
          <h1>Support Tickets</h1>
          <p>Get help from our support team</p>
        </div>
        <div className="ticket-header-stats">
          <div className="ticket-stat">
            <div className="ticket-stat-value cyan">{openCount}</div>
            <div className="ticket-stat-label">Open</div>
          </div>
          <div className="ticket-stat">
            <div className="ticket-stat-value orange">{inProgCount}</div>
            <div className="ticket-stat-label">In Progress</div>
          </div>
          <div className="ticket-stat">
            <div className="ticket-stat-value green">{resolvedCount}</div>
            <div className="ticket-stat-label">Resolved</div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="ticket-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`ticket-tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => { setActiveTab(t.id); setSelectedTicket(null); }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* MY TICKETS */}
      {activeTab === "tickets" && !selectedTicket && (
        <div className="tab-content">
          <div className="ticket-filters">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`ticket-filter ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
                {f === "Open" && openCount > 0 && (
                  <span className="filter-count">{openCount}</span>
                )}
              </button>
            ))}
          </div>

          <div className="tickets-card">
            {filteredTickets.length === 0 ? (
              <div className="ticket-empty">
                <div className="ticket-empty-icon">🎫</div>
                <div className="ticket-empty-title">No tickets found</div>
                <div className="ticket-empty-sub">Create a new ticket to get support</div>
                <button className="new-ticket-btn" onClick={() => setActiveTab("new")}>+ Create Ticket</button>
              </div>
            ) : (
              <div className="tickets-list">
                {filteredTickets.map((t, i) => {
                  const sc = STATUS_CONFIG[t.status];
                  const pc = PRIORITY_CONFIG[t.priority];
                  return (
                    <div className="ticket-item" key={i} onClick={() => setSelectedTicket(t)}>
                      <div className="ticket-item-left">
                        <div className="ticket-id">{t.id}</div>
                        <div className="ticket-subject">{t.subject}</div>
                        <div className="ticket-meta">
                          <span className="ticket-category">{t.category}</span>
                          <span className="ticket-dot">·</span>
                          <span className="ticket-date">{t.date}</span>
                          <span className="ticket-dot">·</span>
                          <span className="ticket-msgs">{t.messages.length} messages</span>
                        </div>
                      </div>
                      <div className="ticket-item-right">
                        <span className="priority-badge" style={{ color: pc.color, background: pc.bg }}>
                          {pc.pulse && <span className="priority-dot"></span>}
                          {t.priority}
                        </span>
                        <span className="status-badge" style={{ color: sc.color, background: sc.bg }}>
                          {sc.label}
                        </span>
                        <span className="ticket-arrow">›</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TICKET DETAIL */}
      {activeTab === "tickets" && selectedTicket && (
        <div className="tab-content">
          <div className="ticket-detail-header">
            <button className="back-btn" onClick={() => setSelectedTicket(null)}>← Back</button>
            <div className="ticket-detail-info">
              <span className="ticket-detail-id">{selectedTicket.id}</span>
              <h2>{selectedTicket.subject}</h2>
              <div className="ticket-detail-meta">
                <span className="ticket-category">{selectedTicket.category}</span>
                <span className="ticket-dot">·</span>
                <span className="ticket-date">{selectedTicket.date}</span>
                <span
                  className="status-badge"
                  style={{
                    color: STATUS_CONFIG[selectedTicket.status].color,
                    background: STATUS_CONFIG[selectedTicket.status].bg
                  }}
                >
                  {STATUS_CONFIG[selectedTicket.status].label}
                </span>
              </div>
            </div>
            {selectedTicket.status !== "closed" && (
              <button className="close-ticket-btn" onClick={handleCloseTicket}>Close Ticket</button>
            )}
          </div>

          <div className="ticket-conversation">
            {selectedTicket.messages.map((msg, i) => (
              <div className={`message ${msg.from}`} key={i}>
                <div className="message-avatar">
                  {msg.from === "user" ? "👤" : "🎧"}
                </div>
                <div className="message-content">
                  <div className="message-sender">
                    {msg.from === "user" ? "You" : "VPX Support"}
                  </div>
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">{msg.time}</div>
                </div>
              </div>
            ))}
          </div>

          {selectedTicket.status !== "closed" && (
            <div className="ticket-reply">
              <textarea
                className="reply-input"
                placeholder="Type your reply here..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                rows={4}
              />
              <div className="reply-actions">
                <span className="reply-hint">Press Send to submit your reply</span>
                <button
                  className="send-btn"
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                >
                  Send Reply ➤
                </button>
              </div>
            </div>
          )}

          {selectedTicket.status === "closed" && (
            <div className="ticket-closed-banner">
              <span>🔒</span>
              <span>This ticket is closed. Create a new ticket if you need further assistance.</span>
            </div>
          )}
        </div>
      )}

      {/* NEW TICKET */}
      {activeTab === "new" && (
        <div className="tab-content">
          {submitted ? (
            <div className="submit-success">
              <div className="success-icon">✓</div>
              <div className="success-title">Ticket Submitted Successfully!</div>
              <div className="success-sub">Our support team will respond within 24 hours. Redirecting to your tickets...</div>
            </div>
          ) : (
            <div className="new-ticket-form">
              <div className="form-card">
                <div className="form-card-header">
                  <h3>Create New Support Ticket</h3>
                  <span>Fill in the details below</span>
                </div>

                <div className="form-body">
                  <div className="form-group full">
                    <label>Subject <span className="required">*</span></label>
                    <input
                      name="subject"
                      className="ticket-input"
                      placeholder="Brief description of your issue"
                      value={form.subject}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Category <span className="required">*</span></label>
                      <select name="category" className="ticket-input" value={form.category} onChange={handleFormChange}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Priority <span className="required">*</span></label>
                      <select name="priority" className="ticket-input" value={form.priority} onChange={handleFormChange}>
                        {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-group full">
                    <label>Description <span className="required">*</span></label>
                    <textarea
                      name="description"
                      className="ticket-input ticket-textarea"
                      placeholder="Please describe your issue in detail. Include any relevant transaction IDs, error messages, or screenshots."
                      value={form.description}
                      onChange={handleFormChange}
                      rows={6}
                    />
                  </div>

                  <div className="form-group full">
                    <label>Attachment <span className="optional">(optional)</span></label>
                    <div className="file-upload">
                      <span className="file-icon">📎</span>
                      <span className="file-text">Click to attach files or drag and drop</span>
                      <span className="file-hint">PNG, JPG, PDF up to 10MB</span>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      className="cancel-btn"
                      onClick={() => setActiveTab("tickets")}
                    >
                      Cancel
                    </button>
                    <button
                      className="submit-btn"
                      onClick={handleSubmit}
                      disabled={!form.subject || !form.description}
                    >
                      Submit Ticket ➤
                    </button>
                  </div>
                </div>
              </div>

              <div className="ticket-tips">
                <div className="tips-header">
                  <h3>💡 Tips for faster resolution</h3>
                </div>
                <div className="tips-list">
                  {[
                    "Include your Transaction ID if the issue is related to a payment",
                    "Attach screenshots to help us understand the issue better",
                    "Select the correct category to route your ticket to the right team",
                    "Set priority to Urgent only for critical issues like account compromise",
                    "Check our Help Center FAQ before submitting — your answer may already be there",
                  ].map((tip, i) => (
                    <div className="tip-item" key={i}>
                      <span className="tip-num">{i + 1}</span>
                      <span className="tip-text">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default React.memo(Ticket);