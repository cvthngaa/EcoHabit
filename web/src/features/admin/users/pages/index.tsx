import React, { useState } from 'react';
import { UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { DataTable, type ColumnDef } from '../../../../shared/components/DataTable';
import { AdminPageHeader, AdminStatCard, StatusPill } from '../../shared/admin-ui';
import { useAdminUsers, useAdminUserStats } from '../services/queries';
import { AdminUserDetailDrawer } from '../components/AdminUserDetailDrawer';
import type { User } from '../services/types';

export const AdminUsersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Queries
  const { data: stats } = useAdminUserStats();
  const { data: usersData, isLoading } = useAdminUsers({ page, limit, search: search || undefined });

  const columns: ColumnDef<User>[] = [
    {
      header: 'Người dùng',
      render: (user) => (
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedUserId(user.id)}>
          <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-100">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-emerald-100 text-xs font-bold text-emerald-700">
                {user.fullName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="font-bold text-slate-800 hover:text-emerald-600 transition-colors">{user.fullName}</p>
            <p className="text-[11px] text-slate-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Vai trò',
      render: (user) => (
        <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
          {user.role}
        </span>
      ),
    },
    {
      header: 'Điểm',
      render: (user) => (
        <span className="font-bold text-emerald-600">{user.pointsBalance.toLocaleString('vi-VN')}</span>
      ),
      className: 'text-right',
    },
    {
      header: 'Ngày tham gia',
      render: (user) => (
        <span className="text-sm text-slate-600">
          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    { header: 'Trạng thái', render: (user) => <StatusPill status={user.status} /> },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to page 1 on new search
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Người dùng"
        description="Quản lý danh sách tài khoản, vai trò, số dư điểm và trạng thái hoạt động."
        action={
          <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-colors">
            <UserPlus className="h-4 w-4" /> Tạo tài khoản
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <AdminStatCard
          label="Tổng người dùng"
          value={stats?.totalUsers.toLocaleString('vi-VN') || '-'}
          change={stats ? `+${stats.newUsersThisMonth} tháng này` : undefined}
          tone="blue"
        />
        <AdminStatCard
          label="Đang hoạt động"
          value={stats?.activeUsers.toLocaleString('vi-VN') || '-'}
          change={stats ? `${Math.round((stats.activeUsers / Math.max(1, stats.totalUsers)) * 100)}%` : undefined}
          tone="emerald"
        />
        <AdminStatCard
          label="Bị khóa / Cấm"
          value={stats?.suspendedUsers.toLocaleString('vi-VN') || '-'}
          tone="rose"
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <input
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={handleSearch}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
          />
        </div>
      </div>

      <DataTable
        data={usersData?.data || []}
        columns={columns}
        isLoading={isLoading}
        containerClassName="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
      />

      {/* Pagination Controls */}
      {usersData && usersData.meta.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-3 shadow-sm mt-4">
          <p className="text-xs text-slate-500">
            Hiển thị <span className="font-bold text-slate-900">{(page - 1) * limit + 1}</span> đến{' '}
            <span className="font-bold text-slate-900">
              {Math.min(page * limit, usersData.meta.total)}
            </span>{' '}
            trong tổng số <span className="font-bold text-slate-900">{usersData.meta.total}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-slate-700">Trang {page} / {usersData.meta.totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(usersData.meta.totalPages, p + 1))}
              disabled={page === usersData.meta.totalPages}
              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {selectedUserId && (
        <AdminUserDetailDrawer
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
};
