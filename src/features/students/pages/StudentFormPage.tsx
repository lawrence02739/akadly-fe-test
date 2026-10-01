import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useCreateStudent, useGetStudent, useUpdateStudent } from "../hooks/useStudents";
import { useQuery } from "@tanstack/react-query";
import { listCourses } from "../../courses/api/courses.api";

interface CoursePlan {
  name: string;
  price?: number;
}

export default function StudentFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  const { data: existing, isLoading: loadingExisting } = useGetStudent(id);
  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ["courses"],
    queryFn: listCourses,
  });

  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    // Personal
    fullName: "",
    email: "",
    countryCode: "+91",
    phone: "",
    city: "",
    addressLine: "",
    state: "",
    pincode: "",
    // Course
    courseId: "",
    planName: "",
    // Payment
    planType: "FULL" as "FULL" | "INSTALLMENT",
    installmentMonths: "3",
    mode: "ONLINE" as "ONLINE" | "OFFLINE",
    type: "UPI",
    transactionId: "",
    paidBy: "STUDENT" as "STUDENT" | "TEACHER",
    // Options
    sendWelcomeInvitation: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Derive course plans
  const selectedCourse = useMemo(
    () => courses.find((c: any) => c.id === form.courseId),
    [courses, form.courseId],
  );
  const plans: CoursePlan[] = selectedCourse?.plans ?? [];
  const selectedPlan = plans.find((p) => p.name === form.planName);
  const planPrice = selectedPlan?.price ?? 0;

  // Compute preview
  const instalmentAmount = useMemo(() => {
    if (form.planType !== "INSTALLMENT" || !planPrice) return null;
    const n = Number(form.installmentMonths);
    return Math.round(planPrice / n);
  }, [form.planType, form.installmentMonths, planPrice]);

  useEffect(() => {
    if (existing && isEdit) {
      setForm((f) => ({
        ...f,
        fullName: existing.fullName,
        email: existing.email,
        countryCode: existing.countryCode,
        phone: existing.phone,
        city: existing.city ?? "",
        addressLine: existing.addressLine ?? "",
        state: existing.state ?? "",
        pincode: existing.pincode ?? "",
        courseId: existing.courseId,
        planName: existing.planName,
        planType: existing.payment.planType,
        installmentMonths: String(existing.payment.installmentMonths ?? 3),
        mode: existing.payment.mode,
        type: existing.payment.type,
        transactionId: existing.payment.transactionId ?? "",
        paidBy: existing.payment.paidBy,
      }));
    }
  }, [existing, isEdit]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Valid email is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!form.courseId) errs.courseId = "Please select a course";
    if (!form.planName) errs.planName = "Please select a plan";
    if (!form.type) errs.type = "Payment type is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit && id) {
      try {
        await updateMutation.mutateAsync({
          id,
          dto: {
            fullName: form.fullName.trim(),
            phone: form.phone,
            countryCode: form.countryCode,
            city: form.city || undefined,
            addressLine: form.addressLine || undefined,
            state: form.state || undefined,
            pincode: form.pincode || undefined,
          },
        });
        toast.success("Student updated");
        navigate(`/partner/students/${id}`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? "Failed to update");
      }
      return;
    }

    try {
      const dto = {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        countryCode: form.countryCode,
        phone: form.phone,
        city: form.city || undefined,
        addressLine: form.addressLine || undefined,
        state: form.state || undefined,
        pincode: form.pincode || undefined,
        courseId: form.courseId,
        planName: form.planName,
        sendWelcomeInvitation: form.sendWelcomeInvitation,
        payment: {
          planType: form.planType,
          installmentMonths:
            form.planType === "INSTALLMENT" ? Number(form.installmentMonths) : undefined,
          mode: form.mode,
          type: form.type,
          transactionId: form.transactionId || undefined,
          paidBy: form.paidBy,
        },
      };
      await createMutation.mutateAsync(dto);
      toast.success("Student enrolled successfully!");
      navigate("/partner/students");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to enrol student";
      if (msg?.toLowerCase().includes("email")) {
        setErrors((e) => ({ ...e, email: "Email already registered" }));
      } else {
        toast.error(msg);
      }
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if ((isEdit && loadingExisting) || loadingCourses) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const paymentTypeOptions = {
    ONLINE: ["UPI", "CARD", "NET_BANKING"],
    OFFLINE: ["CASH", "CHEQUE", "BANK_TRANSFER"],
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3">
        <button type="button" onClick={() => navigate("/partner/students")} className="text-slate-400 hover:text-slate-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-slate-900">
          {isEdit ? `Edit Student — ${existing?.fullName}` : "Enrol New Student"}
        </h1>
      </div>

      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT (2/3): Personal + Course + Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.fullName ? "border-red-400" : "border-slate-300"}`}
                  placeholder="John Doe"
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={form.email}
                  disabled={isEdit}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.email ? "border-red-400" : "border-slate-300"} ${isEdit ? "bg-slate-50 text-slate-400" : ""}`}
                  placeholder="student@example.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <select
                    value={form.countryCode}
                    onChange={(e) => setForm((f) => ({ ...f, countryCode: e.target.value }))}
                    className="w-24 px-2 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="+91">+91 🇮🇳</option>
                    <option value="+1">+1 🇺🇸</option>
                    <option value="+44">+44 🇬🇧</option>
                    <option value="+971">+971 🇦🇪</option>
                  </select>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.phone ? "border-red-400" : "border-slate-300"}`}
                    placeholder="98765 43210"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Mumbai"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Maharashtra"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address Line</label>
                <input
                  type="text"
                  value={form.addressLine}
                  onChange={(e) => setForm((f) => ({ ...f, addressLine: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="123 Main Street, Apt 4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="400001"
                />
              </div>
            </div>
          </section>

          {/* Course & Plan */}
          {!isEdit && (
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Course Enrolment</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Course <span className="text-red-500">*</span></label>
                  <select
                    value={form.courseId}
                    onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value, planName: "" }))}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.courseId ? "border-red-400" : "border-slate-300"}`}
                  >
                    <option value="">— Choose a course —</option>
                    {courses.filter((c: any) => c.status !== "ARCHIVED").map((c: any) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  {errors.courseId && <p className="text-red-500 text-xs mt-1">{errors.courseId}</p>}
                </div>

                {/* Plans from course */}
                {plans.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Select Plan <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {plans.map((plan) => (
                        <button
                          key={plan.name}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, planName: plan.name }))}
                          className={`text-left p-3 rounded-xl border-2 transition-all ${form.planName === plan.name ? "border-primary-600 bg-primary-50" : "border-slate-200 hover:border-slate-300"}`}
                        >
                          <p className="font-medium text-slate-900 text-sm">{plan.name}</p>
                          <p className="text-xl font-bold text-primary-700 mt-1">
                            {plan.price ? `₹${plan.price.toLocaleString()}` : "Free"}
                          </p>
                        </button>
                      ))}
                    </div>
                    {errors.planName && <p className="text-red-500 text-xs mt-1">{errors.planName}</p>}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Payment */}
          {!isEdit && form.planName && (
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Payment Details</h2>
              <div className="space-y-4">
                {/* Plan Type (only if price > 0) */}
                {planPrice > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Payment Plan</label>
                    <div className="flex gap-3">
                      {[
                        { value: "FULL", label: "Full Payment", sub: `₹${planPrice.toLocaleString()}` },
                        { value: "INSTALLMENT", label: "Instalment", sub: "Flexible" },
                      ].map(({ value, label, sub }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, planType: value as any }))}
                          className={`flex-1 p-3 rounded-xl border-2 text-left transition-all ${form.planType === value ? "border-primary-600 bg-primary-50" : "border-slate-200"}`}
                        >
                          <p className="font-medium text-slate-900 text-sm">{label}</p>
                          <p className="text-xs text-slate-500">{sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {form.planType === "INSTALLMENT" && planPrice > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Number of Instalments</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(["3", "6", "9", "12"] as const).map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, installmentMonths: n }))}
                          className={`flex-1 p-2 rounded-xl border-2 text-center transition-all ${form.installmentMonths === n ? "border-primary-600 bg-primary-50" : "border-slate-200"}`}
                        >
                          <p className="font-bold text-slate-900">{n} mo.</p>
                        </button>
                      ))}
                    </div>
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Custom months:</label>
                      <input
                        type="number"
                        min="2"
                        max="60"
                        value={form.installmentMonths}
                        onChange={(e) => setForm((f) => ({ ...f, installmentMonths: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g. 5"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        ≈ ₹{Math.round(planPrice / (Number(form.installmentMonths) || 1)).toLocaleString()} / month
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
                    <div className="flex gap-2">
                      {(["ONLINE", "OFFLINE"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, mode: m, type: m === "ONLINE" ? "UPI" : "CASH" }))}
                          className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${form.mode === m ? "bg-primary-600 text-white border-primary-600" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}
                        >
                          {m.charAt(0) + m.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Payment Type <span className="text-red-500">*</span></label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.type ? "border-red-400" : "border-slate-300"}`}
                    >
                      {paymentTypeOptions[form.mode].map((t) => (
                        <option key={t} value={t}>{t.replace("_", " ")}</option>
                      ))}
                    </select>
                    {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Transaction ID / Receipt No.</label>
                    <input
                      type="text"
                      value={form.transactionId}
                      onChange={(e) => setForm((f) => ({ ...f, transactionId: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Paid By</label>
                    <div className="flex gap-2">
                      {(["STUDENT", "TEACHER"] as const).map((by) => (
                        <button
                          key={by}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, paidBy: by }))}
                          className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${form.paidBy === by ? "bg-primary-600 text-white border-primary-600" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}
                        >
                          {by.charAt(0) + by.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* RIGHT (1/3): Summary + Options */}
        <div className="space-y-6">
          {/* Enrolment Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-20">
            <h2 className="font-semibold text-slate-900 mb-4">Enrolment Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Student</span>
                <span className="font-medium text-slate-800 truncate max-w-32">{form.fullName || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Course</span>
                <span className="font-medium text-slate-800 truncate max-w-32">{selectedCourse?.title ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Plan</span>
                <span className="font-medium text-slate-800">{form.planName || "—"}</span>
              </div>
              {planPrice > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Fee</span>
                    <span className="font-bold text-slate-900">₹{planPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment</span>
                    <span className="font-medium text-slate-800">
                      {form.planType === "FULL"
                        ? "Full"
                        : `${form.installmentMonths}× ≈ ₹${instalmentAmount?.toLocaleString()}`}
                    </span>
                  </div>
                </>
              )}
              {planPrice === 0 && form.planName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Fee</span>
                  <span className="font-bold text-emerald-600">Free</span>
                </div>
              )}
            </div>

            {!isEdit && (
              <>
                <hr className="my-4 border-slate-100" />
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.sendWelcomeInvitation}
                    onChange={(e) => setForm((f) => ({ ...f, sendWelcomeInvitation: e.target.checked }))}
                    className="w-4 h-4 mt-0.5 accent-primary-600"
                  />
                  <div>
                    <p className="font-medium text-slate-700 text-sm">Send welcome email</p>
                    <p className="text-xs text-slate-400">Student receives a set-password link to access the student portal.</p>
                  </div>
                </label>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-[#0C5A69] border-t border-primary-700 px-6 py-3 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate("/partner/students")}
          className="px-5 py-2 border border-white/40 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-5 py-2 bg-white text-primary-800 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : isEdit ? (
            "Save Changes"
          ) : (
            <><Send className="w-4 h-4" /> {form.sendWelcomeInvitation ? "Enrol & Send Invite" : "Enrol Student"}</>
          )}
        </button>
      </div>
    </form>
  );
}
