// ── Mock Data for EcoHabit ────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  rank: 'bronze' | 'silver' | 'gold' | 'diamond';
  totalPoints: number;
  streak: number;
  achievements: number;
  kgRecycled: number;
}

export interface WasteCategory {
  id: number;
  label: string;
  type: 'recyclable' | 'organic' | 'hazardous' | 'general';
  icon: string;
  color: string;
  bg: string;
  points: number;
  disposalTip: string;
}

export interface ScanResult {
  id: string;
  label: string;
  category: WasteCategory;
  confidence: number;
  timestamp: string;
  pointsEarned: number;
}

export interface CollectionPoint {
  id: number;
  name: string;
  distance: string;
  address: string;
  types: string;
  open: boolean;
  lat: number;
  lng: number;
  hours: string;
  phone: string;
}

export interface WalletTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
  date: string;
  icon: string;
  category: string;
}

export interface Reward {
  id: number;
  name: string;
  points: number;
  category: string;
  tag: string;
  color: string;
  bg: string;
  icon: string;
  emoji: string;
  stock: number;
  hot: boolean;
  description: string;
}

export interface EcoTip {
  id: number;
  emoji: string;
  title: string;
  text: string;
  color: string;
}

// ── User ──────────────────────────────────────────────────────────────────────

export const mockUser: UserProfile = {
  id: 'u1',
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@gmail.com',
  avatar: '', // Use initials
  rank: 'bronze',
  totalPoints: 840,
  streak: 14,
  achievements: 7,
  kgRecycled: 12.4,
};

// ── Waste Categories ──────────────────────────────────────────────────────────

export const wasteCategories: WasteCategory[] = [
  { id: 1, label: 'Nhựa',      type: 'recyclable', icon: 'water-outline',      color: '#1565C0', bg: '#E3F2FD', points: 20, disposalTip: 'Rửa sạch và bỏ vào thùng tái chế màu xanh dương. Tháo nhãn nếu có thể.' },
  { id: 2, label: 'Giấy',      type: 'recyclable', icon: 'document-outline',   color: '#5D4037', bg: '#EFEBE9', points: 15, disposalTip: 'Giữ khô ráo, gấp gọn và bỏ vào thùng tái chế. Không tái chế giấy ướt hoặc bẩn.' },
  { id: 3, label: 'Kim loại',  type: 'recyclable', icon: 'hardware-chip',       color: '#546E7A', bg: '#ECEFF1', points: 25, disposalTip: 'Rửa sạch, ép dẹp lon nhôm. Bỏ vào thùng tái chế kim loại.' },
  { id: 4, label: 'Hữu cơ',    type: 'organic',    icon: 'leaf-outline',        color: '#2E7D32', bg: '#E8F5E9', points: 10, disposalTip: 'Bỏ vào thùng rác hữu cơ hoặc thùng compost. Có thể ủ làm phân bón.' },
  { id: 5, label: 'Thủy tinh', type: 'recyclable', icon: 'wine-outline',        color: '#00838F', bg: '#E0F7FA', points: 18, disposalTip: 'Tách riêng theo màu. Bỏ vào thùng tái chế thủy tinh. Cẩn thận mảnh vỡ.' },
  { id: 6, label: 'Pin',       type: 'hazardous',  icon: 'battery-half',        color: '#E65100', bg: '#FFF3E0', points: 30, disposalTip: 'KHÔNG vứt chung rác thải. Mang đến điểm thu gom pin chuyên dụng.' },
  { id: 7, label: 'Vải',       type: 'general',    icon: 'shirt-outline',       color: '#6A1B9A', bg: '#F3E5F5', points: 12, disposalTip: 'Quần áo còn tốt có thể quyên góp. Vải rách bỏ vào thùng rác thải chung.' },
  { id: 8, label: 'Điện tử',   type: 'hazardous',  icon: 'phone-portrait-outline', color: '#B71C1C', bg: '#FFEBEE', points: 35, disposalTip: 'Mang đến điểm thu gom rác điện tử. KHÔNG vứt chung rác thường.' },
];

