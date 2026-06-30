import { useState } from "react";
import { DollarSign, Receipt, CheckCircle, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../services/api";

const ExpensesTab = ({ groupId, expenses, members, user, refresh }) => {
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [paidById, setPaidById] = useState("");
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [evenSplit, setEvenSplit] = useState(true);
  const [customSplits, setCustomSplits] = useState(
    members.map(m => ({ user_id: m.user_id, username: m.username, amount: 0 }))
  );

  const updateCustomSplit = (userId, amount) =>
    setCustomSplits(prev => prev.map(s => s.user_id === userId ? { ...s, amount: parseFloat(amount) || 0 } : s));

  const distributeEqually = () => {
    if (!expenseAmount || !members.length) return;
    const share = parseFloat((parseFloat(expenseAmount) / members.length).toFixed(2));
    setCustomSplits(prev => prev.map(s => ({ ...s, amount: share })));
  };

  const resetForm = () => {
    setExpenseDescription(""); setExpenseAmount(""); setEvenSplit(true);
    setCustomSplits(members.map(m => ({ user_id: m.user_id, username: m.username, amount: 0 })));
    setPaidById(""); setEditingExpenseId(null);
  };

  const handleAddExpense = async () => {
    if (!expenseDescription || !expenseAmount || !paidById) {
      toast.error("Description, amount and who paid are required"); return;
    }
    if (!evenSplit) {
      const totalSplit = customSplits.reduce((s, x) => s + x.amount, 0);
      const expenseAmt = parseFloat(expenseAmount);
      if (Math.abs(totalSplit - expenseAmt) > 0.01) {
        toast.error(`Splits ₹${totalSplit.toFixed(2)} must equal ₹${expenseAmt.toFixed(2)}`); return;
      }
    }
    try {
      if (editingExpenseId) {
        await API.put(`/groups/${groupId}/expenses/${editingExpenseId}`, { description: expenseDescription });
        toast.success("Expense updated!");
        resetForm();
        refresh();
        return;
      }
      await API.post(`/groups/${groupId}/expenses`, {
        group_id: groupId, paid_by_id: paidById,
        description: expenseDescription, amount: parseFloat(expenseAmount),
        even_split: evenSplit, custom_splits: evenSplit ? [] : customSplits.filter(s => s.amount > 0)
      });
      toast.success("Expense added!");
      resetForm();
      refresh();
    } catch (err) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await API.delete(`/groups/${groupId}/expenses/${expenseId}`);
      toast.success("Deleted!");
      refresh();
    } catch { toast.error("Failed"); }
  };

  return (
    <div>
      <div className="g-card">
        <div className="g-card-title">
          <DollarSign size={15} />
          {editingExpenseId ? "Edit Expense" : "Add Expense"}
        </div>
        <div className="add-expense-form">
          <div className="expense-form-row">
            <input type="text" placeholder="What was this expense for?"
              value={expenseDescription} onChange={e => setExpenseDescription(e.target.value)}
              className="form-input" />
            <div className="amount-field-wrap">
              <span className="amount-prefix-sym">₹</span>
              <input type="number" placeholder="0.00" step="0.01"
                value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)}
                className="form-input amount-prefixed" />
            </div>
          </div>

          <select value={paidById} onChange={e => setPaidById(parseInt(e.target.value))} className="form-input">
            <option value="">💳 Who paid?</option>
            {members.map(m => (
              <option key={m.user_id} value={m.user_id}>
                {m.user_id === user.id ? `${m.username} (You)` : m.username}
              </option>
            ))}
          </select>

          <div className="split-type-selector">
            <button type="button" className={`split-type-btn ${evenSplit ? "active" : ""}`} onClick={() => setEvenSplit(true)}>
              <CheckCircle size={14} /> Split Equally
            </button>
            <button type="button" className={`split-type-btn ${!evenSplit ? "active" : ""}`} onClick={() => setEvenSplit(false)}>
              <Edit2 size={14} /> Custom Split
            </button>
          </div>

          {evenSplit && expenseAmount && members.length > 0 && (
            <div className="split-preview-wrap">
              <div className="split-preview-label">Each person pays</div>
              <div className="split-preview-chips">
                {members.map(m => (
                  <div key={m.user_id} className="split-chip">
                    <div className="split-chip-avatar">{m.username.charAt(0).toUpperCase()}</div>
                    <span className="split-chip-name">{m.username}</span>
                    <span className="split-chip-amt">₹{(parseFloat(expenseAmount) / members.length).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!evenSplit && (
            <div className="custom-splits-section">
              <div className="custom-splits-header">
                <span className="custom-splits-title">Custom amounts</span>
                <button type="button" onClick={distributeEqually} className="distribute-btn">Distribute equally</button>
              </div>
              <div className="custom-splits-list">
                {customSplits.map(split => (
                  <div key={split.user_id} className="custom-split-item">
                    <div className="split-member-info">
                      <div className="split-avatar">{split.username.charAt(0).toUpperCase()}</div>
                      <span>{split.username}</span>
                    </div>
                    <div className="split-amount-input">
                      <span>₹</span>
                      <input type="number" step="0.01" min="0"
                        value={split.amount || ""}
                        onChange={e => updateCustomSplit(split.user_id, e.target.value)}
                        placeholder="0.00" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="split-total-row">
                <span>Total assigned</span>
                <span className={customSplits.reduce((s, x) => s + x.amount, 0).toFixed(2) == parseFloat(expenseAmount || 0).toFixed(2) ? "split-ok" : "split-warn"}>
                  ₹{customSplits.reduce((s, x) => s + x.amount, 0).toFixed(2)} / ₹{expenseAmount || "0.00"}
                </span>
              </div>
            </div>
          )}

          <div className="expense-form-actions">
            <button onClick={handleAddExpense} className="btn btn-primary"
              disabled={!expenseDescription || !expenseAmount || !paidById}>
              <DollarSign size={15} />
              {editingExpenseId ? "Update Expense" : "Add Expense"}
            </button>
            {editingExpenseId && (
              <button onClick={resetForm} className="btn btn-ghost">Cancel</button>
            )}
          </div>
        </div>
      </div>

      <div className="g-card">
        <div className="g-card-title"><Receipt size={15} /> Expenses ({expenses.length})</div>
        {expenses.length === 0 ? (
          <div className="g-empty">No expenses yet — add one above</div>
        ) : (
          <div className="expenses-list">
            {expenses.map(exp => (
              <div key={exp.id} className="expense-item">
                <div className="expense-left">
                  <div className="expense-icon">💸</div>
                  <div className="expense-info">
                    <div className="expense-title">{exp.description}</div>
                    <div className="expense-paid-by">Paid by <strong>{exp.paid_by.username}</strong></div>
                    <div className="splits-preview">
                      {exp.splits.map((s, idx) => (
                        <span key={idx} className="split-badge">{s.username} ₹{s.amount.toFixed(2)}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="expense-right">
                  <div className="expense-amount">₹{exp.amount.toFixed(2)}</div>
                  {exp.paid_by.user_id === user.id && (
                    <div className="expense-actions">
                      <button onClick={() => {
                        setExpenseDescription(exp.description);
                        setExpenseAmount(exp.amount.toString());
                        setEditingExpenseId(exp.id);
                      }} className="exp-action-btn edit"><Edit2 size={12} /></button>
                      <button onClick={() => handleDeleteExpense(exp.id)} className="exp-action-btn del"><Trash2 size={12} /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpensesTab;