import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

const toneMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  teal: 'bg-teal-50 text-teal-700 border-teal-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  rose: 'bg-rose-50 text-rose-700 border-rose-100',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const statusClass = (status: string) => {
  const normalized = status.toUpperCase();
  if (['ACTIVE', 'APPROVED', 'VERIFIED', 'LOW', 'CLOSED', 'SUCCESS', 'REVIEWED'].includes(normalized)) {
    return 'bg-emerald-100 text-emerald-700';
  }
  if (['PENDING', 'REVIEWING', 'NEEDS_REVIEW', 'MEDIUM', 'LOW_STOCK', 'DRAFT'].includes(normalized)) {
    return 'bg-amber-100 text-amber-700';
  }
  if (['SUSPENDED', 'REJECTED', 'HIGH', 'OUT_OF_STOCK', 'OPEN', 'PAUSED', 'INACTIVE', 'FAILED'].includes(normalized)) {
    return 'bg-rose-100 text-rose-700';
  }
  return 'bg-slate-100 text-slate-700';
};

export const AdminPageHeader = ({
  eyebrow = 'Admin',
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{eyebrow}</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm text-slate-600">{description}</p>
    </div>
    {action}
  </div>
);

export const AdminStatCard = ({
  label,
  value,
  change,
  tone = 'slate',
}: {
  label: string;
  value: string | number;
  change?: string;
  tone?: string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-extrabold text-slate-900">{value}</p>
      </div>
      {change && (
        <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${toneMap[tone] ?? toneMap.slate}`}>
          {change}
        </span>
      )}
    </div>
  </div>
);

export const AdminToolbar = ({
  placeholder = 'Tìm kiếm...',
  value,
  onChange,
  children,
  showFilterButton = false
}: {
  placeholder?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  children?: React.ReactNode;
  showFilterButton?: boolean;
}) => (
  <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
    <div className="relative max-w-md flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
      />
    </div>
    {(children || showFilterButton) && (
      <div className="flex items-center gap-2">
        {children}
        {showFilterButton && (
          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <SlidersHorizontal className="h-4 w-4" />
            Bộ lọc
          </button>
        )}
      </div>
    )}
  </div>
);

export const StatusPill = ({ status, label }: { status: string; label?: string }) => (
  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(status)}`}>
    {label ?? status}
  </span>
);

export const AdminSection = ({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      {right}
    </div>
    {children}
  </section>
);

export const ProgressBar = ({ value, color = 'bg-slate-900' }: { value: number; color?: string }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
    <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} />
  </div>
);
