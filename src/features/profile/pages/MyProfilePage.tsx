import { Building2, Camera, Mail, Save, UserRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { setAuth } from "../../../store/authSlice";
import api from "../../../shared/api/axios";

type Details = {
  firstName: string;
  lastName: string;
  phone: string;
  jobTitle: string;
  department: string;
  location: string;
  bio: string;
  dateOfBirth: string;
  gender: "" | "female" | "male" | "non_binary" | "prefer_not_to_say";
};

const profileFields = (value: Partial<Details>): Partial<Details> => ({
  firstName: value.firstName,
  lastName: value.lastName,
  phone: value.phone,
  jobTitle: value.jobTitle,
  department: value.department,
  location: value.location,
  bio: value.bio,
  dateOfBirth: value.dateOfBirth,
  gender: value.gender,
});

const empty: Details = {
  firstName: "",
  lastName: "",
  phone: "",
  jobTitle: "",
  department: "",
  location: "",
  bio: "",
  dateOfBirth: "",
  gender: "",
};

export default function MyProfilePage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const storageKey = `tenant-profile-${user?.id ?? "anonymous"}`;
  const [details, setDetails] = useState<Details>(empty);
  const [panCardNumber, setPanCardNumber] = useState("");
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(null);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const [firstName = "", ...rest] = (user?.name ?? "").trim().split(/\s+/);
    const saved = localStorage.getItem(storageKey);
    setDetails(
      saved
        ? { ...empty, ...JSON.parse(saved) }
        : { ...empty, firstName, lastName: rest.join(" ") },
    );
    let active = true;
    void api
      .get("/auth/me")
      .then((response) => {
        const payload = response.data?.data ?? response.data;
        if (!active || !payload?.profile) return;
        setDetails((current) => ({
          ...current,
          ...profileFields(payload.profile),
        }));
        if (payload.profile.profilePictureUrl)
          setProfilePicturePreview(payload.profile.profilePictureUrl);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [storageKey, user?.name]);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const name = `${details.firstName} ${details.lastName}`.trim();
    try {
      const body = new FormData();
      Object.entries(details).forEach(([key, value]) => {
        if (value) body.append(key, value);
      });
      if (panCardNumber) body.append("panCardNumber", panCardNumber);
      if (profilePicture) body.append("profilePicture", profilePicture);
      const response = await api.patch("/auth/me/profile", body, {
        // The shared client defaults to JSON. This endpoint accepts a Multer
        // file field, so it must receive the FormData body as multipart.
        headers: { "Content-Type": "multipart/form-data" },
      });
      const saved = response.data?.data ?? response.data;
      const next = { ...details, ...profileFields(saved) } as Details;
      localStorage.setItem(storageKey, JSON.stringify(next));
      setDetails(next);
      setPanCardNumber("");
      if (saved.profilePictureUrl)
        setProfilePicturePreview(saved.profilePictureUrl);
      if (user && name) dispatch(setAuth({ user: { ...user, name } }));
      toast.success("Profile details saved.");
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Profile could not be saved. Please try again.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };
  if (!user) return null;
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-5 sm:p-8">
      <header>
        <p className="text-sm font-semibold text-[#0C5A69]">Account settings</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">My profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Complete your personal details so your workspace and support records
          stay accurate.
        </p>
      </header>
      <section className="rounded-xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-950">
        <strong>Profile completion:</strong> Details entered during registration
        or invitation are prefilled. Add anything missing and save.
      </section>
      <form
        onSubmit={save}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <span className="grid size-11 place-items-center rounded-full bg-[#0C5A69] text-white">
            <UserRound size={21} />
          </span>
          <div>
            <h2 className="font-bold text-slate-900">Personal details</h2>
            <p className="text-sm text-slate-500">
              Used to identify you in the tenant workspace.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Profile picture" full>
            <div className="flex items-center gap-4">
              <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-teal-50 text-[#0C5A69]">
                {profilePicturePreview ? (
                  <img
                    src={profilePicturePreview}
                    alt="Profile preview"
                    className="size-full object-cover"
                  />
                ) : (
                  <Camera size={22} />
                )}
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setProfilePicture(file);
                  if (!file) return setProfilePicturePreview(null);
                  const reader = new FileReader();
                  reader.onload = () =>
                    setProfilePicturePreview(String(reader.result));
                  reader.readAsDataURL(file);
                }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              PNG, JPG or WebP; maximum 5 MB.
            </p>
          </Field>
          <Field label="First name">
            <input
              required
              maxLength={80}
              value={details.firstName}
              onChange={(e) =>
                setDetails({ ...details, firstName: e.target.value })
              }
            />
          </Field>
          <Field label="Last name">
            <input
              maxLength={80}
              value={details.lastName}
              onChange={(e) =>
                setDetails({ ...details, lastName: e.target.value })
              }
            />
          </Field>
          <Field label="Email">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
              <Mail className="mr-2 inline size-4" />
              {user.email}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Email comes from your invitation and cannot be changed here.
            </p>
          </Field>
          <Field label="Phone number">
            <input
              type="tel"
              maxLength={30}
              value={details.phone}
              onChange={(e) =>
                setDetails({ ...details, phone: e.target.value })
              }
              placeholder="+91 98765 43210"
            />
          </Field>
          <Field label="Date of birth">
            <input
              type="date"
              value={details.dateOfBirth}
              onChange={(e) =>
                setDetails({ ...details, dateOfBirth: e.target.value })
              }
            />
          </Field>
          <Field label="Gender">
            <select
              value={details.gender}
              onChange={(e) =>
                setDetails({
                  ...details,
                  gender: e.target.value as Details["gender"],
                })
              }
            >
              <option value="">Select gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non_binary">Non-binary</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </Field>
          <Field label="PAN card number">
            <input
              maxLength={10}
              value={panCardNumber}
              onChange={(e) => setPanCardNumber(e.target.value.toUpperCase())}
              placeholder="ABCDE1234F"
            />
            <p className="mt-1 text-xs text-slate-500">
              This needs encrypted server storage and is not saved in browser
              storage.
            </p>
          </Field>
          <Field label="Job title">
            <input
              maxLength={100}
              value={details.jobTitle}
              onChange={(e) =>
                setDetails({ ...details, jobTitle: e.target.value })
              }
              placeholder="e.g. Program manager"
            />
          </Field>
          <Field label="Department">
            <input
              maxLength={100}
              value={details.department}
              onChange={(e) =>
                setDetails({ ...details, department: e.target.value })
              }
              placeholder="e.g. Academic operations"
            />
          </Field>
          <Field label="Location" full>
            <input
              maxLength={160}
              value={details.location}
              onChange={(e) =>
                setDetails({ ...details, location: e.target.value })
              }
              placeholder="City, country"
            />
          </Field>
          <Field label="About you" full>
            <textarea
              rows={4}
              maxLength={500}
              value={details.bio}
              onChange={(e) => setDetails({ ...details, bio: e.target.value })}
              placeholder="Add a short introduction or work context"
            />
          </Field>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0C5A69] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Save size={16} /> {saving ? "Saving..." : "Save personal details"}
          </button>
        </div>
      </form>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Building2 className="text-[#0C5A69]" size={20} />
          <div>
            <h2 className="font-bold">Workspace account</h2>
            <p className="text-sm text-slate-500">
              Your tenant access is managed by the platform administrator.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label
      className={`block text-sm font-semibold text-slate-700 ${full ? "sm:col-span-2" : ""}`}
    >
      {label}
      <span className="mt-1.5 block [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-300 [&_input]:px-3 [&_input]:py-2.5 [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-300 [&_select]:px-3 [&_select]:py-2.5 [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-300 [&_textarea]:p-3">
        {children}
      </span>
    </label>
  );
}
