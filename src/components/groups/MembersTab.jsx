import { useState } from "react";
import { UserPlus, Users } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../services/api";

const MembersTab = ({ groupId, members, user, refresh }) => {
  const [memberUsername, setMemberUsername] = useState("");

  const handleAddMember = async () => {
    if (!memberUsername.trim()) { toast.error("Username required"); return; }
    try {
      await API.post(`/groups/${groupId}/add_member`, { username: memberUsername.trim() });
      setMemberUsername("");
      toast.success("Member added!");
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      const memberName = members.find(m => m.user_id === memberId)?.username;
      await API.delete(`/groups/${groupId}/remove_member`, { data: { username: memberName } });
      toast.success("Member removed!");
      refresh();
    } catch {
      toast.error("Failed to remove member");
    }
  };

  return (
    <div>
      <div className="g-card">
        <div className="g-card-title"><UserPlus size={15} /> Add Member</div>
        <div className="add-member-form">
          <input type="text" placeholder="Search by username"
            value={memberUsername} onChange={e => setMemberUsername(e.target.value)}
            className="form-input" onKeyDown={e => e.key === "Enter" && handleAddMember()} />
          <button onClick={handleAddMember} className="btn btn-primary">
            Add
          </button>
        </div>
        <p className="invite-hint">Or use the Invite button above to share a join link instead</p>
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
              {member.user_id !== user.id && member.role !== "admin" && (
                <button onClick={() => handleRemoveMember(member.user_id)} className="remove-btn">
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembersTab;