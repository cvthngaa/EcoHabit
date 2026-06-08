import React, { useState } from 'react';
import { Gift, ChevronLeft, ChevronRight } from 'lucide-react';
import { DataTable, Button, type ColumnDef } from '../../../../shared/components';
import { AdminPageHeader, AdminStatCard, StatusPill } from '../../shared/admin-ui';
import { useAdminRewards, useAdminRewardStats } from '../services/queries';
import { AdminRewardDetailDrawer } from '../components/AdminRewardDetailDrawer';
import { AdminRewardFormModal } from '../components/AdminRewardFormModal';
import type { Reward } from '../services/types';

export const AdminRewardsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: stats } = useAdminRewardStats();
  const { data: rewardsData, isLoading } = useAdminRewards({ page, limit, search: search || undefined });

  const columns: ColumnDef<Reward>[] = [
    { 
      header: 'Quà/Voucher', 
      render: (reward) => (
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedRewardId(reward.id)}>
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
            {reward.thumbnailUrl ? (
              <img src={reward.thumbnailUrl} alt={reward.name} className="w-full h-full object-cover" />
            ) : (
              <Gift className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div>
            <p className="font-bold text-slate-800 hover:text-emerald-600 transition-colors line-clamp-1">{reward.name}</p>
            <p className="text-xs text-slate-500">{reward.partnerProfile?.organizationName || 'Hệ thống'}</p>
          </div>
        </div>
      ) 
    },
    { 
      header: 'Tồn kho', 
      render: (reward) => (
        <span className={reward.stock > 10 ? 'text-slate-900' : reward.stock > 0 ? 'text-amber-600' : 'text-rose-600'}>
          {reward.stock.toLocaleString('vi-VN')}
        </span>
      ), 
      className: 'text-right font-bold' 
    },
    { 
      header: 'Điểm đổi', 
      render: (reward) => (
        <span className="text-emerald-600">{reward.pointsCost.toLocaleString('vi-VN')}</span>
      ), 
      className: 'text-right font-bold' 
    },
    { 
      header: 'Trạng thái', 
      render: (reward) => <StatusPill status={reward.status} /> 
    },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quà tặng & Voucher"
        description="Quản lý kho quà, voucher, trạng thái tồn kho và hiệu quả đổi thưởng trên toàn hệ thống."
        action={
          <Button
            variant="primary"
            leftIcon={<Gift />}
            onClick={() => setIsCreating(true)}
            className="shadow-sm"
          >
            Thêm quà
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <AdminStatCard 
          label="Tổng / Hoạt động" 
          value={`${stats?.totalRewards || 0} / ${stats?.activeRewards || 0}`} 
          tone="emerald" 
        />
        <AdminStatCard 
          label="Đã quy đổi" 
          value={stats?.totalRedemptions.toLocaleString('vi-VN') || '-'} 
          change={stats ? `${stats.pendingRedemptions} đang chờ duyệt` : undefined} 
          tone="blue" 
        />
        <AdminStatCard 
          label="Sắp hết" 
          value={stats?.lowStockRewards || 0} 
          tone="amber" 
        />
        <AdminStatCard 
          label="Hết hàng / Tạm ngưng" 
          value={`${stats?.outOfStockRewards || 0} / ${stats?.inactiveRewards || 0}`} 
          tone="rose" 
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <input
            placeholder="Tìm theo tên phần quà..."
            value={search}
            onChange={handleSearch}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
          />
        </div>
      </div>

      <DataTable 
        data={rewardsData?.data || []} 
        columns={columns} 
        isLoading={isLoading}
        containerClassName="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
      />
      
      {/* Pagination Controls */}
      {rewardsData && rewardsData.meta.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-3 shadow-sm mt-4">
          <p className="text-xs text-slate-500">
            Hiển thị <span className="font-bold text-slate-900">{(page - 1) * limit + 1}</span> đến{' '}
            <span className="font-bold text-slate-900">
              {Math.min(page * limit, rewardsData.meta.total)}
            </span>{' '}
            trong tổng số <span className="font-bold text-slate-900">{rewardsData.meta.total}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-slate-700">Trang {page} / {rewardsData.meta.totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(rewardsData.meta.totalPages, p + 1))}
              disabled={page === rewardsData.meta.totalPages}
              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {selectedRewardId && (
        <AdminRewardDetailDrawer
          rewardId={selectedRewardId}
          onClose={() => setSelectedRewardId(null)}
        />
      )}

      {isCreating && (
        <AdminRewardFormModal onClose={() => setIsCreating(false)} />
      )}
    </div>
  );
};
