import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import { Eye, EyeOff, Wallet } from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";
import "../styles/Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setToken } = useUserContext();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new URLSearchParams();
      data.append("username", username);
      data.append("password", password);
      const response = await API.post("/auth/login", data, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      localStorage.setItem("token", response.data.access_token);
      setToken(response.data.access_token);
      toast.success("Welcome back!");
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      navigate(redirect || "/dashboard");
    } catch (err) {
      toast.error("Invalid credentials. Please try again.");
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
          <h1>Track smarter.<br />Spend better.</h1>
          <p>Manage personal expenses, split group bills, and settle up with UPI — all in one place.</p>
          <div className="auth-features">
            <div className="auth-feature-item">✦ Personal expense tracking</div>
            <div className="auth-feature-item">✦ Group bill splitting</div>
            <div className="auth-feature-item">✦ UPI settlement</div>
            <div className="auth-feature-item">✦ Visual analytics</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Sign in</h2>
            <p>Welcome back to Trackr</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-field">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="auth-field">
              <div className="auth-field-header">
                <label>Password</label>
                <Link to="/forgot-password" className="auth-link-small">Forgot password?</Link>
              </div>
              <div className="auth-input-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;