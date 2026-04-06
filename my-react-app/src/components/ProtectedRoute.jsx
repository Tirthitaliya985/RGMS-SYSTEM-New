import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const userRole = String(user?.role || "").toLowerCase();
  const normalizedAllowed = Array.isArray(allowedRoles)
    ? allowedRoles.map((role) => String(role || "").toLowerCase())
    : null;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (normalizedAllowed && !normalizedAllowed.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
