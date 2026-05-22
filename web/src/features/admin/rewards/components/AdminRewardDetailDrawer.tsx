import React, { useState } from 'react';
import { X, Power, PowerOff, Gift, Clock, CheckCircle, XCircle } from 'lucide-react';
import {
  useAdminRewardDetail,
  useUpdateRewardStatus,
  useAdminRedemptions,
  useUpdateRedemptionStatus,
} from '../services/queries';
import { StatusPill } from '../../shared/admin-ui';
import type { RewardStatus, RedemptionStatus } from '../services/types';

export const AdminRewardDetailDrawer = ({
  rewardId,
  onClose,
}: {
  rewardId: string;
  onClose: () => void;
}) => {
  const { data: reward, isLoading } = useAdminRewardDetail(rewardId);
  const { mutate: updateStatus } = useUpdateRewardStatus();

  const [activeTab, setActiveTab] = useState<'info' | 'redemptions'>('info');

  if (isLoading || !reward) {
    return (
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right sm:w-[500px]">
        <div className="p-6">Đang tải...</div>
      </div>
    );
  }

  const handleToggleStatus = () => {
    const nextStatus: RewardStatus = reward.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (confirm(`Bạn có chắc muốn chuyển trạng thái thành ${nextStatus}?`)) {
      updateStatus({ id: rewardId, dto: { status: nextStatus } });
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right sm:w-[500px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Chi tiết phần quà</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Summary */}
          <div className="p-6 pb-0">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <Gift className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 line-clamp-2">{reward.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{reward.partnerProfile?.organizationName || 'Hệ thống'}</p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusPill status={reward.status} />
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase text-slate-500">Điểm yêu cầu</p>
                <p className="mt-1 text-lg font-bold text-emerald-600">{reward.pointsCost.toLocaleString('vi-VN')}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase text-slate-500">Tồn kho</p>
                <p className={`mt-1 text-lg font-bold ${reward.stock > 10 ? 'text-blue-600' : reward.stock > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                  {reward.stock.toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleToggleStatus}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                  reward.status === 'ACTIVE'
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {reward.status === 'ACTIVE' ? (
                  <>
                    <PowerOff className="h-4 w-4" /> Tạm ngưng
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4" /> Kích hoạt
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-slate-100 px-6">
            <div className="flex gap-4">
              {[
                { id: 'info', label: 'Thông tin chung' },
                { id: 'redemptions', label: 'Lượt đổi quà' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`border-b-2 py-3 text-sm font-bold transition-colors ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'info' && (
              <div className="space-y-4 text-sm">
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="font-semibold text-slate-900 mb-2">Mô tả chi tiết</p>
                  <p className="text-slate-600 whitespace-pre-wrap">{reward.description || 'Không có mô tả'}</p>
                </div>
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="font-semibold text-slate-900">ID Quà tặng: <span className="font-normal text-slate-600">{reward.id}</span></p>
                  <p className="font-semibold text-slate-900 mt-2">Ngày tạo: <span className="font-normal text-slate-600">{new Date(reward.createdAt).toLocaleDateString('vi-VN')}</span></p>
                </div>
              </div>
            )}
            {activeTab === 'redemptions' && (
              <RewardRedemptionsTab rewardId={rewardId} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const RewardRedemptionsTab = ({ rewardId }: { rewardId: string }) => {
  const { data, isLoading } = useAdminRedemptions({ rewardId, limit: 10 });
  const { mutate: updateRedemptionStatus } = useUpdateRedemptionStatus();

  if (isLoading) return <div className="text-sm text-slate-500 text-center py-4">Đang tải...</div>;
  if (!data?.data?.length) return <div className="text-sm text-slate-500 text-center py-4">Chưa có ai đổi phần quà này.</div>;

  const handleUpdateStatus = (id: string, newStatus: RedemptionStatus) => {
    if (confirm(`Chuyển trạng thái lượt đổi thành ${newStatus}?`)) {
      updateRedemptionStatus({ id, dto: { status: newStatus } });
    }
  };

  return (
    <div className="space-y-3">
      {data.data.map((rx) => (
        <div key={rx.id} className="rounded-xl border border-slate-100 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full ${
                rx.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                rx.status === 'APPROVED' ? 'bg-blue-100 text-blue-600' :
                rx.status === 'FULFILLED' ? 'bg-emerald-100 text-emerald-600' :
                'bg-rose-100 text-rose-600'
              }`}>
                {rx.status === 'PENDING' ? <Clock className="h-3 w-3" /> :
                 rx.status === 'APPROVED' ? <CheckCircle className="h-3 w-3" /> :
                 rx.status === 'FULFILLED' ? <CheckCircle className="h-3 w-3" /> :
                 <XCircle className="h-3 w-3" />}
              </span>
              <StatusPill status={rx.status} />
            </div>
            <p className="text-[10px] text-slate-500">
              {new Date(rx.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>
          <div className="mb-3">
            <p className="text-sm font-bold text-slate-900">{rx.user?.fullName || 'Người dùng ẩn'}</p>
            <p className="text-[11px] text-slate-500">{rx.user?.email}</p>
          </div>
          
          {/* Actions for Pending/Approved */}
          {rx.status === 'PENDING' && (
            <div className="flex gap-2">
              <button 
                onClick={() => handleUpdateStatus(rx.id, 'APPROVED')}
                className="flex-1 rounded-lg bg-blue-50 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
              >
                Duyệt
              </button>
              <button 
                onClick={() => handleUpdateStatus(rx.id, 'REJECTED')}
                className="flex-1 rounded-lg bg-rose-50 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
              >
                Từ chối
              </button>
            </div>
          )}
          {rx.status === 'APPROVED' && (
            <div className="flex gap-2">
              <button 
                onClick={() => handleUpdateStatus(rx.id, 'FULFILLED')}
                className="flex-1 rounded-lg bg-emerald-50 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
              >
                Đã giao quà
              </button>
              <button 
                onClick={() => handleUpdateStatus(rx.id, 'CANCELED')}
                className="flex-1 rounded-lg bg-rose-50 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
              >
                Hủy
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
