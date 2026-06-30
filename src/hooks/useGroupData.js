import { useState, useCallback } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

export const useGroupData = () => {
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [groupSummary, setGroupSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchGroupDetails = useCallback(async (groupId) => {
    try {
      setLoading(true);
      const [membersRes, expensesRes, balancesRes, settlementsRes, summaryRes] = await Promise.all([
        API.get(`/groups/${groupId}/members`),
        API.get(`/groups/${groupId}/expenses`),
        API.get(`/groups/${groupId}/balances`),
        API.get(`/groups/${groupId}/settlements`),
        API.get(`/groups/${groupId}/summary`),
      ]);
      setMembers(membersRes.data);
      setExpenses(expensesRes.data.expenses || []);
      setBalances(balancesRes.data || []);
      setSettlements(settlementsRes.data || []);
      setGroupSummary(summaryRes.data);
      return membersRes.data;
    } catch (err) {
      toast.error("Failed to fetch group details");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    members, setMembers,
    expenses, setExpenses,
    balances, setBalances,
    settlements, setSettlements,
    groupSummary, setGroupSummary,
    loading, fetchGroupDetails,
  };
};