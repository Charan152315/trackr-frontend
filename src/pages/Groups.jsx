import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { UserContext } from "../context/UserContext";
import { Users, Receipt, Scale, CreditCard, PieChart } from "lucide-react";
import { useGroupData } from "../hooks/useGroupData";

import GroupsList from "../components/groups/GroupsList";
import GroupDetailHeader from "../components/groups/GroupDetailHeader";
import InviteModal from "../components/groups/InviteModal";
import MembersTab from "../components/groups/MembersTab";
import ExpensesTab from "../components/groups/ExpensesTab";
import BalancesTab from "../components/groups/BalancesTab";
import SettlementsTab from "../components/groups/SettlementsTab";
import SummaryTab from "../components/groups/SummaryTab";

import "../styles/Groups.css";

const TABS = [
  { id: "members",     icon: <Users size={15} />,     label: "Members" },
  { id: "expenses",    icon: <Receipt size={15} />,    label: "Expenses" },
  { id: "balances",    icon: <Scale size={15} />,      label: "Balances" },
  { id: "settlements", icon: <CreditCard size={15} />, label: "Settle" },
  { id: "summary",     icon: <PieChart size={15} />,   label: "Summary" },
];

const Groups = () => {
  const { user, token } = useContext(UserContext);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeTab, setActiveTab] = useState("members");
  const [showInvite, setShowInvite] = useState(false);

  const {
    members, expenses, balances, settlements, groupSummary, loading, fetchGroupDetails
  } = useGroupData();

  useEffect(() => { if (token) fetchGroups(); }, [token]);

  const fetchGroups = async () => {
    try {
      const res = await API.get("/groups/");
      setGroups(res.data);
    } catch { toast.error("Failed to fetch groups"); }
  };

  const openGroup = (groupId) => {
    setSelectedGroup(groupId);
    setActiveTab("members");
    fetchGroupDetails(groupId);
  };

  const refresh = () => fetchGroupDetails(selectedGroup);

  const handleLeaveGroup = async () => {
    if (!window.confirm("Leave this group?")) return;
    try {
      const res = await API.post(`/groups/${selectedGroup}/leave`);
      toast.success(res.data.message);
      setSelectedGroup(null);
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to leave group");
    }
  };

  const currentGroup = groups.find(g => g.id === selectedGroup);

  return (
    <div className="groups-page">
      {!selectedGroup ? (
        <GroupsList
          groups={groups}
          user={user}
          onOpenGroup={openGroup}
          onGroupsChanged={fetchGroups}
        />
      ) : (
        <div className="group-detail-view">
          <GroupDetailHeader
            group={currentGroup}
            members={members}
            expenses={expenses}
            user={user}
            onBack={() => setSelectedGroup(null)}
            onInvite={() => setShowInvite(true)}
            onLeave={handleLeaveGroup}
          />

          {loading ? (
            <div className="loading"><div className="spinner" /> Loading...</div>
          ) : (
            <>
              <div className="tabs">
                {TABS.map(t => (
                  <button key={t.id} className={`tab ${activeTab === t.id ? "active" : ""}`}
                    onClick={() => setActiveTab(t.id)}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              <div className="tab-content">
                {activeTab === "members" && (
                  <MembersTab groupId={selectedGroup} members={members} user={user} refresh={refresh} />
                )}
                {activeTab === "expenses" && (
                  <ExpensesTab groupId={selectedGroup} expenses={expenses} members={members} user={user} refresh={refresh} />
                )}
                {activeTab === "balances" && (
                  <BalancesTab balances={balances} user={user} />
                )}
                {activeTab === "settlements" && (
                  <SettlementsTab groupId={selectedGroup} settlements={settlements} members={members} balances={balances} user={user} refresh={refresh} />
                )}
                {activeTab === "summary" && (
                  <SummaryTab groupSummary={groupSummary} members={members} user={user} />
                )}
              </div>
            </>
          )}
        </div>
      )}

      {showInvite && (
        <InviteModal
          groupId={selectedGroup}
          groupName={currentGroup?.name}
          onClose={() => setShowInvite(false)}
        />
      )}
    </div>
  );
};

export default Groups;