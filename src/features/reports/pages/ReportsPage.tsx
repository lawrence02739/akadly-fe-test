import { BarChart3, BookOpen, ClipboardList, CreditCard, Users } from "lucide-react";
import { Link } from "react-router-dom";

const modules = [
  { title: "Courses", description: "Review course delivery and learner activity.", to: "/partner/courses", icon: BookOpen },
  { title: "Forms", description: "Review form submissions and response trends.", to: "/partner/forms", icon: ClipboardList },
  { title: "Team", description: "Review workspace team activity and access.", to: "/partner/team", icon: Users },
  { title: "Billing", description: "Review your plan and billing information.", to: "/partner/payments", icon: CreditCard },
];

export default function ReportsPage() {
  return <section className="mx-auto max-w-7xl p-5 sm:p-8"><header><p className="text-sm font-semibold text-[#0C5A69]">Workspace reports</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Module overview</h1><p className="mt-1 text-sm text-slate-500">Open a workspace module to review its available reports and activity.</p></header><div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{modules.map(({ title, description, to, icon: Icon }) => <Link key={title} to={to} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"><span className="grid size-11 place-items-center rounded-xl bg-teal-50 text-[#0C5A69]"><Icon size={21} /></span><h2 className="mt-5 font-bold text-slate-900">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p></Link>)}</div><div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><BarChart3 className="mx-auto text-slate-400" size={30} /><h2 className="mt-3 font-bold text-slate-800">Reports are available inside each module</h2><p className="mt-1 text-sm text-slate-500">Support-ticket operations are managed by the platform admin in the Ticket Dashboard.</p></div></section>;
}
