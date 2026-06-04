export const formatAuditAction = (action: string): { label: string; color: string } => {
  switch (action) {
    case 'USER_STATUS_CHANGE': return { label: 'Đổi trạng thái tài khoản', color: 'bg-orange-100 text-orange-700' };
    case 'USER_PROFILE_UPDATE': return { label: 'Cập nhật hồ sơ user', color: 'bg-blue-100 text-blue-700' };
    case 'POINTS_ADJUST': return { label: 'Điều chỉnh điểm', color: 'bg-indigo-100 text-indigo-700' };
    
    case 'PARTNER_APPROVAL': return { label: 'Duyệt đối tác', color: 'bg-emerald-100 text-emerald-700' };
    case 'PARTNER_ROLES_UPDATE': return { label: 'Cập nhật quyền đối tác', color: 'bg-teal-100 text-teal-700' };
    
    case 'REWARD_CREATE': return { label: 'Tạo phần thưởng', color: 'bg-green-100 text-green-700' };
    case 'REWARD_UPDATE': return { label: 'Sửa phần thưởng', color: 'bg-blue-100 text-blue-700' };
    case 'REWARD_DELETE': return { label: 'Xóa phần thưởng', color: 'bg-red-100 text-red-700' };
    case 'REDEMPTION_STATUS_UPDATE': return { label: 'Cập nhật đổi quà', color: 'bg-purple-100 text-purple-700' };
    
    case 'COLLECTION_POINT_CREATE': return { label: 'Tạo điểm thu gom', color: 'bg-green-100 text-green-700' };
    case 'COLLECTION_POINT_UPDATE': return { label: 'Sửa điểm thu gom', color: 'bg-blue-100 text-blue-700' };
    case 'COLLECTION_POINT_DELETE': return { label: 'Xóa điểm thu gom', color: 'bg-red-100 text-red-700' };
    
    case 'FORUM_POST_DELETE': return { label: 'Xóa bài viết', color: 'bg-red-100 text-red-700' };
    case 'FORUM_COMMENT_DELETE': return { label: 'Xóa bình luận', color: 'bg-red-100 text-red-700' };
    
    default: return { label: action, color: 'bg-slate-100 text-slate-700' };
  }
};

export const formatMetadataKey = (key: string): string => {
  const dictionary: Record<string, string> = {
    previousStatus: 'Trạng thái cũ',
    newStatus: 'Trạng thái mới',
    reason: 'Lý do',
    amount: 'Số điểm',
    previousBalance: 'Số dư cũ',
    newBalance: 'Số dư mới',
    rewardId: 'Mã phần thưởng',
    redemptionId: 'Mã đổi quà',
    name: 'Tên',
    transactionId: 'Mã giao dịch',
    partnerProfileId: 'Mã hồ sơ đối tác',
    changes: 'Những thay đổi',
  };
  return dictionary[key] || key;
};
