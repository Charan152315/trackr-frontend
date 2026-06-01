import React, { useEffect, useState, useContext } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { BarChart2 } from "lucide-react";
import { UserContext } from "../context/UserContext";
import {
  Plus, Users, Trash2, DollarSign, CheckCircle,
  Clock, AlertCircle, Send, ArrowRight, Edit2,
  Home, ShoppingCart, Plane, BookOpen, Utensils,
  MoreHorizontal, UserPlus, Receipt, Scale, CreditCard, PieChart
} from "lucide-react";
import "../styles/Groups.css";

const GROUP_TYPES = [
  { type: "Trip",     emoji: "✈️" },
  { type: "Home",     emoji: "🏠" },
  { type: "Food",     emoji: "🍔" },
  { type: "Shopping", emoji: "🛍️" },
  { type: "Study",    emoji: "📚" },
  { type: "Other",    emoji: "📦" },
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

  useEffect(() => { if (token) fetchGroups(); }, [token]);

  const fetchGroups = async () => {
    try {
      const res = await API.get("/groups/");
      setGroups(res.data);
    } catch { toast.error("Failed to fetch groups"); }
  };

  const fetchGroupDetails = async (groupId) => {
    try {
      setLoading(true);
      setSelectedGroup(groupId);
      const [membersRes, expensesRes, balancesRes, settlementsRes, summaryRes] = await Promise.all([
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
    } catch { toast.error("Failed to fetch group details"); }
    finally { setLoading(false); }
  };

  const initializeCustomSplits = (list) =>
    setCustomSplits(list.map(m => ({ user_id: m.user_id, username: m.username, amount: 0 })));

  const updateCustomSplit = (userId, amount) =>
    setCustomSplits(prev => prev.map(s => s.user_id === userId ? { ...s, amount: parseFloat(amount) || 0 } : s));

  const distributeEqually = () => {
    if (!expenseAmount || !members.length) return;
    const share = parseFloat((parseFloat(expenseAmount) / members.length).toFixed(2));
    setCustomSplits(prev => prev.map(s => ({ ...s, amount: share })));
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) { toast.error("Group name required"); return; }
    try {
      await API.post("/groups/", { name: groupName.trim() });
      setGroupName(""); setGroupType("Other");
      toast.success("Group created!"); fetchGroups();
    } catch (err) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Delete this group and all its data?")) return;
    try {
      await API.delete(`/groups/${groupId}`);
      setSelectedGroup(null); toast.success("Group deleted!"); fetchGroups();
    } catch { toast.error("Failed to delete group"); }
  };

  const handleAddMember = async () => {
    if (!memberUsername.trim()) { toast.error("Username required"); return; }
    try {
      await API.post(`/groups/${selectedGroup}/add_member`, { username: memberUsername.trim() });
      setMemberUsername(""); toast.success("Member added!");
      await fetchGroupDetails(selectedGroup);
    } catch (err) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      const memberName = members.find(m => m.user_id === memberId)?.username;
      await API.delete(`/groups/${selectedGroup}/remove_member`, { data: { username: memberName } });
      toast.success("Member removed!"); await fetchGroupDetails(selectedGroup);
    } catch { toast.error("Failed to remove member"); }
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
        await API.put(`/groups/${selectedGroup}/expenses/${editingExpenseId}`, { description: expenseDescription });
        setEditingExpenseId(null); toast.success("Expense updated!");
        setExpenseDescription(""); setExpenseAmount("");
        fetchGroupDetails(selectedGroup); return;
      }
      await API.post(`/groups/${selectedGroup}/expenses`, {
        group_id: selectedGroup, paid_by_id: paidById,
        description: expenseDescription, amount: parseFloat(expenseAmount),
        even_split: evenSplit, custom_splits: evenSplit ? [] : customSplits.filter(s => s.amount > 0)
      });
      toast.success("Expense added!");
      setExpenseDescription(""); setExpenseAmount(""); setEvenSplit(true);
      initializeCustomSplits(members); setPaidById("");
      fetchGroupDetails(selectedGroup);
    } catch (err) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await API.delete(`/groups/${selectedGroup}/expenses/${expenseId}`);
      toast.success("Deleted!"); fetchGroupDetails(selectedGroup);
    } catch { toast.error("Failed"); }
  };

  // Settlement amount validation
  const getMaxOwed = () => {
    if (!settlementTo) return null;
    const toUserId = parseInt(settlementTo);
    const rel = balances.find(b => b.from.user_id === user.id && b.to.user_id === toUserId);
    return rel ? rel.amount : null;
  };

  const handleCreateSettlement = async () => {
    if (!settlementTo || !settlementAmount) { toast.error("Select member and enter amount"); return; }
    if (!user.upi_verified) { toast.error("Please verify your UPI first!"); return; }
    const amt = parseFloat(settlementAmount);
    if (amt <= 0) { toast.error("Amount must be greater than 0"); return; }
    const maxOwed = getMaxOwed();
    if (maxOwed !== null && amt > maxOwed) {
      toast.error(`You only owe ₹${maxOwed.toFixed(2)} to this person. Cannot settle more.`); return;
    }
    const toUser = members.find(m => m.user_id === parseInt(settlementTo));
    if (!toUser?.upi_verified) { toast.error(`${toUser?.username} hasn't verified UPI`); return; }
    try {
      await API.post(`/groups/${selectedGroup}/settlements`, {
        to_user_id: parseInt(settlementTo), amount: amt, proof_url: null,
      });
      setSettlementTo(""); setSettlementAmount("");
      toast.success("Settlement created!"); await fetchGroupDetails(selectedGroup);
    } catch (err) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  const handleConfirmSettlement = async (id) => {
    try {
      await API.post(`/groups/${selectedGroup}/settlements/${id}/confirm`, {});
      toast.success("Confirmed!"); await fetchGroupDetails(selectedGroup);
    } catch { toast.error("Failed"); }
  };

  const handleRejectSettlement = async (id) => {
    try {
      await API.post(`/groups/${selectedGroup}/settlements/${id}/reject`, { reason: "" });
      toast.success("Rejected"); await fetchGroupDetails(selectedGroup);
    } catch { toast.error("Failed"); }
  };

  const getGroupEmoji = (name) => {
    const l = name?.toLowerCase() || "";
    if (l.includes("trip") || l.includes("travel")) return "✈️";
    if (l.includes("home") || l.includes("room") || l.includes("flat")) return "🏠";
    if (l.includes("food") || l.includes("dinner") || l.includes("lunch")) return "🍔";
    if (l.includes("shop") || l.includes("grocery")) return "🛍️";
    if (l.includes("study") || l.includes("college")) return "📚";
    return "👥";
  };

  const currentGroup = groups.find(g => g.id === selectedGroup);
  const totalGroupSpend = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
  const maxOwed = getMaxOwed();

  const TABS = [
    { id: "members",     icon: <Users size={15} />,       label: "Members" },
    { id: "expenses",    icon: <Receipt size={15} />,      label: "Expenses" },
    { id: "balances",    icon: <Scale size={15} />,        label: "Balances" },
    { id: "settlements", icon: <CreditCard size={15} />,   label: "Settle" },
    { id: "summary",     icon: <PieChart size={15} />,     label: "Summary" },
  ];

  return (
    <div className="groups-page">

      {!selectedGroup ? (
        <div className="groups-list-view">
          <div className="groups-header">
            <h1>Groups</h1>
            <p>Split expenses with friends</p>
          </div>

          <div className="create-group-card card">
            <div className="create-group-card-title">
              <Plus size={16} /> Create a new group
            </div>
            <div className="group-type-grid">
              {GROUP_TYPES.map(t => (
                <button key={t.type} type="button"
                  className={`group-type-chip ${groupType === t.type ? "active" : ""}`}
                  onClick={() => setGroupType(t.type)}>
                  <span>{t.emoji}</span><span>{t.type}</span>
                </button>
              ))}
            </div>
            <form onSubmit={handleCreateGroup} className="create-group-form">
              <input type="text" placeholder={`e.g. ${groupType} gang`}
                value={groupName} onChange={e => setGroupName(e.target.value)}
                className="form-input" required />
              <button type="submit" className="btn btn-primary">
                <Plus size={15} /> Create
              </button>
            </form>
          </div>

          {groups.length === 0 ? (
            <div className="groups-empty">
              <div className="groups-empty-icon">👥</div>
              <h3>No groups yet</h3>
              <p>Create your first group to start splitting expenses</p>
            </div>
          ) : (
            <div className="groups-grid">
              {groups.map(group => (
                <div key={group.id} className="group-card card">
                  <div className="group-card-top">
                    <div className="group-emoji-icon">{getGroupEmoji(group.name)}</div>
                    <div className="group-card-info">
                      <h3>{group.name}</h3>
                      <span className="owner-badge">by {group.owner_username}</span>
                    </div>
                    {group.owner_id === user.id && (
                      <button onClick={() => handleDeleteGroup(group.id)} className="group-delete-btn">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <button onClick={() => { fetchGroupDetails(group.id); setActiveTab("members"); }}
                    className="btn btn-primary group-view-btn">
                    Open Group →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      ) : (
        <div className="group-detail-view">

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

          {/* Avatar row */}
          <div className="member-avatar-row">
            {members.map(m => (
              <div key={m.user_id} className="avatar-chip">
                <div className="avatar-circle">{m.username.charAt(0).toUpperCase()}</div>
                <span className="avatar-name">{m.username.slice(0, 6)}</span>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="loading"><div className="spinner" /> Loading...</div>
          ) : (
            <>
              <div className="tabs">
                {TABS.map(t => (
                  <button key={t.id} className={`tab ${activeTab === t.id ? "active" : ""}`}
                    onClick={() => setActiveTab(t.id)}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              <div className="tab-content">

                {/* ===== MEMBERS ===== */}
                {activeTab === "members" && (
                  <div>
                    <div className="g-card">
                      <div className="g-card-title"><UserPlus size={15} /> Add Member</div>
                      <div className="add-member-form">
                        <input type="text" placeholder="Search by username"
                          value={memberUsername} onChange={e => setMemberUsername(e.target.value)}
                          className="form-input" onKeyDown={e => e.key === "Enter" && handleAddMember()} />
                        <button onClick={handleAddMember} className="btn btn-primary">
                          <Plus size={15} /> Add
                        </button>
                      </div>
                    </div>

                    <div className="g-card">
                      <div className="g-card-title"><Users size={15} /> Members ({members.length})</div>
                      <div className="members-list">
                        {members.map(member => (
                          <div key={member.user_id} className="member-item">
                            <div className="member-info">
                              <div className="member-avatar">{member.username.charAt(0).toUpperCase()}</div>
                              <div>
                                <div className="member-name">
                                  {member.username}
                                  {member.user_id === user.id && <span className="you-tag"> (You)</span>}
                                </div>
                                <div className="member-tags">
                                  <span className={`member-role-badge ${member.role}`}>{member.role}</span>
                                  <span className={`upi-badge ${member.upi_verified ? "ok" : "no"}`}>
                                    {member.upi_verified ? "✓ UPI" : "⚠ No UPI"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {member.user_id !== user.id && (
                              <button onClick={() => handleRemoveMember(member.user_id)}
                                className="remove-btn">Remove</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ===== EXPENSES ===== */}
                {activeTab === "expenses" && (
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

                        <select value={paidById} onChange={e => setPaidById(parseInt(e.target.value))}
                          className="form-input">
                          <option value="">💳 Who paid?</option>
                          {members.map(m => (
                            <option key={m.user_id} value={m.user_id}>
                              {m.user_id === user.id ? `${m.username} (You)` : m.username}
                            </option>
                          ))}
                        </select>

                        <div className="split-type-selector">
                          <button type="button"
                            className={`split-type-btn ${evenSplit ? "active" : ""}`}
                            onClick={() => setEvenSplit(true)}>
                            <CheckCircle size={14} /> Split Equally
                          </button>
                          <button type="button"
                            className={`split-type-btn ${!evenSplit ? "active" : ""}`}
                            onClick={() => setEvenSplit(false)}>
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
                              <button type="button" onClick={distributeEqually} className="distribute-btn">
                                Distribute equally
                              </button>
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
                            <button onClick={() => { setEditingExpenseId(null); setExpenseDescription(""); setExpenseAmount(""); }}
                              className="btn btn-ghost">Cancel</button>
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
                                    <button onClick={() => { setExpenseDescription(exp.description); setExpenseAmount(exp.amount.toString()); setEditingExpenseId(exp.id); }}
                                      className="exp-action-btn edit"><Edit2 size={12} /></button>
                                    <button onClick={() => handleDeleteExpense(exp.id)}
                                      className="exp-action-btn del"><Trash2 size={12} /></button>
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

                {/* ===== BALANCES ===== */}
                {activeTab === "balances" && (
                  <div className="g-card">
                    <div className="g-card-title"><Scale size={15} /> Who Owes Whom</div>
                    {balances.length === 0 ? (
                      <div className="g-empty-celebrate">
                        <div className="g-empty-icon">🎉</div>
                        <h3>All settled up!</h3>
                        <p>No outstanding balances in this group</p>
                      </div>
                    ) : (
                      <div className="balances-list">
                        {balances.map((balance, idx) => (
                          <div key={idx} className={`balance-item ${balance.from.username === user.username ? "is-me" : ""}`}>
                            <div className="balance-users">
                              <div className="balance-user">
                                <div className="user-avatar-small bal">{balance.from.username.charAt(0).toUpperCase()}</div>
                                <span className={balance.from.username === user.username ? "bal-me" : ""}>
                                  {balance.from.username === user.username ? "You" : balance.from.username}
                                </span>
                              </div>
                              <div className="balance-arrow-wrap">
                                <ArrowRight size={14} />
                                <span className="owes-text">owes</span>
                              </div>
                              <div className="balance-user">
                                <div className="user-avatar-small bal green">{balance.to.username.charAt(0).toUpperCase()}</div>
                                <span>{balance.to.username === user.username ? "You" : balance.to.username}</span>
                              </div>
                            </div>
                            <div className="balance-amount-tag">₹{balance.amount.toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ===== SETTLEMENTS ===== */}
                {activeTab === "settlements" && (
                  <div>
                    <div className="g-card">
                      <div className="g-card-title"><Send size={15} /> Create Settlement</div>
                      <div className="settlement-form">
                        <div className="settle-fields">
                          <div className="settle-field">
                            <label>Pay to</label>
                            <select value={settlementTo} onChange={e => { setSettlementTo(e.target.value); setSettlementAmount(""); }}
                              className="form-input">
                              <option value="">Select member</option>
                              {members.filter(m => m.user_id !== user.id).map(m => (
                                <option key={m.user_id} value={m.user_id}>
                                  {m.username}{!m.upi_verified && " ⚠ no UPI"}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="settle-field">
                            <label>
                              Amount
                              {maxOwed !== null && (
                                <span className="max-owed-hint"> — max ₹{maxOwed.toFixed(2)}</span>
                              )}
                            </label>
                            <div className="amount-input">
                              <span>₹</span>
                              <input type="number" placeholder="0.00" step="0.01" min="0"
                                max={maxOwed || undefined}
                                value={settlementAmount}
                                onChange={e => setSettlementAmount(e.target.value)} />
                            </div>
                            {settlementAmount && maxOwed !== null && parseFloat(settlementAmount) > maxOwed && (
                              <div className="settle-error">
                                ⚠ You only owe ₹{maxOwed.toFixed(2)} to this person
                              </div>
                            )}
                          </div>
                        </div>
                        <button onClick={handleCreateSettlement} className="btn btn-primary">
                          <Send size={15} /> Create Settlement
                        </button>
                      </div>
                    </div>

                    <div className="g-card">
                      <div className="g-card-title"><Clock size={15} /> Settlement History ({settlements.length})</div>
                      {settlements.length === 0 ? (
                        <div className="g-empty">No settlements yet</div>
                      ) : (
                        <div className="settlements-list">
                          {settlements.map(s => (
                            <div key={s.id} className={`settlement-item status-${s.status}`}>
                              <div className="settlement-left">
                                <div className={`settlement-status-dot ${s.status}`} />
                                <div className="settlement-info">
                                  <div className="settlement-users">
                                    <span className="s-from">
                                      {s.from_user_id === user.id ? "You" : members.find(m => m.user_id === s.from_user_id)?.username}
                                    </span>
                                    <ArrowRight size={12} />
                                    <span className="s-to">
                                      {s.to_user_id === user.id ? "You" : members.find(m => m.user_id === s.to_user_id)?.username}
                                    </span>
                                  </div>
                                  <span className="settlement-amount">₹{s.amount.toFixed(2)}</span>
                                </div>
                              </div>

                              <div className="settlement-right">
                                {s.from_user_id === user.id && s.status === "pending" && (
                                  <button onClick={() => {
                                    const toMember = members.find(m => m.user_id === s.to_user_id);
                                    if (!toMember?.upi_id) { toast.error("Recipient has no UPI ID"); return; }
                                    window.location.href = `upi://pay?pa=${toMember.upi_id}&pn=${toMember.username}&am=${s.amount}&cu=INR&tn=Trackr`;
                                  }} className="btn btn-primary btn-small">
                                    Pay via UPI
                                  </button>
                                )}
                                <div className="settlement-status-area">
                                  {s.status === "pending" && (
                                    <>
                                      <span className="status-badge pending"><Clock size={11} /> Pending</span>
                                      {s.to_user_id === user.id && (
                                        <div className="settle-confirm-btns">
                                          <button onClick={() => handleConfirmSettlement(s.id)} className="btn btn-success btn-small">Confirm</button>
                                          <button onClick={() => handleRejectSettlement(s.id)} className="btn btn-danger btn-small">Reject</button>
                                        </div>
                                      )}
                                    </>
                                  )}
                                  {s.status === "confirmed" && <span className="status-badge confirmed"><CheckCircle size={11} /> Confirmed</span>}
                                  {s.status === "rejected" && <span className="status-badge rejected"><AlertCircle size={11} /> Rejected</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ===== SUMMARY ===== */}
                {activeTab === "summary" && (
                  <div className="g-card">
                    <div className="g-card-title"><PieChart size={15} /> Group Summary</div>
                    {!groupSummary ? (
                      <div className="g-empty">Loading...</div>
                    ) : (
                      <>
                        <div className="summary-stat-boxes">
                          <div className="summary-stat-box">
                            <span className="ssb-val">₹{groupSummary.total_amount.toFixed(2)}</span>
                            <span className="ssb-lbl">Total Spent</span>
                          </div>
                          <div className="summary-stat-box">
                            <span className="ssb-val">{groupSummary.total_expenses}</span>
                            <span className="ssb-lbl">Expenses</span>
                          </div>
                          <div className="summary-stat-box">
                            <span className="ssb-val">{members.length}</span>
                            <span className="ssb-lbl">Members</span>
                          </div>
                        </div>

                        <div className="member-summary-list">
                          {Object.entries(groupSummary.member_summary).map(([username, data]) => (
                            <div key={username} className="member-summary-item">
                              <div className="ms-left">
                                <div className="member-avatar">{username.charAt(0).toUpperCase()}</div>
                                <span className="ms-name">
                                  {username}
                                  {username === user.username && <span className="you-tag"> (You)</span>}
                                </span>
                              </div>
                              <div className="ms-right">
                                <div className="ms-stat">
                                  <span className="ms-lbl">Paid</span>
                                  <span className="ms-val blue">₹{data.paid.toFixed(2)}</span>
                                </div>
                                <div className="ms-stat">
                                  <span className="ms-lbl">Share</span>
                                  <span className="ms-val muted">₹{data.owed.toFixed(2)}</span>
                                </div>
                                <div className="ms-stat">
                                  <span className="ms-lbl">Net</span>
                                  <span className={`ms-val ${data.net >= 0 ? "green" : "red"}`}>
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