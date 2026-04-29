import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── Loading spinner shown while session is being rehydrated ──────────────────
function AuthLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(145deg, #f0f4ff, #faf5ff)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #4EAEE5, #9B59B6)" }}>
          <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-semibold text-gray-400">Loading session…</p>
      </div>
    </div>
  );
}

// ─── Requires any authenticated user ─────────────────────────────────────────
export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoader />;
  if (!user)   return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

// ─── Requires admin role ──────────────────────────────────────────────────────
export function RequireAdmin({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading)   return <AuthLoader />;
  if (!user)     return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin)  return <Navigate to="/" replace />;
  return children;
}