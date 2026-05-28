import React, { useEffect, useState, useContext } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { BarChart2 } from "lucide-react";
import { UserContext } from "../context/UserContext";
import {
  Plus, Users, Trash2, DollarSign, CheckCircle,
  Clock, AlertCircle, Send, ArrowRight, Edit2,
  Home, ShoppingCart, Plane, BookOpen, Utensils, MoreHorizontal
} from "lucide-react";
import "../styles/Groups.css";

const GROUP_TYPES = [
  { type: "Trip",      icon: <Plane size={18} />,        emoji: "✈️" },
  { type: "Home",      icon: <Home size={18} />,          emoji: "🏠" },
  { type: "Food",      icon: <Utensils size={18} />,      emoji: "🍔" },
  { type: "Shopping",  icon: <ShoppingCart size={18} />,  emoji: "🛍️" },
  { type: "Study",     icon: <BookOpen size={18} />,      emoji: "📚" },
  { type: "Other",     icon: <MoreHorizontal size={18} />, emoji: "📦" },
];

const Groups = () => {
  const { user, token } = useContext(UserContext);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeTab, setActiveTab] = useState("members");

  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState("Other");
  const [members, setMembers] = useState([]);
  const [memberUsername, setMemberUsername] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [evenSplit, setEvenSplit] = useState(true);
  const [customSplits, setCustomSplits] = useState([]);
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [paidById, setPaidById] = useState("");
  const [settlementTo, setSettlementTo] = useState("");
  const [groupSummary, setGroupSummary] = useState(null);
  const [settlementAmount, setSettlementAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) fetchGroups();
  }, [token]);

  const fetchGroups = async () => {
    try {
      const res = await API.get("/groups/");
      setGroups(res.data);
    } catch (err) {
      toast.error("Failed to fetch groups");
    }
  };

  const fetchGroupDetails = async (groupId) => {
    try {
      setLoading(true);
      setSelectedGroup(groupId);
      const [membersRes, expensesRes, balancesRes, settlementsRes ,summaryRes] = await Promise.all([
        API.get(`/groups/${groupId}/members`),
        API.get(`/groups/${groupId}/expenses`),
        API.get(`/groups/${groupId}/balances`),
        API.get(`/groups/${groupId}/settlements`),
        API.get(`/groups/${groupId}/summary`),
      ]);
      setMembers(membersRes.data);
      setExpenses(expensesRes.data.expenses || []);
      setBalances(balancesRes.data || []);
      setSettlements(settlementsRes.data || []);
      setGroupSummary(summaryRes.data);
      
      initializeCustomSplits(membersRes.data);
    } catch (err) {
      toast.error("Failed to fetch group details");
    } finally {
      setLoading(false);
    }
  };

  const initializeCustomSplits = (membersList) => {
    setCustomSplits(membersList.map(m => ({ user_id: m.user_id, username: m.username, amount: 0 })));
  };

  const updateCustomSplit = (userId, amount) => {
    setCustomSplits(prev => prev.map(s => s.user_id === userId ? { ...s, amount: parseFloat(amount) || 0 } : s));
  };

  const distributeEqually = () => {
    if (!expenseAmount || members.length === 0) return;
    const share = parseFloat((parseFloat(expenseAmount) / members.length).toFixed(2));
    setCustomSplits(prev => prev.map(s => ({ ...s, amount: share })));
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) { toast.error("Group name required"); return; }
    try {
      await API.post("/groups/", { name: `${groupName.trim()}` });
      setGroupName("");
      setGroupType("Other");
      toast.success("Group created!");
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create group");
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Delete this group and all its data?")) return;
    try {
      await API.delete(`/groups/${groupId}`);
      setSelectedGroup(null);
      toast.success("Group deleted!");
      fetchGroups();
    } catch (err) {
      toast.error("Failed to delete group");
    }
  };

  const handleAddMember = async () => {
    if (!memberUsername.trim()) { toast.error("Username required"); return; }
    try {
      await API.post(`/groups/${selectedGroup}/add_member`, { username: memberUsername.trim() });
      setMemberUsername("");
      toast.success("Member added!");
      await fetchGroupDetails(selectedGroup);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add member");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      const memberName = members.find(m => m.user_id === memberId)?.username;
      await API.delete(`/groups/${selectedGroup}/remove_member`, { data: { username: memberName } });
      toast.success("Member removed!");
      await fetchGroupDetails(selectedGroup);
    } catch (err) {
      toast.error("Failed to remove member");
    }
  };

  const handleAddExpense = async () => {
    if (!expenseDescription || !expenseAmount || !paidById) {
      toast.error("Description, amount and who paid are required");
      return;
    }
    if (!evenSplit) {
      const totalSplit = customSplits.reduce((s, x) => s + x.amount, 0);
      const expenseAmt = parseFloat(expenseAmount);
      if (Math.abs(totalSplit - expenseAmt) > 0.01) {
        toast.error(`Splits (₹${totalSplit.toFixed(2)}) must equal ₹${expenseAmt.toFixed(2)}`);
        return;
      }
    }
    try {
      if (editingExpenseId) {
        await API.put(`/groups/${selectedGroup}/expenses/${editingExpenseId}`, { description: expenseDescription });
        setEditingExpenseId(null);
        toast.success("Expense updated!");
        setExpenseDescription(""); setExpenseAmount("");
        fetchGroupDetails(selectedGroup);
        return;
      }
      await API.post(`/groups/${selectedGroup}/expenses`, {
        group_id: selectedGroup,
        paid_by_id: paidById,
        description: expenseDescription,
        amount: parseFloat(expenseAmount),
        even_split: evenSplit,
        custom_splits: evenSplit ? [] : customSplits.filter(s => s.amount > 0)
      });
      toast.success("Expense added!");
      setExpenseDescription(""); setExpenseAmount(""); setEvenSplit(true);
      initializeCustomSplits(members); setPaidById("");
      fetchGroupDetails(selectedGroup);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add expense");
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await API.delete(`/groups/${selectedGroup}/expenses/${expenseId}`);
      toast.success("Expense deleted!");
      fetchGroupDetails(selectedGroup);
    } catch (err) {
      toast.error("Failed to delete expense");
    }
  };

  const handleCreateSettlement = async () => {
    if (!settlementTo || !settlementAmount) { toast.error("Select member and enter amount"); return; }
    if (!user.upi_verified) { toast.error("Please verify your UPI first!"); return; }
    const toUser = members.find(m => m.user_id === parseInt(settlementTo));
    if (!toUser?.upi_verified) { toast.error(`${toUser?.username} hasn't verified UPI`); return; }
    try {
      await API.post(`/groups/${selectedGroup}/settlements`, {
        to_user_id: parseInt(settlementTo),
        amount: parseFloat(settlementAmount),
        proof_url: null,
      });
      setSettlementTo(""); setSettlementAmount("");
      toast.success("Settlement created! Waiting for confirmation.");
      await fetchGroupDetails(selectedGroup);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create settlement");
    }
  };

  const handleConfirmSettlement = async (id) => {
    try {
      await API.post(`/groups/${selectedGroup}/settlements/${id}/confirm`, {});
      toast.success("Settlement confirmed!");
      await fetchGroupDetails(selectedGroup);
    } catch (err) { toast.error("Failed to confirm"); }
  };

  const handleRejectSettlement = async (id) => {
    try {
      await API.post(`/groups/${selectedGroup}/settlements/${id}/reject`, { reason: "" });
      toast.success("Settlement rejected");
      await fetchGroupDetails(selectedGroup);
    } catch (err) { toast.error("Failed to reject"); }
  };

  const getGroupEmoji = (name) => {
    const lower = name?.toLowerCase() || "";
    if (lower.includes("trip") || lower.includes("travel")) return "✈️";
    if (lower.includes("home") || lower.includes("room") || lower.includes("flat")) return "🏠";
    if (lower.includes("food") || lower.includes("dinner") || lower.includes("lunch")) return "🍔";
    if (lower.includes("shop") || lower.includes("grocery") || lower.includes("groc")) return "🛍️";
    if (lower.includes("study") || lower.includes("college") || lower.includes("class")) return "📚";
    return "👥";
  };

  const currentGroup = groups.find(g => g.id === selectedGroup);
  const totalGroupSpend = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);

  return (
    <div className="groups-page">

      {!selectedGroup ? (
        <div className="groups-list-view">
          <div className="groups-header">
            <h1>Groups</h1>
            <p>Manage shared expenses with your friends</p>
          </div>

          {/* Create Group */}
          <div className="create-group-card card">
            <h3>Create a new group</h3>

            {/* Group Type Picker */}
            <div className="group-type-grid">
              {GROUP_TYPES.map(t => (
                <button
                  key={t.type}
                  type="button"
                  className={`group-type-chip ${groupType === t.type ? "active" : ""}`}
                  onClick={() => setGroupType(t.type)}
                >
                  <span className="group-type-emoji">{t.emoji}</span>
                  <span>{t.type}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleCreateGroup} className="create-group-form">
              <input
                type="text"
                placeholder={`Group name (e.g. ${groupType} with friends)`}
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                className="form-input"
                required
              />
              <button type="submit" className="btn btn-primary">
                <Plus size={16} /> Create
              </button>
            </form>
          </div>

          {/* Groups Grid */}
          {groups.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>👥</div>
              <h3>No groups yet</h3>
              <p>Create your first group to start splitting expenses</p>
            </div>
          ) : (
            <div className="groups-grid">
              {groups.map(group => (
                <div key={group.id} className="group-card card">
                  <div className="group-card-top">
                    <div className="group-emoji-icon">
                      {getGroupEmoji(group.name)}
                    </div>
                    <div className="group-card-info">
                      <h3>{group.name}</h3>
                      <span className="owner-badge">by {group.owner_username}</span>
                    </div>
                    {group.owner_id === user.id && (
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="group-delete-btn"
                        title="Delete group"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => fetchGroupDetails(group.id)}
                    className="btn btn-primary group-view-btn"
                  >
                    Open Group →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      ) : (
        <div className="group-detail-view">

          {/* Header */}
          <div className="group-detail-header">
            <button onClick={() => setSelectedGroup(null)} className="back-btn">← Back</button>
            <div className="group-detail-title">
              <div className="group-detail-emoji">{getGroupEmoji(currentGroup?.name)}</div>
              <div>
                <h1>{currentGroup?.name}</h1>
                <p>Owner: {currentGroup?.owner_username}</p>
              </div>
            </div>
            <div className="group-detail-stats">
              <div className="group-stat">
                <span className="group-stat-val">{members.length}</span>
                <span className="group-stat-lbl">Members</span>
              </div>
              <div className="group-stat">
                <span className="group-stat-val">{expenses.length}</span>
                <span className="group-stat-lbl">Expenses</span>
              </div>
              <div className="group-stat">
                <span className="group-stat-val">₹{totalGroupSpend.toFixed(0)}</span>
                <span className="group-stat-lbl">Total</span>
              </div>
            </div>
          </div>

          {/* Member avatar row */}
          <div className="member-avatar-row">
            {members.map(m => (
              <div key={m.user_id} className="avatar-chip" title={m.username}>
                <div className="avatar-circle">
                  {m.username.charAt(0).toUpperCase()}
                </div>
                <span className="avatar-name">{m.username.split("")[0].toUpperCase() + m.username.slice(1, 6)}</span>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="loading"><div className="spinner" /> Loading...</div>
          ) : (
            <>
              <div className="tabs">
                <button className={`tab ${activeTab === "members" ? "active" : ""}`} onClick={() => setActiveTab("members")}>
                  <Users size={16} /> Members
                </button>
                <button className={`tab ${activeTab === "expenses" ? "active" : ""}`} onClick={() => setActiveTab("expenses")}>
                  <DollarSign size={16} /> Expenses
                </button>
                <button className={`tab ${activeTab === "balances" ? "active" : ""}`} onClick={() => setActiveTab("balances")}>
                  <ArrowRight size={16} /> Balances
                </button>
                <button className={`tab ${activeTab === "settlements" ? "active" : ""}`} onClick={() => setActiveTab("settlements")}>
                  <CheckCircle size={16} /> Settle
                </button>
                <button className={`tab ${activeTab === "summary" ? "active" : ""}`} onClick={() => setActiveTab("summary")}>
                  <BarChart2 size={16} /> Summary
                </button>
              </div>

              <div className="tab-content">

                {/* MEMBERS TAB */}
                {activeTab === "members" && (
                  <div className="members-section">
                    <div className="section-card card">
                      <h3>Add member</h3>
                      <div className="add-member-form">
                        <input
                          type="text"
                          placeholder="Search by username"
                          value={memberUsername}
                          onChange={e => setMemberUsername(e.target.value)}
                          className="form-input"
                          onKeyDown={e => e.key === "Enter" && handleAddMember()}
                        />
                        <button onClick={handleAddMember} className="btn btn-primary">
                          <Plus size={16} /> Add
                        </button>
                      </div>
                    </div>

                    <div className="section-card card">
                      <h3>Members ({members.length})</h3>
                      <div className="members-list">
                        {members.map(member => (
                          <div key={member.user_id} className="member-item">
                            <div className="member-info">
                              <div className="member-avatar">
                                {member.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4>{member.username}
                                  {member.user_id === user.id && <span className="you-tag"> (You)</span>}
                                </h4>
                                <div className="member-tags">
                                  <span className="member-role">{member.role}</span>
                                  <span className={`upi-status ${member.upi_verified ? "verified" : ""}`}>
                                    {member.upi_verified ? "✓ UPI" : "⚠ No UPI"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {member.user_id !== user.id && (
                              <button onClick={() => handleRemoveMember(member.user_id)} className="btn btn-ghost btn-small">
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* EXPENSES TAB */}
                {activeTab === "expenses" && (
                  <div className="expenses-section">
                    <div className="section-card card">
                      <h3>{editingExpenseId ? "✏️ Edit expense" : "Add expense"}</h3>
                      <div className="add-expense-form">
                        <div className="expense-form-row">
                          <input
                            type="text"
                            placeholder="Description"
                            value={expenseDescription}
                            onChange={e => setExpenseDescription(e.target.value)}
                            className="form-input"
                          />
                          <div className="amount-field-wrap">
                            <span className="amount-prefix-sym">₹</span>
                            <input
                              type="number"
                              placeholder="0.00"
                              step="0.01"
                              value={expenseAmount}
                              onChange={e => setExpenseAmount(e.target.value)}
                              className="form-input amount-prefixed"
                            />
                          </div>
                        </div>

                        <select value={paidById} onChange={e => setPaidById(parseInt(e.target.value))} className="form-input">
                          <option value="">Who paid?</option>
                          {members.map(m => (
                            <option key={m.user_id} value={m.user_id}>
                              {m.user_id === user.id ? `${m.username} (You)` : m.username}
                            </option>
                          ))}
                        </select>

                        <div className="split-type-selector">
                          <button type="button" className={`split-type-btn ${evenSplit ? "active" : ""}`} onClick={() => setEvenSplit(true)}>
                            <CheckCircle size={15} /> Equally
                          </button>
                          <button type="button" className={`split-type-btn ${!evenSplit ? "active" : ""}`} onClick={() => setEvenSplit(false)}>
                            <Edit2 size={15} /> Custom
                          </button>
                        </div>

                        {/* Even split preview */}
                        {evenSplit && expenseAmount && members.length > 0 && (
                          <div className="split-preview-chips">
                            {members.map(m => (
                              <div key={m.user_id} className="split-chip">
                                <span className="split-chip-name">{m.username}</span>
                                <span className="split-chip-amt">₹{(parseFloat(expenseAmount) / members.length).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {!evenSplit && (
                          <div className="custom-splits-section">
                            <div className="custom-splits-header">
                              <h4>Custom split</h4>
                              <button type="button" onClick={distributeEqually} className="btn-link">Distribute equally</button>
                            </div>
                            <div className="custom-splits-list">
                              {customSplits.map(split => (
                                <div key={split.user_id} className="custom-split-item">
                                  <div className="split-member-info">
                                    <div className="split-avatar">{split.username.charAt(0).toUpperCase()}</div>
                                    <span className="split-username">{split.username}</span>
                                  </div>
                                  <div className="split-amount-input">
                                    <span>₹</span>
                                    <input
                                      type="number" step="0.01" min="0"
                                      value={split.amount || ""}
                                      onChange={e => updateCustomSplit(split.user_id, e.target.value)}
                                      placeholder="0.00"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="split-total">
                              ₹{customSplits.reduce((s, x) => s + x.amount, 0).toFixed(2)} / ₹{expenseAmount || "0.00"}
                            </div>
                          </div>
                        )}

                        <div className="expense-form-actions">
                          <button onClick={handleAddExpense} className="btn btn-primary" disabled={!expenseDescription || !expenseAmount || !paidById}>
                            <DollarSign size={16} />
                            {editingExpenseId ? "Update" : "Add Expense"}
                          </button>
                          {editingExpenseId && (
                            <button onClick={() => { setEditingExpenseId(null); setExpenseDescription(""); setExpenseAmount(""); }} className="btn btn-ghost">
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="section-card card">
                      <h3>Expenses ({expenses.length})</h3>
                      {expenses.length === 0 ? (
                        <div className="empty-state-small"><p>No expenses yet — add one above</p></div>
                      ) : (
                        <div className="expenses-list">
                          {expenses.map(expense => (
                            <div key={expense.id} className="expense-item">
                              <div className="expense-info">
                                <h4>{expense.description}</h4>
                                <p>Paid by <strong>{expense.paid_by.username}</strong></p>
                                <div className="splits-preview">
                                  {expense.splits.map((split, idx) => (
                                    <span key={idx} className="split-badge">
                                      {split.username} ₹{split.amount.toFixed(2)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="expense-right">
                                <div className="expense-amount">₹{expense.amount.toFixed(2)}</div>
                                {expense.paid_by.user_id === user.id && (
                                  <div className="expense-actions">
                                    <button onClick={() => { setExpenseDescription(expense.description); setExpenseAmount(expense.amount.toString()); setEditingExpenseId(expense.id); setActiveTab("expenses"); }} className="btn btn-ghost btn-small">
                                      <Edit2 size={13} />
                                    </button>
                                    <button onClick={() => handleDeleteExpense(expense.id)} className="btn btn-ghost btn-small danger-ghost">
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* BALANCES TAB */}
                {activeTab === "balances" && (
                  <div className="section-card card">
                    <h3>Who owes whom</h3>
                    {balances.length === 0 ? (
                      <div className="empty-state-small"><p>🎉 All settled up!</p></div>
                    ) : (
                      <div className="balances-list">
                        {balances.map((balance, idx) => (
                          <div key={idx} className="balance-item">
                            <div className="balance-users">
                              <div className="balance-user">
                                <div className="user-avatar-small">{balance.from.username.charAt(0).toUpperCase()}</div>
                                <span>{balance.from.username === user.username ? "You" : balance.from.username}</span>
                              </div>
                              <div className="balance-arrow">
                                <ArrowRight size={16} />
                                <span className="owes-text">owes</span>
                              </div>
                              <div className="balance-user">
                                <div className="user-avatar-small">{balance.to.username.charAt(0).toUpperCase()}</div>
                                <span>{balance.to.username === user.username ? "You" : balance.to.username}</span>
                              </div>
                            </div>
                            <div className="balance-amount">₹{balance.amount.toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* SETTLEMENTS TAB */}
                {activeTab === "settlements" && (
                  <div className="settlements-section">
                    <div className="section-card card">
                      <h3>Create settlement</h3>
                      <div className="settlement-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Pay to</label>
                            <select value={settlementTo} onChange={e => setSettlementTo(e.target.value)} className="form-input">
                              <option value="">Select member</option>
                              {members.filter(m => m.user_id !== user.id).map(m => (
                                <option key={m.user_id} value={m.user_id}>
                                  {m.username}{!m.upi_verified && " (no UPI)"}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Amount</label>
                            <div className="amount-input">
                              <span>₹</span>
                              <input type="number" placeholder="0.00" step="0.01" min="0" value={settlementAmount} onChange={e => setSettlementAmount(e.target.value)} />
                            </div>
                          </div>
                        </div>
                        <button onClick={handleCreateSettlement} className="btn btn-primary">
                          <Send size={16} /> Create Settlement
                        </button>
                      </div>
                    </div>

                    <div className="section-card card">
                      <h3>History</h3>
                      {settlements.length === 0 ? (
                        <div className="empty-state-small"><p>No settlements yet</p></div>
                      ) : (
                        <div className="settlements-list">
                          {settlements.map(settlement => (
                            <div key={settlement.id} className={`settlement-item status-${settlement.status}`}>
                              <div className="settlement-info">
                                <div className="settlement-users">
                                  <span className="from-user">
                                    {settlement.from_user_id === user.id ? "You" : members.find(m => m.user_id === settlement.from_user_id)?.username}
                                  </span>
                                  <ArrowRight size={14} />
                                  <span className="to-user">
                                    {settlement.to_user_id === user.id ? "You" : members.find(m => m.user_id === settlement.to_user_id)?.username}
                                  </span>
                                </div>
                                <span className="settlement-amount">₹{settlement.amount.toFixed(2)}</span>
                              </div>

                              <div className="settlement-right">
                                {settlement.from_user_id === user.id && settlement.status === "pending" && (
                                  <button
                                    onClick={() => {
                                      const toMember = members.find(m => m.user_id === settlement.to_user_id);
                                      if (!toMember?.upi_id) { toast.error("Recipient has no UPI ID"); return; }
                                      window.location.href = `upi://pay?pa=${toMember.upi_id}&pn=${toMember.username}&am=${settlement.amount}&cu=INR&tn=Trackr`;
                                    }}
                                    className="btn btn-primary btn-small"
                                  >
                                    Pay via UPI
                                  </button>
                                )}

                                <div className="settlement-status">
                                  {settlement.status === "pending" && (
                                    <>
                                      <span className="status-badge pending"><Clock size={13} /> Pending</span>
                                      {settlement.to_user_id === user.id && (
                                        <div className="settlement-actions">
                                          <button onClick={() => handleConfirmSettlement(settlement.id)} className="btn btn-success btn-small">Confirm</button>
                                          <button onClick={() => handleRejectSettlement(settlement.id)} className="btn btn-danger btn-small">Reject</button>
                                        </div>
                                      )}
                                    </>
                                  )}
                                  {settlement.status === "confirmed" && <span className="status-badge confirmed"><CheckCircle size={13} /> Confirmed</span>}
                                  {settlement.status === "rejected" && <span className="status-badge rejected"><AlertCircle size={13} /> Rejected</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {activeTab === "summary" && (
                  <div className="section-card card">
                    <h3>Group Summary</h3>
                    {!groupSummary ? (
                      <div className="empty-state-small"><p>Loading...</p></div>
                    ) : (
                      <>
                        <div className="summary-stats-row">
                          <div className="summary-stat-box">
                            <span className="summary-stat-val">₹{groupSummary.total_amount.toFixed(2)}</span>
                            <span className="summary-stat-lbl">Total Spent</span>
                          </div>
                          <div className="summary-stat-box">
                            <span className="summary-stat-val">{groupSummary.total_expenses}</span>
                            <span className="summary-stat-lbl">Expenses</span>
                          </div>
                          <div className="summary-stat-box">
                            <span className="summary-stat-val">{members.length}</span>
                            <span className="summary-stat-lbl">Members</span>
                          </div>
                        </div>

                        <div className="member-summary-list">
                          {Object.entries(groupSummary.member_summary).map(([username, data]) => (
                            <div key={username} className="member-summary-item">
                              <div className="member-summary-left">
                                <div className="member-avatar">{username.charAt(0).toUpperCase()}</div>
                                <span className="member-summary-name">
                                  {username}
                                  {username === user.username && <span className="you-tag"> (You)</span>}
                                </span>
                              </div>
                              <div className="member-summary-right">
                                <div className="member-summary-stat">
                                  <span className="mss-label">Paid</span>
                                  <span className="mss-val paid">₹{data.paid.toFixed(2)}</span>
                                </div>
                                <div className="member-summary-stat">
                                  <span className="mss-label">Owed</span>
                                  <span className="mss-val owed">₹{data.owed.toFixed(2)}</span>
                                </div>
                                <div className="member-summary-stat">
                                  <span className="mss-label">Net</span>
                                  <span className={`mss-val net ${data.net >= 0 ? "positive" : "negative"}`}>
                                    {data.net >= 0 ? "+" : ""}₹{data.net.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
)}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Groups;