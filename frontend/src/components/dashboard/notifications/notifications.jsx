import React, { useState } from "react";
import "./notifications.css";

const NOTIFICATIONS = [
  { id: 1,  type: "trade",    icon: "🔄", title: "Buy Order Executed",        desc: "0.05 BTC purchased at $61,200",              time: "2 min ago",    read: false },
  { id: 2,  type: "security", icon: "🛡️", title: "New Device Login",          desc: "iPhone 15 Pro logged in from Mumbai, IN",    time: "1 hour ago",   read: false },
  { id: 3,  type: "pos",      icon: "💳", title: "POS Payment Received",       desc: "₹1,000 received via 0.0120 ETH",             time: "2 hours ago",  read: false },
  { id: 4,  type: "trade",    icon: "🔄", title: "Sell Order Executed",        desc: "0.80 ETH sold at $2,998",                    time: "Today, 07:32", read: true  },
  { id: 5,  type: "security", icon: "⚠️", title: "Failed Login Attempt",       desc: "Unknown device tried to login from Delhi",   time: "Yesterday",    read: true  },
  { id: 6,  type: "deposit",  icon: "⬇️", title: "Deposit Confirmed",          desc: "+500 USDT deposited to your wallet",         time: "Mar 01",       read: true  },
  { id: 7,  type: "pos",      icon: "💳", title: "POS Payment Received",       desc: "₹2,500 received via 0.0298 ETH",             time: "Mar 01",       read: true  },
  { id: 8,  type: "system",   icon: "📢", title: "System Maintenance",         desc: "Scheduled maintenance on Mar 10, 02:00 AM",  time: "Feb 28",       read: true  },
  { id: 9,  type: "trade",    icon: "🔄", title: "Buy Order Executed",         desc: "10 SOL purchased at $95",                    time: "Feb 27",       read: true  },
  { id: 10, type: "withdraw", icon: "⬆️", title: "Withdrawal Processed",       desc: "₹5,000 withdrawn successfully",              time: "Feb 26",       read: true  },
  { id: 11, type: "system",   icon: "🎉", title: "New Feature Available",      desc: "Portfolio section is now live on VPX",       time: "Feb 25",       read: true  },
  { id: 12, type: "security", icon: "✅", title: "KYC Level 2 Verified",       desc: "Your identity has been successfully verified",time: "Feb 24",      read: true  },
];

const FILTERS = [
  { label: "All",      type: null,                    emoji: "🔔" },
  { label: "Trades",   type: "trade",                 emoji: "🔄" },
  { label: "Security", type: "security",              emoji: "🛡️" },
  { label: "POS",      type: "pos",                   emoji: "💳" },
  { label: "Deposits", type: ["deposit", "withdraw"], emoji: "💰" },
  { label: "System",   type: "system",                emoji: "📢" },
];

const TYPE_CONFIG = {
  trade:    { color: "#00F0FF", bg: "rgba(0,240,255,0.08)",    border: "rgba(0,240,255,0.2)"    },
  security: { color: "#ef5350", bg: "rgba(239,83,80,0.08)",   border: "rgba(239,83,80,0.2)"    },
  pos:      { color: "#FF9800", bg: "rgba(255,152,0,0.08)",   border: "rgba(255,152,0,0.2)"    },
  deposit:  { color: "#26a69a", bg: "rgba(38,166,154,0.08)",  border: "rgba(38,166,154,0.2)"   },
  withdraw: { color: "#FF9800", bg: "rgba(255,152,0,0.08)",   border: "rgba(255,152,0,0.2)"    },
  system:   { color: "#888",    bg: "rgba(136,136,136,0.08)", border: "rgba(136,136,136,0.2)"  },
};

