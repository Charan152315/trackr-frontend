import { useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { Bell, CheckCheck, Trash2, Info, CheckCircle, AlertTriangle, AlertCircle, Users, X, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/Notifications.css";

const TYPE_ICON = {
  info:    <Info size={16} />,
  success: <CheckCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  danger:  <AlertCircle size={16} />,
  group_invite: <Users size={16} />,
};

const TYPE_CLASS = {
  info: "notif-info",
  success: "notif-success",
  warning: "notif-warning",
  danger: "notif-danger",
  group_invite: "notif-invite",
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAll = async () => {
    try {
      const [notifRes, invitesRes] = await Promise.all([
        API.get("/notifications/"),
        API.get("/groups/invite-requests/pending"),
      ]);
      setNotifications(notifRes.data.notifications);
      setPendingInvites(invitesRes.data);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = setInterval(() => {
        setNotifications(n => [...n]);
        setPendingInvites(i => [...i]);
    }, 60000);
    
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetchAll();

    const id = setInterval(fetchAll, 30000);

    return () => clearInterval(id);
}, []);

  const markRead = async (id) => {
    await API.post(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    await API.post("/notifications/read-all");
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast.success("All marked as read");
  };

  const clearAll = async () => {
    if (!window.confirm("Clear all notifications?")) return;
    await API.delete("/notifications/clear");
    setNotifications([]);
    toast.success("Cleared");
  };

  const handleAcceptInvite = async (requestId) => {
    try {
      const res = await API.post(`/groups/invite-requests/${requestId}/accept`);
      toast.success(res.data.message);
      setPendingInvites(prev => prev.filter(p => p.id !== requestId));
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to accept");
    }
  };

  const handleRejectInvite = async (requestId) => {
    try {
      await API.post(`/groups/invite-requests/${requestId}/reject`);
      toast.success("Invite declined");
      setPendingInvites(prev => prev.filter(p => p.id !== requestId));
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to reject");
    }
  };

  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <div className="notif-page">
      <div className="notif-header">
        <div className="notif-title-row">
          <div className="notif-title-left">
            <div className="notif-bell-icon">
              <Bell size={22} />
              {(unread + pendingInvites.length) > 0 && (
                <span className="notif-badge">{unread + pendingInvites.length}</span>
              )}
            </div>
            <div>
              <h2>Notifications</h2>
              <p>{unread} unread{pendingInvites.length > 0 && ` · ${pendingInvites.length} pending invite${pendingInvites.length > 1 ? "s" : ""}`}</p>
            </div>
          </div>
          <div className="notif-header-actions">
            {unread > 0 && (
              <button onClick={markAllRead} className="btn btn-ghost btn-small">
                <CheckCheck size={15} /> Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={clearAll} className="btn btn-ghost btn-small danger-ghost">
                <Trash2 size={15} /> Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Loading...</div>
      ) : (
        <>
          {pendingInvites.length > 0 && (
            <div className="notif-invites-section">
              <div className="notif-section-label">Group invites</div>
              {pendingInvites.map(inv => (
                <div key={inv.id} className="notif-invite-card">
                  <div className="notif-invite-icon"><Users size={18} /></div>
                  <div className="notif-invite-body">
                    <div className="notif-invite-title">
                      <strong>{inv.invited_by}</strong> invited you to join
                    </div>
                    <div className="notif-invite-group">{inv.group_name}</div>
                    <div className="notif-item-time">{timeAgo(inv.created_at)}</div>
                  </div>
                  <div className="notif-invite-actions">
                    <button className="notif-invite-btn accept" onClick={() => handleAcceptInvite(inv.id)}>
                      <Check size={15} />
                    </button>
                    <button className="notif-invite-btn reject" onClick={() => handleRejectInvite(inv.id)}>
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {notifications.length === 0 && pendingInvites.length === 0 ? (
            <div className="notif-empty">
              <div className="notif-empty-icon"><Bell size={40} /></div>
              <h3>All caught up!</h3>
              <p>No notifications yet. Activity from groups and settlements will appear here.</p>
            </div>
          ) : notifications.length > 0 && (
            <div className="notif-list">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`notif-item ${!n.is_read ? "unread" : ""} ${TYPE_CLASS[n.type] || "notif-info"}`}
                  onClick={() => !n.is_read && markRead(n.id)}
                >
                  <div className={`notif-icon-wrap ${TYPE_CLASS[n.type]}`}>
                    {TYPE_ICON[n.type] || TYPE_ICON.info}
                  </div>
                  <div className="notif-content">
                    <div className="notif-item-title">{n.title}</div>
                    <div className="notif-item-msg">{n.message}</div>
                    <div className="notif-item-time">{timeAgo(n.created_at)}</div>
                  </div>
                  {!n.is_read && <div className="notif-dot" />}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Notifications;