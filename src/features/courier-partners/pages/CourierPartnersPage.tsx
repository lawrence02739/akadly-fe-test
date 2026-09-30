import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, Plus, Star, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import {
  useListCourierPartners,
  useListCourierPartnerPerformance,
  useDeleteCourierPartner,
  useUpdateCourierPartner,
} from "../hooks/useCourierPartners";
import type { CourierPartner } from "../types";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-red-100 text-red-700",
};

function StarRating({ rating }: { rating?: number }) {
  if (rating == null) return <span className="text-slate-400 text-sm">—</span>;
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
        />
      ))}
    </div>
  );
}

export default function CourierPartnersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "ACTIVE" | "INACTIVE">("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useListCourierPartners({
    search: search || undefined,
    status: statusFilter || undefined,
    page,
    limit,
  });

  const { data: perfData } = useListCourierPartnerPerformance(statusFilter || undefined);

  const deleteMutation = useDeleteCourierPartner();
  const updateMutation = useUpdateCourierPartner();

  const handleDelete = async (partner: CourierPartner) => {
    if (!window.confirm(`Delete "${partner.name}"? This cannot be undone.`)) return;
    try {
      await deleteMutation.mutateAsync(partner.id);
      toast.success("Courier partner deleted");
    } catch {
      toast.error("Failed to delete courier partner");
    }
  };

  const handleToggleStatus = async (partner: CourierPartner) => {
    const newStatus = partner.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateMutation.mutateAsync({ id: partner.id, dto: { status: newStatus } });
      toast.success(`Partner ${newStatus === "ACTIVE" ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const partners = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary-700" />
            Manage Courier Partners
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {total} partner{total !== 1 ? "s" : ""} configured
          </p>
        </div>
        <button
          onClick={() => navigate("/partner/courier-partners/new")}
          className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Partner
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search partners..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Partner Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse h-64" />
          ))}
        </div>
      ) : partners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Truck className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">No courier partners yet</p>
          <p className="text-slate-400 text-sm mb-4">Add your first partner to get started</p>
          <button
            onClick={() => navigate("/partner/courier-partners/new")}
            className="bg-primary-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
          >
            + Add New Partner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                    {partner.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm leading-tight">{partner.name}</p>
                    <p className="text-xs text-slate-400">{partner.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[partner.status]}`}>
                    {partner.status === "ACTIVE" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-3 gap-1 text-center mb-3 py-2 border-y border-slate-100">
                <div>
                  <p className="text-xs text-slate-500">Shipments</p>
                  <p className="font-semibold text-slate-800 text-sm">{partner.totalShipments ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Success %</p>
                  <p className="font-semibold text-emerald-600 text-sm">{partner.successRate?.toFixed(1) ?? "0.0"}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Avg. Days</p>
                  <p className="font-semibold text-slate-800 text-sm">{partner.avgDeliveryDays}</p>
                </div>
              </div>

              {/* Hubs */}
              {partner.hubs?.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Coverage Hubs</p>
                  <div className="flex flex-wrap gap-1">
                    {partner.hubs.slice(0, 3).map((hub) => (
                      <span key={hub} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {hub}
                      </span>
                    ))}
                    {partner.hubs.length > 3 && (
                      <span className="text-xs text-slate-400">+{partner.hubs.length - 3}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Rate Card */}
              <div className="mb-3">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Rate Card Summary</p>
                <div className="flex gap-2 text-xs">
                  <span className="text-slate-600">Std: <strong>₹{partner.standardRate}</strong></span>
                  {partner.expressRate != null && <span className="text-slate-600">Exp: <strong>₹{partner.expressRate}</strong></span>}
                  {partner.priorityRate != null && <span className="text-slate-600">Pri: <strong>₹{partner.priorityRate}</strong></span>}
                </div>
              </div>

              {/* Account Manager */}
              {partner.accountManagerName && (
                <div className="text-xs text-slate-500 mb-3">
                  <span className="font-medium">Account Manager:</span> {partner.accountManagerName}
                  {partner.accountManagerPhone && ` · ${partner.accountManagerPhone}`}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 border-t border-slate-100 pt-3">
                <button
                  onClick={() => navigate(`/partner/courier-partners/${partner.id}/edit`)}
                  className="flex-1 flex items-center justify-center gap-1 text-xs text-slate-600 hover:text-primary-700 py-1 rounded hover:bg-slate-50"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(partner)}
                  className="flex-1 flex items-center justify-center gap-1 text-xs text-slate-600 hover:text-amber-600 py-1 rounded hover:bg-slate-50"
                >
                  {partner.status === "ACTIVE" ? (
                    <><XCircle className="w-3.5 h-3.5" /> Deactivate</>
                  ) : (
                    <><CheckCircle className="w-3.5 h-3.5" /> Activate</>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(partner)}
                  className="flex-1 flex items-center justify-center gap-1 text-xs text-red-500 hover:text-red-700 py-1 rounded hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mb-8">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40">Previous</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 text-sm border rounded-lg ${p === page ? "bg-primary-800 text-white border-primary-800" : "hover:bg-slate-50"}`}
            >
              {p}
            </button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40">Next</button>
        </div>
      )}

      {/* Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Performance &amp; SLA Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Courier Partner", "Total Shipments", "Delivered", "Failed", "Success Rate", "Avg Days", "Cost/Shipment", "Rating"].map((col) => (
                  <th key={col} className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wide">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(perfData ?? []).map((partner) => (
                <tr key={partner.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-3">
                    <button
                      onClick={() => navigate(`/partner/courier-partners/${partner.id}/edit`)}
                      className="font-medium text-primary-700 hover:underline"
                    >
                      {partner.name}
                    </button>
                    <p className="text-xs text-slate-400">{partner.code}</p>
                  </td>
                  <td className="py-3 px-3">{partner.totalShipments ?? 0}</td>
                  <td className="py-3 px-3 text-emerald-600 font-medium">{partner.delivered ?? 0}</td>
                  <td className="py-3 px-3 text-red-500">{partner.failed ?? 0}</td>
                  <td className="py-3 px-3">
                    <span className="text-emerald-600 font-medium">{partner.successRate?.toFixed(1) ?? "0.0"}%</span>
                  </td>
                  <td className="py-3 px-3">{partner.avgDeliveryDays} days</td>
                  <td className="py-3 px-3">₹{partner.standardRate.toFixed(2)}</td>
                  <td className="py-3 px-3"><StarRating rating={partner.rating} /></td>
                </tr>
              ))}
              {(!perfData || perfData.length === 0) && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-sm">No data yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
