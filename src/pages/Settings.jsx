import { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import API from "../services/api";
import toast from "react-hot-toast";
import { Settings, Wallet, Shield, TrendingUp, CheckCircle, Mail } from "lucide-react";
import "../styles/Settings.css";

const SettingsPage = () => {
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  // Budget
  const [newLimit, setNewLimit] = useState("");

  // UPI
  const [upiId, setUpiId] = useState(user?.upi_id || "");
  const [upiOtp, setUpiOtp] = useState("");
  const [upiStep, setUpiStep] = useState("idle");

  // Email
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailStep, setEmailStep] = useState("idle");

  useEffect(() => {
    API.get("/expenses/summary/monthly")
      .then(r => setSummary(r.data))
      .catch(() => {});
    if (user?.upi_id) setUpiId(user.upi_id);
  }, [user]);

  const spentPct = summary?.limit
    ? Math.min(100, Math.round((summary.total_spent / summary.limit) * 100))
    : 0;

  // Budget update
  const handleLimitUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put(`/users/set_limit?limit=${parseFloat(newLimit)}`);
      setUser(prev => ({ ...prev, monthly_limit: parseFloat(newLimit) }));
      toast.success("Budget limit updated!");
      setNewLimit("");
      API.get("/expenses/summary/monthly").then(r => setSummary(r.data));
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update limit");
    } finally {
      setLoading(false);
    }
  };

  // UPI request
  const handleUpiRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put("/users/upi", { upi_id: upiId });
      setUser(prev => ({ ...prev, upi_id: upiId, upi_verified: false }));
      toast.success("UPI saved. Now verify it.");
      setUpiStep("verify");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update UPI");
    } finally {
      setLoading(false);
    }
  };

  // UPI verify
  const handleUpiVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/users/upi/verify", { upi_id: upiId });
      setUser(prev => ({ ...prev, upi_verified: true }));
      toast.success("UPI verified!");
      setUpiStep("idle");
      setUpiOtp("");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Email request
  const handleEmailRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/users/change-email/request", { email: newEmail });
      setEmailStep("sent");
      toast.success("OTP sent to new email!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    } finally {
      setLoading(false);
    }
  };

  // Email confirm
  const handleEmailConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/users/change-email/confirm", { otp: emailOtp });
      setUser(prev => ({ ...prev, email: newEmail }));
      toast.success("Email updated!");
      setEmailStep("idle");
      setNewEmail("");
      setEmailOtp("");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="settings-page">

      <div className="settings-header">
        <Settings size={22} />
        <div>
          <h2>Settings</h2>
          <p>Manage account, payments and security</p>
        </div>
      </div>

      {/* BUDGET */}
      <div className="settings-card">
        <div className="settings-card-title">
          <TrendingUp size={15} /> Budget Settings
        </div>

        <div className="settings-current-val">
          Current limit: <strong>{user.monthly_limit ? `₹${parseFloat(user.monthly_limit).toFixed(0)}` : "Not set"}</strong>
        </div>

        {summary?.limit && (
          <div className="settings-progress-wrap">
            <div className="settings-progress-row">
              <span>₹{summary.total_spent.toFixed(0)} spent</span>
              <span>{spentPct}%</span>
            </div>
            <div className="settings-progress-track">
              <div
                className="settings-progress-fill"
                style={{
                  width: `${spentPct}%`,
                  background: spentPct >= 90 ? "var(--danger)" : spentPct >= 70 ? "#f59e0b" : "#22c55e"
                }}
              />
            </div>
            <div className="settings-progress-sub">of ₹{parseFloat(summary.limit).toFixed(0)} limit</div>
          </div>
        )}

        <form onSubmit={handleLimitUpdate}>
          <label>Update monthly limit</label>
          <div className="settings-input-prefix-wrap">
            <span>₹</span>
            <input
              type="number"
              placeholder={user.monthly_limit ? `Current: ₹${parseFloat(user.monthly_limit).toFixed(0)}` : "e.g. 10000"}
              value={newLimit}
              onChange={e => setNewLimit(e.target.value)}
              min="0"
              step="100"
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Update Limit"}
          </button>
        </form>
      </div>

      {/* UPI */}
      <div className="settings-card">
        <div className="settings-card-title">
          <Wallet size={15} /> Payment Settings
        </div>

        <div className="settings-status">
          {user.upi_verified
            ? <span className="verified"><CheckCircle size={13} /> {user.upi_id} — Verified</span>
            : user.upi_id
              ? <span className="unverified">{user.upi_id} — Not verified</span>
              : <span className="unverified">No UPI linked</span>
          }
        </div>

        {upiStep === "idle" && (
          <form onSubmit={handleUpiRequest}>
            <label>{user.upi_id ? "Update UPI ID" : "Set UPI ID"}</label>
            <input
              type="text"
              placeholder="yourname@upi"
              value={upiId}
              onChange={e => setUpiId(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save & Verify UPI"}
            </button>
          </form>
        )}

        {upiStep === "verify" && (
          <form onSubmit={handleUpiVerify}>
            <div className="email-msg">
              UPI saved. Click verify to confirm.
            </div>
            <div className="email-actions">
              <button type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify UPI"}
              </button>
              <button type="button" className="cancel-btn" onClick={() => setUpiStep("idle")}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* SECURITY */}
      <div className="settings-card">
        <div className="settings-card-title">
          <Shield size={15} /> Security
        </div>

        <p className="current-email">
          Current email: <strong>{user.email}</strong>
        </p>

        {emailStep === "idle" && (
          <form onSubmit={handleEmailRequest}>
            <label>New email address</label>
            <input
              type="email"
              placeholder="newemail@gmail.com"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Sending OTP..." : "Send Verification OTP"}
            </button>
          </form>
        )}

        {emailStep === "sent" && (
          <div className="email-box">
            <div className="email-msg">
              <Mail size={14} /> OTP sent to <strong>{newEmail}</strong>
            </div>
            <form onSubmit={handleEmailConfirm}>
              <label>Enter 6-digit OTP</label>
              <input
                type="text"
                placeholder="e.g. 482910"
                value={emailOtp}
                onChange={e => setEmailOtp(e.target.value)}
                maxLength={6}
                required
              />
              <div className="email-actions">
                <button type="submit" disabled={loading}>
                  {loading ? "Confirming..." : "Confirm Change"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => { setEmailStep("idle"); setNewEmail(""); setEmailOtp(""); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

    </div>
  );
};

export default SettingsPage;