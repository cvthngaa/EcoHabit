import React, { useState, useMemo } from 'react';
import {
  Gift, Plus, Search, History, RefreshCw,
  Edit, Trash2, Eye, X, Loader2, CheckCircle2, Package, Clock, ArrowRightLeft
} from 'lucide-react';
import { useGetRewards } from '../services/use-get-rewards';
import { useGetRedemptions } from '../services/use-get-redemptions';
import { useCreateReward } from '../services/use-create-reward';
import { useUpdateReward } from '../services/use-update-reward';
import { useDeleteReward } from '../services/use-delete-reward';
import { useUpdateRedemptionStatus } from '../services/use-update-redemption-status';
import { useGetLocations } from '../../locations/services/queries';
import type { Reward, Redemption, RewardStatus, RedemptionStatus, CreateRewardDto } from '../services/types';
import { Badge, Modal, StatCard, DataTable, IconButton } from '../../../../shared/components';
import { apiClient } from '../../../../shared/services/api-client';

// ── Helpers ──

const REWARD_STATUS_MAP: Record<RewardStatus, { label: string, color: string }> = {
  DRAFT: { label: 'Nháp', color: 'bg-slate-100 text-slate-600' },
  ACTIVE: { label: 'Đang hoạt động', color: 'bg-emerald-100 text-emerald-700' },
  INACTIVE: { label: 'Tạm ẩn', color: 'bg-amber-100 text-amber-700' },
};

