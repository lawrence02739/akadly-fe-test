import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Plus,
  Mail,
  Trash2,
  MoreVertical,
  UserCheck,
  BookOpen,
  DollarSign,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import { useListStudents, useDeleteStudent, useResendInvitation } from "../hooks/useStudents";
import type { Student } from "../types";

const statusColors: Record<string, { bg: string; dot: string; text: string }> = {
  ACTIVE: { bg: "bg-emerald-100", dot: "bg-emerald-500", text: "text-emerald-700" },
  INVITED: { bg: "bg-amber-100", dot: "bg-amber-500", text: "text-amber-700" },
  INACTIVE: { bg: "bg-slate-100", dot: "bg-slate-400", text: "text-slate-500" },
};

const paymentColors: Record<string, string> = {
  PAID: "text-emerald-600",
  PARTIALLY_PAID: "text-amber-600",
  PENDING: "text-red-500",
};

const paymentLabels: Record<string, string> = {
  PAID: "Paid",
  PARTIALLY_PAID: "Partial",
  PENDING: "Pending",
};

function StudentRow({ student, onDelete, onResend }: { student: Student; onDelete: (s: Student) => void; onResend: (s: Student) => void }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const style = statusColors[student.status];

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 group">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700 text-sm flex-shrink-0">
            {student.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <button
              onClick={() => navigate(`/partner/students/${student.id}`)}
              className="font-medium text-slate-900 hover:text-primary-700 text-sm leading-tight text-left"
            >
              {student.fullName}
            </button>
            <p className="text-xs text-slate-400">{student.studentCode}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <p className="text-sm text-slate-700">{student.email}</p>
        <p className="text-xs text-slate-400">{student.phone}</p>
      </td>
      <td className="py-3 px-4">
        <p className="text-sm font-medium text-slate-800">{student.courseTitle}</p>
        <p className="text-xs text-slate-400">{student.planName}</p>
      </td>
      <td className="py-3 px-4">
        <div className={`flex items-center gap-1.5 ${style.bg} ${style.text} px-2 py-0.5 rounded-full w-fit`}>
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot} flex-shrink-0`} />
          <span className="text-xs font-medium">{student.status.charAt(0) + student.status.slice(1).toLowerCase()}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <p className={`text-sm font-medium ${paymentColors[student.payment.overallStatus]}`}>
          {paymentLabels[student.payment.overallStatus]}
        </p>
        <p className="text-xs text-slate-400">
          ₹{student.payment.paidAmount.toLocaleString()} / ₹{student.payment.totalAmount.toLocaleString()}
        </p>
      </td>
      <td className="py-3 px-4">
        <p className="text-sm text-slate-600">{student.totalOrders ?? 0}</p>
      </td>
      <td className="py-3 px-4">
        <div className="relative flex items-center justify-end gap-2">
          <button
            onClick={() => navigate(`/partner/students/${student.id}/edit`)}
            className="p-1.5 text-slate-400 hover:text-primary-700 hover:bg-primary-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="Edit"
          >
            <UserCheck className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setMenuOpen(!menuOpen); }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded relative"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20">
              <button
                onClick={() => { setMenuOpen(false); onResend(student); }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-t-xl"
              >
                <Mail className="w-4 h-4" />
                Resend invitation
              </button>
              <button
                onClick={() => navigate(`/partner/students/${student.id}`)}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <BookOpen className="w-4 h-4" />
                View details
              </button>
              <button
                onClick={() => navigate(`/partner/students/${student.id}/payments`)}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <DollarSign className="w-4 h-4" />
                Payment schedule
              </button>
              <hr className="border-slate-100" />
              <button
                onClick={() => { setMenuOpen(false); onDelete(student); }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-xl"
              >
                <Trash2 className="w-4 h-4" />
                Delete student
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function StudentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "INVITED" | "ACTIVE" | "INACTIVE">("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useListStudents({
    search: search || undefined,
    status: statusFilter || undefined,
    page,
    limit,
  });

  const deleteMutation = useDeleteStudent();
  const resendMutation = useResendInvitation();

  const students = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const handleDelete = async (student: Student) => {
    if (!window.confirm(`Delete student "${student.fullName}"? This cannot be undone.`)) return;
    try {
      await deleteMutation.mutateAsync(student.id);
      toast.success("Student deleted");
    } catch {
      toast.error("Failed to delete student");
    }
  };

  const handleResend = async (student: Student) => {
    try {
      await resendMutation.mutateAsync(student.id);
      toast.success(`Invitation resent to ${student.email}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to resend invitation");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary-700" />
            Students
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {total} student{total !== 1 ? "s" : ""} enrolled
          </p>
        </div>
        <button
          onClick={() => navigate("/partner/students/new")}
          className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Enrol Student
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Enrolled", value: total, icon: GraduationCap, color: "text-primary-700 bg-primary-50" },
          { label: "Active", value: students.filter((s) => s.status === "ACTIVE").length, icon: UserCheck, color: "text-emerald-600 bg-emerald-50" },
          { label: "Pending Invitation", value: students.filter((s) => s.status === "INVITED").length, icon: Mail, color: "text-amber-600 bg-amber-50" },
          { label: "Payment Due", value: students.filter((s) => s.payment.overallStatus !== "PAID").length, icon: DollarSign, color: "text-red-500 bg-red-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-52">
          <input
            type="text"
            placeholder="Search by name, email, code..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-3 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          {(["", "INVITED", "ACTIVE", "INACTIVE"] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${statusFilter === s ? "bg-primary-800 text-white border-primary-800" : "text-slate-600 border-slate-200 hover:bg-slate-50"}`}
            >
              {s === "" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden min-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <GraduationCap className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-600 font-medium">No students found</p>
            <p className="text-slate-400 text-sm mb-4">Enrol your first student to get started</p>
            <button
              onClick={() => navigate("/partner/students/new")}
              className="bg-primary-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
            >
              + Enrol Student
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Student", "Contact", "Course / Plan", "Status", "Payment", "Orders", ""].map((col) => (
                  <th key={col} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <StudentRow
                  key={s.id}
                  student={s}
                  onDelete={handleDelete}
                  onResend={handleResend}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40">Previous</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 text-sm border rounded-lg ${p === page ? "bg-primary-800 text-white border-primary-800" : "hover:bg-slate-50"}`}
            >
              {p}
            </button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
