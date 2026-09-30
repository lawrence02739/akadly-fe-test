import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  useCreateCourierPartner,
  useGetCourierPartner,
  useUpdateCourierPartner,
} from "../hooks/useCourierPartners";

const HUB_SUGGESTIONS = [
  "Mumbai", "Delhi", "Bengaluru", "Pune", "Kolkata", "Chennai", "Hyderabad",
];

export default function CourierPartnerFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  const { data: existing, isLoading: loadingExisting } = useGetCourierPartner(id);
  const createMutation = useCreateCourierPartner();
  const updateMutation = useUpdateCourierPartner();

  const [form, setForm] = useState({
    name: "",
    code: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    standardRate: "",
    expressRate: "",
    priorityRate: "",
    avgDeliveryDays: "",
    maxPayloadWeightKg: "",
    country: "India",
    hubs: [] as string[],
    accountManagerName: "",
    accountManagerPhone: "",
  });
  const [hubInput, setHubInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existing && isEdit) {
      setForm({
        name: existing.name,
        code: existing.code,
        status: existing.status,
        standardRate: String(existing.standardRate),
        expressRate: existing.expressRate != null ? String(existing.expressRate) : "",
        priorityRate: existing.priorityRate != null ? String(existing.priorityRate) : "",
        avgDeliveryDays: String(existing.avgDeliveryDays),
        maxPayloadWeightKg: existing.maxPayloadWeightKg != null ? String(existing.maxPayloadWeightKg) : "",
        country: existing.country,
        hubs: existing.hubs,
        accountManagerName: existing.accountManagerName ?? "",
        accountManagerPhone: existing.accountManagerPhone ?? "",
      });
    }
  }, [existing, isEdit]);

  const addHub = (hub: string) => {
    const trimmed = hub.trim();
    if (!trimmed || form.hubs.includes(trimmed)) return;
    setForm((f) => ({ ...f, hubs: [...f.hubs, trimmed] }));
    setHubInput("");
  };

  const removeHub = (hub: string) => {
    setForm((f) => ({ ...f, hubs: f.hubs.filter((h) => h !== hub) }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.code.trim()) errs.code = "Code is required";
    if (!form.standardRate || Number(form.standardRate) < 0) errs.standardRate = "Standard rate required (≥ 0)";
    if (!form.avgDeliveryDays || Number(form.avgDeliveryDays) < 0) errs.avgDeliveryDays = "Avg. delivery days required (≥ 0)";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const dto = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      status: form.status,
      standardRate: Number(form.standardRate),
      expressRate: form.expressRate ? Number(form.expressRate) : undefined,
      priorityRate: form.priorityRate ? Number(form.priorityRate) : undefined,
      avgDeliveryDays: Number(form.avgDeliveryDays),
      maxPayloadWeightKg: form.maxPayloadWeightKg ? Number(form.maxPayloadWeightKg) : undefined,
      country: form.country,
      hubs: form.hubs,
      accountManagerName: form.accountManagerName || undefined,
      accountManagerPhone: form.accountManagerPhone || undefined,
    };

    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, dto });
        toast.success("Courier partner updated");
      } else {
        await createMutation.mutateAsync(dto);
        toast.success("Courier partner created");
      }
      navigate("/partner/courier-partners");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to save";
      if (msg?.toLowerCase().includes("code")) {
        setErrors((e) => ({ ...e, code: "This code already exists for your workspace" }));
      } else {
        toast.error(msg);
      }
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && loadingExisting) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate("/partner/courier-partners")} className="text-slate-400 hover:text-slate-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900">
            {isEdit ? "Edit Courier Partner" : "Add New Courier Partner"}
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* General Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">General Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="cp-name" className="block text-sm font-medium text-slate-700 mb-1">
                  Courier Partner Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="cp-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.name ? "border-red-400" : "border-slate-300"}`}
                  placeholder="e.g. BlueDart Express"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="cp-code" className="block text-sm font-medium text-slate-700 mb-1">
                  Unique Partner Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="cp-code"
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase ${errors.code ? "border-red-400" : "border-slate-300"}`}
                  placeholder="e.g. BLUEDART"
                />
                {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
              </div>
              <div>
                <label htmlFor="cp-status" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  id="cp-status"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Rate Cards */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Rate Cards &amp; Services</h2>
            <div className="space-y-4">
              {[
                { key: "standardRate", label: "Standard Rate", required: true },
                { key: "expressRate", label: "Express Rate", required: false },
                { key: "priorityRate", label: "Priority Rate", required: false },
              ].map(({ key, label, required }) => (
                <div key={key}>
                  <label htmlFor={`cp-${key}`} className="block text-sm font-medium text-slate-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                    <input
                      id={`cp-${key}`}
                      type="number"
                      min={0}
                      step={0.01}
                      value={(form as any)[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className={`w-full pl-7 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${(errors as any)[key] ? "border-red-400" : "border-slate-300"}`}
                      placeholder="0.00"
                    />
                  </div>
                  {(errors as any)[key] && <p className="text-red-500 text-xs mt-1">{(errors as any)[key]}</p>}
                </div>
              ))}
              <div>
                <label htmlFor="cp-avgDays" className="block text-sm font-medium text-slate-700 mb-1">
                  Average Delivery Time (days) <span className="text-red-500">*</span>
                </label>
                <input
                  id="cp-avgDays"
                  type="number"
                  min={0}
                  step={0.1}
                  value={form.avgDeliveryDays}
                  onChange={(e) => setForm((f) => ({ ...f, avgDeliveryDays: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.avgDeliveryDays ? "border-red-400" : "border-slate-300"}`}
                  placeholder="e.g. 2.4"
                />
                {errors.avgDeliveryDays && <p className="text-red-500 text-xs mt-1">{errors.avgDeliveryDays}</p>}
              </div>
              <div>
                <label htmlFor="cp-maxWeight" className="block text-sm font-medium text-slate-700 mb-1">
                  Maximum Allowed Payload Weight (kg)
                </label>
                <input
                  id="cp-maxWeight"
                  type="number"
                  min={0}
                  value={form.maxPayloadWeightKg}
                  onChange={(e) => setForm((f) => ({ ...f, maxPayloadWeightKg: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. 25"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Hub Coverage */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Hub Regional Coverage</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="cp-country" className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                <input
                  id="cp-country"
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="cp-hubs" className="block text-sm font-medium text-slate-700 mb-1">Operational Hubs</label>
                <div className="flex gap-2">
                  <input
                    id="cp-hubs"
                    type="text"
                    value={hubInput}
                    onChange={(e) => setHubInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addHub(hubInput); }
                    }}
                    list="hub-suggestions"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Type a city and press Enter"
                  />
                  <datalist id="hub-suggestions">
                    {HUB_SUGGESTIONS.map((h) => <option key={h} value={h} />)}
                  </datalist>
                  <button
                    type="button"
                    onClick={() => addHub(hubInput)}
                    className="px-3 py-2 bg-primary-800 text-white rounded-lg text-sm hover:bg-primary-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.hubs.map((hub) => (
                    <span key={hub} className="flex items-center gap-1 bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">
                      {hub}
                      <button type="button" onClick={() => removeHub(hub)} className="text-primary-400 hover:text-primary-700">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Account Coordination */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Account Coordination</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="cp-amName" className="block text-sm font-medium text-slate-700 mb-1">Account Manager Name</label>
                <input
                  id="cp-amName"
                  type="text"
                  value={form.accountManagerName}
                  onChange={(e) => setForm((f) => ({ ...f, accountManagerName: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. Rahul Verma"
                />
              </div>
              <div>
                <label htmlFor="cp-amPhone" className="block text-sm font-medium text-slate-700 mb-1">Contact Telephone Number</label>
                <input
                  id="cp-amPhone"
                  type="tel"
                  value={form.accountManagerPhone}
                  onChange={(e) => setForm((f) => ({ ...f, accountManagerPhone: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-[#0C5A69] border-t border-primary-700 px-6 py-3 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate("/partner/courier-partners")}
          className="px-5 py-2 border border-white/40 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 bg-white text-primary-800 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : `${isEdit ? "Save Changes" : "+ Save Partner"}`}
        </button>
      </div>
    </form>
  );
}
