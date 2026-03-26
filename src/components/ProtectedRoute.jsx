import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ allowedType, children }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    const target =
      allowedType === "company" ? "/login/empresa" : "/login/candidato";
    return <Navigate replace to={target} state={{ from: location.pathname }} />;
  }

  if (allowedType && currentUser.type !== allowedType) {
    const target =
      currentUser.type === "company" ? "/app/empresa" : "/app/candidato";
    return <Navigate replace to={target} />;
  }

  return children;
}
