import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiTrendingUp, 
  FiRepeat, 
  FiCreditCard, 
  FiBriefcase,
  FiUser,
  FiShield,
  FiBell,
  FiHelpCircle,
  FiMail 
} from 'react-icons/fi';
import VPXLogo from '../../common/VPXLogo';
import './sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="sidebar">
      <div className="logo">
        <VPXLogo size="lg" />
      </div>

      <nav className="nav-menu">
        <div className="nav-section">
          <ul>
            <li className={`nav-item ${isActive('/portfolio') ? 'active' : ''}`}>
              <Link to="/dashboard/portfolio" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%' }}>
                <FiBriefcase className="icon" />
                <span>Portfolio</span>
              </Link>
            </li>
            <li className={`nav-item ${isActive('/markets') ? 'active' : ''}`}>
              <Link to="/dashboard/markets" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%' }}>
                <FiTrendingUp className="icon" />
                <span>Markets</span>
              </Link>
            </li>
            <li className={`nav-item ${isActive('/trade') ? 'active' : ''}`}>
              <Link to="/dashboard/trade" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%' }}>
                <FiRepeat className="icon" />
                <span>Trade</span>
              </Link>
            </li>
            <li className={`nav-item ${isActive('/wallet') ? 'active' : ''}`}>
              <Link to="/dashboard/wallet" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%' }}>
                <FiCreditCard className="icon" />
                <span>Wallet</span>
              </Link>
            </li>
            <li className={`nav-item ${isActive('/pos') ? 'active' : ''}`}>
              <Link to="/dashboard/pos" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%' }}>
                <FiBriefcase className="icon" />
                <span>POS Terminal</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="nav-section">
          <p className="section-title">ACCOUNT</p>
          <ul>
            <li className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
              <Link to="/dashboard/profile" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%' }}>
                <FiUser className="icon" />
                <span>Profile</span>
              </Link>
            </li>
            <li className={`nav-item ${isActive('/security') ? 'active' : ''}`}>
              <Link to="/dashboard/security" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%' }}>
                <FiShield className="icon" />
                <span>Security</span>
              </Link>
            </li>
            <li className={`nav-item ${isActive('/notifications') ? 'active' : ''}`}>
              <Link to="/dashboard/notifications" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%' }}>
                <FiBell className="icon" />
                <span>Notifications</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="nav-section">
          <p className="section-title">SUPPORT</p>
          <ul>
            <li className={`nav-item ${isActive('/help') ? 'active' : ''}`}>
              <Link to="/dashboard/help" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%' }}>
                <FiHelpCircle className="icon" />
                <span>Help Center</span>
              </Link>
            </li>
            <li className={`nav-item ${isActive('/ticket') ? 'active' : ''}`}>
              <Link to="/dashboard/ticket" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%' }}>
                <FiMail className="icon" />
                <span>Support Ticket</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
