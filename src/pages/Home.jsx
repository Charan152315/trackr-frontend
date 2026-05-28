import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { ArrowRight, Wallet } from "lucide-react";
import "../styles/Home.css";

const Home = () => {
  const { user } = useContext(UserContext);

  const features = [
    { icon: "💸", title: "Personal Tracking", desc: "Log and categorize daily expenses in seconds. Set monthly budgets and get instant alerts." },
    { icon: "👥", title: "Group Splitting",   desc: "Split bills equally or with custom amounts. Settle up via UPI directly inside the app." },
    { icon: "📊", title: "Visual Analytics", desc: "Pie charts and bar graphs show exactly where your money goes every month." },
    { icon: "🔔", title: "Smart Alerts",     desc: "Get notified when you cross your budget limit, receive settlements, or get added to groups." },
    { icon: "📤", title: "Export Reports",   desc: "Download your expenses as CSV or PDF with one click, ready for sharing or tax." },
    { icon: "🌙", title: "Dark Mode",        desc: "Full dark mode support. Works great on desktop and mobile alike." },
  ];

  return (
    <div className="home-page">

      {/* ===== HERO ===== */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-brand">
            <div className="home-brand-mark"><Wallet size={20} strokeWidth={2.5} /></div>
            <span>Trackr</span>
          </div>

          <h1>
            Track smarter.<br />
            <span className="home-gradient-text">Spend better.</span>
          </h1>
          <p>
            Manage personal expenses, split group bills, settle up via UPI,
            and visualize your spending — all in one clean app.
          </p>

          <div className="home-hero-btns">
            {!user ? (
              <>
                <Link to="/register" className="btn btn-primary btn-large">
                  Get Started <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-outline btn-large">Sign In</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="btn btn-primary btn-large">
                  Dashboard <ArrowRight size={18} />
                </Link>
                <Link to="/groups" className="btn btn-outline btn-large">My Groups</Link>
              </>
            )}
          </div>

          <div className="home-hero-stats">
            <div className="home-hero-stat"><span>Free</span><span>Forever</span></div>
            <div className="home-hero-stat-div" />
            <div className="home-hero-stat"><span>UPI</span><span>Settlements</span></div>
            <div className="home-hero-stat-div" />
            <div className="home-hero-stat"><span>Open</span><span>Source</span></div>
          </div>
        </div>

        <div className="home-hero-visual">
          <div className="home-mock-card">
            <div className="home-mock-header">
              <div className="home-mock-dot red" /><div className="home-mock-dot yellow" /><div className="home-mock-dot green" />
            </div>
            <div className="home-mock-body">
              <div className="home-mock-stat-row">
                <div className="home-mock-stat blue">
                  <span>Total Spent</span>
                  <strong>₹8,450</strong>
                </div>
                <div className="home-mock-stat green">
                  <span>Saved</span>
                  <strong>₹1,550</strong>
                </div>
              </div>
              <div className="home-mock-label">Recent Expenses</div>
              {[
                { icon: "🍔", name: "Food", amt: "₹340", cat: "food" },
                { icon: "🚗", name: "Transport", amt: "₹120", cat: "transport" },
                { icon: "🛍️", name: "Shopping", amt: "₹890", cat: "shopping" },
              ].map((e, i) => (
                <div key={i} className="home-mock-expense">
                  <span className="home-mock-exp-icon">{e.icon}</span>
                  <span className="home-mock-exp-name">{e.name}</span>
                  <span className="home-mock-exp-amt">{e.amt}</span>
                </div>
              ))}
              <div className="home-mock-progress-wrap">
                <div className="home-mock-progress-label">
                  <span>Budget</span><span>84%</span>
                </div>
                <div className="home-mock-progress-track">
                  <div className="home-mock-progress-fill" style={{ width: "84%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="home-features">
        <div className="home-features-inner">
          <div className="home-section-label">Everything you need</div>
          <h2>Built for real financial clarity</h2>
          <div className="home-features-grid">
            {features.map((f, i) => (
              <div key={i} className="home-feature-card">
                <div className="home-feature-emoji">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DARK STATS BAR ===== */}
      <section className="home-stats-bar">
        <div className="home-stats-inner">
          <div className="home-stat-item">
            <div className="home-stat-num">₹0</div>
            <div className="home-stat-lbl">Cost to use</div>
          </div>
          <div className="home-stat-item">
            <div className="home-stat-num">7</div>
            <div className="home-stat-lbl">Expense categories</div>
          </div>
          <div className="home-stat-item">
            <div className="home-stat-num">UPI</div>
            <div className="home-stat-lbl">Native settlement</div>
          </div>
          <div className="home-stat-item">
            <div className="home-stat-num">CSV+PDF</div>
            <div className="home-stat-lbl">Export formats</div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="home-cta">
        <div className="home-cta-inner">
          <h2>Start tracking today.</h2>
          <p>Free, fast, and built for India. No credit card required.</p>
          {!user ? (
            <Link to="/register" className="btn btn-primary btn-large">
              Create free account <ArrowRight size={18} />
            </Link>
          ) : (
            <Link to="/dashboard" className="btn btn-primary btn-large">
              Go to Dashboard <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </section>

    </div>
  );
};

export default Home;