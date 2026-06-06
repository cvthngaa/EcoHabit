import React, { useState } from 'react';
import { ShieldAlert, Check, X, Search } from 'lucide-react';
import { DataTable, type ColumnDef } from '../../../../shared/components/DataTable';
import { AdminPageHeader, AdminStatCard, StatusPill } from '../../shared/admin-ui';
import { SearchFilterBar } from '../../../../shared/components/SearchFilterBar';
import { useFraudFlags, useFraudStats, useUpdateFraudFlagStatus } from '../services/queries';
import type { FraudFlag, FraudSeverity, FraudStatus } from '../services/types';

const severityClass = (s: FraudSeverity) => {
  if (s === 'HIGH') return 'bg-rose-100 text-rose-700 border border-rose-200';
  if (s === 'MEDIUM') return 'bg-amber-100 text-amber-700 border border-amber-200';
  return 'bg-slate-100 text-slate-500';
};

const severityLabel: Record<FraudSeverity, string> = {
  HIGH: 'Cao',
  MEDIUM: 'Trung bình',
  LOW: 'Thấp',
};

const STATUS_FILTER_OPTIONS = [
  { label: 'Tất cả trạng thái', value: '' },
  { label: 'Đang mở (OPEN)', value: 'OPEN' },
  { label: 'Đang rà soát (REVIEWING)', value: 'REVIEWING' },
  { label: 'Đã giải quyết (RESOLVED)', value: 'RESOLVED' },
  { label: 'Từ chối (REJECTED)', value: 'REJECTED' },
];

const SEVERITY_FILTER_OPTIONS = [
  { label: 'Tất cả mức độ', value: '' },
  { label: 'Cao (HIGH)', value: 'HIGH' },
  { label: 'Trung bình (MEDIUM)', value: 'MEDIUM' },
  { label: 'Thấp (LOW)', value: 'LOW' },
];

export const AdminFraudPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useFraudFlags({
    page,
    limit: 20,
    status: statusFilter as FraudStatus | '',
    severity: severityFilter as FraudSeverity | '',
  });
  const { data: stats } = useFraudStats();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateFraudFlagStatus();

  const flags = data?.data ?? [];

  // Client-side text search
  const filtered = searchValue
    ? flags.filter((f) =>
      f.flagCode.toLowerCase().includes(searchValue.toLowerCase()) ||
      f.description.toLowerCase().includes(searchValue.toLowerCase()) ||
      f.user?.fullName?.toLowerCase().includes(searchValue.toLowerCase()) ||
      f.user?.email?.toLowerCase().includes(searchValue.toLowerCase())
    )
    : flags;

  const columns: ColumnDef<FraudFlag>[] = [
    {
      header: 'Mã / Loại',
      render: (f) => (
        <div>
          <p className="font-mono text-xs font-bold text-slate-700">{f.flagCode}</p>
          <p className="text-[11px] text-slate-400">{f.sourceType}</p>
        </div>
      ),
    },
    {
      header: 'Người dùng',
      render: (f) => (
        <div>
          <p className="font-semibold text-sm text-slate-800">{f.user?.fullName ?? <span className="italic text-slate-400">Ẩn danh</span>}</p>
          {f.user?.email && <p className="text-xs text-slate-400">{f.user.email}</p>}
        </div>
      ),
    },
    {
      header: 'Lý do',
      render: (f) => (
        <span className="text-sm text-slate-600 line-clamp-2 max-w-xs block">{f.description}</span>
      ),
    },
    {
      header: 'Mức độ',
      render: (f) => (
        <span className={`px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase rounded-full ${severityClass(f.severity)}`}>
          {severityLabel[f.severity]}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      render: (f) => <StatusPill status={f.status} />,
    },
    {
      header: 'Thao tác',
      render: (f) => {
        if (f.status === 'RESOLVED' || f.status === 'REJECTED') {
          return <span className="text-[11px] text-slate-400 italic">Đã đóng</span>;
        }
        return (
          <div className="flex gap-1.5">
            <button
              onClick={() => updateStatus({ id: f.id, dto: { status: 'RESOLVED' } })}
              disabled={isUpdating}
              title="Đánh dấu đã giải quyết"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <Check className="w-3 h-3" />Giải quyết
            </button>
            {f.status === 'OPEN' && (
              <button
                onClick={() => updateStatus({ id: f.id, dto: { status: 'REVIEWING' } })}
                disabled={isUpdating}
                title="Chuyển sang đang rà soát"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <Search className="w-3 h-3" />Rà soát
              </button>
            )}
            <button
              onClick={() => updateStatus({ id: f.id, dto: { status: 'REJECTED' } })}
              disabled={isUpdating}
              title="Từ chối (bỏ qua)"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-3 h-3" />Bỏ qua
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Cảnh báo gian lận"
        description="Phát hiện và xử lý các tín hiệu bất thường: GPS sai lệch, tần suất check-in cao, điểm vượt ngưỡng và hành vi lạm dụng."
        action={
          <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors">
            <ShieldAlert className="h-4 w-4" />Xuất báo cáo
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <AdminStatCard label="Đang mở" value={(stats?.open ?? 0).toString()} change="cần xử lý" tone="rose" />
        <AdminStatCard label="Mức độ cao" value={(stats?.highSeverity ?? 0).toString()} change="HIGH" tone="rose" />
        <AdminStatCard label="Đang rà soát" value={(stats?.reviewing ?? 0).toString()} change="REVIEWING" tone="amber" />
        <AdminStatCard label="Đã đóng" value={((stats?.resolved ?? 0) + (stats?.rejected ?? 0)).toString()} change="resolved + rejected" tone="emerald" />
      </div>

      <SearchFilterBar
        searchPlaceholder="Tìm mã cảnh báo, người dùng, lý do..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={[
          {
            key: 'status',
            value: statusFilter,
            onChange: (v) => { setStatusFilter(v); setPage(1); },
            options: STATUS_FILTER_OPTIONS,
          },
          {
            key: 'severity',
            value: severityFilter,
            onChange: (v) => { setSeverityFilter(v); setPage(1); },
            options: SEVERITY_FILTER_OPTIONS,
          },
        ]}
      />

      <DataTable
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        emptyTitle="Không có cảnh báo nào"
        emptyDescription="Không có fraud flag nào khớp bộ lọc hiện tại."
        pagination={
          data && data.meta.totalPages > 1
            ? {
              currentPage: data.meta.page,
              totalPages: data.meta.totalPages,
              onPageChange: setPage,
            }
            : undefined
        }
      />
    </div>
  );
};
