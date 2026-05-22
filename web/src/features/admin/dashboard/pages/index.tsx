import React from 'react';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Gift,
  MapPin,
  QrCode,
  ShieldAlert,
  Store,
  Ticket,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import {
  AdminPageHeader,
  AdminSection,
  AdminStatCard,
  ProgressBar,
  StatusPill,
} from '../../shared/admin-ui';

const kpis = [
  { label: 'Tổng người dùng', value: '12,480', change: '+8.4%', tone: 'blue' },
  { label: 'Tổng đối tác', value: '86', change: '+6 mới', tone: 'emerald' },
  { label: 'Tổng rác đã thu gom', value: '42.8 tấn', change: '+12.7%', tone: 'teal' },
  { label: 'Cần xử lý', value: '37', change: 'ưu tiên', tone: 'amber' },
];

const taskQueue = [
  { label: 'Đối tác chờ duyệt', count: 9, icon: Store, level: 'PENDING' },
  { label: 'Điểm thu gom chờ duyệt', count: 14, icon: MapPin, level: 'PENDING' },
  { label: 'Giao dịch thu gom nghi vấn', count: 12, icon: ShieldAlert, level: 'HIGH' },
  { label: 'AI confidence thấp', count: 39, icon: Bot, level: 'NEEDS_REVIEW' },
  { label: 'User bị cảnh báo gian lận', count: 18, icon: Users, level: 'OPEN' },
  { label: 'Voucher sắp hết hàng/hết hạn', count: 7, icon: Gift, level: 'LOW_STOCK' },
  { label: 'Báo cáo forum chưa xử lý', count: 6, icon: AlertTriangle, level: 'OPEN' },
];

const dailyWaste = [
  { label: 'T2', plastic: 280, paper: 160, metal: 90, glass: 80, battery: 28, other: 42 },
  { label: 'T3', plastic: 340, paper: 220, metal: 120, glass: 110, battery: 34, other: 56 },
  { label: 'T4', plastic: 310, paper: 210, metal: 96, glass: 124, battery: 42, other: 38 },
  { label: 'T5', plastic: 430, paper: 260, metal: 150, glass: 140, battery: 58, other: 72 },
  { label: 'T6', plastic: 520, paper: 310, metal: 180, glass: 160, battery: 74, other: 86 },
  { label: 'T7', plastic: 460, paper: 280, metal: 170, glass: 150, battery: 66, other: 76 },
  { label: 'CN', plastic: 370, paper: 250, metal: 130, glass: 120, battery: 48, other: 62 },
];

const wasteKeys = [
  { key: 'plastic', label: 'Nhựa', color: '#10b981', className: 'bg-emerald-500' },
  { key: 'paper', label: 'Giấy', color: '#f59e0b', className: 'bg-amber-500' },
  { key: 'metal', label: 'Kim loại', color: '#3b82f6', className: 'bg-blue-500' },
  { key: 'glass', label: 'Thủy tinh', color: '#6366f1', className: 'bg-indigo-500' },
  { key: 'battery', label: 'Pin/điện tử', color: '#ef4444', className: 'bg-rose-500' },
  { key: 'other', label: 'Khác', color: '#94a3b8', className: 'bg-slate-400' },
] as const;

const wasteShare = [
  { label: 'Nhựa', value: 38, color: '#10b981' },
  { label: 'Giấy', value: 24, color: '#f59e0b' },
  { label: 'Kim loại', value: 14, color: '#3b82f6' },
  { label: 'Thủy tinh', value: 12, color: '#6366f1' },
  { label: 'Pin/điện tử', value: 7, color: '#ef4444' },
  { label: 'Khác', value: 5, color: '#94a3b8' },
];

const systemTrend = [
  { label: 'T2', users: 92, scans: 190, transactions: 140, points: 26 },
  { label: 'T3', users: 118, scans: 246, transactions: 186, points: 34 },
  { label: 'T4', users: 104, scans: 228, transactions: 172, points: 31 },
  { label: 'T5', users: 132, scans: 301, transactions: 224, points: 41 },
  { label: 'T6', users: 156, scans: 342, transactions: 260, points: 47 },
  { label: 'T7', users: 141, scans: 318, transactions: 238, points: 44 },
  { label: 'CN', users: 126, scans: 284, transactions: 210, points: 39 },
];

const cumulativeGrowth = [
  { label: 'T1', kg: 18, points: 940, users: 8400 },
  { label: 'T2', kg: 22, points: 1180, users: 9100 },
  { label: 'T3', kg: 27, points: 1460, users: 9800 },
  { label: 'T4', kg: 33, points: 1860, users: 10700 },
  { label: 'T5', kg: 42.8, points: 2800, users: 12480 },
];

