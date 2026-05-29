import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { UserContext  } from "../context/UserContext";
import { useEffect } from "react";
import {
  Home, Info, User, LayoutDashboard,
  BarChart2, Users, LogOut, LogIn, UserPlus,
  Menu, X, ChevronsLeft, ChevronsRight,
  Moon, Sun, Wallet,Settings as SettingsIcon
} from "lucide-react";
import "../styles/Navbar.css";
import API from "../services/api";

import { Bell, Activity, Download } from "lucide-react";

const Navbar = () => {
  const { user, logoutUser, theme, toggleTheme } = useContext(UserContext);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchUnread = () => {
      API.get("/notifications/")
        .then(res =>
          setUnreadCount(
            res.data.unread_count
          )
        )
        .catch(() => {});
    };

    fetchUnread();

    window.addEventListener(
      "notificationsUpdated",
      fetchUnread
    );

    return () =>
      window.removeEventListener(
        "notificationsUpdated",
        fetchUnread
      );

  }, [user]);

    const handleLogout = () => {
      logoutUser();
      navigate("/login");
      setMobileOpen(false);
    };

  const close = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button className="navbar-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      <div className={`navbar-overlay ${mobileOpen ? "active" : ""}`} onClick={close} />

      <aside className={`navbar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>

        {/* ===== LOGO ===== */}
        <div className="navbar-logo">
          <NavLink to="/" onClick={close} className="logo-link">
            <div className="logo-mark">
              <Wallet size={16} strokeWidth={2.5} />
            </div>
            <span className="logo-text">Trackr</span>
          </NavLink>

          <button
            className="collapse-toggle"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
          </button>
        </div>

        {/* ===== USER CHIP ===== */}
        {user && (
          <div className="navbar-user-wrap">
            <div className="navbar-user" onClick={() => setShowUserMenu(!showUserMenu)}>
              <div className="navbar-user-avatar">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="navbar-user-info">
                  <div className="navbar-user-name">{user.username}</div>
                  <div className="navbar-user-role">
                    {user.upi_verified
                      ? <span className="role-verified">● Verified</span>
                      : <span className="role-user">● Member</span>
                    }
                  </div>
                </div>
              )}
            </div>

            {showUserMenu && !collapsed && (
              <div className="user-dropdown">
                <NavLink to="/profile" className="user-dropdown-item" onClick={() => setShowUserMenu(false)}>
                  <User size={14} /> Profile & Settings
                </NavLink>
                <div className="user-dropdown-wallet">
                  <div className="wallet-header">
                    <Wallet size={14} />
                    <span>Wallet</span>
                    <span className="wallet-badge">Soon</span>
                  </div>
                  <div className="wallet-balance">
                    <span className="wallet-bal-label">Balance</span>
                    <span className="wallet-bal-value">₹0.00</span>
                  </div>
                  <button className="wallet-add-btn" disabled title="Coming soon">
                    + Add Money via UPI
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== NAV LINKS ===== */}
        <nav className="navbar-links">

          {!user && (
            <>
              <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} onClick={close} title="Home">
                <Home size={17} />
                <span className="nav-text">Home</span>
              </NavLink>
              <NavLink to="/about" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} onClick={close} title="About">
                <Info size={17} />
                <span className="nav-text">About</span>
              </NavLink>
              <div className="nav-divider" />
              <NavLink to="/login" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} onClick={close} title="Login">
                <LogIn size={17} />
                <span className="nav-text">Sign in</span>
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} onClick={close} title="Register">
                <UserPlus size={17} />
                <span className="nav-text">Sign up</span>
              </NavLink>
            </>
          )}

          {user && (
            <>
              {!collapsed && <div className="nav-section-label">Overview</div>}
              <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} onClick={close} title="Dashboard">
                <LayoutDashboard size={17} />
                <span className="nav-text">Dashboard</span>
              </NavLink>
              <NavLink to="/summary" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} onClick={close} title="Summary">
                <BarChart2 size={17} />
                <span className="nav-text">Analytics</span>
              </NavLink>

              {!collapsed && <div className="nav-section-label">Social</div>}
              <NavLink to="/groups" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} onClick={close} title="Groups">
                <Users size={17} />
                <span className="nav-text">Groups</span>
              </NavLink>

              {!collapsed && <div className="nav-section-label">Account</div>}
              <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} onClick={close} title="Profile">
                <User size={17} />
                <span className="nav-text">Profile</span>
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
                onClick={close}
                title="Settings"
              >
                <SettingsIcon size={17} />
                <span className="nav-text">
                  Settings
                </span>
              </NavLink>
              {!collapsed && <div className="nav-section-label">Tools</div>}
              <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} onClick={close} title="Notifications">
                <div style={{ position: "relative" }}>
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: "absolute", top: -6, right: -8,
                      background: "var(--danger)", color: "white",
                      borderRadius: "50%", width: 16, height: 16,
                      fontSize: 9, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
                  )}
                </div>
                <span className="nav-text">Notifications</span>
              </NavLink>

              <NavLink to="/activity" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} onClick={close} title="Activity">
                <Activity size={17} />
                <span className="nav-text">Activity Log</span>
              </NavLink>

              <NavLink to="/export" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} onClick={close} title="Export">
                <Download size={17} />
                <span className="nav-text">Export Data</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* ===== BOTTOM ACTIONS ===== */}
        <div className="navbar-bottom">
          <button className="nav-item theme-btn" onClick={toggleTheme} title={theme === "light" ? "Dark mode" : "Light mode"}>
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            <span className="nav-text">{theme === "light" ? "Dark mode" : "Light mode"}</span>
          </button>

          {user && (
            <button className="nav-item logout-item" onClick={handleLogout} title="Sign out">
              <LogOut size={17} />
              <span className="nav-text">Sign out</span>
            </button>
          )}
        </div>

      </aside>
    </>
  );
};

export default Navbar;