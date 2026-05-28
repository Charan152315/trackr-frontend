import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";
import { UserContext } from "../context/UserContext";
import { TrendingUp, RefreshCw } from "lucide-react";
import "../styles/Summary.css";

const COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

const Summary = () => {
  const { token } = useContext(UserContext);
  const [summary, setSummary] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchSummary = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);

      const [summaryRes, breakdownRes] = await Promise.all([
        API.get("/expenses/summary/monthly"),
        API.get("/expenses/breakdown/categories?days=30")
      ]);

      setSummary(summaryRes.data);
      setCategoryBreakdown(breakdownRes.data.breakdown || []);
      setError("");
    } catch (err) {
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) fetchSummary();
  }, [token]);

  if (loading) return <div className="summary-page"><p>Loading analytics...</p></div>;
  if (error) return (
    <div className="summary-page">
      <p>{error}</p>
      <button onClick={() => fetchSummary()}>Try Again</button>
    </div>
  );
  if (!summary) return null;

  const pieData = Object.entries(summary.by_category || {}).map(([name, value]) => ({
    name,
    value: parseFloat(value)
  }));

  const percentageUsed = summary.limit
    ? Math.min(Math.round((summary.total_spent / summary.limit) * 100), 100)
    : 0;

  return (
    <div className="summary-page">
      <div className="summary-header">
        <div>
          <h1>Expense Analytics</h1>
          <p>{summary.month}</p>
        </div>
        <div className="header-actions">
          <TrendingUp size={32} />
          <button
            onClick={() => fetchSummary(true)}
            disabled={refreshing}
            className="refresh-btn"
          >
            <RefreshCw size={20} className={refreshing ? "spinning" : ""} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-label">Total Spent</span>
          <span className="stat-value">₹{summary.total_spent.toFixed(2)}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Personal</span>
          <span className="stat-value">₹{(summary.personal_spent || 0).toFixed(2)}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Group Share</span>
          <span className="stat-value">₹{(summary.group_share || 0).toFixed(2)}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Monthly Limit</span>
          <span className="stat-value">
            {summary.limit ? `₹${summary.limit.toFixed(2)}` : "Not Set"}
          </span>
        </div>
      </div>

      {/* Budget progress */}
      {summary.limit && (
        <div className="progress-section">
          <div className="progress-header">
            <span>Budget Usage</span>
            <span>{percentageUsed}%</span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-fill ${
                percentageUsed >= 100 ? "danger" : percentageUsed > 80 ? "warning" : "success"
              }`}
              style={{ width: `${percentageUsed}%` }}
            />
          </div>
          {summary.warning && <p className="warning-box">{summary.warning}</p>}
        </div>
      )}

      {/* Charts */}
      {pieData.length > 0 ? (
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>By Category</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <p>No expenses this month. Start tracking to see analytics!</p>
        </div>
      )}

      {/* Category table */}
      {categoryBreakdown.length > 0 && (
        <div className="category-table-section">
          <h2>Category Details</h2>
          <table className="category-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Count</th>
                <th>Total</th>
                <th>Average</th>
                <th>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdown.map((item, i) => (
                <tr key={i}>
                  <td>
                    <span className="category-dot" style={{ background: COLORS[i % COLORS.length] }} />
                    {item.category}
                  </td>
                  <td>{item.count}</td>
                  <td>₹{item.total.toFixed(2)}</td>
                  <td>₹{item.average.toFixed(2)}</td>
                  <td>{item.percentage ?? ((item.total / summary.total_spent) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Summary;