const rankingLocations = [
  { label: 'Trạm Quận 1 - Nguyễn Huệ', value: 3820 },
  { label: 'Máy Vincom Đồng Khởi', value: 2140 },
  { label: 'Điểm Phú Nhuận', value: 1680 },
  { label: 'Thùng pin Trường Sơn', value: 980 },
  { label: 'Trạm Quận 7', value: 840 },
];

const rankingPartners = [
  { label: 'Green Loop VN', value: 1420 },
  { label: 'EcoMart Rewards', value: 1180 },
  { label: 'Nhựa Sạch Sài Gòn', value: 860 },
  { label: 'Tái Chế Bình An', value: 540 },
  { label: 'Urban Refill', value: 430 },
];

const rankingUsers = [
  { label: 'Lê Hoàng Yến', value: 76 },
  { label: 'Nguyễn Minh Anh', value: 48 },
  { label: 'Đỗ Thanh Tùng', value: 31 },
  { label: 'Trần Quốc Bảo', value: 12 },
  { label: 'Phạm Gia Hân', value: 2 },
];

const rankingVouchers = [
  { label: 'Voucher Highlands 30K', value: 318 },
  { label: 'Mã giảm giá siêu thị 10%', value: 600 },
  { label: 'Túi canvas EcoHabit', value: 126 },
  { label: 'Bình nước tái chế', value: 94 },
  { label: 'Voucher trà sữa 20K', value: 88 },
];

const voucherStats = [
  { label: 'Voucher được đổi nhiều nhất', value: '600 lượt', icon: Ticket },
  { label: 'Voucher sắp hết hàng', value: '7 mã', icon: AlertTriangle },
  { label: 'Voucher sắp hết hạn', value: '4 mã', icon: Gift },
  { label: 'Tỷ lệ đổi thành công', value: '92.4%', icon: CheckCircle2 },
  { label: 'Điểm đã tiêu cho quà', value: '1.1M', icon: Trophy },
];

const pointSources = [
  { label: 'Gửi rác', value: 58, color: 'bg-emerald-500' },
  { label: 'Scan AI', value: 18, color: 'bg-indigo-500' },
  { label: 'Quiz', value: 15, color: 'bg-blue-500' },
  { label: 'Admin', value: 9, color: 'bg-slate-500' },
];

const progressGoals = [
  { label: 'Mục tiêu thu gom tháng', value: 78, helper: '42.8 / 55 tấn' },
  { label: 'Giao dịch đã xử lý', value: 91, helper: '349 / 384 hôm nay' },
  { label: 'Voucher đã đổi', value: 64, helper: '8,420 lượt đổi' },
  { label: 'Điểm thu gom hoạt động', value: 80, helper: '102 / 128 điểm' },
];

const aiFraudSignals = [
  { label: 'Số lượt scan AI', value: '18,420', helper: '+9% tuần này', icon: Bot },
  { label: 'Tỷ lệ đúng theo feedback', value: '87.6%', helper: '1,240 feedback', icon: CheckCircle2 },
  { label: 'Ảnh confidence thấp', value: '39', helper: 'cần kiểm duyệt', icon: AlertTriangle },
  { label: 'QR bị dùng lặp', value: '12', helper: 'rủi ro cao', icon: QrCode },
  { label: 'Check-in sai GPS', value: '7', helper: '>150m', icon: MapPin },
  { label: 'Khối lượng bất thường', value: '5', helper: 'vượt ngưỡng', icon: ShieldAlert },
];

const heatmap = [
  [12, 18, 24, 26, 30, 42, 28],
  [9, 14, 22, 24, 36, 55, 31],
  [6, 12, 19, 33, 41, 64, 38],
  [8, 16, 28, 39, 46, 58, 36],
];

const format = (value: number) => value.toLocaleString('vi-VN');

