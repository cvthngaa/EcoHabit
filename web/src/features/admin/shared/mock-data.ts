export const adminMetrics = [
  { label: 'Người dùng', value: '12,480', change: '+8.4%', tone: 'blue' },
  { label: 'Đối tác', value: '86', change: '+6 mới', tone: 'emerald' },
  { label: 'Rác thu gom', value: '42.8 tấn', change: '+12.7%', tone: 'teal' },
  { label: 'Cần xử lý', value: '37', change: 'ưu tiên cao', tone: 'amber' },
];

export const collectionTrend = [
  { label: 'T2', kg: 820, scans: 190 },
  { label: 'T3', kg: 1040, scans: 246 },
  { label: 'T4', kg: 960, scans: 228 },
  { label: 'T5', kg: 1280, scans: 301 },
  { label: 'T6', kg: 1510, scans: 342 },
  { label: 'T7', kg: 1380, scans: 318 },
  { label: 'CN', kg: 1130, scans: 284 },
];

export const wasteBreakdown = [
  { label: 'Nhựa', value: 38, color: 'bg-emerald-500' },
  { label: 'Giấy', value: 24, color: 'bg-amber-500' },
  { label: 'Kim loại', value: 14, color: 'bg-blue-500' },
  { label: 'Thủy tinh', value: 12, color: 'bg-indigo-500' },
  { label: 'Pin/điện tử', value: 7, color: 'bg-rose-500' },
  { label: 'Khác', value: 5, color: 'bg-slate-400' },
];

export const adminTasks = [
  { title: 'Duyệt 6 đối tác mới', description: 'Hồ sơ đã đủ giấy phép nhưng chưa được kích hoạt.', level: 'urgent' },
  { title: '12 giao dịch nghi vấn', description: 'QR lặp hoặc GPS lệch quá xa điểm thu gom.', level: 'danger' },
  { title: '9 lượt AI confidence thấp', description: 'Cần kiểm duyệt nhãn rác trước khi dùng huấn luyện lại.', level: 'warning' },
  { title: '4 voucher sắp hết hàng', description: 'Cân nhắc tạm ẩn hoặc bổ sung tồn kho.', level: 'info' },
];

export const users = [
  { id: 'U-1001', name: 'Nguyễn Minh Anh', email: 'minhanh@example.com', points: 1280, scans: 48, status: 'ACTIVE', joined: '18/05/2026' },
  { id: 'U-1002', name: 'Trần Quốc Bảo', email: 'quocbao@example.com', points: 340, scans: 12, status: 'WATCHLIST', joined: '17/05/2026' },
  { id: 'U-1003', name: 'Lê Hoàng Yến', email: 'yen.le@example.com', points: 2210, scans: 76, status: 'ACTIVE', joined: '15/05/2026' },
  { id: 'U-1004', name: 'Phạm Gia Hân', email: 'giahan@example.com', points: 0, scans: 2, status: 'SUSPENDED', joined: '12/05/2026' },
  { id: 'U-1005', name: 'Đỗ Thanh Tùng', email: 'tung.do@example.com', points: 890, scans: 31, status: 'ACTIVE', joined: '08/05/2026' },
];

export const partners = [
  { id: 'P-201', name: 'Green Loop VN', contact: 'Mai Linh', locations: 8, rewards: 12, status: 'APPROVED', submitted: '20/05/2026' },
  { id: 'P-202', name: 'Nhựa Sạch Sài Gòn', contact: 'Minh Đức', locations: 3, rewards: 4, status: 'PENDING', submitted: '21/05/2026' },
  { id: 'P-203', name: 'EcoMart Rewards', contact: 'Hồng Nhung', locations: 0, rewards: 18, status: 'APPROVED', submitted: '14/05/2026' },
  { id: 'P-204', name: 'Tái Chế Bình An', contact: 'Quốc Huy', locations: 1, rewards: 0, status: 'REJECTED', submitted: '11/05/2026' },
];

export const locations = [
  { id: 'L-310', name: 'Trạm Quận 1 - Nguyễn Huệ', partner: 'Green Loop VN', type: 'CENTER', kg: 3820, transactions: 412, status: 'APPROVED' },
  { id: 'L-311', name: 'Máy thu gom Vincom Đồng Khởi', partner: 'Green Loop VN', type: 'MACHINE', kg: 2140, transactions: 266, status: 'APPROVED' },
  { id: 'L-312', name: 'Điểm thu gom Phú Nhuận', partner: 'Nhựa Sạch Sài Gòn', type: 'COUNTER', kg: 0, transactions: 0, status: 'PENDING' },
  { id: 'L-313', name: 'Thùng pin Trường Sơn', partner: 'Tái Chế Bình An', type: 'BIN', kg: 180, transactions: 34, status: 'INACTIVE' },
];

export const transactions = [
  { id: 'TX-9001', user: 'Nguyễn Minh Anh', location: 'Trạm Quận 1 - Nguyễn Huệ', waste: 'Nhựa', amount: '2.4 kg', points: 72, risk: 'LOW', status: 'VERIFIED' },
  { id: 'TX-9002', user: 'Trần Quốc Bảo', location: 'Máy thu gom Vincom Đồng Khởi', waste: 'Giấy', amount: '8.8 kg', points: 0, risk: 'HIGH', status: 'PENDING' },
  { id: 'TX-9003', user: 'Lê Hoàng Yến', location: 'Trạm Quận 1 - Nguyễn Huệ', waste: 'Kim loại', amount: '1.1 kg', points: 44, risk: 'LOW', status: 'VERIFIED' },
  { id: 'TX-9004', user: 'Phạm Gia Hân', location: 'Thùng pin Trường Sơn', waste: 'Pin', amount: '0.3 kg', points: 0, risk: 'MEDIUM', status: 'REJECTED' },
];

