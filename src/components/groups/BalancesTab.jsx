import { Scale, ArrowRight } from "lucide-react";

const BalancesTab = ({ balances, user }) => (
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
);

export default BalancesTab;