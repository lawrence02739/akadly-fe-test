import { useState, useEffect } from 'react';
import { Plus, Edit2, ShieldCheck, ShieldAlert, Trash2 } from 'lucide-react';
import { adminApi } from '../api/admin.api';
import toast from 'react-hot-toast';

export default function AdminAddons() {
  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddon, setEditingAddon] = useState<any>(null);

  useEffect(() => {
    fetchAddons();
  }, []);

  const fetchAddons = async () => {
    try {
      const data = await adminApi.fetchAddons();
      setAddons(data.data || data);
    } catch (e) {
      toast.error('Failed to load addons');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      if (editingAddon) {
        // Update allows only specific fields
        const payload = {
          name: formData.get('name'),
          unitLabel: formData.get('unitLabel'),
          unitPrice: Number(formData.get('unitPrice')),
          minQty: Number(formData.get('minQty')),
          maxQty: Number(formData.get('maxQty')),
          status: formData.get('status'),
        };
        await adminApi.updateAddon(editingAddon._id, payload);
        toast.success('Addon updated successfully');
      } else {
        // Create requires all fields
        const payload = {
          name: formData.get('name'),
          type: formData.get('type'),
          unitLabel: formData.get('unitLabel'),
          unitPrice: Number(formData.get('unitPrice')),
          currency: formData.get('currency'),
          interval: formData.get('interval'),
          minQty: Number(formData.get('minQty')),
          maxQty: Number(formData.get('maxQty')),
        };
        await adminApi.createAddon(payload);
        toast.success('Addon created successfully');
      }
      setShowModal(false);
      fetchAddons();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save addon');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this add-on?')) return;
    try {
      await adminApi.deleteAddon(id);
      toast.success('Addon deleted successfully');
      fetchAddons();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete addon');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add-ons</h1>
          <p className="text-slate-500 mt-1">Manage extra capacity packages available to tenants.</p>
        </div>
        <button
          onClick={() => { setEditingAddon(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-[#0C5A69] hover:bg-[#084855] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Add-on
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Qty Limits</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {addons.map(addon => (
              <tr key={addon._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{addon.name}</td>
                <td className="px-6 py-4 capitalize">{addon.type}</td>
                <td className="px-6 py-4">₹{addon.unitPrice} / {addon.unitLabel}</td>
                <td className="px-6 py-4">{addon.minQty} - {addon.maxQty}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    addon.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {addon.status === 'active' ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    <span className="capitalize">{addon.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => { setEditingAddon(addon); setShowModal(true); }} className="text-slate-400 hover:text-blue-600 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(addon._id)} className="text-slate-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {addons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  No add-ons created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">
                {editingAddon ? 'Edit Add-on' : 'Create Add-on'}
              </h2>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Name</label>
                  <input name="name" defaultValue={editingAddon?.name} required className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. Extra 5 Users" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Type</label>
                  <select name="type" disabled={!!editingAddon} defaultValue={editingAddon?.type || 'user'} className="w-full px-3 py-2 border rounded-lg disabled:bg-slate-50 disabled:text-slate-500">
                    <option value="user">Users</option>
                    <option value="student">Students</option>
                    <option value="course">Courses</option>
                    <option value="storage">Storage</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Unit Price (₹)</label>
                  <input name="unitPrice" type="number" defaultValue={editingAddon?.unitPrice} required className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. 500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Currency</label>
                  <select name="currency" disabled={!!editingAddon} defaultValue={editingAddon?.currency || 'INR'} className="w-full px-3 py-2 border rounded-lg disabled:bg-slate-50 disabled:text-slate-500">
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Unit Label</label>
                  <input name="unitLabel" defaultValue={editingAddon?.unitLabel} required className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. per 5 users" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Interval</label>
                  <select name="interval" disabled={!!editingAddon} defaultValue={editingAddon?.interval || 'monthly'} className="w-full px-3 py-2 border rounded-lg disabled:bg-slate-50 disabled:text-slate-500">
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="one_time">One Time</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Min Quantity</label>
                  <input name="minQty" type="number" defaultValue={editingAddon?.minQty || 1} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Max Quantity</label>
                  <input name="maxQty" type="number" defaultValue={editingAddon?.maxQty || 10} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>

              {editingAddon && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <select name="status" defaultValue={editingAddon?.status || 'active'} className="w-full px-3 py-2 border rounded-lg">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50 font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#0C5A69] text-white rounded-lg hover:bg-[#084855] font-medium">Save Add-on</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