export const rewards = [
  { id: 'R-501', name: 'Voucher Highlands 30K', partner: 'EcoMart Rewards', stock: 42, redeemed: 318, cost: 450, status: 'ACTIVE' },
  { id: 'R-502', name: 'Túi canvas EcoHabit', partner: 'Green Loop VN', stock: 7, redeemed: 126, cost: 720, status: 'LOW_STOCK' },
  { id: 'R-503', name: 'Mã giảm giá siêu thị 10%', partner: 'EcoMart Rewards', stock: 0, redeemed: 600, cost: 300, status: 'OUT_OF_STOCK' },
  { id: 'R-504', name: 'Bình nước tái chế', partner: 'Green Loop VN', stock: 28, redeemed: 94, cost: 1100, status: 'ACTIVE' },
];

export const pointRules = [
  { source: 'Gửi rác nhựa', rate: '30 điểm / kg', limit: '5 kg/ngày', status: 'ACTIVE' },
  { source: 'Gửi pin/điện tử', rate: '120 điểm / kg', limit: '2 kg/tuần', status: 'ACTIVE' },
  { source: 'Quiz hằng ngày', rate: '20 điểm / lượt đúng', limit: '1 lượt/ngày', status: 'ACTIVE' },
  { source: 'Scan AI phân loại', rate: '5 điểm / ảnh hợp lệ', limit: '10 ảnh/ngày', status: 'PAUSED' },
];

export const fraudAlerts = [
  { id: 'F-71', user: 'Trần Quốc Bảo', reason: 'QR được dùng 4 lần trong 9 phút', severity: 'HIGH', status: 'OPEN' },
  { id: 'F-72', user: 'Phạm Gia Hân', reason: 'GPS lệch 1.8 km so với điểm thu gom', severity: 'MEDIUM', status: 'REVIEWING' },
  { id: 'F-73', user: 'Ẩn danh', reason: 'Khối lượng giao dịch tăng bất thường', severity: 'LOW', status: 'CLOSED' },
  { id: 'F-74', user: 'Đỗ Thanh Tùng', reason: 'Nhiều tài khoản đổi voucher cùng thiết bị', severity: 'HIGH', status: 'OPEN' },
];

export const aiReviews = [
  { id: 'AI-401', image: 'plastic-bottle.jpg', predicted: 'Nhựa', confidence: 0.92, feedback: 'Đúng', status: 'APPROVED' },
  { id: 'AI-402', image: 'battery-pack.jpg', predicted: 'Kim loại', confidence: 0.54, feedback: 'Sai, là pin', status: 'NEEDS_REVIEW' },
  { id: 'AI-403', image: 'paper-cup.jpg', predicted: 'Giấy', confidence: 0.68, feedback: 'Không chắc', status: 'NEEDS_REVIEW' },
  { id: 'AI-404', image: 'glass-jar.jpg', predicted: 'Thủy tinh', confidence: 0.88, feedback: 'Đúng', status: 'APPROVED' },
];

export const auditLogs = [
  { id: 'A-810', actor: 'admin@ecohabit.vn', action: 'APPROVE_PARTNER', target: 'Nhựa Sạch Sài Gòn', time: '23/05/2026 09:12' },
  { id: 'A-811', actor: 'admin@ecohabit.vn', action: 'REJECT_TRANSACTION', target: 'TX-9004', time: '23/05/2026 09:30' },
  { id: 'A-812', actor: 'ops@ecohabit.vn', action: 'UPDATE_POINT_RULE', target: 'Gửi pin/điện tử', time: '23/05/2026 10:05' },
  { id: 'A-813', actor: 'ops@ecohabit.vn', action: 'PAUSE_REWARD', target: 'Mã giảm giá siêu thị 10%', time: '23/05/2026 10:42' },
];

export const forumReports = [
  { id: 'FR-21', post: 'Cách phân loại hộp sữa?', reporter: '3 báo cáo', reason: 'Thông tin gây nhầm lẫn', status: 'OPEN' },
  { id: 'FR-22', post: 'Điểm thu gom bị đầy', reporter: '1 báo cáo', reason: 'Cần xác minh', status: 'REVIEWING' },
  { id: 'FR-23', post: 'Mẹo tái chế chai nhựa', reporter: '2 báo cáo', reason: 'Spam link', status: 'CLOSED' },
];

export const quizQuestions = [
  { id: 'Q-01', topic: 'Phân loại nhựa', question: 'Chai PET nên bỏ vào nhóm nào?', correctRate: 86, status: 'ACTIVE' },
  { id: 'Q-02', topic: 'Rác nguy hại', question: 'Pin cũ có nên bỏ cùng rác sinh hoạt?', correctRate: 71, status: 'ACTIVE' },
  { id: 'Q-03', topic: 'Tái chế giấy', question: 'Giấy dính dầu mỡ có tái chế được không?', correctRate: 52, status: 'DRAFT' },
];

export const systemSettings = [
  { key: 'Giới hạn giao dịch/ngày', value: '8 giao dịch', scope: 'Chống gian lận' },
  { key: 'Bán kính GPS hợp lệ', value: '150 mét', scope: 'Xác thực thu gom' },
  { key: 'Confidence AI cần duyệt', value: '< 70%', scope: 'AI Review' },
  { key: 'Thời hạn OTP', value: '5 phút', scope: 'Bảo mật' },
];
