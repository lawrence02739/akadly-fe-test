import { Loader2, Sparkles, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function AccessControlTab({ courseData, onChange, onSave, isSaving }: { courseData: any, onChange: (field: string, value: any) => void, onSave: () => void, isSaving: boolean }) {

  const [rules, setRules] = useState<any[]>(courseData.accessOverrideRules || []);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', condition: '', action: 'Auto-Enroll', active: true });

  const handleAddRule = () => {
    if (!newRule.name) return;
    const updatedRules = [...rules, newRule];
    setRules(updatedRules);
    onChange('accessOverrideRules', updatedRules);
    setNewRule({ name: '', condition: '', action: 'Auto-Enroll', active: true });
    setIsAddingRule(false);
  };

  const handleDeleteRule = (index: number) => {
    const updatedRules = rules.filter((_, i) => i !== index);
    setRules(updatedRules);
    onChange('accessOverrideRules', updatedRules);
  };

  const toggleRuleActive = (index: number) => {
    const updatedRules = [...rules];
    updatedRules[index].active = !updatedRules[index].active;
    setRules(updatedRules);
    onChange('accessOverrideRules', updatedRules);
  };

  return (
    <div className="space-y-6 relative h-full min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Distribution Platforms */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Distribution Platforms</h3>
            <p className="text-sm text-slate-500 mb-6">Select the environments where this course structure can be purchased and accessed.</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                <div>
                  <h4 className="font-semibold text-slate-800">Global Website</h4>
                  <p className="text-sm text-slate-500">Publish directly onto your custom marketplace page</p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange('distributionGlobalWebsite', !courseData.distributionGlobalWebsite)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${courseData.distributionGlobalWebsite ? 'bg-primary-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${courseData.distributionGlobalWebsite ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                <div>
                  <h4 className="font-semibold text-slate-800">Android App</h4>
                  <p className="text-sm text-slate-500">Enable access for Android devices via deep linking</p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange('distributionAndroidApp', !courseData.distributionAndroidApp)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${courseData.distributionAndroidApp ? 'bg-primary-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${courseData.distributionAndroidApp ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                <div>
                  <h4 className="font-semibold text-slate-800">iOS App</h4>
                  <p className="text-sm text-slate-500">App Store guidelines and mobile deep linking rules apply</p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange('distributionIosApp', !courseData.distributionIosApp)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${courseData.distributionIosApp ? 'bg-primary-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${courseData.distributionIosApp ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                <div>
                  <h4 className="font-semibold text-slate-800">Internal Only (Private)</h4>
                  <p className="text-sm text-slate-500">Hides course from search engine indices</p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange('distributionInternalOnly', !courseData.distributionInternalOnly)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${courseData.distributionInternalOnly ? 'bg-primary-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${courseData.distributionInternalOnly ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Enrollment Limits & Schedules */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Enrollment Limits & Schedules</h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Max Enrollment Cap</label>
                <div className="relative">
                  <input
                    type="number"
                    value={courseData.maxEnrollmentCap || ''}
                    onChange={(e) => onChange('maxEnrollmentCap', Number(e.target.value))}
                    className="w-full pl-3 pr-20 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-2 text-slate-500 text-sm">Students</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Enrollment Starts</label>
                <input
                  type="date"
                  value={courseData.enrollmentStartDate || ''}
                  onChange={(e) => onChange('enrollmentStartDate', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Enrollment Ends</label>
                <div className="relative">
                  <input
                    type="date"
                    value={courseData.enrollmentEndDate || ''}
                    onChange={(e) => onChange('enrollmentEndDate', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {!courseData.enrollmentEndDate && (
                    <span className="absolute left-3 top-2.5 text-slate-400 pointer-events-none bg-slate-50 px-1">
                      Continuous access
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <h4 className="font-semibold text-slate-800">Auto-enroll upon subscription payment</h4>
                <p className="text-sm text-slate-500">Instantly triggers onboarding welcome emails</p>
              </div>
              <button
                type="button"
                onClick={() => onChange('autoEnrollOnPayment', !courseData.autoEnrollOnPayment)}
                className={`w-11 h-6 rounded-full transition-colors relative ${courseData.autoEnrollOnPayment ? 'bg-primary-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${courseData.autoEnrollOnPayment ? 'left-6' : 'left-1'}`}></div>
              </button>
            </div>
          </div>

          {/* Custom Access Override Rules */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Custom Access Override Rules</h3>
              <button onClick={() => setIsAddingRule(true)} className="px-3 py-1.5 bg-slate-100 text-primary-700 text-sm font-medium rounded-lg hover:bg-slate-200 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Rule
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Rule Name</th>
                    <th className="px-4 py-3">Condition</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3 text-right">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rules.map((rule, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-4 font-semibold text-slate-800">{rule.name}</td>
                      <td className="px-4 py-4 text-slate-600">{rule.condition}</td>
                      <td className="px-4 py-4 font-bold text-primary-700">{rule.action}</td>
                      <td className="px-4 py-4 text-right flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => toggleRuleActive(i)}
                          className={`w-11 h-6 rounded-full transition-colors relative ${rule.active ? 'bg-primary-600' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${rule.active ? 'left-6' : 'left-1'}`}></div>
                        </button>
                        <button onClick={() => handleDeleteRule(i)} className="text-slate-400 hover:text-red-500 ml-2"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {rules.length === 0 && !isAddingRule && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No custom access rules active. Click Add Rule to create one.</td>
                    </tr>
                  )}
                  {isAddingRule && (
                    <tr className="bg-blue-50/50">
                      <td className="px-2 py-2">
                        <input type="text" placeholder="Beta Cohort Exemption" value={newRule.name} onChange={e => setNewRule({ ...newRule, name: e.target.value })} className="w-full px-2 py-1.5 border rounded" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" placeholder="Tag: 'beta-student'" value={newRule.condition} onChange={e => setNewRule({ ...newRule, condition: e.target.value })} className="w-full px-2 py-1.5 border rounded" />
                      </td>
                      <td className="px-2 py-2">
                        <select value={newRule.action} onChange={e => setNewRule({ ...newRule, action: e.target.value })} className="w-full px-2 py-1.5 border rounded font-semibold text-primary-700">
                          <option>Grant 100% Free</option>
                          <option>Auto-Enroll</option>
                        </select>
                      </td>
                      <td className="px-2 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setIsAddingRule(false)} className="px-2 py-1 text-sm text-slate-500">Cancel</button>
                          <button onClick={handleAddRule} className="px-3 py-1 bg-primary-600 text-white text-sm rounded">Save</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#f0faeb] rounded-xl border border-[#d6f0cb] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-emerald-800 text-sm uppercase">AI Targeting Insights</h3>
            </div>
            <p className="text-sm text-slate-700 mb-4 leading-relaxed">
              We evaluated local tech cohort registration volumes. Frontend masterclass modules enjoy 42% higher conversion on direct mobile deep linking inside Android developer networks.
            </p>
            <button className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-medium transition-colors">
              Optimize Platform Strategy
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Geographic Restrictions</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Restrict or whitelist student purchases based on regional compliance or taxation structures.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">North America (US/CA)</span>
              <span className="px-3 py-1 border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">European Union</span>
              <span className="px-3 py-1 border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">India (VAT Compliance)</span>
            </div>
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
