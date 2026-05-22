import React, { useState } from 'react';
import { X, Lock, Unlock, ShieldAlert, Award, ArrowDownToLine, Zap, FileText } from 'lucide-react';
import {
  useAdminUserDetail,
  useUpdateUserStatus,
  useAdjustUserPoints,
  useAdminUserPoints,
} from '../services/queries';
import { StatusPill } from '../../shared/admin-ui';

export const AdminUserDetailDrawer = ({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) => {
  const { data: user, isLoading } = useAdminUserDetail(userId);
  const { mutate: updateStatus } = useUpdateUserStatus();
  const { mutate: adjustPoints } = useAdjustUserPoints();

  const [activeTab, setActiveTab] = useState<'info' | 'points' | 'dropoffs'>('info');

  if (isLoading || !user) {
    return (
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right sm:w-[480px]">
        <div className="p-6">Đang tải...</div>
      </div>
    );
  }

  const handleLockToggle = () => {
    if (user.status === 'LOCKED' || user.status === 'BANNED') {
      if (confirm('Bạn có chắc muốn mở khóa tài khoản này?')) {
        updateStatus({ id: userId, dto: { status: 'ACTIVE' } });
      }
    } else {
      const reason = prompt('Nhập lý do khóa tài khoản:');
      if (reason) {
        updateStatus({ id: userId, dto: { status: 'LOCKED', reason } });
      }
    }
  };

  const handleAdjustPoints = () => {
    const amountStr = prompt('Nhập số điểm cần cộng/trừ (âm để trừ):');
    if (!amountStr) return;
    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount === 0) return alert('Số điểm không hợp lệ!');

    const reason = prompt('Nhập lý do điều chỉnh:');
    if (!reason) return alert('Lý do là bắt buộc!');

    adjustPoints({ id: userId, dto: { amount, reason } });
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right sm:w-[480px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Chi tiết người dùng</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* User Profile Summary */}
          <div className="p-6 pb-0">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-100">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-emerald-100 text-xl font-bold text-emerald-700">
                    {user.fullName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900">{user.fullName}</h3>
                <p className="text-sm text-slate-500">{user.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusPill status={user.status} />
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase text-slate-500">Số dư điểm</p>
                <p className="mt-1 text-lg font-bold text-emerald-600">{user.pointsBalance.toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase text-slate-500">Ngày tham gia</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleAdjustPoints}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                <Award className="h-4 w-4" /> Điều chỉnh điểm
              </button>
              <button
                onClick={handleLockToggle}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                  user.status === 'ACTIVE'
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {user.status === 'ACTIVE' ? (
                  <>
                    <Lock className="h-4 w-4" /> Khóa tài khoản
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4" /> Mở khóa
                  </>
                )}
              </button>
            </div>
            {user.lockedReason && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  <strong>Lý do khóa:</strong> {user.lockedReason}
                </p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-slate-100 px-6">
            <div className="flex gap-4">
              {[
                { id: 'info', label: 'Thông tin' },
                { id: 'points', label: 'Lịch sử điểm' },
                { id: 'dropoffs', label: 'Giao dịch thu gom' },
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
                <p className="text-slate-500">Đây là nơi hiển thị thêm thông tin chi tiết về người dùng.</p>
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="font-semibold text-slate-900">Email: <span className="font-normal text-slate-600">{user.email}</span></p>
                  <p className="font-semibold text-slate-900 mt-2">ID: <span className="font-normal text-slate-600">{user.id}</span></p>
                </div>
              </div>
            )}
            {activeTab === 'points' && (
              <UserPointsTab userId={userId} />
            )}
            {activeTab === 'dropoffs' && (
              <div className="text-sm text-slate-500 text-center py-10">Đang cập nhật...</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const UserPointsTab = ({ userId }: { userId: string }) => {
  const { data, isLoading } = useAdminUserPoints(userId, { limit: 10 });

  if (isLoading) return <div className="text-sm text-slate-500 text-center py-4">Đang tải...</div>;
  if (!data?.data?.length) return <div className="text-sm text-slate-500 text-center py-4">Không có giao dịch nào.</div>;

  return (
    <div className="space-y-3">
      {data.data.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
              tx.type === 'EARN' ? 'bg-emerald-100 text-emerald-600' :
              tx.type === 'SPEND' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {tx.type === 'EARN' ? <ArrowDownToLine className="h-4 w-4" /> :
               tx.type === 'SPEND' ? <Zap className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {tx.type === 'EARN' ? 'Nhận điểm' : tx.type === 'SPEND' ? 'Tiêu điểm' : 'Điều chỉnh'}
              </p>
              <p className="text-[10px] text-slate-500">
                {new Date(tx.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-sm font-bold ${
              tx.type === 'EARN' ? 'text-emerald-600' :
              tx.type === 'SPEND' ? 'text-rose-600' : 'text-blue-600'
            }`}>
              {tx.type === 'SPEND' ? '-' : '+'}{tx.points}
            </p>
            <p className="text-[10px] text-slate-500">Dư: {tx.balanceAfter}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
