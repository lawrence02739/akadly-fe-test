import { Loader2, Plus, Edit, Copy, Trash2, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function PricingPlansTab({ courseData, onChange, onSave, isSaving }: { courseData: any, onChange: (field: string, value: any) => void, onSave: () => void, isSaving: boolean }) {
  const [plans, setPlans] = useState<any[]>(courseData.plans || []);
  const [newPlan, setNewPlan] = useState({ name: '', type: 'One-time Plan', price: 0, checkoutUrl: '' });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddPlan = () => {
    if (!newPlan.name) return;
    const updatedPlans = [...plans, newPlan];
    setPlans(updatedPlans);
    onChange('plans', updatedPlans);
    setNewPlan({ name: '', type: 'One-time Plan', price: 0, checkoutUrl: '' });
    setIsAdding(false);
  };

  const handleDeletePlan = (index: number) => {
    const updatedPlans = plans.filter((_, i) => i !== index);
    setPlans(updatedPlans);
    onChange('plans', updatedPlans);
  };

  return (
    <div className="space-y-6 relative h-full min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Pricing Details */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Pricing Details</h3>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Base Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500">$</span>
                  <input
                    type="number"
                    value={courseData.price || ''}
                    onChange={(e) => onChange('price', Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Discounted Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500">$</span>
                  <input
                    type="number"
                    value={courseData.discountedPrice || ''}
                    onChange={(e) => onChange('discountedPrice', Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Discount (%)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={
                      courseData.price && courseData.discountedPrice && courseData.price > courseData.discountedPrice
                        ? Math.round(((courseData.price - courseData.discountedPrice) / courseData.price) * 100) + '%'
                        : '0%'
                    }
                    disabled
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Refund Policy</label>
                <select
                  value={courseData.refundPolicy || ''}
                  onChange={(e) => onChange('refundPolicy', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Policy</option>
                  <option value="30 Days money-back">30 Days money-back</option>
                  <option value="14 Days money-back">14 Days money-back</option>
                  <option value="No refund">No refund</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Access Duration</label>
                <select
                  value={courseData.accessDuration || ''}
                  onChange={(e) => onChange('accessDuration', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Duration</option>
                  <option value="Lifetime access">Lifetime access</option>
                  <option value="1 Year access">1 Year access</option>
                  <option value="6 Months access">6 Months access</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tax Rate (%)</label>
                <select
                  value={courseData.taxRate || ''}
                  onChange={(e) => onChange('taxRate', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Tax</option>
                  <option value="No tax">No tax</option>
                  <option value="18% VAT">18% VAT</option>
                  <option value="5% GST">5% GST</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-slate-100 mt-4 pt-4">
              <span className="text-sm font-medium text-slate-700">Show pricing including taxes</span>
              <button
                type="button"
                onClick={() => onChange('showPriceWithTax', !courseData.showPriceWithTax)}
                className={`w-11 h-6 rounded-full transition-colors relative ${courseData.showPriceWithTax ? 'bg-primary-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${courseData.showPriceWithTax ? 'left-6' : 'left-1'}`}></div>
              </button>
            </div>
          </div>

          {/* Active Pricing Plans */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Active Pricing Plans</h3>
              <button onClick={() => setIsAdding(true)} className="px-3 py-1.5 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Plan
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Plan Name</th>
                    <th className="px-4 py-3">Plan Type</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Checkout URL</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {plans.map((plan, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{plan.name}</td>
                      <td className="px-4 py-3 text-slate-600">{plan.type}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">${plan.price}</td>
                      <td className="px-4 py-3 text-primary-600 hover:underline cursor-pointer">{plan.checkoutUrl}</td>
                      <td className="px-4 py-3 text-right flex items-center justify-end gap-3 text-slate-400">
                        <button className="hover:text-primary-600"><Edit className="w-4 h-4" /></button>
                        <button className="hover:text-primary-600"><Copy className="w-4 h-4" /></button>
                        <button onClick={() => handleDeletePlan(i)} className="hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {plans.length === 0 && !isAdding && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No active plans. Click Add Plan to create one.</td>
                    </tr>
                  )}
                  {isAdding && (
                    <tr className="bg-blue-50/50">
                      <td className="px-2 py-2">
                        <input type="text" placeholder="Plan Name" value={newPlan.name} onChange={e => setNewPlan({ ...newPlan, name: e.target.value })} className="w-full px-2 py-1.5 border rounded" />
                      </td>
                      <td className="px-2 py-2">
                        <select value={newPlan.type} onChange={e => setNewPlan({ ...newPlan, type: e.target.value })} className="w-full px-2 py-1.5 border rounded">
                          <option>Free Access</option>
                          <option>One-time Plan</option>
                          <option>Subscription</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" placeholder="0" value={newPlan.price} onChange={e => setNewPlan({ ...newPlan, price: Number(e.target.value) })} className="w-20 px-2 py-1.5 border rounded" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" placeholder="URL" value={newPlan.checkoutUrl} onChange={e => setNewPlan({ ...newPlan, checkoutUrl: e.target.value })} className="w-full px-2 py-1.5 border rounded" />
                      </td>
                      <td className="px-2 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setIsAdding(false)} className="px-2 py-1 text-sm text-slate-500">Cancel</button>
                          <button onClick={handleAddPlan} className="px-3 py-1 bg-primary-600 text-white text-sm rounded">Save</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Course Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Course Summary for Receipt</h3>
              <textarea
                rows={3}
                value={courseData.courseSummaryForReceipt || ''}
                onChange={(e) => onChange('courseSummaryForReceipt', e.target.value)}
                placeholder="Thank you for registering. You have unlocked complete lifetime access..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Category & Promos */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Category & Promos</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Primary Category</label>
                <select
                  value={courseData.category || ''}
                  onChange={(e) => onChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Category</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-slate-700">Featured Course Priority</span>
                <button
                  type="button"
                  onClick={() => onChange('featuredCoursePriority', !courseData.featuredCoursePriority)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${courseData.featuredCoursePriority ? 'bg-primary-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${courseData.featuredCoursePriority ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#fff9ed] rounded-xl border border-[#ffe4b5] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-amber-700 text-sm uppercase">AI Price Optimization</h3>
            </div>
            <p className="text-sm text-slate-700 mb-4 leading-relaxed">
              Based on current market indexes, setting a base price of <strong>$129</strong> with a limited-time launch offer of <strong>$89</strong> will improve conversion velocity by up to <strong>24%</strong> for frontend blueprints.
            </p>
            <button 
              onClick={() => {
                onChange('price', 129);
                onChange('discountedPrice', 89);
              }}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Apply optimized rates
            </button>
          </div>
        </div>
      </div>

      <div className="bg-primary-900 border-t border-primary-800 px-6 py-4 flex items-center justify-end gap-4 z-50">
        <button className="px-6 py-2 border border-slate-400 text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors">
          Discard
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-6 py-2 bg-white text-primary-900 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
