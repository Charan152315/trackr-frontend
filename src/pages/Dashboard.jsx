import { useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import "../styles/Dashboard.css";

const CATEGORIES = [
  { name: "Food",          icon: "🍔", color: "#fef3c7", text: "#92400e" },
  { name: "Transport",     icon: "🚗", color: "#dbeafe", text: "#1e40af" },
  { name: "Shopping",      icon: "🛍️", color: "#fce7f3", text: "#9d174d" },
  { name: "Bills",         icon: "📋", color: "#fee2e2", text: "#991b1b" },
  { name: "Health",        icon: "💊", color: "#dcfce7", text: "#166534" },
  { name: "Entertainment", icon: "🎬", color: "#ede9fe", text: "#5b21b6" },
  { name: "Other",         icon: "📦", color: "#f3f4f6", text: "#374151" },
];

const getCategoryData = (name) =>
  CATEGORIES.find((c) => c.name === name) || CATEGORIES[CATEGORIES.length - 1];

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchExpenses = async () => {
    try {
      const res = await API.get("/expenses/");
      setExpenses(res.data);
    } catch (err) {
      toast.error("Failed to fetch expenses");
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const expenseData = { title, amount: parseFloat(amount), category };
    try {
      if (editId) {
        await API.put(`/expenses/${editId}`, expenseData);
        toast.success("Expense updated");
        setEditId(null);
      } else {
        await API.post("/expenses/", expenseData);
        toast.success("Expense added");
      }
      setTitle("");
      setAmount("");
      setCategory("");
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error saving expense");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setTitle(expense.title);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setEditId(expense.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await API.delete(`/expenses/${id}`);
      toast.success("Expense deleted");
      fetchExpenses();
    } catch (err) {
      toast.error("Error deleting expense");
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setTitle("");
    setAmount("");
    setCategory("");
  };

  const [combinedTotal, setCombinedTotal] = useState(0);

  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const res = await API.get("/expenses/summary/monthly");
        setCombinedTotal(res.data.total_spent);
      } catch {}
    };
    fetchTotal();
  }, [expenses]);

  return (
    <div className="dashboard-container">

      {/* ===== PAGE HEADER ===== */}
      <div className="dash-header">
        <div>
          <h2>Dashboard</h2>
          <p className="dash-sub">Track your personal expenses</p>
        </div>
        <div className="dash-total-chip">
          <span className="dash-total-label">This month</span>
          <span className="dash-total-value">₹{combinedTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* ===== CATEGORY QUICK PICK ===== */}
      <div className="cat-grid">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            type="button"
            className={`cat-chip ${category === cat.name ? "cat-chip-active" : ""}`}
            onClick={() => setCategory(cat.name)}
            style={category === cat.name
              ? { background: cat.color, borderColor: cat.text, color: cat.text }
              : {}
            }
          >
            <span className="cat-icon">{cat.icon}</span>
            <span className="cat-name">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* ===== ADD / EDIT FORM ===== */}
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="expense-form-title">
          {editId ? "✏️ Edit Expense" : "➕ Add Expense"}
          {category && (
            <span className="form-cat-badge" style={{
              background: getCategoryData(category).color,
              color: getCategoryData(category).text
            }}>
              {getCategoryData(category).icon} {category}
            </span>
          )}
        </div>

        <div className="form-row-2">
          <div className="form-field">
            <label>Title</label>
            <input
              type="text"
              placeholder="What did you spend on?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label>Amount (₹)</label>
            <div className="amount-field-wrap">
              <span className="amount-prefix">₹</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                required
                className="amount-input-field"
              />
            </div>
          </div>
        </div>

        {!category && (
          <p className="form-cat-hint">← Pick a category above</p>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading || !category}>
            {loading ? "Saving..." : editId ? "Update Expense" : "Add Expense"}
          </button>
          {editId && (
            <button type="button" onClick={handleCancelEdit} className="btn btn-ghost">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* ===== EXPENSE LIST ===== */}
      <div className="expense-list-header">
        <h3>Recent Expenses</h3>
        <span className="expense-count">{expenses.length} total</span>
      </div>

      <ul className="expense-list">
        {expenses.length === 0 && (
          <div className="empty-msg">
            <span style={{ fontSize: "2rem" }}>💸</span>
            <p>No expenses yet. Add your first one!</p>
          </div>
        )}
        {expenses.map((exp) => {
          const cat = getCategoryData(exp.category);
          return (
            <li className="expense-item" key={exp.id}>
              <div className="expense-item-left">
                <div
                  className="expense-cat-icon"
                  style={{ background: cat.color, color: cat.text }}
                >
                  {cat.icon}
                </div>
                <div className="expense-item-info">
                  <span className="expense-title">{exp.title}</span>
                  <span className="expense-cat-label" style={{ color: cat.text }}>
                    {exp.category}
                  </span>
                </div>
              </div>
              <div className="expense-item-right">
                <span className="expense-amount">₹{parseFloat(exp.amount).toFixed(2)}</span>
                <div className="action-buttons">
                  <button className="edit-btn" onClick={() => handleEdit(exp)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(exp.id)}>Delete</button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Dashboard;