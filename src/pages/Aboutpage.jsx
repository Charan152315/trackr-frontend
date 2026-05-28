import { Wallet, Github, Code2, Database, Globe, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/About.css";

const techStack = [
  { icon: <Code2 size={18} />,    name: "React 19",     desc: "Frontend UI",    color: "#0ea5e9" },
  { icon: <Globe size={18} />,    name: "FastAPI",       desc: "Backend API",    color: "#22c55e" },
  { icon: <Database size={18} />, name: "PostgreSQL",    desc: "Database",       color: "#f59e0b" },
  { icon: <Code2 size={18} />,    name: "SQLAlchemy",    desc: "ORM",            color: "#8b5cf6" },
  { icon: <Globe size={18} />,    name: "JWT + Argon2",  desc: "Auth",           color: "#ef4444" },
  { icon: <Code2 size={18} />,    name: "Recharts",      desc: "Charts",         color: "#0ea5e9" },
  { icon: <Globe size={18} />,    name: "UPI Deeplink",  desc: "Payments",       color: "#22c55e" },
  { icon: <Code2 size={18} />,    name: "ReportLab",     desc: "PDF Export",     color: "#f59e0b" },
];

const features = [
  { emoji: "💸", title: "Personal Tracking",   desc: "Log and categorize daily spending. Set monthly limits and get email alerts." },
  { emoji: "👥", title: "Group Splitting",      desc: "Create groups, add members, split bills equally or with custom amounts." },
  { emoji: "📊", title: "Visual Analytics",     desc: "Pie charts and bar graphs break down spending by category monthly." },
  { emoji: "💳", title: "UPI Settlements",      desc: "Settle debts via UPI deeplink — opens any UPI app instantly." },
  { emoji: "🔔", title: "Smart Notifications",  desc: "Get notified on group activity, settlements, and budget alerts." },
  { emoji: "📤", title: "Export Reports",       desc: "Download expense history as CSV or PDF with one click." },
];

function About() {
  return (
    <div className="about-page">

      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <div className="about-logo-mark"><Wallet size={28} strokeWidth={2.5} /></div>
          <h1>Built for financial clarity</h1>
          <p>
            Trackr is an open-source, full-stack expense management app.
            Personal tracking, group splitting, UPI settlements, and
            visual analytics — all in one place.
          </p>
          <div className="about-hero-btns">
            <Link to="/register" className="btn btn-primary">
              Get Started <ArrowRight size={16} />
            </Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="btn btn-outline about-github-btn">
              <Github size={15} /> View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="about-features">
        <div className="about-section-inner">
          <div className="about-section-label">What it does</div>
          <h2>Everything in one app</h2>
          <div className="about-features-grid">
            {features.map((f, i) => (
              <div key={i} className="about-feature-card">
                <div className="about-feature-emoji">{f.emoji}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="about-tech">
        <div className="about-section-inner">
          <div className="about-section-label">Built with</div>
          <h2>Tech stack</h2>
          <div className="about-tech-grid">
            {techStack.map((t, i) => (
              <div key={i} className="about-tech-card">
                <div className="about-tech-icon" style={{ background: `${t.color}18`, color: t.color }}>
                  {t.icon}
                </div>
                <div>
                  <div className="about-tech-name">{t.name}</div>
                  <div className="about-tech-desc">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section className="about-arch">
        <div className="about-section-inner">
          <div className="about-section-label">Architecture</div>
          <h2>How it works</h2>
          <div className="about-arch-flow">
            <div className="arch-box arch-frontend">
              <div className="arch-box-label">Frontend</div>
              <div className="arch-box-items">
                <span>React 19 + Vite</span>
                <span>React Router v7</span>
                <span>Axios</span>
                <span>Recharts</span>
                <span>Tailwind CSS v4</span>
              </div>
            </div>
            <div className="arch-arrow">→</div>
            <div className="arch-box arch-backend">
              <div className="arch-box-label">Backend</div>
              <div className="arch-box-items">
                <span>FastAPI</span>
                <span>SQLAlchemy ORM</span>
                <span>Alembic Migrations</span>
                <span>JWT + Argon2</span>
                <span>SMTP Email</span>
              </div>
            </div>
            <div className="arch-arrow">→</div>
            <div className="arch-box arch-db">
              <div className="arch-box-label">Database</div>
              <div className="arch-box-items">
                <span>PostgreSQL</span>
                <span>Users + Expenses</span>
                <span>Groups + Splits</span>
                <span>Settlements</span>
                <span>Notifications</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="about-section-inner">
          <div className="about-cta-box">
            <h2>Ready to try it?</h2>
            <p>Create a free account in under a minute.</p>
            <Link to="/register" className="btn btn-primary btn-large">
              Create free account <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default About;