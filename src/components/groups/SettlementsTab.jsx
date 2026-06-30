import { useState } from "react";
import { Send, Clock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../services/api";

const SettlementsTab = ({ groupId, settlements, members, balances, user, refresh }) => {
  const [settlementTo, setSettlementTo] = useState("");
  const [settlementAmount, setSettlementAmount] = useState("");

  const getMaxOwed = () => {
    if (!settlementTo) return null;
    const toUserId = parseInt(settlementTo);
    const rel = balances.find(b => b.from.user_id === user.id && b.to.user_id === toUserId);
    return rel ? rel.amount : null;
  };
  const maxOwed = getMaxOwed();

  const handleCreateSettlement = async () => {
    if (!settlementTo || !settlementAmount) { toast.error("Select member and enter amount"); return; }
    if (!user.upi_verified) { toast.error("Please verify your UPI first!"); return; }
    const amt = parseFloat(settlementAmount);
    if (amt <= 0) { toast.error("Amount must be greater than 0"); return; }
    if (maxOwed !== null && amt > maxOwed) {
      toast.error(`You only owe ₹${maxOwed.toFixed(2)} to this person.`); return;
    }
    const toUser = members.find(m => m.user_id === parseInt(settlementTo));
    if (!toUser?.upi_verified) { toast.error(`${toUser?.username} hasn't verified UPI`); return; }
    try {
      await API.post(`/groups/${groupId}/settlements`, {
        to_user_id: parseInt(settlementTo), amount: amt, proof_url: null,
      });
      setSettlementTo(""); setSettlementAmount("");
      toast.success("Settlement created!");
      refresh();
    } catch (err) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  const handleConfirm = async (id) => {
    try {
      await API.post(`/groups/${groupId}/settlements/${id}/confirm`, {});
      toast.success("Confirmed!"); refresh();
    } catch { toast.error("Failed"); }
  };

  const handleReject = async (id) => {
    try {
      await API.post(`/groups/${groupId}/settlements/${id}/reject`, { reason: "" });
      toast.success("Rejected"); refresh();
    } catch { toast.error("Failed"); }
  };

  return (
    <div>
      <div className="g-card">
        <div className="g-card-title"><Send size={15} /> Create Settlement</div>
        <div className="settlement-form">
          <div className="settle-fields">
            <div className="settle-field">
              <label>Pay to</label>
              <select value={settlementTo} onChange={e => { setSettlementTo(e.target.value); setSettlementAmount(""); }} className="form-input">
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
                {maxOwed !== null && <span className="max-owed-hint"> — max ₹{maxOwed.toFixed(2)}</span>}
              </label>
              <div className="amount-input">
                <span>₹</span>
                <input type="number" placeholder="0.00" step="0.01" min="0" max={maxOwed || undefined}
                  value={settlementAmount} onChange={e => setSettlementAmount(e.target.value)} />
              </div>
              {settlementAmount && maxOwed !== null && parseFloat(settlementAmount) > maxOwed && (
                <div className="settle-error">⚠ You only owe ₹{maxOwed.toFixed(2)} to this person</div>
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
                    }} className="btn btn-primary btn-small">Pay via UPI</button>
                  )}
                  <div className="settlement-status-area">
                    {s.status === "pending" && (
                      <>
                        <span className="status-badge pending"><Clock size={11} /> Pending</span>
                        {s.to_user_id === user.id && (
                          <div className="settle-confirm-btns">
                            <button onClick={() => handleConfirm(s.id)} className="btn btn-success btn-small">Confirm</button>
                            <button onClick={() => handleReject(s.id)} className="btn btn-danger btn-small">Reject</button>
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
  );
};

export default SettlementsTab;