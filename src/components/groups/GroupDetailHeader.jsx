import { LogOut, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../services/api";

const getGroupEmoji = (name) => {
  const l = name?.toLowerCase() || "";
  if (l.includes("trip") || l.includes("travel")) return "✈️";
  if (l.includes("home") || l.includes("room") || l.includes("flat")) return "🏠";
  if (l.includes("food") || l.includes("dinner") || l.includes("lunch")) return "🍔";
  if (l.includes("shop") || l.includes("grocery")) return "🛍️";
  if (l.includes("study") || l.includes("college")) return "📚";
  return "👥";
};

const GroupDetailHeader = ({ group, members, expenses, user, onBack, onInvite, onLeave }) => {
  const totalGroupSpend = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
  const isOwner = group?.owner_id === user.id;

  return (
    <>
      <div className="group-detail-header">
        <button onClick={onBack} className="back-btn">← Back</button>
        <div className="group-detail-title">
          <div className="group-detail-emoji">{getGroupEmoji(group?.name)}</div>
          <div>
            <h1>{group?.name}</h1>
            <p>Owner: {group?.owner_username}</p>
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

        <div className="group-header-actions">
          <button className="group-header-btn" onClick={onInvite}>
            <Link2 size={14} /> Invite
          </button>
          {!isOwner && (
            <button className="group-header-btn danger" onClick={onLeave}>
              <LogOut size={14} /> Leave
            </button>
          )}
        </div>
      </div>

      <div className="member-avatar-row">
        {members.map(m => (
          <div key={m.user_id} className="avatar-chip">
            <div className="avatar-circle">{m.username.charAt(0).toUpperCase()}</div>
            <span className="avatar-name">{m.username.slice(0, 6)}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default GroupDetailHeader;