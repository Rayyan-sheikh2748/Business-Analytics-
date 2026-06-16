import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation, Redirect } from "wouter";
import { AlertCircle } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user && location !== "/login") {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

export function RoleGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) return null;

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="h-full min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-[#f4f5f9] rounded-2xl mx-4 my-4">
        <div className="w-24 h-24 bg-red-100 rounded-[2rem] flex items-center justify-center mb-6 shadow-[0_8px_32px_rgba(239,68,68,0.25)]">
          <AlertCircle className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-4xl font-bold text-[#0a0a0a] mb-4 tracking-tight">Access Denied</h1>
        <p className="text-base text-[#64748b] max-w-md mb-8 leading-relaxed">
          You don't have permission to access this area. Please contact your administrator if you believe this is a mistake.
        </p>
        <button className="btn-primary px-8 py-3 text-sm font-semibold shadow-lg" onClick={() => window.history.back()}>
          Return to Previous Page
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
