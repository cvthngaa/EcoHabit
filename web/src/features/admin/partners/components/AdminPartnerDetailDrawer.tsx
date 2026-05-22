import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Lock, Unlock, Shield } from 'lucide-react';
import {
  useAdminPartnerDetail,
  useUpdatePartnerApproval,
  useUpdatePartnerRoles,
  useUpdatePartnerUserStatus,
} from '../services/queries';
import { StatusPill } from '../../shared/admin-ui';
import type { PartnerRoleType, PartnerApprovalStatus } from '../services/types';

const ROLE_LABELS: Record<PartnerRoleType, string> = {
  COLLECTOR: 'Thu gom rác',
  REWARD_PROVIDER: 'Cung cấp quà',
};

const APPROVAL_STATUS_LABEL: Record<PartnerApprovalStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

export const AdminPartnerDetailDrawer = ({
  partnerId,
  onClose,
}: {
  partnerId: string;
  onClose: () => void;
}) => {
  const { data: partner, isLoading } = useAdminPartnerDetail(partnerId);
  const { mutate: updateApproval, isPending: isApprovingPending } = useUpdatePartnerApproval();
  const { mutate: updateRoles } = useUpdatePartnerRoles();
  const { mutate: updateUserStatus } = useUpdatePartnerUserStatus();

  const [activeTab, setActiveTab] = useState<'info' | 'roles'>('info');

  if (isLoading || !partner) {
    return (
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl sm:w-[500px]">
        <div className="p-6 text-slate-500">Đang tải...</div>
      </div>
    );
  }

  const handleApprove = () => {
    if (confirm('Bạn có chắc muốn DUYỆT hồ sơ đối tác này?')) {
      updateApproval({ id: partnerId, dto: { status: 'APPROVED' } });
    }
  };

  const handleReject = () => {
    const reason = prompt('Nhập lý do từ chối:');
    if (reason) {
      updateApproval({ id: partnerId, dto: { status: 'REJECTED', rejectionReason: reason } });
    }
  };

  const handleToggleAccountStatus = () => {
    const isActive = partner.user?.status === 'ACTIVE';
    if (isActive) {
      const reason = prompt('Nhập lý do khóa tài khoản đối tác:');
      if (reason) updateUserStatus({ id: partnerId, dto: { status: 'LOCKED', reason } });
    } else {
      if (confirm('Mở khóa tài khoản đối tác này?')) {
        updateUserStatus({ id: partnerId, dto: { status: 'ACTIVE' } });
      }
    }
  };

  const handleToggleRole = (role: PartnerRoleType) => {
    const current = partner.roleTypes ?? [];
    const next = current.includes(role)
      ? current.filter((r) => r !== role)
      : [...current, role];
    if (next.length === 0) return alert('Đối tác phải có ít nhất 1 loại hình.');
    updateRoles({ id: partnerId, dto: { roles: next } });
  };

  const approvalColor = partner.approvalStatus === 'APPROVED'
    ? 'bg-emerald-100 text-emerald-700'
    : partner.approvalStatus === 'REJECTED'
    ? 'bg-rose-100 text-rose-700'
    : 'bg-amber-100 text-amber-700';

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right sm:w-[520px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Chi tiết Đối tác</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Block */}
          <div className="p-6 pb-0">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-extrabold text-blue-700">
                {partner.organizationName.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900">{partner.organizationName}</h3>
                <p className="mt-0.5 text-sm text-slate-500">{partner.user?.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${approvalColor}`}>
                    {APPROVAL_STATUS_LABEL[partner.approvalStatus]}
                  </span>
                  {partner.user && <StatusPill status={partner.user.status} />}
                  {(partner.roleTypes ?? []).map((r) => (
                    <span key={r} className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                      {ROLE_LABELS[r]}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase text-slate-500">Ngày đăng ký</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {new Date(partner.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase text-slate-500">Tài khoản</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{partner.user?.fullName || '—'}</p>
              </div>
            </div>

            {/* Action Buttons */}
            {partner.approvalStatus === 'PENDING' && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleApprove}
                  disabled={isApprovingPending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" /> Duyệt hồ sơ
                </button>
                <button
                  onClick={handleReject}
                  disabled={isApprovingPending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" /> Từ chối
                </button>
              </div>
            )}

            {partner.approvalStatus === 'APPROVED' && (
              <div className="mt-4">
                <button
                  onClick={handleToggleAccountStatus}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold ${
                    partner.user?.status === 'ACTIVE'
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {partner.user?.status === 'ACTIVE'
                    ? <><Lock className="h-4 w-4" /> Khóa tài khoản đối tác</>
                    : <><Unlock className="h-4 w-4" /> Mở khóa tài khoản</>}
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-slate-100 px-6">
            <div className="flex gap-4">
              {[
                { id: 'info', label: 'Thông tin hồ sơ' },
                { id: 'roles', label: 'Loại hình & Phân quyền' },
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
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Tên tổ chức', value: partner.organizationName },
                  { label: 'Loại hình', value: partner.organizationType || '—' },
                  { label: 'Người liên hệ', value: partner.contactName || '—' },
                  { label: 'Điện thoại', value: partner.contactPhone || '—' },
                  { label: 'Email liên hệ', value: partner.contactEmail || '—' },
                  { label: 'Địa chỉ', value: partner.address || '—' },
                  { label: 'Mã số thuế', value: partner.taxCode || '—' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start justify-between rounded-lg border border-slate-100 p-3">
                    <span className="font-semibold text-slate-600 shrink-0 mr-4">{item.label}</span>
                    <span className="text-slate-900 text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'roles' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 mb-4">Bấm để bật/tắt loại hình hoạt động của đối tác này.</p>
                {(['COLLECTOR', 'REWARD_PROVIDER'] as PartnerRoleType[]).map((role) => {
                  const isActive = (partner.roleTypes ?? []).includes(role);
                  return (
                    <button
                      key={role}
                      onClick={() => handleToggleRole(role)}
                      className={`flex w-full items-center justify-between rounded-xl border-2 p-4 transition-all ${
                        isActive
                          ? 'border-emerald-400 bg-emerald-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Shield className={`h-5 w-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <div className="text-left">
                          <p className={`text-sm font-bold ${isActive ? 'text-emerald-800' : 'text-slate-700'}`}>
                            {ROLE_LABELS[role]}
                          </p>
                          <p className="text-[11px] text-slate-500">{role}</p>
                        </div>
                      </div>
                      <div className={`h-5 w-5 rounded-full border-2 ${isActive ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                        {isActive && <div className="h-full w-full rounded-full flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-white" />
                        </div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
