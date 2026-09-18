import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

interface AccessRouteProps {
  children: ReactNode;
  anyOf?: string[];
}

export default function AccessRoute({
  children,
  anyOf = [],
}: AccessRouteProps) {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth,
  );
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.isOwner || anyOf.length === 0) return <>{children}</>;
  const granted = new Set(user.permissions ?? []);
  if (anyOf.some((permission) => granted.has(permission)))
    return <>{children}</>;
  return (
    <div className="m-auto max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center">
      <h1 className="text-xl font-bold text-slate-900">Access restricted</h1>
      <p className="mt-2 text-sm text-slate-500">
        Your assigned role does not include permission to open this section.
      </p>
    </div>
  );
}