// ── Scan History ──────────────────────────────────────────────────────────────

export const mockScanHistory: ScanResult[] = [
  { id: 's1', label: 'Chai nhựa PET',            category: wasteCategories[0], confidence: 0.95, timestamp: '2 phút trước',  pointsEarned: 20 },
  { id: 's2', label: 'Hộp giấy carton',          category: wasteCategories[1], confidence: 0.88, timestamp: '1 giờ trước',   pointsEarned: 15 },
  { id: 's3', label: 'Vỏ lon nhôm',              category: wasteCategories[2], confidence: 0.72, timestamp: '3 giờ trước',   pointsEarned: 25 },
  { id: 's4', label: 'Vỏ chuối',                 category: wasteCategories[3], confidence: 0.91, timestamp: 'Hôm qua',      pointsEarned: 10 },
  { id: 's5', label: 'Chai thủy tinh',           category: wasteCategories[4], confidence: 0.85, timestamp: 'Hôm qua',      pointsEarned: 18 },
];

// ── Collection Points ─────────────────────────────────────────────────────────

export const collectionPoints: CollectionPoint[] = [
  { id: 1, name: 'Điểm thu gom B1',     distance: '0.3 km', address: '12 Nguyễn Huệ, Q1',    types: 'Nhựa, Giấy',      open: true,  lat: 10.7769, lng: 106.7009, hours: '7:00 - 20:00', phone: '0901 234 567' },
  { id: 2, name: 'Trạm tái chế Xanh',   distance: '0.8 km', address: '45 Lê Lợi, Q1',         types: 'Tổng hợp',         open: true,  lat: 10.7740, lng: 106.6980, hours: '8:00 - 18:00', phone: '0902 345 678' },
  { id: 3, name: 'Điểm thu B3',         distance: '1.2 km', address: '78 Hai Bà Trưng, Q3',   types: 'Kim loại, Pin',    open: false, lat: 10.7800, lng: 106.6950, hours: '9:00 - 17:00', phone: '0903 456 789' },
  { id: 4, name: 'Siêu thị Ecomart',    distance: '1.5 km', address: '99 Đồng Khởi, Q1',      types: 'Nhựa, Thủy tinh', open: true,  lat: 10.7760, lng: 106.7030, hours: '8:00 - 22:00', phone: '0904 567 890' },
  { id: 5, name: 'Trường ĐH Khoa học',  distance: '2.1 km', address: '227 Nguyễn Văn Cừ, Q5', types: 'Giấy, Hữu cơ',    open: true,  lat: 10.7620, lng: 106.6820, hours: '7:30 - 17:30', phone: '0905 678 901' },
];

// ── Wallet Transactions ───────────────────────────────────────────────────────

export const mockTransactions: WalletTransaction[] = [
  { id: 't1', type: 'earn',  amount: 20,  description: 'Quét rác nhựa',        date: '12/04/2026 10:32', icon: 'scan',     category: 'scan' },
  { id: 't2', type: 'earn',  amount: 50,  description: 'Giao rác tại điểm B3', date: '12/04/2026 09:15', icon: 'location', category: 'delivery' },
  { id: 't3', type: 'spend', amount: 200, description: 'Đổi túi vải tái chế',  date: '11/04/2026 14:20', icon: 'gift',     category: 'redeem' },
  { id: 't4', type: 'earn',  amount: 30,  description: 'Huy hiệu "Người xanh"', date: '10/04/2026 08:00', icon: 'ribbon',  category: 'achievement' },
  { id: 't5', type: 'earn',  amount: 15,  description: 'Quét giấy carton',     date: '09/04/2026 16:45', icon: 'scan',     category: 'scan' },
  { id: 't6', type: 'spend', amount: 150, description: 'Voucher Cafe xanh 50K', date: '08/04/2026 11:30', icon: 'ticket',  category: 'redeem' },
  { id: 't7', type: 'earn',  amount: 25,  description: 'Quét vỏ lon nhôm',     date: '07/04/2026 13:20', icon: 'scan',     category: 'scan' },
  { id: 't8', type: 'earn',  amount: 100, description: 'Hoàn thành thử thách', date: '06/04/2026 10:00', icon: 'trophy',   category: 'challenge' },
];