const SparkLine = ({
  data,
  lines,
}: {
  data: typeof systemTrend;
  lines: Array<{ key: keyof (typeof systemTrend)[number]; color: string; label: string }>;
}) => {
  const width = 560;
  const height = 220;
  const padding = 28;
  const maxValue = Math.max(...lines.flatMap((line) => data.map((item) => Number(item[line.key]))));

  const pointsFor = (key: keyof (typeof systemTrend)[number]) =>
    data
      .map((item, index) => {
        const x = padding + (index / (data.length - 1)) * (width - padding * 2);
        const y = height - padding - (Number(item[key]) / maxValue) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full">
        {[0, 1, 2, 3].map((line) => (
          <line
            key={line}
            x1={padding}
            x2={width - padding}
            y1={padding + line * 48}
            y2={padding + line * 48}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}
        {lines.map((line) => (
          <polyline
            key={String(line.key)}
            points={pointsFor(line.key)}
            fill="none"
            stroke={line.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <div className="flex flex-wrap gap-3">
        {lines.map((line) => (
          <span key={String(line.key)} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: line.color }} />
            {line.label}
          </span>
        ))}
      </div>
    </div>
  );
};

const AreaChart = ({ data }: { data: typeof cumulativeGrowth }) => {
  const width = 520;
  const height = 180;
  const padding = 20;
  const maxValue = Math.max(...data.map((item) => item.kg));
  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - (item.kg / maxValue) * (height - padding * 2);
    return { x, y };
  });
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ');
  const areaPoints = `${padding},${height - padding} ${linePoints} ${width - padding},${height - padding}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full">
      <polygon points={areaPoints} fill="#d1fae5" />
      <polyline points={linePoints} fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
      {points.map((point, index) => (
        <circle key={data[index].label} cx={point.x} cy={point.y} r="4" fill="#047857" />
      ))}
    </svg>
  );
};

const DonutChart = ({ data }: { data: typeof wasteShare }) => {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-[180px_1fr] md:items-center">
      <div className="relative h-44 w-44">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="16" />
          {data.map((item) => {
            const dash = (item.value / 100) * circumference;
            const segment = (
              <circle
                key={item.label}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="16"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return segment;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-slate-900">100%</span>
          <span className="text-xs font-semibold text-slate-500">loại rác</span>
        </div>
      </div>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-2 font-semibold text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
            <span className="font-bold text-slate-900">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StackedWasteChart = () => {
  const maxTotal = Math.max(
    ...dailyWaste.map((day) => wasteKeys.reduce((sum, waste) => sum + Number(day[waste.key]), 0))
  );

  return (
    <div>
      <div className="flex h-72 items-end gap-3 overflow-x-auto pb-2">
        {dailyWaste.map((day) => {
          const total = wasteKeys.reduce((sum, waste) => sum + Number(day[waste.key]), 0);
          return (
            <div key={day.label} className="flex min-w-14 flex-1 flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-500">{format(total)} kg</span>
              <div
                className="flex w-full flex-col-reverse overflow-hidden rounded-t-lg bg-slate-100"
                style={{ height: `${Math.max((total / maxTotal) * 210, 24)}px` }}
              >
                {wasteKeys.map((waste) => (
                  <div
                    key={waste.key}
                    className={waste.className}
                    style={{ height: `${(Number(day[waste.key]) / total) * 100}%` }}
                    title={`${waste.label}: ${day[waste.key]} kg`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-500">{day.label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        {wasteKeys.map((waste) => (
          <span key={waste.key} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className={`h-2.5 w-2.5 rounded-full ${waste.className}`} />
            {waste.label}
          </span>
        ))}
      </div>
    </div>
  );
};

const HorizontalRanking = ({
  title,
  data,
  suffix,
}: {
  title: string;
  data: Array<{ label: string; value: number }>;
  suffix: string;
}) => {
  const maxValue = Math.max(...data.map((item) => item.value));
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {data.map((item, index) => (
        <div key={item.label} className="grid grid-cols-[1fr_auto] items-center gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                {index + 1}
              </span>
              <span className="truncate text-sm font-semibold text-slate-700">{item.label}</span>
            </div>
            <ProgressBar value={(item.value / maxValue) * 100} color="bg-slate-900" />
          </div>
          <span className="text-sm font-bold text-slate-900">{format(item.value)} {suffix}</span>
        </div>
      ))}
    </div>
  );
};

const GaugeCard = ({ label, value, helper }: { label: string; value: number; helper: string }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
    <div className="mb-3 flex items-center justify-between">
      <span className="text-sm font-bold text-slate-800">{label}</span>
      <span className="text-lg font-extrabold text-slate-900">{value}%</span>
    </div>
    <ProgressBar value={value} color={value >= 85 ? 'bg-emerald-500' : value >= 70 ? 'bg-blue-500' : 'bg-amber-500'} />
    <p className="mt-2 text-xs font-medium text-slate-500">{helper}</p>
  </div>
);

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin Dashboard"
        title="Tổng quan hệ thống"
        description="Theo dõi toàn bộ EcoHabit: người dùng, đối tác, điểm thu gom, giao dịch, điểm thưởng, voucher, AI và chống gian lận bằng dữ liệu mock."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((metric) => (
          <AdminStatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <AdminSection title="Việc cần xử lý">
          <div className="space-y-3">
            {taskQueue.map((task) => (
              <div key={task.label} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 ring-1 ring-slate-200">
                    <task.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">{task.label}</p>
                    <p className="text-xs text-slate-500">{task.count} mục đang chờ</p>
                  </div>
                </div>
                <StatusPill status={task.level} />
              </div>
            ))}
          </div>
        </AdminSection>

        <AdminSection title="Gauge / Progress mục tiêu">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {progressGoals.map((goal) => (
              <GaugeCard key={goal.label} {...goal} />
            ))}
          </div>
        </AdminSection>

        <AdminSection title="Heatmap hoạt động">
          <div className="space-y-3">
            <div className="grid grid-cols-7 gap-1.5">
              {heatmap.flatMap((row, rowIndex) =>
                row.map((value, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="aspect-square rounded-md"
                    title={`${value} hoạt động`}
                    style={{ backgroundColor: `rgba(15, 23, 42, ${0.12 + value / 90})` }}
                  />
                ))
              )}
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Thấp</span>
              <span>Cao</span>
            </div>
            <p className="text-sm text-slate-500">Mật độ hoạt động theo giờ/ngày trong tuần, dùng để phát hiện giờ cao điểm và bất thường.</p>
          </div>
        </AdminSection>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <AdminSection title="Stacked Bar Chart - Kg rác theo ngày và loại rác">
            <StackedWasteChart />
          </AdminSection>
        </div>
        <div className="xl:col-span-2">
          <AdminSection title="Donut Chart - Tỷ lệ loại rác">
            <DonutChart data={wasteShare} />
          </AdminSection>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AdminSection title="Line Chart - Người dùng, scan AI, giao dịch">
          <SparkLine
            data={systemTrend}
            lines={[
              { key: 'users', color: '#2563eb', label: 'Người dùng mới' },
              { key: 'scans', color: '#7c3aed', label: 'Scan AI' },
              { key: 'transactions', color: '#059669', label: 'Giao dịch' },
            ]}
          />
        </AdminSection>

        <AdminSection title="Area Chart - Tăng trưởng tích lũy">
          <AreaChart data={cumulativeGrowth} />
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-xs font-semibold text-emerald-700">Rác tích lũy</p>
              <p className="mt-1 text-lg font-extrabold text-emerald-900">42.8 tấn</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3">
              <p className="text-xs font-semibold text-blue-700">Điểm đã cấp</p>
              <p className="mt-1 text-lg font-extrabold text-blue-900">2.8M</p>
            </div>
            <div className="rounded-xl bg-slate-100 p-3">
              <p className="text-xs font-semibold text-slate-600">Người dùng</p>
              <p className="mt-1 text-lg font-extrabold text-slate-900">12.4K</p>
            </div>
          </div>
        </AdminSection>
      </div>

      <AdminSection title="Horizontal Bar Chart - Bảng xếp hạng">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <HorizontalRanking title="Top 5 điểm thu gom" data={rankingLocations} suffix="kg" />
          <HorizontalRanking title="Top 5 đối tác" data={rankingPartners} suffix="GD" />
          <HorizontalRanking title="Top 5 voucher" data={rankingVouchers} suffix="lượt" />
          <HorizontalRanking title="Top user tích cực" data={rankingUsers} suffix="scan" />
        </div>
      </AdminSection>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AdminSection title="Người dùng & điểm thưởng">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Nguồn phát sinh điểm</h3>
              {pointSources.map((source) => (
                <div key={source.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-semibold text-slate-700">{source.label}</span>
                    <span className="font-bold text-slate-900">{source.value}%</span>
                  </div>
                  <ProgressBar value={source.value} color={source.color} />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Hành vi bất thường</h3>
              {['Scan quá nhiều trong ngày', 'Đổi quà nhiều tài khoản cùng thiết bị', 'Check-in xa điểm thu gom'].map((item, index) => (
                <div key={item} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span className="text-sm font-semibold text-slate-700">{item}</span>
                  <StatusPill status={index === 0 ? 'MEDIUM' : 'HIGH'} />
                </div>
              ))}
            </div>
          </div>
        </AdminSection>

        <AdminSection title="Quà tặng / Voucher">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {voucherStats.map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 ring-1 ring-slate-200">
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                  <p className="text-base font-extrabold text-slate-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </AdminSection>
      </div>

      <AdminSection title="AI & Chống gian lận">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {aiFraudSignals.map((signal) => (
            <div key={signal.label} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-700 ring-1 ring-slate-200">
                  <signal.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{signal.label}</p>
                  <p className="text-xs text-slate-500">{signal.helper}</p>
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{signal.value}</p>
            </div>
          ))}
        </div>
      </AdminSection>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-amber-500" />
            <div>
              <p className="font-bold text-slate-900">Dashboard này đang dùng mock data</p>
              <p className="text-sm text-slate-500">Các chart đã sẵn layout để sau này nối API admin thật.</p>
            </div>
          </div>
          <StatusPill status="ACTIVE" label="Demo mode" />
        </div>
      </div>
    </div>
  );
};
