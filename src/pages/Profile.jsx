import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import API from "../services/api";
import {
  User,
  Mail,
  Calendar,
  CheckCircle,
  Wallet,
  Users,
  Activity,
  Settings
} from "lucide-react";
import { NavLink } from "react-router-dom";
import "../styles/Profile.css";

const Profile = () => {
  const { user } = useContext(UserContext);

  const [summary, setSummary] = useState(null);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    API.get("/expenses/summary/monthly")
      .then(res => setSummary(res.data))
      .catch(() => {});

    API.get("/groups/")
      .then(res => setGroups(res.data || []))
      .catch(() => {});
  }, []);

  if (!user) return null;

  const memberSince = new Date(
    user.created_at
  ).toLocaleDateString(
    "en-IN",
    {
      month: "long",
      year: "numeric"
    }
  );

  return (
    <div className="profile-page">

      {/* HERO */}

      <div className="profile-hero">

        <div className="profile-avatar-ring">
          <div className="profile-avatar">
            {user.username?.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="profile-hero-info">

          <h1>{user.username}</h1>

          <div className="profile-email">
            <Mail size={14} />
            {user.email}
          </div>

          <div className="profile-meta">

            <span>
              <Calendar size={13} />
              Member since {memberSince}
            </span>

            {user.upi_verified ? (
              <span className="profile-badge verified">
                <CheckCircle size={12} />
                UPI Verified
              </span>
            ) : (
              <span className="profile-badge unverified">
                UPI Not Verified
              </span>
            )}

          </div>

        </div>
      </div>

      {/* STATS */}

      {/* STATS */}

      <div className="profile-stats">

        <div className="profile-stat-card">
          <Wallet size={18} />
          <div>
            <h3>
              ₹
              {summary
                ? Number(summary.total_spent).toFixed(0)
                : "0"}
            </h3>
            <p>This Month</p>
          </div>
        </div>

        <div className="profile-stat-card">
          <Users size={18} />
          <div>
            <h3>{groups.length}</h3>
            <p>Groups Joined</p>
          </div>
        </div>

        <div className="profile-stat-card">
          <Activity size={18} />
          <div>
            <h3>
              {summary
                ? summary.total_expenses
                : 0}
            </h3>
            <p>Total Expenses</p>
          </div>
        </div>

      </div>

      {/* PROFILE SUMMARY */}

      <div className="profile-card">

        <div className="profile-card-title">
          <User size={16} />
          Profile Summary
        </div>

        <div className="profile-summary-grid">

          <div className="profile-summary-item">
            <span>Status</span>
            <strong>
              {user.upi_verified
                ? "Verified Member"
                : "Standard Member"}
            </strong>
          </div>

          <div className="profile-summary-item">
            <span>Budget Tracking</span>
            <strong>
              {user.monthly_limit
                ? "Budget Enabled"
                : "No Budget Set"}
            </strong>
          </div>

          <div className="profile-summary-item">
            <span>Payments</span>
            <strong>
              {user.upi_id
                ? "UPI Linked"
                : "UPI Not Linked"}
            </strong>
          </div>

          <div className="profile-summary-item">
            <span>Account</span>
            <strong>Active</strong>
          </div>

        </div>

      </div>

      {/* ACCOUNT */}

      <div className="profile-card">

        <div className="profile-card-title">
          <User size={16} />
          Account Overview
        </div>

        <div className="profile-info-grid">

          <div className="profile-info-item">
            <span>Username</span>
            <strong>{user.username}</strong>
          </div>

          <div className="profile-info-item">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>

          <div className="profile-info-item">
            <span>Monthly Limit</span>
            <strong>
              {user.monthly_limit
                ? `₹${user.monthly_limit}`
                : "Not set"}
            </strong>
          </div>

          <div className="profile-info-item">
            <span>UPI</span>
            <strong>
              {user.upi_id || "Not set"}
            </strong>
          </div>

        </div>
      </div>

      {/* QUICK ACTIONS */}

      <div className="profile-card">

        <div className="profile-card-title">
          <Settings size={16} />
          Quick Actions
        </div>

        <div className="profile-actions">

          <NavLink
            to="/settings"
            className="profile-action-btn"
          >
            <Settings size={15} />
            Settings
          </NavLink>

          <NavLink
            to="/activity"
            className="profile-action-btn"
          >
            <Activity size={15} />
            Activity Log
          </NavLink>

          <NavLink
            to="/dashboard"
            className="profile-action-btn"
          >
            Dashboard
          </NavLink>

        </div>
      </div>

    </div>
  );
};

export default Profile;