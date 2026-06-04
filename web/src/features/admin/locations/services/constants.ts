export const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Hoạt động',
  REJECTED: 'Từ chối',
  INACTIVE: 'Tạm ngưng',
};

export const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
  INACTIVE: 'bg-slate-100 text-slate-700',
};

export const TYPE_LABEL: Record<string, string> = {
  BIN: 'Thùng rác thông minh',
  CENTER: 'Trung tâm phân loại',
  COLLECTION_POINT: 'Điểm thu gom',
};

export const CAPABILITY_LABEL: Record<string, string> = {
  COLLECTION: 'Nhận rác',
  REWARD_PICKUP: 'Đổi thưởng',
};