const REDEMPTION_STATUS_MAP: Record<RedemptionStatus, { label: string, color: string }> = {
  PENDING: { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-700' },
  APPROVED: { label: 'Đã duyệt', color: 'bg-blue-100 text-blue-700' },
  FULFILLED: { label: 'Đã hoàn tất', color: 'bg-emerald-100 text-emerald-700' },
  REJECTED: { label: 'Từ chối', color: 'bg-rose-100 text-rose-700' },
  CANCELED: { label: 'Đã hủy', color: 'bg-slate-100 text-slate-500' },
};

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Reward Form Modal ──

interface RewardFormModalProps {
  reward?: Reward | null;
  onClose: () => void;
}

const RewardFormModal: React.FC<RewardFormModalProps> = ({ reward, onClose }) => {
  const { data: locations = [] } = useGetLocations();
  const createMut = useCreateReward();
  const updateMut = useUpdateReward();

  const isEdit = !!reward;
  const isPending = createMut.isPending || updateMut.isPending;

  const [formData, setFormData] = useState<CreateRewardDto>({
    name: reward?.name ?? '',
    description: reward?.description ?? '',
    thumbnailUrl: reward?.thumbnailUrl ?? '',
    pointsCost: reward?.pointsCost ?? 100,
    stock: reward?.stock ?? 10,
    status: reward?.status ?? 'DRAFT',
    pickupLocationIds: reward?.pickupOptions?.map(p => p.location?.id).filter(Boolean) as string[] ?? [],
    pickupLocationIds: reward?.pickupOptions?.map(p => p.location?.id).filter(Boolean) as string[] ?? [],
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('file', file);

    setIsUploading(true);
    try {
      const res = await apiClient.post('/uploads/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.url) {
        setFormData(prev => ({ ...prev, thumbnailUrl: res.data.url }));
      }
    } catch (error) {
      console.error('Lỗi upload ảnh:', error);
      alert('Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      updateMut.mutate({ id: reward.id, data: formData }, { onSuccess: onClose });
    } else {
      createMut.mutate(formData, { onSuccess: onClose });
    }
  };

  const toggleLocation = (locId: string) => {
    const ids = formData.pickupLocationIds || [];
    if (ids.includes(locId)) {
      setFormData({ ...formData, pickupLocationIds: ids.filter(id => id !== locId) });
    } else {
      setFormData({ ...formData, pickupLocationIds: [...ids, locId] });
    }
  };

  return (
    <Modal
      title={isEdit ? 'Cập nhật quà tặng' : 'Thêm quà tặng mới'}
      icon={<Gift className="w-4 h-4 text-emerald-600" />}
      onClose={onClose}
      maxWidth="lg"
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="reward-form"
            disabled={isPending}
            className="flex-1 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {isEdit ? 'Lưu thay đổi' : 'Thêm quà'}
          </button>
        </div>
      }
    >
      <div className="px-6 py-5">
        <form id="reward-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Tên quà tặng <span className="text-rose-500">*</span></label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="VD: Voucher Trà sữa 50K"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Mô tả</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
              placeholder="Điều kiện áp dụng, hạn sử dụng..."
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Ảnh minh họa</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadImage}
              disabled={isUploading}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
            {isUploading && <p className="text-xs text-emerald-600 mt-2 font-medium">Đang tải ảnh lên...</p>}
            {formData.thumbnailUrl && (
              <div className="mt-3 h-32 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <img
                  src={formData.thumbnailUrl}
                  alt="Ảnh quà tặng"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Điểm cần đổi <span className="text-rose-500">*</span></label>
              <input
                required
                type="number"
                min={1}
                value={formData.pointsCost}
                onChange={e => setFormData({ ...formData, pointsCost: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Tồn kho <span className="text-rose-500">*</span></label>
              <input
                required
                type="number"
                min={0}
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Trạng thái</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as RewardStatus })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
            >
              <option value="DRAFT">Nháp</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Tạm ẩn</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Điểm hỗ trợ nhận quà</label>
            <div className="border border-slate-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
              {locations.length === 0 ? (
                <p className="p-3 text-xs text-slate-500 text-center">Chưa có điểm thu gom nào.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {locations.map(loc => {
                    const isChecked = formData.pickupLocationIds?.includes(loc.id);
                    return (
                      <label key={loc.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleLocation(loc.id)}
                          className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{loc.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{loc.address}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

// ── Redemption Status Modal ──

interface RedemptionStatusModalProps {
  redemption: Redemption;
  onClose: () => void;
}

const RedemptionStatusModal: React.FC<RedemptionStatusModalProps> = ({ redemption, onClose }) => {
  const mut = useUpdateRedemptionStatus();
  const current = redemption.status;

  // Determine allowed next states based on backend rules
  const allowedStatus: RedemptionStatus[] = [];
  if (current === 'PENDING') {
    allowedStatus.push('APPROVED', 'FULFILLED', 'REJECTED', 'CANCELED');
  } else if (current === 'APPROVED') {
    allowedStatus.push('FULFILLED', 'REJECTED', 'CANCELED');
  }

  const handleUpdate = (s: RedemptionStatus) => {
    mut.mutate({ id: redemption.id, data: { status: s } }, { onSuccess: onClose });
  };

  return (
    <Modal
      title="Cập nhật lượt đổi quà"
      icon={<ArrowRightLeft className="w-4 h-4 text-blue-600" />}
      onClose={onClose}
      maxWidth="sm"
    >
      <div className="px-6 py-4 space-y-4">
        <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Mã đổi quà</span>
            <span className="font-mono text-slate-800">{redemption.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Quà tặng</span>
            <span className="font-semibold text-slate-800 max-w-[160px] truncate">{redemption.reward?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Người dùng</span>
            <span className="font-medium text-slate-800">{redemption.user?.displayName || 'Ẩn danh'}</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-600 mb-2">Chọn trạng thái mới:</p>
          <div className="grid grid-cols-1 gap-2">
            {allowedStatus.map(s => (
              <button
                key={s}
                disabled={mut.isPending}
                onClick={() => handleUpdate(s)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer disabled:opacity-50
                    ${s === 'APPROVED' ? 'hover:bg-blue-50 border-blue-200 text-blue-700' :
                    s === 'FULFILLED' ? 'hover:bg-emerald-50 border-emerald-200 text-emerald-700' :
                      s === 'REJECTED' ? 'hover:bg-rose-50 border-rose-200 text-rose-700' :
                        'hover:bg-slate-50 border-slate-200 text-slate-700'}`}
              >
                Chuyển sang <strong>{REDEMPTION_STATUS_MAP[s].label}</strong>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ── Main Page ──

export const Rewards: React.FC = () => {
  const { data: rewards = [], isLoading: rewardsLoading, refetch: refetchRewards } = useGetRewards();
  const { data: redemptions = [], isLoading: redemptionsLoading, refetch: refetchRedemptions } = useGetRedemptions();
  const deleteMut = useDeleteReward();

  const [activeTab, setActiveTab] = useState<'REWARDS' | 'REDEMPTIONS'>('REWARDS');

  // Filter state
  const [rewardSearch, setRewardSearch] = useState('');
  const [rewardStatus, setRewardStatus] = useState<'ALL' | RewardStatus>('ALL');
  const [rewardStock, setRewardStock] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');

  const [redemptionSearch, setRedemptionSearch] = useState('');
  const [redemptionStatus, setRedemptionStatus] = useState<'ALL' | RedemptionStatus>('ALL');

  // Modal state
  const [formReward, setFormReward] = useState<Reward | null | undefined>(undefined); // undefined means no modal, null means create, object means edit
  const [detailReward, setDetailReward] = useState<Reward | null>(null);
  const [statusRedemption, setStatusRedemption] = useState<Redemption | null>(null);
  const [detailRedemption, setDetailRedemption] = useState<Redemption | null>(null);

  const stats = useMemo(() => {
    const totalRewards = rewards.length;
    const activeRewards = rewards.filter(r => r.status === 'ACTIVE').length;
    const totalStock = rewards.reduce((sum, r) => sum + (r.stock || 0), 0);
    const pendingRedemptions = redemptions.filter(r => r.status === 'PENDING').length;
    return { totalRewards, activeRewards, totalStock, pendingRedemptions };
  }, [rewards, redemptions]);

  const filteredRewards = useMemo(() => {
    const q = rewardSearch.toLowerCase();
    return rewards.filter(r => {
      if (rewardStatus !== 'ALL' && r.status !== rewardStatus) return false;
      if (rewardStock === 'IN_STOCK' && r.stock <= 0) return false;
      if (rewardStock === 'OUT_OF_STOCK' && r.stock > 0) return false;
      if (q && !r.name.toLowerCase().includes(q) && !(r.description || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rewards, rewardSearch, rewardStatus, rewardStock]);

  const filteredRedemptions = useMemo(() => {
    const q = redemptionSearch.toLowerCase();
    return redemptions
      .filter(r => {
        if (redemptionStatus !== 'ALL' && r.status !== redemptionStatus) return false;
        if (q && !r.user?.displayName?.toLowerCase().includes(q) && !r.reward?.name.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [redemptions, redemptionSearch, redemptionStatus]);

  const handleRefresh = () => {
    if (activeTab === 'REWARDS') refetchRewards();
    else refetchRedemptions();
  };

  const handleDeleteReward = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa quà tặng này?')) {
      deleteMut.mutate(id);
    }
  };

  return (
    <>
      <div className="space-y-6 font-sans">

        {/* A. Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Gift className="w-6 h-6 text-emerald-600" />
              Quà tặng & Voucher
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Quản lý phần thưởng, tồn kho và lượt đổi quà của người dùng.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              title="Làm mới"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setFormReward(null)} // Null means create new
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Thêm quà tặng
            </button>
          </div>
        </div>

        {/* B. Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Gift, label: 'Tổng quà tặng', value: stats.totalRewards, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { icon: CheckCircle2, label: 'Đang hoạt động', value: stats.activeRewards, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { icon: Package, label: 'Tổng tồn kho', value: stats.totalStock, color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: Clock, label: 'Chờ xử lý', value: stats.pendingRedemptions, color: 'text-amber-600', bg: 'bg-amber-50', isAlert: stats.pendingRedemptions > 0 },
          ].map((s, i) => (
            <StatCard
              key={i}
              icon={s.icon}
              iconColorClass={s.color}
              iconBgClass={s.bg}
              iconClassName="w-5 h-5"
              label={<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{s.label}</span>}
              value={
                <>
                  {s.value}
                  {s.isAlert && (
                    <span className="flex h-2 w-2 relative mb-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                  )}
                </>
              }
            />
          ))}
        </div>

        {/* C. Tabs */}
        <div className="flex gap-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('REWARDS')}
            className={`pb-3 px-1 text-sm font-bold transition-all border-b-2 cursor-pointer ${activeTab === 'REWARDS' ? 'text-emerald-600 border-emerald-600' : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'
              }`}
          >
            Danh sách quà
          </button>
          <button
            onClick={() => setActiveTab('REDEMPTIONS')}
            className={`pb-3 px-1 text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${activeTab === 'REDEMPTIONS' ? 'text-emerald-600 border-emerald-600' : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'
              }`}
          >
            Lượt đổi quà
            {stats.pendingRedemptions > 0 && (
              <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.5 rounded-full">{stats.pendingRedemptions}</span>
            )}
          </button>
        </div>

        {/* Tab Content: REWARDS */}
        {activeTab === 'REWARDS' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {/* Filters */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 bg-slate-50/50">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm theo tên quà, mô tả..."
                  value={rewardSearch}
                  onChange={e => setRewardSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={rewardStatus}
                  onChange={e => setRewardStatus(e.target.value as any)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="DRAFT">Nháp</option>
                  <option value="INACTIVE">Tạm ẩn</option>
                </select>
                <select
                  value={rewardStock}
                  onChange={e => setRewardStock(e.target.value as any)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                >
                  <option value="ALL">Tất cả tồn kho</option>
                  <option value="IN_STOCK">Còn hàng</option>
                  <option value="OUT_OF_STOCK">Hết hàng</option>
                </select>
              </div>
            </div>

            {/* List */}
            <DataTable
              data={filteredRewards}
              isLoading={rewardsLoading}
              loadingMessage="Đang tải danh sách quà tặng..."
              loadingMinHeight="py-12"
              emptyIcon={<Gift className="w-12 h-12 opacity-20" />}
              emptyTitle="Không tìm thấy quà tặng nào"
              emptyClassName="py-12"
              containerClassName=""
              tableClassName="text-xs"
              columns={[
                {
                  header: 'Quà tặng',
                  render: (r) => (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                        {r.thumbnailUrl ? (
                          <img src={r.thumbnailUrl} alt={r.name} className="w-full h-full object-cover" />
                        ) : (
                          <Gift className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{r.name}</p>
                        {r.description && <p className="text-slate-400 mt-0.5 truncate max-w-[200px]">{r.description}</p>}
                      </div>
                    </div>
                  ),
                },
                {
                  header: 'Điểm',
                  render: (r) => <span className="font-bold text-emerald-700">{r.pointsCost}</span>,
                },
                {
                  header: 'Tồn kho',
                  render: (r) => <span className={`font-semibold ${r.stock > 0 ? 'text-slate-700' : 'text-rose-500'}`}>{r.stock}</span>,
                },
                {
                  header: 'Trạng thái',
                  render: (r) => (
                    <Badge
                      className={`text-[10px] ${REWARD_STATUS_MAP[r.status].color}`}
                      label={REWARD_STATUS_MAP[r.status].label}
                    />
                  ),
                },
                {
                  header: 'Điểm nhận',
                  className: 'text-slate-500',
                  render: (r) => r.pickupOptions?.length ? `${r.pickupOptions.length} điểm` : 'Mọi nơi',
                },
                {
                  header: 'Thao tác',
                  className: 'text-right',
                  render: (r) => (
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setDetailReward(r)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors" title="Chi tiết">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => setFormReward(r)} className="p-1.5 text-blue-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors" title="Sửa">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteReward(r.id)} className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors" title="Xóa">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}

        {/* Tab Content: REDEMPTIONS */}
        {activeTab === 'REDEMPTIONS' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 bg-slate-50/50">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm theo người dùng, quà tặng..."
                  value={redemptionSearch}
                  onChange={e => setRedemptionSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
              <select
                value={redemptionStatus}
                onChange={e => setRedemptionStatus(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Chờ xử lý</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="FULFILLED">Đã hoàn tất</option>
                <option value="REJECTED">Từ chối</option>
                <option value="CANCELED">Đã hủy</option>
              </select>
            </div>

            <DataTable
              data={filteredRedemptions}
              isLoading={redemptionsLoading}
              loadingMessage="Đang tải danh sách đổi quà..."
              loadingMinHeight="p-12"
              emptyIcon={<History className="w-12 h-12 opacity-20" />}
              emptyTitle="Không tìm thấy lượt đổi quà nào"
              emptyClassName="p-12"
              tableClassName="text-xs"
              containerClassName=""
              columns={[
                {
                  header: 'Ngày đổi',
                  className: 'whitespace-nowrap text-slate-500',
                  render: (r) => fmtDate(r.createdAt),
                },
                {
                  header: 'Người dùng',
                  render: (r) => (
                    <>
                      <p className="font-semibold text-slate-800">{r.user?.displayName || 'Ẩn danh'}</p>
                      {r.user?.email && <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{r.user.email}</p>}
                    </>
                  ),
                },
                {
                  header: 'Quà tặng',
                  render: (r) => (
                    <>
                      <p className="font-semibold text-slate-800 max-w-[180px] truncate">{r.reward?.name}</p>
                      <p className="text-[10px] font-bold text-emerald-600 mt-0.5">{r.pointsSpent} điểm</p>
                    </>
                  ),
                },
                {
                  header: 'Trạng thái',
                  render: (r) => (
                    <Badge
                      className={`text-[10px] ${REDEMPTION_STATUS_MAP[r.status].color}`}
                      label={REDEMPTION_STATUS_MAP[r.status].label}
                    />
                  ),
                },
                {
                  header: 'Xử lý',
                  render: (r) => (
                    <div className="flex items-center gap-1.5">
                      {['PENDING', 'APPROVED'].includes(r.status) ? (
                        <button
                          onClick={() => setStatusRedemption(r)}
                          className="px-2.5 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors"
                        >
                          Cập nhật
                        </button>
                      ) : (
                        <button
                          onClick={() => setDetailRedemption(r)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                        >
                          Chi tiết
                        </button>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {formReward !== undefined && (
        <RewardFormModal reward={formReward} onClose={() => setFormReward(undefined)} />
      )}

      {statusRedemption && (
        <RedemptionStatusModal redemption={statusRedemption} onClose={() => setStatusRedemption(null)} />
      )}

      {detailReward && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="flex-1 bg-slate-900/30 backdrop-blur-sm" onClick={() => setDetailReward(null)} />
          <div className="w-full max-w-sm bg-white shadow-2xl flex flex-col border-l border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <h3 className="text-sm font-bold text-slate-800">Chi tiết quà tặng</h3>
              <IconButton
                onClick={() => setDetailReward(null)}
                icon={<X />}
                variant="ghost"
                size="sm"
                aria-label="Đóng chi tiết"
                className="text-slate-400 hover:text-slate-600"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {detailReward.thumbnailUrl ? (
                <div className="w-full h-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 mb-2">
                  <img src={detailReward.thumbnailUrl} alt={detailReward.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center mb-2">
                  <Gift className="w-10 h-10 text-slate-300" />
                </div>
              )}
              <div className="space-y-1">
                <p className="text-slate-500">Tên quà tặng</p>
                <p className="font-semibold text-slate-800 text-sm">{detailReward.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-slate-500">Trạng thái</p>
                  <Badge
                    className={`text-[10px] ${REWARD_STATUS_MAP[detailReward.status].color}`}
                    label={REWARD_STATUS_MAP[detailReward.status].label}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500">Tồn kho</p>
                  <p className="font-bold text-slate-800">{detailReward.stock}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500">Điểm đổi</p>
                <p className="font-bold text-emerald-600">{detailReward.pointsCost} điểm</p>
              </div>
              {detailReward.description && (
                <div className="space-y-1">
                  <p className="text-slate-500">Mô tả</p>
                  <p className="text-slate-700 bg-slate-50 p-2 rounded-lg">{detailReward.description}</p>
                </div>
              )}
              {detailReward.pickupOptions && detailReward.pickupOptions.length > 0 && (
                <div className="space-y-1">
                  <p className="text-slate-500">Điểm nhận quà ({detailReward.pickupOptions.length})</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    {detailReward.pickupOptions.map(p => (
                      <li key={p.id}><strong>{p.location?.name}</strong><br /><span className="text-[10px] text-slate-500">{p.location?.address}</span></li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 space-y-1">
                <p>ID: {detailReward.id}</p>
                <p>Tạo: {fmtDate(detailReward.createdAt)}</p>
                {detailReward.updatedAt && <p>Cập nhật: {fmtDate(detailReward.updatedAt)}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {detailRedemption && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="flex-1 bg-slate-900/30 backdrop-blur-sm" onClick={() => setDetailRedemption(null)} />
          <div className="w-full max-w-sm bg-white shadow-2xl flex flex-col border-l border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <h3 className="text-sm font-bold text-slate-800">Chi tiết lượt đổi quà</h3>
              <IconButton
                onClick={() => setDetailRedemption(null)}
                icon={<X />}
                variant="ghost"
                size="sm"
                aria-label="Đóng chi tiết"
                className="text-slate-400 hover:text-slate-600"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                <span className="text-slate-500">Trạng thái</span>
                <Badge
                  className={`text-[10px] ${REDEMPTION_STATUS_MAP[detailRedemption.status].color}`}
                  label={REDEMPTION_STATUS_MAP[detailRedemption.status].label}
                />
              </div>
              <div className="space-y-1">
                <p className="text-slate-500">Người dùng</p>
                <p className="font-semibold text-slate-800">{detailRedemption.user?.displayName || 'Ẩn danh'}</p>
                <p className="text-slate-500">{detailRedemption.user?.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500">Quà tặng</p>
                <p className="font-semibold text-slate-800">{detailRedemption.reward?.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500">Điểm đã dùng</p>
                <p className="font-bold text-emerald-600">{detailRedemption.pointsSpent} điểm</p>
              </div>
              <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 space-y-1">
                <p>Mã đổi quà: {detailRedemption.id}</p>
                <p>Ngày đổi: {fmtDate(detailRedemption.createdAt)}</p>
                {detailRedemption.updatedAt && <p>Cập nhật: {fmtDate(detailRedemption.updatedAt)}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
