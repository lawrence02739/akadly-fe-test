import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../../../shared/layouts/AuthLayout";
import { teamApi, type ApiInvitation } from "../api/team.api";

const errorText = (error: unknown) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? "This invitation is invalid or has expired.";

export default function AcceptInvitation() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";
  const [invite, setInvite] = useState<ApiInvitation | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    teamApi
      .previewInvite(token)
      .then(setInvite)
      .catch((e) => setError(errorText(e)))
      .finally(() => setLoading(false));
  }, [token]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (password !== confirm) return setError("Passwords do not match.");
    setSaving(true);
    try {
      await teamApi.acceptInvite(token, password);
      navigate("/login", {
        state: {
          message: "Invitation accepted. Sign in with your new password.",
        },
      });
    } catch (e) {
      setError(errorText(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthLayout>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Join workspace</h1>
        {!token && (
          <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            Invitation token is missing.
          </div>
        )}
        {loading && token && (
          <p className="mt-5 text-slate-500">Checking your invitation...</p>
        )}
        {error && (
          <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        {invite && (
          <>
            <p className="mt-2 text-slate-500">
              Welcome, {invite.name}. Set a password to accept your invitation
              as {invite.roleNames.join(", ")}.
            </p>
            <form onSubmit={submit} className="mt-7 space-y-4">
              <Password
                label="Password"
                value={password}
                change={setPassword}
              />
              <Password
                label="Confirm password"
                value={confirm}
                change={setConfirm}
              />
              <p className="text-xs text-slate-500">
                Use at least 8 characters with uppercase, lowercase, number, and
                special character.
              </p>
              <button
                disabled={saving}
                className="w-full rounded-xl bg-[#0C5A69] py-3 font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Creating account..." : "Accept invitation"}
              </button>
            </form>
          </>
        )}
        <Link
          to="/login"
          className="mt-6 block text-center text-sm font-semibold text-slate-500"
        >
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}

function Password({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        type="password"
        minLength={8}
        required
        value={value}
        onChange={(e) => change(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#0C5A69] focus:ring-2 focus:ring-[#0C5A69]/20"
      />
    </label>
  );
}
