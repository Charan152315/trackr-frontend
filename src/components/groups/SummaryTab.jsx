import { PieChart } from "lucide-react";

const SummaryTab = ({ groupSummary, members, user }) => (
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
                <div className="ms-stat"><span className="ms-lbl">Paid</span><span className="ms-val blue">₹{data.paid.toFixed(2)}</span></div>
                <div className="ms-stat"><span className="ms-lbl">Share</span><span className="ms-val muted">₹{data.owed.toFixed(2)}</span></div>
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
);

export default SummaryTab;