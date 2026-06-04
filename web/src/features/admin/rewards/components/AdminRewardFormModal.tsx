import React, { useState, useEffect } from 'react';
import { Gift } from 'lucide-react';
import { Modal, Button } from '../../../../shared/components';
import { useCreateReward, useUpdateReward } from '../services/queries';
import type { Reward, CreateRewardDto } from '../services/types';

interface AdminRewardFormModalProps {
  onClose: () => void;
  reward?: Reward | null;
}

export const AdminRewardFormModal: React.FC<AdminRewardFormModalProps> = ({ onClose, reward }) => {
  const isEditing = !!reward;
  const { mutateAsync: createReward, isPending: isCreating } = useCreateReward();
  const { mutateAsync: updateReward, isPending: isUpdating } = useUpdateReward();

  const [formData, setFormData] = useState<CreateRewardDto>({
    name: '',
    description: '',
    pointsCost: 0,
    stock: 0,
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (reward) {
      setFormData({
        name: reward.name,
        description: reward.description || '',
        pointsCost: reward.pointsCost,
        stock: reward.stock,
        status: reward.status,
      });
    }
  }, [reward]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'pointsCost' || name === 'stock' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateReward({ id: reward.id, dto: formData });
      } else {
        await createReward(formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save reward', error);
      alert('Có lỗi xảy ra khi lưu phần quà');
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Modal
      title={isEditing ? 'Chỉnh sửa quà tặng' : 'Thêm quà tặng mới'}
      icon={<Gift className="w-5 h-5 text-emerald-600" />}
      onClose={onClose}
      maxWidth="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isPending}>
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Tên phần quà *</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            placeholder="Ví dụ: Voucher giảm 50K..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Mô tả</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:bg-white resize-none"
            placeholder="Nhập mô tả hoặc điều kiện áp dụng..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Điểm yêu cầu *</label>
            <input
              type="number"
              name="pointsCost"
              required
              min="0"
              value={formData.pointsCost}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Số lượng tồn kho *</label>
            <input
              type="number"
              name="stock"
              required
              min="0"
              value={formData.stock}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Trạng thái</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
          >
            <option value="DRAFT">Bản nháp (DRAFT)</option>
            <option value="ACTIVE">Kích hoạt (ACTIVE)</option>
            <option value="INACTIVE">Tạm ngưng (INACTIVE)</option>
          </select>
        </div>
      </form>
    </Modal>
  );
};
