import { Navigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useUserContext();
  if (loading) return null;
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;