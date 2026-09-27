import React from 'react';
import { X, Globe, Lock } from 'lucide-react';
import { useFormBuilderStore } from '../store/useFormBuilderStore';

export const FormSettingsPanel: React.FC = () => {
  const { settings, updateSettings, toggleSettings, isSettingsOpen, passwordDraft, setPasswordDraft } = useFormBuilderStore();
  const expiryDate = settings.expiryDate?.slice(0, 10) || '';
  const expiryHour24 = Number(settings.expiryDate?.slice(11, 13) || 23);
  const expiryHour12 = expiryHour24 % 12 || 12;
  const expiryMinute = settings.expiryDate?.slice(14, 16) || '59';
  const expiryPeriod = expiryHour24 >= 12 ? 'PM' : 'AM';
  const setExpiry = (date: string, hour12: number, minute: string, period: string) => {
    if (!date) {
      updateSettings({ expiryDate: undefined });
      return;
    }
    const hour24 = hour12 % 12 + (period === 'PM' ? 12 : 0);
    updateSettings({ expiryDate: `${date}T${String(hour24).padStart(2, '0')}:${minute}` });
  };

  if (!isSettingsOpen) return null;

  return (
    <div className="w-[350px] bg-white border-l border-slate-200 h-full flex flex-col shadow-[-4px_0_15px_rgba(0,0,0,0.03)] z-20">
      <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
        <h2 className="text-lg font-semibold text-slate-800">Settings</h2>
        <button 
          onClick={toggleSettings}
          className="p-1 text-slate-400 hover:bg-slate-100 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-6">
        
        {/* Responses Section */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4" /> Responses
          </h3>
          
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">Limit to 1 response</span>
              <span className="text-xs text-slate-500">Requires login</span>
            </div>
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={settings.limitOneResponse}
                onChange={(e) => updateSettings({ limitOneResponse: e.target.checked })}
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
            </div>
          </label>
        </section>

        <hr className="border-slate-200" />

        {/* Access Control Section */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4" /> Access Control
          </h3>

          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">Password protection</span>
              <span className="text-xs text-slate-500">Require a password to view and submit</span>
            </div>
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={settings.requirePassword || false}
                onChange={(e) => updateSettings({ requirePassword: e.target.checked })}
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
            </div>
          </label>

          {settings.requirePassword && (
            <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="text-xs font-medium text-slate-700">Form Password</label>
              <input 
                type="password" 
                minLength={6}
                maxLength={128}
                placeholder="Enter password..."
                value={passwordDraft}
                onChange={(e) => setPasswordDraft(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
              <span className="text-xs text-slate-500">Use 6–128 characters.</span>
            </div>
          )}
        </section>

        {/* Advanced Section */}
        <section className="flex flex-col gap-4 mt-2 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
             Advanced Settings
          </h3>

          <div className="flex flex-col gap-2 mt-2">
            <label htmlFor="form-expiry-date" className="text-sm font-medium text-slate-700">Form Expiry Date & Time</label>
            <input 
              id="form-expiry-date"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiry(e.target.value, expiryHour12, expiryMinute, expiryPeriod)}
              className="w-full p-2 border border-slate-300 rounded text-sm focus:border-purple-600 outline-none text-slate-600"
            />
            <div className="grid grid-cols-3 gap-2">
              <label className="text-xs text-slate-600">Hour
                <select aria-label="Expiry hour" disabled={!expiryDate} value={expiryHour12} onChange={(e) => setExpiry(expiryDate, Number(e.target.value), expiryMinute, expiryPeriod)} className="mt-1 w-full p-2 border border-slate-300 rounded text-sm disabled:opacity-50">
                  {Array.from({ length: 12 }, (_, index) => index + 1).map((hour) => <option key={hour} value={hour}>{hour}</option>)}
                </select>
              </label>
              <label className="text-xs text-slate-600">Minute
                <select aria-label="Expiry minute" disabled={!expiryDate} value={expiryMinute} onChange={(e) => setExpiry(expiryDate, expiryHour12, e.target.value, expiryPeriod)} className="mt-1 w-full p-2 border border-slate-300 rounded text-sm disabled:opacity-50">
                  {Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0')).map((minute) => <option key={minute} value={minute}>{minute}</option>)}
                </select>
              </label>
              <label className="text-xs text-slate-600">AM / PM
                <select aria-label="Expiry AM or PM" disabled={!expiryDate} value={expiryPeriod} onChange={(e) => setExpiry(expiryDate, expiryHour12, expiryMinute, e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded text-sm disabled:opacity-50">
                  <option value="AM">AM</option><option value="PM">PM</option>
                </select>
              </label>
            </div>
            <span className="text-xs text-slate-500">Time uses your device's local timezone.</span>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <span className="text-sm font-medium text-slate-700">Maximum Responses</span>
            <input 
              type="number"
              min="1"
              placeholder="Leave empty for unlimited"
              value={settings.maxResponses || ''}
              onChange={(e) => updateSettings({ maxResponses: e.target.value ? parseInt(e.target.value, 10) : undefined })}
              className="w-full p-2 border border-slate-300 rounded text-sm focus:border-purple-600 outline-none text-slate-600"
            />
          </div>

        </section>
      </div>

    </div>
  );
};