const Notifications = () => {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [filter, setFilter]               = useState("All");

  const unreadCount = notifications.filter(n => !n.read).length;

  const activeFilter = FILTERS.find(f => f.label === filter);

  const filteredNotifications = notifications.filter(n => {
    if (!activeFilter.type) return true;
    if (Array.isArray(activeFilter.type)) return activeFilter.type.includes(n.type);
    return n.type === activeFilter.type;
  });

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead    = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotif = (id) => setNotifications(prev => prev.filter(n => n.id !== id));
  const clearAll    = () => setNotifications([]);

  const todayNotifs      = filteredNotifications.filter(n => n.time.includes("min") || n.time.includes("hour") || n.time.includes("Today"));
  const earlierNotifs    = filteredNotifications.filter(n => !n.time.includes("min") && !n.time.includes("hour") && !n.time.includes("Today"));

  const NotifItem = ({ n }) => {
    const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
    return (
      <div className={`notif-item ${!n.read ? "unread" : ""}`} onClick={() => markRead(n.id)}>
        <div className="notif-icon-wrapper" style={{ background: config.bg, border: `1px solid ${config.border}` }}>
          <span className="notif-icon">{n.icon}</span>
        </div>
        <div className="notif-content">
          <div className="notif-top">
            <span className="notif-title">{n.title}</span>
            <span className="notif-time">{n.time}</span>
          </div>
          <div className="notif-desc">{n.desc}</div>
          <div className="notif-type-tag" style={{ color: config.color, background: config.bg }}>
            {n.type.charAt(0).toUpperCase() + n.type.slice(1)}
          </div>
        </div>
        <div className="notif-right">
          {!n.read && <div className="unread-dot" style={{ background: config.color }}></div>}
          <button className="delete-btn" onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}>✕</button>
        </div>
      </div>
    );
  };

  return (
    <div className="notifications-container">

      {/* HEADER */}
      <div className="notif-header">
        <div className="notif-header-left">
          <div className="notif-title-row">
            <h1>Notifications</h1>
            {unreadCount > 0 && <span className="unread-pill">{unreadCount} new</span>}
          </div>
          <p>Stay updated with your trading activity and account alerts</p>
        </div>
        <div className="notif-header-actions">
          {unreadCount > 0 && (
            <button className="header-btn" onClick={markAllRead}>✓ Mark all read</button>
          )}
          {notifications.length > 0 && (
            <button className="header-btn danger" onClick={clearAll}>🗑 Clear all</button>
          )}
        </div>
      </div>

      {/* STATS ROW */}
      <div className="notif-stats">
        {[
          { label: "Total",    value: notifications.length,                                          color: "#AAA"    },
          { label: "Unread",   value: unreadCount,                                                   color: "#00F0FF" },
          { label: "Trades",   value: notifications.filter(n => n.type === "trade").length,          color: "#00F0FF" },
          { label: "Security", value: notifications.filter(n => n.type === "security").length,       color: "#ef5350" },
          { label: "POS",      value: notifications.filter(n => n.type === "pos").length,            color: "#FF9800" },
        ].map((s, i) => (
          <div className="notif-stat-card" key={i}>
            <div className="notif-stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="notif-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="notif-filters">
        {FILTERS.map(f => (
          <button
            key={f.label}
            className={`notif-filter-btn ${filter === f.label ? "active" : ""}`}
            onClick={() => setFilter(f.label)}
          >
            <span>{f.emoji}</span>
            <span>{f.label}</span>
            {f.label === "All" && unreadCount > 0 && (
              <span className="filter-badge">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="notif-card">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <div className="empty-title">All caught up!</div>
            <div className="empty-sub">No notifications in this category</div>
          </div>
        ) : (
          <>
            {todayNotifs.length > 0 && (
              <div className="notif-group">
                <div className="group-label">Today</div>
                {todayNotifs.map(n => <NotifItem key={n.id} n={n} />)}
              </div>
            )}
            {earlierNotifs.length > 0 && (
              <div className="notif-group">
                <div className="group-label">Earlier</div>
                {earlierNotifs.map(n => <NotifItem key={n.id} n={n} />)}
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
};

export default React.memo(Notifications);