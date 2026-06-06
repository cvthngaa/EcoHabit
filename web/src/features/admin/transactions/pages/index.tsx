import React, { useMemo, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { DataTable, type ColumnDef } from '../../../../shared/components/DataTable';
import { AdminPageHeader, AdminStatCard } from '../../shared/admin-ui';
import { SearchFilterBar } from '../../../../shared/components/SearchFilterBar';
import { useAdminCollectionTransactions } from '../services/queries';
import type { AdminCollectionTransaction, DropoffStatus } from '../services/types';

const statusTone = (s: DropoffStatus | null | undefined) => {
  if (s === 'VERIFIED') return 'bg-emerald-100 text-emerald-700';
  if (s === 'PENDING') return 'bg-amber-100 text-amber-700';
  if (s === 'REJECTED') return 'bg-rose-100 text-rose-700';
  return 'bg-slate-100 text-slate-600';
};

const STATUS_FILTER_OPTIONS = [
  { label: 'Tất cả trạng thái', value: '' },
  { label: 'Chờ duyệt (PENDING)', value: 'PENDING' },
  { label: 'Đã duyệt (VERIFIED)', value: 'VERIFIED' },
  { label: 'Từ chối (REJECTED)', value: 'REJECTED' },
];

export const AdminTransactionsPage: React.FC = () => {
  const { data: allData = [], isLoading } = useAdminCollectionTransactions();
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Client-side filter vì backend trả mảng flat, không phân trang
  const filtered = useMemo(() => {
    return allData.filter((tx) => {
      const matchStatus = !statusFilter || tx.status === statusFilter;
      const q = searchValue.toLowerCase();
      const matchSearch =
        !q ||
        tx.id.toLowerCase().includes(q) ||
        tx.user?.fullName?.toLowerCase().includes(q) ||
        tx.user?.email?.toLowerCase().includes(q) ||
        tx.location?.name?.toLowerCase().includes(q) ||
        tx.acceptedWasteType?.wasteType?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [allData, statusFilter, searchValue]);

  const stats = useMemo(() => ({
    total: allData.length,
    verified: allData.filter((t) => t.status === 'VERIFIED').length,
    pending: allData.filter((t) => t.status === 'PENDING').length,
    rejected: allData.filter((t) => t.status === 'REJECTED').length,
  }), [allData]);

  const columns: ColumnDef<AdminCollectionTransaction>[] = [
    {
      header: 'Mã GD',
      render: (tx) => (
        <span className="font-mono text-xs font-bold text-slate-700">{tx.id.split('-')[0].toUpperCase()}</span>
      ),
    },
    {
      header: 'Người dùng',
      render: (tx) => (
        <div>
          <p className="font-semibold text-sm text-slate-800">{tx.user?.fullName ?? '—'}</p>
          <p className="text-xs text-slate-400">{tx.user?.email}</p>
        </div>
      ),
    },
    {
      header: 'Điểm thu gom',
      render: (tx) => <span className="text-sm">{tx.location?.name ?? '—'}</span>,
    },
    {
      header: 'Rác',
      render: (tx) => (
        <span className="text-sm">
          {tx.acceptedWasteType?.wasteType ?? '—'}
          {tx.quantityValue != null && (
            <span className="text-slate-400"> · {tx.quantityValue} {tx.quantityUnit}</span>
          )}
        </span>
      ),
    },
    {
      header: 'Điểm',
      render: (tx) => (
        <span className={`font-bold text-sm ${(tx.pointsAwarded ?? 0) > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
          {tx.pointsAwarded != null ? `+${tx.pointsAwarded}` : '—'}
        </span>
      ),
      className: 'text-right',
    },
    {
      header: 'Trạng thái',
      render: (tx) => (
        <span className={`px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase rounded-full ${statusTone(tx.status)}`}>
          {tx.status ?? 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Giao dịch thu gom"
        description="Lịch sử check-in gửi rác của người dùng tại các điểm thu gom. Tối đa 100 giao dịch mới nhất."
        action={
          <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors">
            <ClipboardCheck className="h-4 w-4" />Xuất báo cáo
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <AdminStatCard label="Tổng giao dịch" value={stats.total.toLocaleString('vi-VN')} change="tải về" tone="blue" />
        <AdminStatCard label="Đã duyệt" value={stats.verified.toLocaleString('vi-VN')} change="đã cộng điểm" tone="emerald" />
        <AdminStatCard label="Chờ duyệt" value={stats.pending.toLocaleString('vi-VN')} change="cần xác nhận" tone="amber" />
        <AdminStatCard label="Từ chối" value={stats.rejected.toLocaleString('vi-VN')} change="không hợp lệ" tone="rose" />
      </div>

      <SearchFilterBar
        searchPlaceholder="Tìm mã GD, người dùng, điểm thu gom..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={[
          {
            key: 'status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: STATUS_FILTER_OPTIONS,
          },
        ]}
      />

      <DataTable
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        emptyTitle="Không có giao dịch nào"
        emptyDescription="Chưa có dữ liệu hoặc không khớp bộ lọc."
      />
    </div>
  );
};
