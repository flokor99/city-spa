// src/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: "2rem" }}>Prüfe Login Status…</div>;
  }

  if (!user) {
    // Merken, woher der User kam, damit wir nach Login zurück navigieren können
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
