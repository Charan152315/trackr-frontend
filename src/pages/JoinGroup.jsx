import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, CheckCircle, AlertCircle, Wallet } from "lucide-react";
import API from "../services/api";
import { UserContext } from "../context/UserContext";
import toast from "react-hot-toast";
import "../styles/JoinGroup.css";

const JoinGroup = () => {
  const { code } = useParams();
  const { user, token } = useContext(UserContext);
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      // Not logged in — redirect to login, then come back here
      navigate(`/login?redirect=/join/${code}`);
      return;
    }
    fetchPreview();
  }, [token]);

  const fetchPreview = async () => {
    try {
      const res = await API.get(`/groups/invite/${code}/preview`);
      setPreview(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid invite link");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await API.post(`/groups/invite/${code}/join`);
      toast.success(res.data.message);
      navigate("/groups");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to join");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="join-page">
        <div className="join-card">
          <div className="loading"><div className="spinner" /> Loading invite...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="join-page">
        <div className="join-card">
          <div className="join-error-icon"><AlertCircle size={32} /></div>
          <h2>Invite link invalid</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate("/groups")}>
            Go to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="join-page">
      <div className="join-card">
        <div className="join-brand">
          <div className="join-brand-icon"><Wallet size={20} /></div>
          <span>Trackr</span>
        </div>

        <div className="join-group-emoji">👥</div>
        <h2>{preview.group_name}</h2>
        <p className="join-owner">Created by {preview.owner_username}</p>

        <div className="join-stats">
          <Users size={15} />
          <span>{preview.member_count} member{preview.member_count !== 1 ? "s" : ""}</span>
        </div>

        {preview.already_member ? (
          <div className="join-already">
            <CheckCircle size={16} /> You're already a member
          </div>
        ) : null}

        <button
          className="btn btn-primary btn-large join-btn"
          onClick={preview.already_member ? () => navigate("/groups") : handleJoin}
          disabled={joining}
        >
          {joining ? "Joining..." : preview.already_member ? "Go to Group" : "Join Group"}
        </button>
      </div>
    </div>
  );
};

export default JoinGroup;