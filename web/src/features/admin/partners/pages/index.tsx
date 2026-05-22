import React, { useState } from 'react';
import { Store, ChevronLeft, ChevronRight } from 'lucide-react';
import { DataTable, type ColumnDef } from '../../../../shared/components/DataTable';
import { AdminPageHeader, AdminStatCard, StatusPill } from '../../shared/admin-ui';
import { useAdminPartners, useAdminPartnerStats } from '../services/queries';
import { AdminPartnerDetailDrawer } from '../components/AdminPartnerDetailDrawer';
import type { Partner } from '../services/types';

const APPROVAL_PILL: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
};

const APPROVAL_LABEL: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

export const AdminPartnersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);

  const { data: stats } = useAdminPartnerStats();
  const { data: partnersData, isLoading } = useAdminPartners({ page, limit, search: search || undefined });

  const columns: ColumnDef<Partner>[] = [
    {
      header: 'Đối tác',
      render: (p) => (
        <div className="cursor-pointer" onClick={() => setSelectedPartnerId(p.id)}>
          <p className="font-bold text-slate-800 hover:text-emerald-600 transition-colors line-clamp-1">
            {p.organizationName}
          </p>
          <p className="text-xs text-slate-500">{p.contactName || p.user?.email || '—'}</p>
        </div>
      ),
    },
    {
      header: 'Loại hình',
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {(p.roleTypes ?? []).length === 0
            ? <span className="text-slate-400 text-xs">Chưa phân</span>
            : (p.roleTypes ?? []).map((r) => (
              <span key={r} className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                {r === 'COLLECTOR' ? 'Thu gom' : 'Quà tặng'}
              </span>
            ))}
        </div>
      ),
    },
    {
      header: 'Tài khoản',
      render: (p) => p.user ? <StatusPill status={p.user.status} /> : <span className="text-slate-400">—</span>,
    },
    {
      header: 'Ngày đăng ký',
      render: (p) => (
        <span className="text-sm text-slate-600">
          {new Date(p.createdAt).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      render: (p) => (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${APPROVAL_PILL[p.approvalStatus] ?? 'bg-slate-100 text-slate-600'}`}>
          {APPROVAL_LABEL[p.approvalStatus] ?? p.approvalStatus}
        </span>
      ),
    },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Đối tác"
        description="Duyệt hồ sơ, theo dõi năng lực vận hành và phân quyền cho đối tác thu gom hoặc cung cấp quà."
        action={
          <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-colors">
            <Store className="h-4 w-4" /> Duyệt hồ sơ
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <AdminStatCard
          label="Tổng đối tác"
          value={stats?.totalPartners ?? '-'}
          change={stats ? `+${stats.newPartnersThisMonth} tháng này` : undefined}
          tone="blue"
        />
        <AdminStatCard
          label="Đã duyệt"
          value={stats?.approvedPartners ?? '-'}
          tone="emerald"
        />
        <AdminStatCard
          label="Chờ duyệt"
          value={stats?.pendingPartners ?? '-'}
          tone="amber"
        />
        <AdminStatCard
          label="Từ chối"
          value={stats?.rejectedPartners ?? '-'}
          tone="rose"
        />
      </div>

      <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <input
            placeholder="Tìm tên tổ chức, email..."
            value={search}
            onChange={handleSearch}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
          />
        </div>
      </div>

      <DataTable
        data={partnersData?.data ?? []}
        columns={columns}
        isLoading={isLoading}
        containerClassName="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
      />

      {partnersData && partnersData.meta.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-3 shadow-sm">
          <p className="text-xs text-slate-500">
            Hiển thị <span className="font-bold text-slate-900">{(page - 1) * limit + 1}</span>–
            <span className="font-bold text-slate-900">{Math.min(page * limit, partnersData.meta.total)}</span>
            {' '}/ <span className="font-bold text-slate-900">{partnersData.meta.total}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-slate-700">Trang {page}/{partnersData.meta.totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(partnersData.meta.totalPages, p + 1))}
              disabled={page === partnersData.meta.totalPages}
              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {selectedPartnerId && (
        <AdminPartnerDetailDrawer
          partnerId={selectedPartnerId}
          onClose={() => setSelectedPartnerId(null)}
        />
      )}
    </div>
  );
};
