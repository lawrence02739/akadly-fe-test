import React from 'react';
import type { SaveBillingProfileRequest } from '../types/onboarding.types';

interface BillingFormProps {
  values: SaveBillingProfileRequest;
  onChange: (fields: Partial<SaveBillingProfileRequest>) => void;
  errors?: Partial<Record<keyof SaveBillingProfileRequest, string>>;
}

export const BillingForm: React.FC<BillingFormProps> = ({
  values,
  onChange,
  errors = {},
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Legal Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Legal / Business Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={values.legalName}
          onChange={(e) => onChange({ legalName: e.target.value })}
          placeholder="Acme Technologies Pvt Ltd"
          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
        />
        {errors.legalName && (
          <span className="text-[11px] text-rose-500 font-medium">
            {errors.legalName}
          </span>
        )}
      </div>

      {/* Billing Email */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Billing Email Address <span className="text-rose-500">*</span>
        </label>
        <input
          type="email"
          value={values.billingEmail}
          onChange={(e) => onChange({ billingEmail: e.target.value })}
          placeholder="billing@yourdomain.com"
          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
        />
        {errors.billingEmail && (
          <span className="text-[11px] text-rose-500 font-medium">
            {errors.billingEmail}
          </span>
        )}
      </div>

      {/* Address Line 1 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Street Address <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={values.addressLine1}
          onChange={(e) => onChange({ addressLine1: e.target.value })}
          placeholder="Building, street, or suite number"
          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
        />
        {errors.addressLine1 && (
          <span className="text-[11px] text-rose-500 font-medium">
            {errors.addressLine1}
          </span>
        )}
      </div>

      {/* Address Line 2 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Apartment, Suite, Unit (Optional)
        </label>
        <input
          type="text"
          value={values.addressLine2 || ''}
          onChange={(e) => onChange({ addressLine2: e.target.value })}
          placeholder="Floor 4, Block B"
          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
        />
      </div>

      {/* City & State */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            City <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={values.city}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="Mumbai"
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
          />
          {errors.city && (
            <span className="text-[11px] text-rose-500 font-medium">
              {errors.city}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            State / Province <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={values.state}
            onChange={(e) => onChange({ state: e.target.value })}
            placeholder="Maharashtra"
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
          />
          {errors.state && (
            <span className="text-[11px] text-rose-500 font-medium">
              {errors.state}
            </span>
          )}
        </div>
      </div>

      {/* Postal Code & Country */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Postal / PIN Code <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={values.postalCode}
            onChange={(e) => onChange({ postalCode: e.target.value })}
            placeholder="400001"
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
          />
          {errors.postalCode && (
            <span className="text-[11px] text-rose-500 font-medium">
              {errors.postalCode}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Country <span className="text-rose-500">*</span>
          </label>
          <select
            value={values.country}
            onChange={(e) => onChange({ country: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
          >
            <option value="IN">India (IN)</option>
            <option value="US">United States (US)</option>
            <option value="GB">United Kingdom (GB)</option>
            <option value="CA">Canada (CA)</option>
            <option value="AU">Australia (AU)</option>
            <option value="SG">Singapore (SG)</option>
            <option value="AE">United Arab Emirates (AE)</option>
          </select>
        </div>
      </div>

      {/* GSTIN (Only for India) */}
      {values.country === 'IN' && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              GSTIN (Optional)
            </label>
            <span className="text-[11px] text-slate-400">15-digit code</span>
          </div>
          <input
            type="text"
            value={values.gstin || ''}
            onChange={(e) =>
              onChange({ gstin: e.target.value.toUpperCase().trim() })
            }
            maxLength={15}
            placeholder="27AAAAA0000A1Z5"
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all uppercase shadow-2xs"
          />
          {errors.gstin && (
            <span className="text-[11px] text-rose-500 font-medium">
              {errors.gstin}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
