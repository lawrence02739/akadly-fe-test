import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  adminApi,
  adminError,
  type AdminSubscription,
  type AdminAcademyAdmin,
  type AdminTenant,
  type Pagination,
  type TenantPayload,
} from "../api/admin.api";
import { useAdminSession } from "../AdminSession";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0C5A69]/25";
const secondary =
  "rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50";
const primary =
  "rounded-lg bg-[#0C5A69] px-4 py-2 text-sm font-semibold text-white hover:bg-[#084855] disabled:opacity-50";
const badge = (status: string) =>
  status === "active"
    ? "bg-emerald-50 text-emerald-700"
    : status === "suspended"
      ? "bg-amber-50 text-amber-700"
      : "bg-slate-100 text-slate-600";
const date = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : "Ã¢â‚¬â€";

function CreateTenant({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<TenantPayload>({
    fullName: "",
    email: "",
    organizationName: "",
    organizationAddress: "",
    description: "",
    planId: "",
    billingDate: "",
    dueDate: "",
    paymentStatus: "due",
  });
  const [plans, setPlans] = useState<AdminSubscription[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<AdminSubscription | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState("");
  const [paymentProofFiles, setPaymentProofFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    adminApi
      .subscriptions({
        page: 1,
        pageSize: 100,
        status: "active",
        sortBy: "name",
        sortOrder: "asc",
      })
      .then(({ items }) => setPlans(items))
      .catch((cause) => setError(adminError(cause)));
  }, []);
  useEffect(() => {
    let active = true;
    if (!form.planId) {
      setSelectedPlan(null);
      setPlanError("");
      return () => {
        active = false;
      };
    }
    setPlanLoading(true);
    setPlanError("");
    adminApi
      .subscription(form.planId)
      .then((plan) => {
        if (active) setSelectedPlan(plan);
      })
      .catch((cause) => {
        if (active) {
          setSelectedPlan(null);
          setPlanError(adminError(cause));
        }
      })
      .finally(() => {
        if (active) setPlanLoading(false);
      });
    return () => {
      active = false;
    };
  }, [form.planId]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (new Date(form.dueDate) < new Date(form.billingDate))
        throw new Error("Due date must be on or after the billing date.");
      if (form.paymentStatus === "paid" && paymentProofFiles.length === 0)
        throw new Error(
          "Upload at least one payment proof when payment status is paid.",
        );
      const paymentProofs = await Promise.all(
        paymentProofFiles.map((file) =>
          adminApi.uploadTenantPaymentProof(file),
        ),
      );
      await adminApi.createTenant({
        ...form,
        description: form.description?.trim() || undefined,
        paymentProofs: paymentProofs.length ? paymentProofs : undefined,
      });
      toast.success(
        "Tenant created. A password setup link was emailed to the owner.",
      );
      onCreated();
      onClose();
    } catch (cause) {
      setError(adminError(cause));
    } finally {
      setSaving(false);
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 overflow-auto bg-slate-900/50 p-4 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Register tenant"
    >
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6 space-y-4"
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Create tenant</h2>
            <p className="text-sm text-slate-500">
              The owner will receive a secure link to set their password.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <label className="block text-sm font-medium">
          Full name
          <input
            required
            maxLength={120}
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Organization name
          <input
            required
            maxLength={120}
            value={form.organizationName}
            onChange={(e) =>
              setForm({ ...form, organizationName: e.target.value })
            }
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Organization location / address
          <textarea
            required
            maxLength={500}
            rows={2}
            value={form.organizationAddress}
            onChange={(e) =>
              setForm({ ...form, organizationAddress: e.target.value })
            }
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Description
          <textarea
            maxLength={500}
            rows={2}
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Subscription plan
          <select
            value={form.planId}
            onChange={(e) => setForm({ ...form, planId: e.target.value })}
            className={inputClass}
          >
            <option value="">Free plan (automatic)</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} Ã¢â‚¬â€{" "}
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: plan.currency,
                }).format(plan.price)}{" "}
                / {plan.interval === "monthly" ? "month" : "year"}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Choose a paid plan only when required. Otherwise the tenant receives
            the Free plan automatically.
          </p>
          {planLoading && <p className="mt-3 text-sm text-slate-500">Loading selected plan details...</p>}
          {planError && <p className="mt-3 text-sm text-rose-600">{planError}</p>}
          {selectedPlan && (
            <section className="mt-3 overflow-hidden rounded-xl border border-teal-100 bg-white" aria-live="polite">
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-teal-100 bg-teal-50/60 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900">Selected subscription details</p>
                  <p className="mt-0.5 text-xs text-slate-600">Data fetched from subscription ID: {selectedPlan.id}</p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#0C5A69] ring-1 ring-teal-100">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: selectedPlan.currency }).format(selectedPlan.price)} / {selectedPlan.interval === "monthly" ? "month" : "year"}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-xs">
                  <tbody className="divide-y divide-slate-100">
                    <PlanDetailRow label="Plan ID" value={selectedPlan.id} />
                    <PlanDetailRow label="Plan name" value={selectedPlan.name} />
                    <PlanDetailRow label="Plan code" value={selectedPlan.code} />
                    <PlanDetailRow label="Description" value={selectedPlan.description || "Not provided"} />
                    <PlanDetailRow label="Price" value={new Intl.NumberFormat("en-IN", { style: "currency", currency: selectedPlan.currency }).format(selectedPlan.price)} />
                    <PlanDetailRow label="Currency" value={selectedPlan.currency} />
                    <PlanDetailRow label="Billing interval" value={selectedPlan.interval} />
                    <PlanDetailRow label="Plan status" value={selectedPlan.status} />
                    <PlanDetailRow label="Popular plan" value={selectedPlan.isPopular ? "Yes" : "No"} />
                    <PlanDetailRow label="User limit" value={selectedPlan.userLimit === null ? "Unlimited" : selectedPlan.userLimit} />
                    <PlanDetailRow label="Student limit" value={selectedPlan.studentLimit === null ? "Unlimited" : selectedPlan.studentLimit} />
                    <PlanDetailRow label="Course limit" value={selectedPlan.courseLimit === null ? "Unlimited" : selectedPlan.courseLimit} />
                    <PlanDetailRow label="Content storage limit" value={formatBytes(selectedPlan.contentLimit)} />
                    <PlanDetailRow label="Included modules" value={selectedPlan.allowedModules.length ? <span className="flex flex-wrap gap-1.5">{selectedPlan.allowedModules.map((module) => <span key={module} className="rounded bg-teal-50 px-2 py-1 text-teal-700">{module}</span>)}</span> : "No modules configured"} />
                    <PlanDetailRow label="Created at" value={formatDateTime(selectedPlan.createdAt)} />
                    <PlanDetailRow label="Last updated" value={formatDateTime(selectedPlan.updatedAt)} />
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </label>
        <div className="grid sm:grid-cols-3 gap-4">
          <label className="block text-sm font-medium">
            Billing date
            <input
              required
              type="date"
              value={form.billingDate}
              onChange={(e) =>
                setForm({ ...form, billingDate: e.target.value })
              }
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-medium">
            Payment due date
            <input
              required
              type="date"
              min={form.billingDate || undefined}
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-medium">
            Payment status
            <select
              value={form.paymentStatus}
              onChange={(e) =>
                setForm({
                  ...form,
                  paymentStatus: e.target
                    .value as TenantPayload["paymentStatus"],
                })
              }
              className={inputClass}
            >
              <option value="due">Due</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </label>
        </div>
        {form.paymentStatus === "paid" && (
          <section className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-emerald-950">
                Payment proof
              </h3>
              <p className="mt-1 text-xs text-emerald-900/80">
                Upload receipt, screenshot, or payment document. JPG, PNG, PDF,
                DOC, DOCX; maximum 10 MB each.
              </p>
            </div>
            <input
              required
              type="file"
              multiple
              accept="image/jpeg,image/png,application/pdf,.doc,.docx"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                if (files.length > 5) {
                  setError(
                    "You can upload a maximum of five payment-proof files.",
                  );
                  return;
                }
                if (files.some((file) => file.size > 10 * 1024 * 1024)) {
                  setError("Each payment-proof file must be 10 MB or smaller.");
                  return;
                }
                setError("");
                setPaymentProofFiles(files);
              }}
              className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:font-semibold file:text-[#0C5A69]"
            />
            {paymentProofFiles.length > 0 && (
              <ul className="space-y-1 text-xs text-slate-700">
                {paymentProofFiles.map((file) => (
                  <li
                    key={`${file.name}-${file.lastModified}`}
                    className="flex items-center justify-between gap-3 rounded bg-white px-3 py-2"
                  >
                    <span className="truncate">
                      {file.name} ({Math.ceil(file.size / 1024)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPaymentProofFiles((current) =>
                          current.filter((currentFile) => currentFile !== file),
                        )
                      }
                      className="font-semibold text-red-700 hover:underline"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={secondary}>
            Cancel
          </button>
          <button disabled={saving} className={primary}>
            {saving ? "RegisteringÃ¢â‚¬Â¦" : "Register tenant"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminTenants() {
  const { can } = useAdminSession();
  const [items, setItems] = useState<AdminTenant[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("createdAt:desc");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);
  useEffect(() => {
    if (!can("tenant:read")) return;
    let active = true;
    const [sortBy, sortOrder] = sort.split(":");
    adminApi
      .tenants({
        page,
        pageSize: 20,
        search: search || undefined,
        status: status || undefined,
        sortBy,
        sortOrder,
      })
      .then((result) => {
        if (active) {
          setItems(result.items);
          setPagination(result.pagination);
          setError("");
        }
      })
      .catch((cause) => {
        if (active) setError(adminError(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, search, status, sort, revision, can]);
  return (
    <div className="min-h-screen bg-[#f3f6f8]">
      <main className="mx-auto max-w-7xl px-5 sm:px-8 py-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#0C5A69]">
              Workspace administration
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Tenants</h1>
            <p className="mt-1 text-sm text-slate-500">
              Search, register and manage platform workspaces.
            </p>
          </div>
          {can("tenant:create") && (
            <button
              className={`${primary} flex items-center gap-2`}
              onClick={() => setCreateOpen(true)}
            >
              <Plus size={18} /> Register tenant
            </button>
          )}
        </div>
        {can("tenant:read") ? (
          <>
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-52">
                <Search
                  size={17}
                  className="absolute left-3 top-3 text-slate-400"
                />
                <input
                  aria-label="Search tenants"
                  placeholder="Search name or slug"
                  maxLength={120}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
              <select
                aria-label="Filter status"
                className={inputClass + " sm:w-40"}
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="archived">Archived</option>
              </select>
              <select
                aria-label="Sort tenants"
                className={inputClass + " sm:w-48"}
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
              >
                <option value="createdAt:desc">Newest first</option>
                <option value="createdAt:asc">Oldest first</option>
                <option value="name:asc">Name AÃ¢â‚¬â€œZ</option>
                <option value="name:desc">Name ZÃ¢â‚¬â€œA</option>
                <option value="updatedAt:desc">Recently updated</option>
              </select>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="min-w-[760px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-4">Workspace</th>
                    <th className="p-4">Owner</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created</th>
                    <th className="p-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">
                          {tenant.name}
                        </div>
                        <div className="text-slate-500">{tenant.slug}</div>
                      </td>
                      <td className="p-4">
                        <div>{tenant.owner.name}</div>
                        <div className="text-slate-500">
                          {tenant.owner.email}
                        </div>
                      </td>
                      <td className="p-4"><div className="font-medium capitalize">{tenant.subscription?.name ?? tenant.plan}</div>{tenant.subscription && <div className="mt-0.5 text-xs text-slate-500">{tenant.subscription.code} ? {tenant.subscription.interval}</div>}</td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${tenant.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-700" : tenant.paymentStatus === "unpaid" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}
                        >
                          {tenant.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${badge(tenant.status)}`}
                        >
                          {tenant.status}
                        </span>
                      </td>
                      <td className="p-4">{date(tenant.createdAt)}</td>
                      <td className="p-4">
                        <Link
                          className="text-[#0C5A69] font-semibold hover:underline"
                          to={`/admin/tenants/${tenant.id}`}
                        >
                          View details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loading && (
                <p className="p-8 text-center text-slate-500">
                  Loading tenantsÃ¢â‚¬Â¦
                </p>
              )}
              {!loading && !error && items.length === 0 && (
                <p className="p-8 text-center text-slate-500">
                  No tenants found.
                </p>
              )}
              {error && (
                <p role="alert" className="p-6 text-center text-red-600">
                  {error}{" "}
                  <button
                    onClick={() => setRevision((v) => v + 1)}
                    className="underline"
                  >
                    Retry
                  </button>
                </p>
              )}
            </div>
            {pagination && (
              <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                <span>
                  {pagination.total} tenant{pagination.total === 1 ? "" : "s"}{" "}
                  Ã‚Â· Page {pagination.page} of{" "}
                  {Math.max(1, pagination.totalPages)}
                </span>
                <div className="flex gap-2">
                  <button
                    className={secondary}
                    disabled={!pagination.hasPrev}
                    onClick={() => setPage(page - 1)}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    className={secondary}
                    disabled={!pagination.hasNext}
                    onClick={() => setPage(page + 1)}
                    aria-label="Next page"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl bg-white border p-8 text-slate-600">
            You do not have permission to view tenants.
          </div>
        )}
        {createOpen && (
          <CreateTenant
            onClose={() => setCreateOpen(false)}
            onCreated={() => {
              setPage(1);
              setRevision((v) => v + 1);
            }}
          />
        )}
      </main>
    </div>
  );
}

export function AdminTenantDetails() {
  const { id } = useParams();
  const { can } = useAdminSession();
  const [tenant, setTenant] = useState<AdminTenant | null>(null);
  const [form, setForm] = useState({ name: "", ownerName: "", plan: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [academyWebsite, setAcademyWebsite] = useState("");
  const [acquisitionChannel, setAcquisitionChannel] = useState("Manual");
  const [activeTab, setActiveTab] = useState<
    "information" | "admins" | "billing" | "usage" | "documents"
  >("information");
  const [adminSearch, setAdminSearch] = useState("");
  const [academyAdmins, setAcademyAdmins] = useState<AdminAcademyAdmin[]>([]);
  const [billingPlans, setBillingPlans] = useState<AdminSubscription[]>([]);
  const [billingPlanId, setBillingPlanId] = useState("");
  const [billingDate, setBillingDate] = useState("");
  const [billingDueDate, setBillingDueDate] = useState("");
  const [savingBilling, setSavingBilling] = useState(false);
  const isFreePlan = tenant?.subscription?.price === 0 || tenant?.subscription?.code === "free" || tenant?.plan.toLowerCase() === "free";
  const formatPlanPrice = (plan: AdminSubscription | null | undefined) =>
    plan ? new Intl.NumberFormat("en-IN", { style: "currency", currency: plan.currency, maximumFractionDigits: 0 }).format(plan.price) : "Not set";
  const load = useCallback(async () => {
    if (!id) return;
    try {
      const result = await adminApi.tenant(id);
      setTenant(result);
      setForm({
        name: result.name,
        ownerName: result.owner.name,
        plan: result.plan,
      });
      const organization = result.settings?.organization as Record<string, unknown> | undefined;
      setAcademyWebsite(typeof organization?.website === "string" ? organization.website : "");
      setAcquisitionChannel(typeof result.settings?.acquisitionChannel === "string" ? result.settings.acquisitionChannel : "Manual");
      setBillingPlanId(result.planId ?? "");
      setBillingDate(result.billingDate?.slice(0, 10) ?? "");
      setBillingDueDate(result.dueDate?.slice(0, 10) ?? "");
      setError("");
    } catch (cause) {
      setError(adminError(cause));
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    if (can("tenant:read")) void load();
  }, [can, load]);
  useEffect(() => {
    if (!id || activeTab !== "admins" || !can("tenant:read")) return;
    let active = true;
    adminApi.academyAdmins(id)
      .then((admins) => { if (active) setAcademyAdmins(admins.items); })
      .catch((cause) => active && setError(adminError(cause)));
    return () => { active = false; };
  }, [activeTab, can, id]);
  useEffect(() => {
    if (activeTab !== "billing") return;
    let active = true;
    adminApi.subscriptions({ page: 1, pageSize: 100, status: "active", sortBy: "name", sortOrder: "asc" })
      .then((result) => active && setBillingPlans(result.items))
      .catch((cause) => active && setError(adminError(cause)));
    return () => { active = false; };
  }, [activeTab]);
  const saveBilling = async (event: FormEvent) => {
    event.preventDefault();
    if (!id || !tenant) return;
    setSavingBilling(true); setError("");
    try {
      const result = await adminApi.updateTenant(id, {
        planId: billingPlanId || null,
        billingDate: billingDate ? new Date(`${billingDate}T00:00:00.000Z`).toISOString() : null,
        dueDate: billingDueDate ? new Date(`${billingDueDate}T00:00:00.000Z`).toISOString() : null,
      });
      setTenant(result);
      setBillingPlanId(result.planId ?? "");
      setBillingDate(result.billingDate?.slice(0, 10) ?? "");
      setBillingDueDate(result.dueDate?.slice(0, 10) ?? "");
      toast.success("Subscription details saved.");
    } catch (cause) { setError(adminError(cause)); } finally { setSavingBilling(false); }
  };
  const saveAcademyInformation = async (event: FormEvent) => {
    event.preventDefault();
    if (!id || !tenant) return;
    setSaving(true); setError("");
    try {
      const settings = {
        ...(tenant.settings ?? {}),
        organization: {
          ...((tenant.settings?.organization as Record<string, unknown> | undefined) ?? {}),
          name: form.name.trim(),
          website: academyWebsite.trim() || undefined,
        },
        acquisitionChannel,
      };
      const result = await adminApi.updateTenant(id, { name: form.name.trim(), ownerName: form.ownerName.trim(), settings });
      setTenant(result);
      toast.success("Academy information saved.");
    } catch (cause) { setError(adminError(cause)); } finally { setSaving(false); }
  };
  const revokeOwnerInvitation = async () => {
    if (
      !id ||
      !tenant ||
      !window.confirm(
        "Revoke this password setup link? The existing email link will stop working immediately.",
      )
    )
      return;
    setSaving(true);
    setError("");
    try {
      await adminApi.revokeTenantOwnerInvitation(id);
      setTenant({ ...tenant, ownerInvitationStatus: "revoked" });
      toast.success("Tenant owner invitation revoked.");
    } catch (cause) {
      setError(adminError(cause));
    } finally {
      setSaving(false);
    }
  };
  const changeStatus = async () => {
    if (
      !id ||
      !tenant ||
      !window.confirm(
        `${tenant.status === "active" ? "Suspend" : "Activate"} ${tenant.name}?`,
      )
    )
      return;
    setSaving(true);
    setError("");
    try {
      setTenant(
        await adminApi.setTenantStatus(
          id,
          tenant.status === "active" ? "suspend" : "activate",
        ),
      );
      toast.success("Tenant status updated.");
    } catch (cause) {
      setError(adminError(cause));
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#f3f6f8]">
      <main className="mx-auto max-w-6xl px-5 sm:px-8 py-7">
        <Link
          to="/admin/tenants"
          className="inline-flex items-center gap-2 text-sm text-[#0C5A69] font-semibold"
        >
          <ArrowLeft size={17} /> All tenants
        </Link>
        {loading ? (
          <p className="mt-8 text-slate-500">Loading tenantÃ¢â‚¬Â¦</p>
        ) : !can("tenant:read") ? (
          <p className="mt-8">Access restricted.</p>
        ) : tenant ? (
          <>
            <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
              <div><h1 className="text-2xl font-bold tracking-tight text-slate-900">{tenant.name}</h1><p className="mt-1 text-sm text-slate-500">Update this academy's details, contacts and subscription information.</p></div>
              <div className="flex items-center gap-2"><Link to="/admin/tenants" className={secondary}>Cancel</Link>{can("tenant:update") && <button type="button" onClick={() => { const target = activeTab === "billing" ? "subscription-edit-form" : "tenant-edit-form"; if (activeTab !== "billing") setActiveTab("information"); window.setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); }} className={primary}>Edit</button>}</div>
            </div>
            <section className="mt-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-4">
              <TenantMeta label="Tenant ID" value={tenant.id} />
              <TenantMeta label="Academy status" value={tenant.status} status />
              <TenantMeta label="Current plan" value={tenant.subscription?.name ?? tenant.plan} />
              <TenantMeta label="Primary admin contact" value={tenant.owner.email} />
            </section>
                        <nav
              className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200"
              aria-label="Tenant details sections"
            >
              {[
                ["information", "Academy information"],
                ["admins", "Academy admins"],
                ["billing", "Subscription & billing"],
                ["usage", "Learner quota & usage"],
                ["documents", "Documents"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActiveTab(value as typeof activeTab)}
                  className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold transition ${
                    activeTab === value
                      ? "border-[#0C5A69] text-[#0C5A69]"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
            {activeTab === "information" && (
              <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.85fr)]">
                <div className="space-y-4">
                  <form id="tenant-edit-form" onSubmit={saveAcademyInformation} className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase text-slate-500">Academy information</p><p className="mt-2 text-sm text-slate-500">These details identify the academy across the Akadly platform.</p><div className="mt-5 grid gap-x-4 gap-y-4 text-sm sm:grid-cols-2"><label className="font-medium">Academy name *<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={`mt-1 ${inputClass}`} /></label><label className="font-medium">Academy domain<input readOnly value={tenant.slug} className={`mt-1 ${inputClass} bg-slate-50`} /></label><label className="font-medium">Website<input type="url" value={academyWebsite} onChange={(event) => setAcademyWebsite(event.target.value)} placeholder="https://www.example.edu" className={`mt-1 ${inputClass}`} /></label><label className="font-medium">Acquisition channel<select value={acquisitionChannel} onChange={(event) => setAcquisitionChannel(event.target.value)} className={`mt-1 ${inputClass}`}><option>Manual</option><option>Referral</option><option>Website</option><option>Sales</option><option>Partner</option></select></label><label className="font-medium">Tenant ID<input readOnly value={tenant.id} className={`mt-1 ${inputClass} bg-slate-50`} /></label><label className="font-medium">Academy status<input readOnly value={tenant.status} className={`mt-1 ${inputClass} bg-slate-50 capitalize`} /></label></div><p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">Tenant ID cannot be changed. Academy access is managed from the overview.</p><div className="mt-4 flex justify-end"><button disabled={saving} className={primary}>{saving ? "Saving?" : "Save changes"}</button></div></form>
                  <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase text-slate-500">Academy contact</p><div className="mt-5 grid gap-4 text-sm sm:grid-cols-2"><label className="font-medium">Primary admin name<input readOnly value={tenant.owner.name} className={`mt-1 ${inputClass} bg-slate-50`} /></label><label className="font-medium">Primary admin email<input readOnly value={tenant.owner.email} className={`mt-1 ${inputClass} bg-slate-50`} /></label></div><p className="mt-3 text-xs text-slate-500">Primary admin access is managed separately under Academy admins.</p>{can("tenant:update") && tenant.ownerInvitationStatus === "pending" && <button type="button" disabled={saving} onClick={revokeOwnerInvitation} className="mt-3 text-sm font-semibold text-red-700 hover:underline">Revoke password setup link</button>}</div>
                </div>
                <aside className="space-y-4"><div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase text-slate-500">Tenant record</p><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1"><InfoField label="Academy" value={tenant.name} /><InfoField label="Tenant ID" value={tenant.id} /><InfoField label="Domain" value={tenant.slug} /><InfoField label="Last updated by" value={`Updated ${date(tenant.updatedAt)}`} /></dl></div><div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase text-slate-500">Subscription & capacity</p><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1"><InfoField label="Current plan" value={tenant.subscription?.name ?? tenant.plan} /><InfoField label="Plan price" value={formatPlanPrice(tenant.subscription)} />{!isFreePlan && <><InfoField label="Billing cycle" value={tenant.subscription?.interval ?? "Not set"} /><InfoField label="Next due date" value={date(tenant.dueDate ?? undefined)} /></>}<InfoField label="Billable members" value={tenant.usage ? String(tenant.usage.members) : "Not tracked"} /><InfoField label="Member limit" value={tenant.subscription?.userLimit === null ? "Unlimited" : tenant.subscription?.userLimit?.toString() ?? "Not set"} /><InfoField label="Course usage" value={tenant.usage ? String(tenant.usage.courses) : "Not tracked"} /><InfoField label="Course limit" value={tenant.subscription?.courseLimit === null ? "Unlimited" : tenant.subscription?.courseLimit?.toString() ?? "Not set"} /><InfoField label="Student limit" value={tenant.subscription?.studentLimit === null ? "Unlimited" : tenant.subscription?.studentLimit?.toString() ?? "Not set"} /><InfoField label="Storage limit" value={formatBytes(tenant.subscription?.contentLimit ?? null)} /></dl>{tenant.subscription?.allowedModules?.length ? <div className="mt-4 border-t border-slate-100 pt-3"><p className="text-xs text-slate-500">Included modules</p><div className="mt-2 flex flex-wrap gap-1.5">{tenant.subscription.allowedModules.map((module) => <span key={module} className="rounded-full bg-teal-50 px-2 py-1 text-xs font-semibold text-[#0C5A69]">{module}</span>)}</div></div> : null}</div><div className="rounded-xl border border-sky-100 bg-sky-50 p-4 text-xs text-sky-900"><p className="font-semibold">Academy details</p><p className="mt-1">Admin, subscription and learner quota are managed in their respective tabs.</p></div></aside>
              </section>
            )}
            {activeTab === "billing" && (
              <section className="mt-4 space-y-4">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.85fr)]">
                  <div className="space-y-4"><div className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase text-slate-500">Current subscription</p><h2 className="mt-2 text-xl font-bold text-slate-900">{tenant.subscription?.name ?? tenant.plan}</h2></div><div className="text-right"><span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-bold text-[#0C5A69]">{tenant.subscription?.status === "active" ? "Subscription active" : "Subscription unavailable"}</span><p className="mt-3 text-xl font-bold text-slate-900">{formatPlanPrice(tenant.subscription)} <span className="text-sm font-medium">{isFreePlan ? "" : `/${tenant.subscription?.interval === "yearly" ? "year" : "month"}`}</span></p></div></div><dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4"><InfoField label="Billing cycle" value={isFreePlan ? "Free" : tenant.subscription?.interval ?? "Not set"} /><InfoField label="Next renewal" value={isFreePlan ? "Not applicable" : date(tenant.dueDate ?? undefined)} /><InfoField label="Plan code" value={tenant.subscription?.code ?? "Not set"} /><InfoField label="Plan status" value={tenant.subscription?.status ?? "Not set"} status /></dl>{isFreePlan && <p className="mt-4 text-sm text-slate-500">Free plan includes {tenant.subscription?.userLimit ?? 0} user, {tenant.subscription?.studentLimit ?? 0} student, {tenant.subscription?.courseLimit ?? 0} course and {formatBytes(tenant.subscription?.contentLimit ?? null)} storage.</p>}</div>
                  <form id="subscription-edit-form" onSubmit={saveBilling} className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase text-slate-500">Update subscription</p><p className="mt-1 text-sm text-slate-500">Edit the active subscription for {tenant.name}.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium">Subscription plan<select value={billingPlanId} onChange={(event) => setBillingPlanId(event.target.value)} className={`mt-1 ${inputClass}`}><option value="">Free plan</option>{billingPlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select></label><label className="text-sm font-medium">Billing cycle<input readOnly value={billingPlans.find((plan) => plan.id === billingPlanId)?.interval ?? tenant.subscription?.interval ?? "Free"} className={`mt-1 ${inputClass} bg-slate-50`} /></label><label className="text-sm font-medium">Billing date<input type="date" value={billingDate} onChange={(event) => setBillingDate(event.target.value)} className={`mt-1 ${inputClass}`} /></label><label className="text-sm font-medium">Next renewal<input type="date" value={billingDueDate} onChange={(event) => setBillingDueDate(event.target.value)} className={`mt-1 ${inputClass}`} /></label></div><div className="mt-4 flex justify-end"><button disabled={savingBilling} className={primary}>{savingBilling ? "Saving?" : "Save subscription"}</button></div></form></div>
                  <aside className="space-y-4"><div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase text-slate-500">Billing details</p><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-slate-500">Billing organization</dt><dd className="mt-1 font-semibold">{tenant.name}</dd></div><div><dt className="text-slate-500">Billing contact email</dt><dd className="mt-1 font-semibold">{tenant.owner.email}</dd></div><div><dt className="text-slate-500">Payment status</dt><dd className="mt-1 font-semibold capitalize">{isFreePlan ? "No payment required" : tenant.paymentStatus}</dd></div></dl></div><div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase text-slate-500">Subscription & capacity</p><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1"><InfoField label="Users used" value={tenant.usage ? String(tenant.usage.members) : "Not tracked"} /><InfoField label="User limit" value={tenant.subscription?.userLimit === null ? "Unlimited" : tenant.subscription?.userLimit?.toString() ?? "Not set"} /><InfoField label="Courses used" value={tenant.usage ? String(tenant.usage.courses) : "Not tracked"} /><InfoField label="Course limit" value={tenant.subscription?.courseLimit === null ? "Unlimited" : tenant.subscription?.courseLimit?.toString() ?? "Not set"} /><InfoField label="Student limit" value={tenant.subscription?.studentLimit === null ? "Unlimited" : tenant.subscription?.studentLimit?.toString() ?? "Not set"} /><InfoField label="Storage limit" value={formatBytes(tenant.subscription?.contentLimit ?? null)} /></dl></div></aside>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase text-slate-500">Invoice history</p>{isFreePlan ? <p className="mt-3 text-sm text-slate-500">The Free plan has no invoices or payment renewal history.</p> : tenant.paymentProofs?.length ? <ul className="mt-3 divide-y divide-slate-100">{tenant.paymentProofs.map((proof) => <li key={`${proof.fileName}-${proof.fileUrl}`} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><div><p className="font-semibold">{proof.fileName}</p><p className="text-slate-500">Uploaded {date(proof.uploadedAt)}</p></div><a className="font-semibold text-[#0C5A69] hover:underline" href={proof.fileUrl} target="_blank" rel="noreferrer">Download</a></li>)}</ul> : <p className="mt-3 text-sm text-slate-500">No invoice records are available yet.</p>}</div>
              </section>
            )}
            {activeTab === "billing" && tenant.paymentProofs?.length > 0 && (
              <section className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Payment proofs
                </p>
                <ul className="mt-3 divide-y divide-slate-100">
                  {tenant.paymentProofs?.map((proof) => (
                    <li
                      key={`${proof.fileUrl}-${proof.fileName}`}
                      className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {proof.fileName}
                        </p>
                        <p className="text-slate-500">
                          {proof.mimeType} ? {Math.ceil(proof.sizeBytes / 1024)}{" "}
                          KB
                          {proof.uploadedAt
                            ? ` ? Uploaded ${date(proof.uploadedAt)}`
                            : ""}
                        </p>
                      </div>
                      <a
                        href={proof.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-[#0C5A69] hover:underline"
                      >
                        Open proof
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {activeTab === "admins" && (
              <section className="mt-5 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase text-slate-500">Academy admins</p><h2 className="mt-1 text-lg font-bold text-slate-900">Academy admins</h2></div><div className="flex items-center gap-3"><span className="text-sm font-semibold text-[#0C5A69]">{academyAdmins.filter((admin) => admin.status === "active").length} active</span>{can("tenant:update") && <button type="button" onClick={() => { setActiveTab("information"); window.setTimeout(() => document.getElementById("tenant-edit-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); }} className={secondary}>Edit</button>}</div></div>
                  <label className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500"><Search size={15} /><input value={adminSearch} onChange={(event) => setAdminSearch(event.target.value)} placeholder="Search admins by name or email..." className="w-full bg-transparent outline-none" /></label>
                  <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200"><table className="w-full min-w-[500px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Admin</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{academyAdmins.filter((admin) => `${admin.name} ${admin.email}`.toLowerCase().includes(adminSearch.toLowerCase())).map((admin) => <tr key={admin.userId}><td className="px-4 py-3"><p className="font-semibold text-slate-800">{admin.name}</p><p className="text-xs text-slate-500">{admin.email}</p></td><td className="px-4 py-3">{admin.userId === tenant.ownerUserId ? "Primary academy admin" : "Academy admin"}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${badge(admin.status)}`}>{admin.status}</span></td></tr>)}</tbody></table></div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase text-slate-500">Academy roles</p><p className="mt-2 text-sm text-slate-600">Both roles are local to {tenant.name}, not platform staff roles.</p><div className="mt-4 border-b border-slate-100 pb-3"><p className="font-semibold text-slate-800">Primary academy admin</p><p className="mt-1 text-sm text-slate-600">Primary contact for the academy. Manages local learners, courses and users.</p></div><div className="pt-3"><p className="font-semibold text-slate-800">Academy admin</p><p className="mt-1 text-sm text-slate-600">Manages local learners, courses and users within this academy.</p></div></div>
              </section>
            )}
            {activeTab === "documents" && (
              <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.85fr)]">
                <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase text-slate-500">Documents</p><h2 className="mt-1 text-lg font-bold text-slate-900">Organization documents</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="border-y border-slate-200 bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-3">Document</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Submitted</th></tr></thead><tbody className="divide-y divide-slate-100">{tenant.organizationCompliance.documents.map((document) => <tr key={document.documentTypeCode}><td className="px-3 py-3 font-medium">{document.fileName ?? document.documentTypeCode}</td><td className="px-3 py-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">{document.status}</span></td><td className="px-3 py-3 text-slate-600">{date(document.submittedAt ?? undefined)}</td></tr>)}</tbody></table></div>{!tenant.organizationCompliance.documents.length && <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No organization documents have been submitted.</p>}</div>
                <aside className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase text-slate-500">Document profile</p><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-slate-500">Organization type</dt><dd className="mt-1 font-semibold">{tenant.organizationCompliance.organizationType?.code ?? tenant.organizationCompliance.organizationTypeCode ?? "Not set"}</dd></div><div><dt className="text-slate-500">GSTIN</dt><dd className="mt-1 font-semibold">{tenant.organizationCompliance.gstin ?? "Not provided"}</dd></div><div><dt className="text-slate-500">Pincode</dt><dd className="mt-1 font-semibold">{tenant.organizationCompliance.pincode ?? "Not provided"}</dd></div></dl></aside>
              </section>
            )}
            {activeTab === "usage" && (
              <section className="mt-5 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <UsageCard label="Users used" value={tenant.usage ? String(tenant.usage.members) : "Not tracked"} limit={tenant.subscription?.userLimit === null ? "Unlimited" : `${tenant.subscription?.userLimit ?? "Not set"} allowed`} />
                  <UsageCard label="Student quota" value={tenant.subscription?.studentLimit === null ? "Unlimited" : tenant.subscription?.studentLimit?.toLocaleString() ?? "Not set"} limit="Plan allowance" />
                  <UsageCard label="Courses used" value={tenant.usage ? String(tenant.usage.courses) : "Not tracked"} limit={tenant.subscription?.courseLimit === null ? "Unlimited" : `${tenant.subscription?.courseLimit ?? "Not set"} allowed`} />
                  <UsageCard label="Storage allowance" value={formatBytes(tenant.subscription?.contentLimit ?? null)} limit="Plan allowance" />
                </div>
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)]">
                  <div className="space-y-4"><div className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs font-bold uppercase text-slate-500">Usage breakdown</p><h2 className="mt-1 text-lg font-bold text-slate-900">Current plan usage</h2></div><div className="flex items-center gap-3"><span className="text-sm text-slate-500">Live tenant data</span>{can("tenant:update") && <button type="button" onClick={() => { setActiveTab("information"); window.setTimeout(() => document.getElementById("tenant-edit-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); }} className={secondary}>Edit</button>}</div></div><div className="mt-6 space-y-5"><QuotaUsageBar label="Billable users" used={tenant.usage?.members ?? null} limit={tenant.subscription?.userLimit ?? null} /><QuotaUsageBar label="Courses" used={tenant.usage?.courses ?? null} limit={tenant.subscription?.courseLimit ?? null} /><QuotaUsageBar label="Students" used={tenant.usage?.students ?? null} limit={tenant.subscription?.studentLimit ?? null} /></div><p className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500">Student usage and storage utilization will appear when the relevant tenant services start recording those metrics.</p></div><div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase text-slate-500">Recent usage activity</p><p className="mt-3 text-sm text-slate-500">Usage activity history is not recorded yet.</p></div></div>
                  <aside className="space-y-4"><div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase text-slate-500">Current plan quota</p><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-1"><InfoField label="Current plan" value={tenant.subscription?.name ?? tenant.plan} /><InfoField label="Users used" value={tenant.usage ? String(tenant.usage.members) : "Not tracked"} /><InfoField label="User limit" value={tenant.subscription?.userLimit === null ? "Unlimited" : tenant.subscription?.userLimit?.toString() ?? "Not set"} /><InfoField label="Course limit" value={tenant.subscription?.courseLimit === null ? "Unlimited" : tenant.subscription?.courseLimit?.toString() ?? "Not set"} /><InfoField label="Student limit" value={tenant.subscription?.studentLimit === null ? "Unlimited" : tenant.subscription?.studentLimit?.toString() ?? "Not set"} /><InfoField label="Storage limit" value={formatBytes(tenant.subscription?.contentLimit ?? null)} /></dl></div><div className="rounded-xl border border-sky-100 bg-sky-50 p-4 text-xs text-sky-900"><p className="font-semibold">Quota & subscription</p><p className="mt-1">Plan allowance comes from the assigned subscription. Usage is calculated from active tenant members and courses.</p></div></aside>
                </div>
              </section>
            )}
            {activeTab === "information" && can("tenant:suspend") && tenant.status !== "archived" && (
              <div className="mt-6 rounded-xl bg-white border border-slate-200 p-6 flex flex-wrap justify-between gap-4">
                <div>
                  <h2 className="font-bold">Workspace access</h2>
                  <p className="text-sm text-slate-500">
                    {tenant.status === "active"
                      ? "Suspend access to this workspace."
                      : "Restore access to this workspace."}
                  </p>
                </div>
                <button
                  disabled={saving}
                  onClick={changeStatus}
                  className={
                    tenant.status === "active"
                      ? "rounded-lg border border-amber-300 text-amber-800 px-4 py-2 font-semibold hover:bg-amber-50 disabled:opacity-50"
                      : primary
                  }
                >
                  {tenant.status === "active"
                    ? "Suspend tenant"
                    : "Activate tenant"}
                </button>
              </div>
            )}
          </>
        ) : null}
        {error && (
          <p role="alert" className="mt-5 text-red-700">
            {error}{" "}
            <button onClick={() => void load()} className="underline">
              Retry
            </button>
          </p>
        )}
      </main>
    </div>
  );
}

function InfoField({ label, value, status = false }: { label: string; value: string; status?: boolean }) {
  return <div><dt className="text-xs text-slate-500">{label}</dt><dd className={`mt-1 text-sm font-semibold ${status ? "capitalize text-emerald-700" : "text-slate-800"}`}>{value}</dd></div>;
}

function TenantMeta({
  label,
  value,
  status = false,
}: {
  label: string;
  value: string;
  status?: boolean;
}) {
  return (
    <div className="min-w-0 border-b border-slate-100 pb-2 last:border-b-0 sm:border-b-0 sm:border-r sm:px-2 sm:last:border-r-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 truncate text-sm font-semibold ${status ? "capitalize text-emerald-700" : "text-slate-800"}`}>{value}</p>
    </div>
  );
}

function QuotaUsageBar({ label, used, limit }: { label: string; used: number | null; limit: number | null }) {
  const tracked = used !== null;
  const ratio = tracked && limit !== null && limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : null;
  const description = !tracked ? "Not tracked" : limit === null ? `${used} used ? unlimited` : `${used} of ${limit} used`;
  return <div><div className="flex justify-between gap-3 text-sm"><span className="font-medium text-slate-700">{label}</span><span className="text-slate-500">{description}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">{ratio !== null && <div className="h-full rounded-full bg-[#0C8791]" style={{ width: `${ratio}%` }} />}</div></div>;
}

function UsageCard({
  label,
  value,
  limit,
}: {
  label: string;
  value: string;
  limit: number | string | null;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">
        Limit: {limit === null ? "Unlimited" : limit}
      </p>
    </div>
  );
}

function PlanDetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return <tr><th className="w-44 bg-slate-50 px-3 py-2.5 font-semibold text-slate-600">{label}</th><td className="px-3 py-2.5 font-medium text-slate-800">{value}</td></tr>;
}
function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}
function formatBytes(value: number | null) {
  if (value === null) return "Unlimited";
  if (value < 1024 * 1024 * 1024) return `${Math.round(value / (1024 * 1024))} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
