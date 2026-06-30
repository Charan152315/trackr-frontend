import { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../services/api";
import "../../styles/Groups.css";

const GROUP_TYPES = [
  { type: "Trip",     emoji: "✈️" },
  { type: "Home",     emoji: "🏠" },
  { type: "Food",     emoji: "🍔" },
  { type: "Shopping", emoji: "🛍️" },
  { type: "Study",    emoji: "📚" },
  { type: "Other",    emoji: "📦" },
];

const getGroupEmoji = (name) => {
  const l = name?.toLowerCase() || "";
  if (l.includes("trip") || l.includes("travel")) return "✈️";
  if (l.includes("home") || l.includes("room") || l.includes("flat")) return "🏠";
  if (l.includes("food") || l.includes("dinner") || l.includes("lunch")) return "🍔";
  if (l.includes("shop") || l.includes("grocery")) return "🛍️";
  if (l.includes("study") || l.includes("college")) return "📚";
  return "👥";
};

const GroupsList = ({ groups, user, onOpenGroup, onGroupsChanged }) => {
  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState("Other");

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) { toast.error("Group name required"); return; }
    try {
      await API.post("/groups/", { name: groupName.trim() });
      setGroupName(""); setGroupType("Other");
      toast.success("Group created!");
      onGroupsChanged();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create group");
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Delete this group and all its data?")) return;
    try {
      await API.delete(`/groups/${groupId}`);
      toast.success("Group deleted!");
      onGroupsChanged();
    } catch {
      toast.error("Failed to delete group");
    }
  };

  return (
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
          <p>Create your first group or join one via invite link</p>
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
              <button onClick={() => onOpenGroup(group.id)} className="btn btn-primary group-view-btn">
                Open Group →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupsList;