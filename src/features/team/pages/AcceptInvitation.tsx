import { Navigate, useSearchParams } from "react-router-dom";

export default function AcceptInvitation() {
  const [params] = useSearchParams();
  const token = params.get("token");

  // New member invitations use the same password setup flow as tenant owners.
  // This redirect keeps links issued by earlier versions usable.
  return (
    <Navigate
      replace
      to={token ? `/reset-password?token=${encodeURIComponent(token)}` : "/login"}
    />
  );
}
