import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Wallet } from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";
import "../styles/Login.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "", email: "", password: "", monthly_limit: 0
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.username.match(/^[a-zA-Z0-9]{3,50}$/)) {
      toast.error("Username must be alphanumeric, 3-50 characters");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await API.post("/auth/register", {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        monthly_limit: parseFloat(formData.monthly_limit) || 0
      });
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      toast.success("Account created! Please sign in.");
      navigate(redirect ? `/login?redirect=${redirect}` : "/login");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <Wallet size={22} strokeWidth={2.5} />
          </div>
          <span className="auth-brand-name">Trackr</span>
        </div>
        <div className="auth-left-content">
          <h1>Join Trackr.<br />Take control.</h1>
          <p>Start tracking your expenses in under a minute. No credit card required.</p>
          <div className="auth-features">
            <div className="auth-feature-item">✦ Free forever</div>
            <div className="auth-feature-item">✦ Set monthly budgets</div>
            <div className="auth-feature-item">✦ Split with friends</div>
            <div className="auth-feature-item">✦ Email alerts</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Create account</h2>
            <p>Get started with Trackr today</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="e.g. johndoe"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label>Monthly limit <span className="auth-optional">(optional)</span></label>
              <div className="auth-input-wrap">
                <span className="auth-input-prefix">₹</span>
                <input
                  type="number"
                  name="monthly_limit"
                  placeholder="5000"
                  value={formData.monthly_limit || ""}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="auth-input-prefixed"
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;