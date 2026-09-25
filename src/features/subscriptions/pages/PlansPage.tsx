import { useEffect, useState } from 'react';
import { BadgeCheck, BookOpen, CreditCard, Users } from 'lucide-react';
import { plansApi, type TenantPlan } from '../api/plans.api';

const limit = (value: number | null) =>
  value === null ? 'Unlimited' : value.toLocaleString();

const formatStorageLimit = (value: number | null) => {
  if (value === null) return 'Unlimited';
  const megabyte = 1024 * 1024;
  const gigabyte = 1024 * megabyte;
  if (value >= gigabyte && value % gigabyte === 0) return `${value / gigabyte} GB`;
  if (value >= megabyte && value % megabyte === 0) return `${value / megabyte} MB`;
  return `${value.toLocaleString()} bytes`;
};

const price = (plan: TenantPlan) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: plan.currency,
    maximumFractionDigits: 2,
  }).format(plan.price);

export default function PlansPage() {
  const [plans, setPlans] = useState<TenantPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    plansApi
      .list()
      .then((items) => {
        if (active) setPlans(items);
      })
      .catch(() => {
        if (active) setError('Plans could not be loaded. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 p-6 lg:p-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-[#0C5A69]">
          Workspace subscription
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Available plans
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Compare the plans configured for your Acadly workspace.
        </p>
      </header>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          Loading available plans…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : !plans.length ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No active plans are available right now.
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              {plan.isPopular && <span className="mb-4 inline-flex w-fit rounded-full bg-[#0C5A69] px-3 py-1 text-xs font-bold text-white">Popular plan</span>}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {plan.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {plan.description || 'Workspace plan'}
                  </p>
                </div>
                <CreditCard className="shrink-0 text-[#0C5A69]" size={24} />
              </div>
              <div className="mt-6">
                <span className="text-3xl font-bold text-slate-900">
                  {price(plan)}
                </span>
                <span className="ml-1 text-sm text-slate-500">
                  /{plan.interval === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-3 border-y border-slate-100 py-5 text-sm">
                <div><dt className="text-slate-500">Users</dt><dd className="mt-1 font-semibold">{limit(plan.userLimit)}</dd></div>
                <div><dt className="text-slate-500">Students</dt><dd className="mt-1 font-semibold">{limit(plan.studentLimit)}</dd></div>
                <div><dt className="text-slate-500">Content storage</dt><dd className="mt-1 font-semibold">{formatStorageLimit(plan.contentLimit)}</dd></div>
                <div><dt className="text-slate-500">Courses</dt><dd className="mt-1 font-semibold">{limit(plan.courseLimit)}</dd></div>
              </dl>
              <div className="mt-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-800"><BadgeCheck size={16} className="text-[#0C5A69]" /> Included modules</p>
                {plan.allowedModules.length ? <ul className="mt-3 space-y-2 text-sm text-slate-600">{plan.allowedModules.map((module) => <li key={module} className="flex items-center gap-2"><BookOpen size={14} className="text-slate-400" />{module.replace(/-/g, ' ')}</li>)}</ul> : <p className="mt-3 text-sm text-slate-500">No modules configured.</p>}
              </div>
              <div className="mt-auto pt-6 text-xs text-slate-400"><Users size={13} className="mr-1 inline" /> Contact your workspace owner to change plans.</div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
