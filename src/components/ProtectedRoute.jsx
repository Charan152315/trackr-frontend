import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(UserContext);
  const location = useLocation();

  if (loading) return null;
  if (!token) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }
  return children;
};

export default ProtectedRoute;