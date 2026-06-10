import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { IconButton } from '../../../../shared/components/IconButton';
import { Button } from '../../../../shared/components/Button';
import { useUpdatePointRule } from '../services/queries';
import type { PointRule } from '../services/types';

const EVENT_TYPE_LABEL: Record<string, string> = {
  CLASSIFICATION_CORRECT: 'Phân loại AI đúng',
  DROPOFF_CONFIRMED: 'Xác nhận thu gom',
  REDEMPTION: 'Đổi quà',
  MANUAL_ADJUST: 'Điều chỉnh thủ công',
};

export const AdminPointRuleDrawer = ({
  rule,
  onClose,
}: {
  rule: PointRule;
  onClose: () => void;
}) => {
  const [editPoints, setEditPoints] = useState<number>(rule.points);
  const [editIsActive, setEditIsActive] = useState<boolean>(rule.isActive);
  const { mutate: updateRule, isPending: isUpdating } = useUpdatePointRule();

  // Reset state when rule changes
  useEffect(() => {
    setEditPoints(rule.points);
    setEditIsActive(rule.isActive);
  }, [rule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRule(
      { id: rule.id, dto: { points: editPoints, isActive: editIsActive } },
      { onSuccess: onClose }
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right sm:w-[480px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Chỉnh sửa quy tắc điểm</h2>
          <IconButton
            onClick={onClose}
            icon={<X />}
            variant="ghost"
            size="sm"
            aria-label="Đóng"
            className="text-slate-500 hover:text-slate-800"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Mã quy tắc</label>
              <input type="text" value={rule.code} disabled className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Tên quy tắc</label>
              <input type="text" value={rule.name} disabled className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Loại sự kiện</label>
              <input type="text" value={EVENT_TYPE_LABEL[rule.eventType] ?? rule.eventType} disabled className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Số điểm thưởng *</label>
              <input
                required
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400"
                value={editPoints}
                onChange={(e) => setEditPoints(Number(e.target.value))}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <input
                type="checkbox"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-sm font-bold text-slate-700">Kích hoạt quy tắc này</span>
            </label>

            <div className="flex gap-3 pt-6 border-t border-slate-100">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" variant="primary" className="flex-1" isLoading={isUpdating}>
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
