import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { UserContext } from "../context/UserContext";
import { RefreshCw, TrendingUp, TrendingDown, Wallet, Users, Target } from "lucide-react";
import "../styles/Summary.css";

const CATEGORY_COLORS = [
  "#38bdf8", "#22c55e", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#0ea5e9"
];

const CATEGORY_EMOJI = {
  Food: "🍔", Transport: "🚗", Shopping: "🛍️",
  Bills: "📋", Health: "💊", Entertainment: "🎬", Other: "📦"
};

const Summary = () => {
  const { token } = useContext(UserContext);
  const [summary, setSummary] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const [summaryRes, breakdownRes, statsRes] = await Promise.all([
        API.get("/expenses/summary/monthly"),
        API.get("/expenses/breakdown/categories?days=30"),
        API.get("/expenses/stats/overview"),
      ]);
      setSummary(summaryRes.data);
      setCategoryBreakdown(breakdownRes.data.breakdown || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (token) fetchAll(); }, [token]);

  if (loading) return (
    <div className="summary-page">
      <div className="summary-loading">
        <div className="spinner" />
        <span>Loading analytics...</span>
      </div>
    </div>
  );

  if (!summary) return null;

  const spentPct = summary.limit
    ? Math.min(100, Math.round((summary.total_spent / summary.limit) * 100))
    : 0;

  const topCategory = categoryBreakdown[0];
  const totalCatSpend = categoryBreakdown.reduce((s, c) => s + c.total, 0);

  const changePositive = stats?.change_percentage >= 0;

  return (
    <div className="summary-page">

      {/* ===== PAGE HEADER ===== */}
      <div className="summary-page-header">
        <div>
          <h2>Analytics</h2>
          <p className="summary-month-label">{summary.month}</p>
        </div>
        <button
          className="summary-refresh-btn"
          onClick={() => fetchAll(true)}
          disabled={refreshing}
          title="Refresh"
        >
          <RefreshCw size={16} className={refreshing ? "spinning" : ""} />
        </button>
      </div>

      {/* ===== TOP STAT CARDS ===== */}
      <div className="summary-stats-row">
        <div className="summary-stat-card primary">
          <div className="ssc-icon"><Wallet size={18} /></div>
          <div className="ssc-body">
            <span className="ssc-label">Total Spent</span>
            <span className="ssc-value">₹{summary.total_spent.toFixed(2)}</span>
          </div>
        </div>
        <div className="summary-stat-card">
          <div className="ssc-icon green"><TrendingUp size={18} /></div>
          <div className="ssc-body">
            <span className="ssc-label">Personal</span>
            <span className="ssc-value">₹{(summary.personal_spent || 0).toFixed(2)}</span>
          </div>
        </div>
        <div className="summary-stat-card">
          <div className="ssc-icon purple"><Users size={18} /></div>
          <div className="ssc-body">
            <span className="ssc-label">Group Share</span>
            <span className="ssc-value">₹{(summary.group_share || 0).toFixed(2)}</span>
          </div>
        </div>
        <div className="summary-stat-card">
          <div className="ssc-icon amber"><Target size={18} /></div>
          <div className="ssc-body">
            <span className="ssc-label">Monthly Limit</span>
            <span className="ssc-value">
              {summary.limit ? `₹${parseFloat(summary.limit).toFixed(0)}` : "Not set"}
            </span>
          </div>
        </div>
      </div>

      {/* ===== BUDGET PROGRESS ===== */}
      {summary.limit && (
        <div className="summary-budget-card">
          <div className="summary-budget-top">
            <div>
              <span className="summary-budget-title">Budget</span>
              <span className="summary-budget-sub">
                ₹{summary.total_spent.toFixed(0)} of ₹{parseFloat(summary.limit).toFixed(0)}
              </span>
            </div>
            <span className={`summary-budget-pct ${spentPct >= 90 ? "danger" : spentPct >= 70 ? "warning" : "good"}`}>
              {spentPct}%
            </span>
          </div>
          <div className="summary-budget-track">
            <div
              className="summary-budget-fill"
              style={{
                width: `${spentPct}%`,
                background: spentPct >= 90 ? "#ef4444" : spentPct >= 70 ? "#f59e0b" : "#22c55e"
              }}
            />
          </div>
          {summary.warning && (
            <div className="summary-warning-msg">⚠ {summary.warning}</div>
          )}
        </div>
      )}

      {/* ===== MAIN CONTENT GRID ===== */}
      {categoryBreakdown.length > 0 ? (
        <div className="summary-content-grid">

          {/* LEFT — Category breakdown list (Splitwise style) */}
          <div className="summary-panel">
            <div className="summary-panel-header">
              <h3>Category Breakdown</h3>
              <span className="summary-panel-sub">{summary.month}</span>
            </div>

            {/* Donut chart built with SVG */}
            <div className="summary-donut-wrap">
              <DonutChart data={categoryBreakdown} colors={CATEGORY_COLORS} total={totalCatSpend} />
            </div>

            {/* Category list */}
            <div className="summary-cat-list">
              {categoryBreakdown.map((cat, i) => {
                const pct = totalCatSpend > 0 ? ((cat.total / totalCatSpend) * 100).toFixed(1) : 0;
                return (
                  <div key={i} className="summary-cat-item">
                    <div className="summary-cat-left">
                      <div className="summary-cat-dot" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                      <span className="summary-cat-emoji">{CATEGORY_EMOJI[cat.category] || "📦"}</span>
                      <span className="summary-cat-name">{cat.category}</span>
                    </div>
                    <div className="summary-cat-right">
                      <span className="summary-cat-amt">₹{cat.total.toFixed(0)}</span>
                      <span className="summary-cat-pct">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT — Stats + Bar chart */}
          <div className="summary-right-col">

            {/* Month comparison card */}
            {stats && (
              <div className="summary-panel summary-compare-card">
                <div className="summary-panel-header">
                  <h3>vs Last Month</h3>
                </div>
                <div className="summary-compare-row">
                  <div className="summary-compare-item">
                    <span className="summary-compare-label">This month</span>
                    <span className="summary-compare-val primary">₹{stats.current_month_total.toFixed(0)}</span>
                  </div>
                  <div className="summary-compare-arrow">
                    {changePositive
                      ? <TrendingUp size={20} className="trend-up" />
                      : <TrendingDown size={20} className="trend-down" />
                    }
                  </div>
                  <div className="summary-compare-item right">
                    <span className="summary-compare-label">Last month</span>
                    <span className="summary-compare-val">₹{stats.last_month_total.toFixed(0)}</span>
                  </div>
                </div>
                <div className={`summary-change-badge ${changePositive ? "up" : "down"}`}>
                  {changePositive ? "▲" : "▼"} {Math.abs(stats.change_percentage).toFixed(1)}% vs last month
                </div>
                {stats.top_category && (
                  <div className="summary-top-cat">
                    Top: {CATEGORY_EMOJI[stats.top_category] || "📦"} {stats.top_category} — ₹{stats.top_category_amount.toFixed(0)}
                  </div>
                )}
              </div>
            )}

            {/* Horizontal bar chart */}
            <div className="summary-panel">
              <div className="summary-panel-header">
                <h3>Spending by Category</h3>
              </div>
              <div className="summary-hbar-list">
                {categoryBreakdown.map((cat, i) => {
                  const pct = totalCatSpend > 0 ? (cat.total / totalCatSpend) * 100 : 0;
                  return (
                    <div key={i} className="summary-hbar-item">
                      <div className="summary-hbar-label">
                        <span>{CATEGORY_EMOJI[cat.category] || "📦"} {cat.category}</span>
                        <span className="summary-hbar-amt">₹{cat.total.toFixed(0)}</span>
                      </div>
                      <div className="summary-hbar-track">
                        <div
                          className="summary-hbar-fill"
                          style={{
                            width: `${pct}%`,
                            background: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="empty-state">
          <span style={{ fontSize: "2.5rem" }}>📊</span>
          <h3>No expenses this month</h3>
          <p>Start tracking expenses to see analytics here.</p>
        </div>
      )}

      {/* ===== CATEGORY TABLE ===== */}
      {categoryBreakdown.length > 0 && (
        <div className="summary-table-card">
          <div className="summary-panel-header">
            <h3>Detailed Breakdown</h3>
            <span className="summary-panel-sub">{categoryBreakdown.length} categories</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Transactions</th>
                <th>Total</th>
                <th>Average</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdown.map((item, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                        flexShrink: 0
                      }} />
                      <span>{CATEGORY_EMOJI[item.category] || "📦"} {item.category}</span>
                    </div>
                  </td>
                  <td>{item.count}</td>
                  <td style={{ fontWeight: 700, color: "#0ea5e9" }}>₹{item.total.toFixed(2)}</td>
                  <td>₹{item.average.toFixed(2)}</td>
                  <td>
                    <div className="summary-share-bar-wrap">
                      <div
                        className="summary-share-bar"
                        style={{
                          width: `${item.percentage}%`,
                          background: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
                        }}
                      />
                      <span>{item.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

/* ===== DONUT CHART COMPONENT ===== */
const DonutChart = ({ data, colors, total }) => {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 58;
  const ir = 35;

  let cumAngle = -Math.PI / 2;

  const slices = data.map((d, i) => {
    const frac = total > 0 ? d.total / total : 0;
    const angle = frac * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + r * Math.cos(cumAngle);
    const y2 = cy + r * Math.sin(cumAngle);
    const ix1 = cx + ir * Math.cos(cumAngle);
    const iy1 = cy + ir * Math.sin(cumAngle);
    const ix2 = cx + ir * Math.cos(cumAngle - angle);
    const iy2 = cy + ir * Math.sin(cumAngle - angle);
    const large = angle > Math.PI ? 1 : 0;

    return {
      d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${ir} ${ir} 0 ${large} 0 ${ix2} ${iy2} Z`,
      color: colors[i % colors.length],
      label: d.category
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => (
        <path
          key={i}
          d={s.d}
          fill={s.color}
          stroke={data.length === 1 ? "none" : "var(--bg-page)"}
          strokeWidth={data.length === 1 ? 0 : 2}
        />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--text-primary)" fontSize="13" fontWeight="700">
        ₹{total.toFixed(0)}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--text-muted)" fontSize="10">
        total
      </text>
    </svg>
  );
};

export default Summary;