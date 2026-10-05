import { Building2, Camera, Mail, Save, Upload, UserRound } from "lucide-react";
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
  location: string;
  bio: string;
  dateOfBirth: string;
  gender: "" | "female" | "male" | "non_binary" | "prefer_not_to_say";
};

const profileFields = (value: Partial<Details>): Partial<Details> => ({
  firstName: value.firstName,
  lastName: value.lastName,
  phone: value.phone,
  location: value.location,
  bio: value.bio,
  dateOfBirth: value.dateOfBirth,
  gender: value.gender,
});

type ComplianceDocument = {
  documentTypeCode: string;
  fileName: string | null;
  fileUrl: string | null;
  status: string;
  rejectionReason: string | null;
};
type Compliance = {
  organizationType: {
    code: string;
    name: string;
    requiredDocuments: {
      documentTypeCode: string;
      isMandatory: boolean;
      order: number;
    }[];
  };
  gstin: string | null;
  pincode: string | null;
  documents: ComplianceDocument[];
};
type GstinDetails = {
  gstin: string;
  details: Record<string, unknown>;
  profileComplete: boolean;
  lookedUpAt: string;
  cached: boolean;
};

const gstLabel = (key: string) =>
  key.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

function GstDetailValue({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    return <div className="space-y-2">{value.map((item, index) =>
      <div key={index} className="rounded border border-slate-200 p-2">
        <GstDetailValue value={item} />
      </div>)}</div>;
  }
  if (value && typeof value === "object") {
    return <div className="grid gap-2 sm:grid-cols-2">{Object.entries(value).filter(([, item]) => item !== null && item !== "" && (!Array.isArray(item) || item.length > 0)).map(([key, item]) =>
      <div key={key}><span className="text-xs text-slate-500">{gstLabel(key)}</span><GstDetailValue value={item} /></div>)}</div>;
  }
  return <span className="break-words text-sm font-medium text-slate-900">{String(value)}</span>;
}
type ConfigType = {
  type: string;
  name: string;
  docs: Array<{
    code: string;
    name: string;
    enabled: boolean;
    required: boolean;
    fileType: "PDF" | "PNG" | "JPG";
  }>;
};
const empty: Details = {
  firstName: "",
  lastName: "",
  phone: "",
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
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(null);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [compliance, setCompliance] = useState<Compliance | null>(null);
  const [complianceSaving, setComplianceSaving] = useState(false);
  const [organizationTypes, setOrganizationTypes] = useState<ConfigType[]>([]);
  const [gstinDetails, setGstinDetails] = useState<GstinDetails | null>(null);
  const [gstinLookupError, setGstinLookupError] = useState("");
  const [gstinLookupLoading, setGstinLookupLoading] = useState(false);
  const [savedGstin, setSavedGstin] = useState<string | null>(null);
  const lookupGstin = async () => {
    setGstinLookupLoading(true);
    setGstinLookupError("");
    try {
      const response = await api.post("/auth/me/organization-gstin-lookup");
      setGstinDetails(response.data?.data ?? response.data);
    } catch (error) {
      setGstinLookupError(
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "GST details could not be fetched. You can retry later.",
      );
    } finally {
      setGstinLookupLoading(false);
    }
  };
  useEffect(() => {
    const [firstName = "", ...rest] = (user?.name ?? "").trim().split(/\s+/);
    const saved = localStorage.getItem(storageKey);
    setDetails(
      saved
        ? { ...empty, ...profileFields(JSON.parse(saved) as Partial<Details>) }
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
    void api
      .get("/auth/me/organization-compliance")
      .then((response) => {
        if (active) {
          const loaded = (response.data?.data ?? response.data) as Compliance;
          setCompliance(loaded);
          setSavedGstin(loaded.gstin);
        }
      })
      .catch(() => undefined);
    void api
      .get("/auth/me/organization-document-config")
      .then((response) => {
        if (active) setOrganizationTypes(response.data?.data ?? response.data);
      })
      .catch(() => undefined);
    void api.get("/auth/me/organization-gstin-details").then((response) => {
      if (active) setGstinDetails(response.data?.data ?? response.data);
    }).catch(() => undefined);
    return () => {
      active = false;
    };
  }, [storageKey, user?.name]);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const name = `${details.firstName} ${details.lastName}`.trim();
    try {
      const body: Record<string, string> = {};
      const allowedProfileFields: Array<keyof Details> = [
        "firstName",
        "lastName",
        "phone",
        "location",
        "bio",
        "dateOfBirth",
        "gender",
      ];
      for (const key of allowedProfileFields) {
        const value = details[key];
        if (value) body[key] = value;
      }
      if (profilePicture) {
        const { data } = await api.post("/auth/me/profile-picture/presign", {
          fileName: profilePicture.name,
          contentType: profilePicture.type,
          sizeBytes: profilePicture.size,
        });
        const upload = data?.data ?? data;
        const uploadResponse = await fetch(upload.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": profilePicture.type },
          body: profilePicture,
        });
        if (!uploadResponse.ok)
          throw new Error("Profile picture could not be uploaded to storage");
        body.profilePictureKey = upload.fileKey;
      }
      const response = await api.patch("/auth/me/profile", body);
      if (compliance) {
        const complianceResponse = await api.patch(
          "/auth/me/organization-compliance",
          {
            organizationTypeCode: compliance.organizationType.code,
            gstin: compliance.gstin || undefined,
            pincode: compliance.pincode || undefined,
          },
        );
        const savedCompliance = (complianceResponse.data?.data ?? complianceResponse.data) as Compliance;
        setCompliance(savedCompliance);
        setSavedGstin(savedCompliance.gstin);
        if (compliance.gstin && compliance.gstin.length === 15) {
          await lookupGstin();
        } else {
          setGstinDetails(null);
        }
      }
      const saved = response.data?.data ?? response.data;
      const next = { ...empty, ...details, ...profileFields(saved) } as Details;
      localStorage.setItem(storageKey, JSON.stringify(next));
      setDetails(next);
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
  const uploadOrganizationDocument = async (
    documentTypeCode: string,
    file: File,
  ) => {
    setComplianceSaving(true);
    try {
      // The user may select a new organization type and upload before pressing
      // the page-level Save changes button. Persist that selection first so the
      // backend validates against the same global configuration shown in the UI.
      const complianceResponse = await api.patch(
        "/auth/me/organization-compliance",
        {
          organizationTypeCode: compliance?.organizationType.code,
          gstin: compliance?.gstin || undefined,
          pincode: compliance?.pincode || undefined,
        },
      );
      const syncedCompliance =
        complianceResponse.data?.data ?? complianceResponse.data;
      setCompliance(syncedCompliance);
      const presignResponse = await api.post(
        "/auth/me/organization-documents/presign",
        {
          documentTypeCode,
          fileName: file.name,
          contentType: file.type,
          sizeBytes: file.size,
        },
      );
      const upload = presignResponse.data?.data ?? presignResponse.data;
      const put = await fetch(upload.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error("Upload failed");
      const submitResponse = await api.post("/auth/me/organization-documents", {
        documentTypeCode,
        fileName: upload.fileName,
        fileKey: upload.fileKey,
        fileUrl: upload.fileUrl,
        mimeType: upload.mimeType,
        sizeBytes: upload.sizeBytes,
      });
      setCompliance(submitResponse.data?.data ?? submitResponse.data);
      toast.success("Document submitted for admin review.");
    } catch (error) {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Document could not be uploaded.",
      );
    } finally {
      setComplianceSaving(false);
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
        id="my-profile-form"
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
      </form>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Building2 className="text-[#0C5A69]" size={20} />
          <div>
            <h2 className="font-bold">Organization verification</h2>
            <p className="text-sm text-slate-500">
              Submit your organization details and documents for platform
              review.
            </p>
          </div>
        </div>
        {compliance && (
          <div className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Organization type">
                <select
                  value={compliance.organizationType.code}
                  onChange={(e) => {
                    const selected = organizationTypes.find(
                      (type) => type.type === e.target.value,
                    );
                    if (!selected) return;
                    setCompliance({
                      ...compliance,
                      organizationType: {
                        code: selected.type,
                        name: selected.name,
                        requiredDocuments: selected.docs
                          .filter((doc) => doc.enabled)
                          .map((doc, index) => ({
                            documentTypeCode: doc.code,
                            isMandatory: doc.required,
                            order: index + 1,
                          })),
                      },
                      documents: [],
                    });
                  }}
                >
                  {organizationTypes.map((type) => (
                    <option key={type.type} value={type.type}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="GSTIN">
                <input
                  value={compliance.gstin ?? ""}
                  maxLength={15}
                  onChange={(e) => {
                    setGstinDetails(null);
                    setGstinLookupError("");
                    setCompliance({
                      ...compliance,
                      gstin: e.target.value.toUpperCase(),
                    });
                  }}
                />
              </Field>
              <Field label="Pincode">
                <input
                  value={compliance.pincode ?? ""}
                  maxLength={12}
                  onChange={(e) =>
                    setCompliance({ ...compliance, pincode: e.target.value })
                  }
                />
              </Field>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">GST registration details</h3>
                  <p className="mt-1 text-xs text-slate-500">Available registration details appear after saving a valid GSTIN. Documents still need to be uploaded separately.</p>
                </div>
                <button type="button" disabled={gstinLookupLoading || !compliance.gstin || compliance.gstin !== savedGstin || compliance.gstin.length !== 15} onClick={() => void lookupGstin()} className="rounded-lg border border-[#0C5A69] px-3 py-2 text-xs font-semibold text-[#0C5A69] disabled:opacity-50">
                  {gstinLookupLoading ? "Checking..." : "Fetch GST details"}
                </button>
              </div>
              {gstinLookupError && <p role="alert" className="mt-3 text-sm text-amber-700">{gstinLookupError}</p>}
              {gstinDetails && gstinDetails.gstin === compliance.gstin && (
                <div className="mt-4">
                  <p className="mb-3 text-xs text-slate-500">Fetched {new Date(gstinDetails.lookedUpAt).toLocaleString()} {gstinDetails.profileComplete ? "· Full profile available" : "· Provider returned partial details"}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Object.entries(gstinDetails.details).filter(([, value]) => value !== null && value !== "" && (!Array.isArray(value) || value.length > 0)).map(([key, value]) => (
                      <div key={key} className="rounded-lg border border-slate-200 bg-white p-3">
                        <p className="mb-1 text-xs text-slate-500">{gstLabel(key)}</p>
                        <GstDetailValue value={value} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold">Required documents</h3>
              <div className="mt-3 space-y-3">
                {compliance.organizationType.requiredDocuments.map(
                  (required) => {
                    const configuredDocument = organizationTypes
                      .find(
                        (type) =>
                          type.type === compliance.organizationType.code,
                      )
                      ?.docs.find(
                        (doc) => doc.code === required.documentTypeCode,
                      );
                    const fileType = configuredDocument?.fileType ?? "PDF";
                    const accept =
                      fileType === "PDF"
                        ? "application/pdf"
                        : fileType === "PNG"
                          ? "image/png"
                          : "image/jpeg";
                    const document = compliance.documents.find(
                      (item) =>
                        item.documentTypeCode === required.documentTypeCode,
                    );
                    return (
                      <div
                        key={required.documentTypeCode}
                        className="rounded-lg border border-slate-200 p-3 text-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <strong>
                              {required.documentTypeCode.replaceAll("_", " ")}
                            </strong>
                            <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                              {fileType}
                            </span>
                            {required.isMandatory && (
                              <span className="ml-2 text-xs text-red-600">
                                Required
                              </span>
                            )}
                            <p className="mt-1 text-slate-500">
                              {document?.status ?? "PENDING"}
                              {document?.rejectionReason
                                ? `: ${document.rejectionReason}`
                                : ""}
                            </p>
                          </div>
                          {document?.fileUrl && (
                            <a
                              className="text-[#0C5A69] underline"
                              href={document.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open file
                            </a>
                          )}
                        </div>
                        <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded border px-3 py-2 font-semibold text-[#0C5A69]">
                          <Upload size={15} /> Upload {fileType}
                          <input
                            className="hidden"
                            type="file"
                            accept={accept}
                            disabled={complianceSaving}
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file)
                                void uploadOrganizationDocument(
                                  required.documentTypeCode,
                                  file,
                                );
                            }}
                          />
                        </label>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        )}
      </section>
      <div className="flex justify-end">
        <button
          type="submit"
          form="my-profile-form"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0C5A69] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Save size={16} /> {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
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
