import { useState, useEffect } from "react";
import API from "../services/api";
import {
  Activity as ActivityIcon,
  DollarSign,
  Users,
  CheckCircle,
  User,
  Shield
} from "lucide-react";
import "../styles/Activity.css";

const ACTION_ICON = {
  add_expense: <DollarSign size={15} />,
  delete_expense: <DollarSign size={15} />,
  add_member: <Users size={15} />,
  remove_member: <Users size={15} />,
  confirm_settlement: <CheckCircle size={15} />,
  create_group: <Users size={15} />,
  update_profile: <User size={15} />,
  change_email: <Shield size={15} />,
};

const ACTION_COLOR = {
  add_expense: "#0ea5e9",
  delete_expense: "#ef4444",
  add_member: "#22c55e",
  remove_member: "#f59e0b",
  confirm_settlement: "#22c55e",
  create_group: "#8b5cf6",
  update_profile: "#6b7280",
  change_email: "#f59e0b",
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(dateStr).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
    }
  );
};

const Activity = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/activity/")
      .then((res) => {
        setLogs(res.data.activity || []);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const grouped = logs.reduce((acc, log) => {
    const date = new Date(
      log.created_at
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    if (!acc[date]) {
      acc[date] = [];
    }

    acc[date].push(log);
    return acc;
  }, {});

  return (
    <div className="activity-page">

      {/* HEADER */}
      <div className="activity-header">
        <div className="activity-title-icon">
          <ActivityIcon size={22} />
        </div>

        <div>
          <h2>Activity Log</h2>
          <p>Your recent actions on Trackr</p>
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="loading">
          <div className="spinner" />
          Loading...
        </div>

      ) : logs.length === 0 ? (

        /* EMPTY */
        <div className="activity-empty">
          <div className="activity-empty-icon">
            <ActivityIcon size={40} />
          </div>

          <h3>No activity yet</h3>

          <p>
            Actions like adding expenses,
            joining groups, and settling up
            will appear here.
          </p>
        </div>

      ) : (

        /* TIMELINE */
        <div className="activity-timeline">

          {Object.entries(grouped).map(
            ([date, items]) => (

              <div
                key={date}
                className="activity-group"
              >
                <div className="activity-date-label">
                  {date}
                </div>

                <div className="activity-group-items">

                  {items.map((log) => (
                    <div
                      key={log.id}
                      className="activity-item"
                    >

                      {/* ICON */}
                      <div
                        className="activity-icon"
                        style={{
                          background: `${ACTION_COLOR[log.action]}18`,
                          color:
                            ACTION_COLOR[log.action] ||
                            "#6b7280",
                        }}
                      >
                        {ACTION_ICON[log.action] || (
                          <ActivityIcon size={15} />
                        )}
                      </div>

                      {/* CONTENT */}
                      <div className="activity-content">

                        <div className="activity-desc">
                          {log.description}
                        </div>

                        {log.entity_type && (
                          <span className="activity-tag">
                            {log.entity_type}
                          </span>
                        )}
                      </div>

                      {/* TIME */}
                      <div className="activity-time">
                        {timeAgo(log.created_at)}
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Activity;