// ── Rewards ───────────────────────────────────────────────────────────────────

export const mockRewards: Reward[] = [
  { id: 1, name: 'Túi vải tái chế EcoHabit', points: 200, category: 'Mua sắm', tag: '🔥 Hot', color: '#1565C0', bg: '#E3F2FD', icon: 'bag-outline',     emoji: '🛍️', stock: 48,  hot: true,  description: 'Túi vải canvas cao cấp, thân thiện môi trường' },
  { id: 2, name: 'Bình nước thép không gỉ',   points: 450, category: 'Mua sắm', tag: 'Mới',  color: '#00838F', bg: '#E0F7FA', icon: 'cafe-outline',    emoji: '🧴', stock: 22,  hot: false, description: 'Bình giữ nhiệt 500ml, không chứa BPA' },
  { id: 3, name: 'Voucher Cafe xanh 50K',      points: 150, category: 'Ăn uống', tag: '',     color: '#E65100', bg: '#FFF3E0', icon: 'ticket-outline',  emoji: '☕', stock: 100, hot: false, description: 'Giảm giá 50K tại hệ thống Cafe Xanh toàn quốc' },
  { id: 4, name: 'Hạt giống rau hữu cơ',       points: 80,  category: 'Cây trồng', tag: '',  color: '#2E7D32', bg: '#E8F5E9', icon: 'leaf-outline',    emoji: '🌱', stock: 200, hot: false, description: 'Bộ hạt giống rau sạch, dễ trồng tại nhà' },
  { id: 5, name: 'Khóa học tái chế online',    points: 300, category: 'Giáo dục', tag: 'VIP', color: '#6A1B9A', bg: '#F3E5F5', icon: 'school-outline',  emoji: '📚', stock: 999, hot: false, description: 'Khóa học 4 tuần về tái chế và sống xanh' },
  { id: 6, name: 'Mũ vải EcoHabit',            points: 350, category: 'Mua sắm', tag: '',    color: '#F57F17', bg: '#FFF8E1', icon: 'pricetag-outline', emoji: '🧢', stock: 30,  hot: false, description: 'Mũ lưỡi trai phiên bản giới hạn EcoHabit' },
];

// ── Eco Tips ──────────────────────────────────────────────────────────────────

export const ecoTips: EcoTip[] = [
  { id: 1, emoji: '♻️', title: 'Phân loại rác', text: 'Phân loại rác trước khi vứt giúp tái chế hiệu quả hơn 60%.', color: '#1565C0' },
  { id: 2, emoji: '🌊', title: 'Túi vải thay túi nilon', text: 'Dùng túi vải thay túi nilon — mỗi túi vải thay thế 700 túi nhựa.', color: '#00838F' },
  { id: 3, emoji: '🌱', title: 'Trồng cây', text: 'Trồng 1 cây xanh hấp thụ 21 kg CO₂ mỗi năm.', color: '#2E7D32' },
  { id: 4, emoji: '💧', title: 'Tiết kiệm nước', text: 'Tắt vòi khi đánh răng tiết kiệm 8 lít nước mỗi lần.', color: '#1565C0' },
  { id: 5, emoji: '🔋', title: 'Pin cũ nguy hiểm', text: '1 viên pin có thể ô nhiễm 500 lít nước. Hãy tái chế đúng cách.', color: '#E65100' },
];

// ── Rank Config ───────────────────────────────────────────────────────────────

export const rankConfig = {
  bronze:  { emoji: '🥉', label: 'Đồng',     next: 'Bạc',     nextPoints: 1000 },
  silver:  { emoji: '🥈', label: 'Bạc',      next: 'Vàng',    nextPoints: 2500 },
  gold:    { emoji: '🥇', label: 'Vàng',     next: 'Kim cương', nextPoints: 5000 },
  diamond: { emoji: '💎', label: 'Kim cương', next: null,      nextPoints: null },
};
