import { Loader2 } from 'lucide-react';

export default function PricingPlansTab({ courseData, onChange, onSave, isSaving }: { courseData: any, onChange: (field: string, value: any) => void, onSave: () => void, isSaving: boolean }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Pricing Details</h3>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500">$</span>
                <input
                  type="number"
                  value={courseData.price || ''}
                  onChange={(e) => onChange('price', Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
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
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h4 className="font-medium text-slate-800 mb-3">Active Pricing Plans</h4>
            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => onChange('pricingPlan', 'FREE')}
                className={`border p-4 rounded-lg cursor-pointer flex flex-col items-center justify-center gap-2 ${courseData.pricingPlan === 'FREE' ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-300'}`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${courseData.pricingPlan === 'FREE' ? 'border-primary-600' : 'border-slate-300'}`}>
                  {courseData.pricingPlan === 'FREE' && <div className="w-2 h-2 bg-primary-600 rounded-full"></div>}
                </div>
                <span className="font-semibold text-slate-800">Free plan</span>
                <span className="text-xs text-slate-500 text-center">Allow anyone to enroll for free</span>
              </div>

              <div
                onClick={() => onChange('pricingPlan', 'ONE_TIME')}
                className={`border p-4 rounded-lg cursor-pointer flex flex-col items-center justify-center gap-2 ${courseData.pricingPlan === 'ONE_TIME' || !courseData.pricingPlan ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-300'}`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${courseData.pricingPlan === 'ONE_TIME' || !courseData.pricingPlan ? 'border-primary-600' : 'border-slate-300'}`}>
                  {(courseData.pricingPlan === 'ONE_TIME' || !courseData.pricingPlan) && <div className="w-2 h-2 bg-primary-600 rounded-full"></div>}
                </div>
                <span className="font-semibold text-slate-800">One-time plan</span>
                <span className="text-xs text-slate-500 text-center">Standard one-time payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary-900 border-t border-primary-800 px-6 py-4 flex items-center justify-end gap-4 z-10">
        <button className="px-6 py-2 border border-slate-400 text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors">
          Discard
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-6 py-2 bg-white text-primary-900 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
