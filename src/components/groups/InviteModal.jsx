import { useState, useEffect } from "react";
import { X, Copy, Link2, Clock, Trash2, Check } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../services/api";
import "../../styles/groups/InviteModal.css";

const EXPIRY_OPTIONS = [
  { label: "24 hours", value: 24 },
  { label: "7 days", value: 168 },
  { label: "Never expires", value: null },
];

const InviteModal = ({ groupId, groupName, onClose }) => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expiryHours, setExpiryHours] = useState(24);
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchInvites = async () => {
    try {
      const res = await API.get(`/groups/${groupId}/invites`);
      setInvites(res.data);
    } catch {
      toast.error("Failed to load invites");
    }
  };

  useEffect(() => { fetchInvites(); }, [groupId]);

  const handleCreateInvite = async () => {
    setLoading(true);
    try {
      const res = await API.post(`/groups/${groupId}/invite`, { expiry_hours: expiryHours });
      toast.success("Invite link created!");
      fetchInvites();
      handleCopy(res.data.code);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create invite");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code) => {
    const link = `${window.location.origin}/join/${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    toast.success("Link copied!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRevoke = async (code) => {
    try {
      await API.delete(`/groups/${groupId}/invite/${code}`);
      toast.success("Invite revoked");
      fetchInvites();
    } catch {
      toast.error("Failed to revoke");
    }
  };

  const formatExpiry = (expiresAt) => {
    if (!expiresAt) return "Never expires";
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return "Expired";
    const hours = Math.round(diff / (1000 * 60 * 60));
    if (hours < 24) return `Expires in ${hours}h`;
    return `Expires in ${Math.round(hours / 24)}d`;
  };

  return (
    <div className="invite-modal-overlay" onClick={onClose}>
      <div className="invite-modal" onClick={e => e.stopPropagation()}>
        <div className="invite-modal-header">
          <div>
            <h3><Link2 size={17} /> Invite to {groupName}</h3>
            <p>Anyone with the link can join instantly</p>
          </div>
          <button className="invite-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="invite-create-row">
          <select value={expiryHours ?? "never"}
            onChange={e => setExpiryHours(e.target.value === "never" ? null : parseInt(e.target.value))}
            className="form-input invite-expiry-select">
            {EXPIRY_OPTIONS.map(o => (
              <option key={o.label} value={o.value ?? "never"}>{o.label}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={handleCreateInvite} disabled={loading}>
            {loading ? "Creating..." : "Generate Link"}
          </button>
        </div>

        <div className="invite-list">
          {invites.length === 0 ? (
            <div className="invite-empty">No active invite links. Generate one above.</div>
          ) : (
            invites.map(inv => (
              <div key={inv.code} className="invite-item">
                <div className="invite-item-left">
                  <div className="invite-link-text">
                    {window.location.origin}/join/{inv.code}
                  </div>
                  <div className="invite-item-meta">
                    <Clock size={11} /> {formatExpiry(inv.expires_at)}
                  </div>
                </div>
                <div className="invite-item-actions">
                  <button className="invite-action-btn" onClick={() => handleCopy(inv.code)}>
                    {copiedCode === inv.code ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                  <button className="invite-action-btn danger" onClick={() => handleRevoke(inv.code)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteModal;