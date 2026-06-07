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
  Loader2,
} from 'lucide-react';
import {
  AdminPageHeader,
  AdminSection,
  AdminStatCard,
  ProgressBar,
  StatusPill,
} from '../../shared/admin-ui';
import { useAdminDashboardStats } from '../services/queries';

const IconMap: Record<string, React.FC<any>> = {
  Store,
  MapPin,
  ShieldAlert,
  Bot,
  Users,
  Gift,
  AlertTriangle,
  Ticket,
  CheckCircle2,
  Trophy,
};

const wasteKeys = [
  { key: 'plastic', label: 'Nhựa', color: '#10b981', className: 'bg-emerald-500' },
  { key: 'paper', label: 'Giấy', color: '#f59e0b', className: 'bg-amber-500' },
  { key: 'metal', label: 'Kim loại', color: '#3b82f6', className: 'bg-blue-500' },
  { key: 'glass', label: 'Thủy tinh', color: '#6366f1', className: 'bg-indigo-500' },
  { key: 'battery', label: 'Pin/điện tử', color: '#ef4444', className: 'bg-rose-500' },
  { key: 'other', label: 'Khác', color: '#94a3b8', className: 'bg-slate-400' },
] as const;

const format = (value: number) => value.toLocaleString('vi-VN');

const SparkLine = ({
  data,
  lines,
}: {
  data: any[];
  lines: Array<{ key: string; color: string; label: string }>;
}) => {
  const width = 560;
  const height = 220;
  const padding = 28;
  const maxValue = Math.max(...lines.flatMap((line) => data.map((item) => Number(item[line.key]))), 1);

  const pointsFor = (key: string) =>
    data
      .map((item, index) => {
        const x = padding + (index / (Math.max(data.length - 1, 1))) * (width - padding * 2);
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
        {data.length > 0 && lines.map((line) => (
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
      {data.length === 0 && (
        <div className="text-center text-sm text-slate-500 -mt-32 mb-32">Chưa có dữ liệu thống kê</div>
      )}
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

const AreaChart = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) {
    return <div className="h-52 w-full flex items-center justify-center text-sm text-slate-500">Chưa có dữ liệu tăng trưởng</div>;
  }
  
  const width = 520;
  const height = 180;
  const padding = 20;
  const maxValue = Math.max(...data.map((item) => item.kg || 1), 1);
  const points = data.map((item, index) => {
    const x = padding + (index / (Math.max(data.length - 1, 1))) * (width - padding * 2);
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
        <circle key={data[index].label || index} cx={point.x} cy={point.y} r="4" fill="#047857" />
      ))}
    </svg>
  );
};

const DonutChart = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0 || data.every(d => !d.value)) {
    return <div className="flex h-44 items-center justify-center text-sm text-slate-500">Chưa có dữ liệu rác</div>;
  }

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const total = Math.max(data.reduce((sum, item) => sum + (item.value || 0), 0), 1);

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-[180px_1fr] md:items-center">
      <div className="relative h-44 w-44">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="16" />
          {data.map((item) => {
            const percentage = (item.value || 0) / total;
            const dash = percentage * circumference;
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
        {data.map((item) => {
          const pct = total > 1 ? Math.round(((item.value || 0) / total) * 100) : item.value;
          return (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2 font-semibold text-slate-700">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
              <span className="font-bold text-slate-900">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StackedWasteChart = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) {
    return <div className="flex h-72 items-center justify-center text-sm text-slate-500">Chưa có dữ liệu</div>;
  }

  const maxTotal = Math.max(
    ...data.map((day) => wasteKeys.reduce((sum, waste) => sum + Number(day[waste.key] || 0), 0)),
    1 // prevent division by zero
  );

  return (
    <div>
      <div className="flex h-72 items-end gap-3 overflow-x-auto pb-2">
        {data.map((day) => {
          const total = wasteKeys.reduce((sum, waste) => sum + Number(day[waste.key] || 0), 0);
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
                    style={{ height: `${total > 0 ? (Number(day[waste.key] || 0) / total) * 100 : 0}%` }}
                    title={`${waste.label}: ${day[waste.key] || 0} kg`}
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
  if (!data || data.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500">Chưa có xếp hạng</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1);
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
  const { data, isLoading, isError } = useAdminDashboardStats();

  const displayKpis = data?.kpi ? [
    { label: 'Tổng người dùng', value: format(data.kpi.totalUsers || 0), change: 'hệ thống', tone: 'blue' },
    { label: 'Tổng rác đã thu gom', value: `${format(data.kpi.totalKg || 0)} kg`, change: 'từ Giao dịch', tone: 'teal' },
    { label: 'Điểm đã cấp', value: format(data.kpi.totalPoints || 0), change: 'tổng cộng', tone: 'blue' },
    { label: 'Giao dịch chờ duyệt', value: format(data.kpi.pendingTransactions || 0), change: 'cần xử lý', tone: 'amber' },
  ] : [];

  const displayDailyWaste = data?.chartData || [];
  
  const displayWasteShare = data?.chartData?.length ? wasteKeys.map(w => {
    const total = data.chartData.reduce((sum, day) => sum + Number((day as any)[w.key] || 0), 0);
    return { label: w.label, value: total, color: w.color };
  }) : [];

  const displayRankingLocations = data?.rankings?.locations || [];
  const displayRankingPartners = data?.rankings?.partners || [];
  const displayRankingUsers = data?.rankings?.users || [];
  const displayRankingVouchers = data?.rankings?.vouchers || [];

  const displayTaskQueue = data?.taskQueue?.map(t => {
    const Icon = IconMap[t.iconType] || AlertTriangle;
    return { ...t, icon: Icon };
  }) || [];

  const displaySystemTrend = data?.systemTrend || [];

  const displayAiFraudSignals = data?.aiFraud ? [
    { label: 'Số lượt scan AI', value: format(data.aiFraud.totalScans || 0), helper: 'tổng hệ thống', icon: Bot },
    { label: 'Tỷ lệ đúng theo feedback', value: `${data.aiFraud.accuracyRate || 0}%`, helper: 'feedback người dùng', icon: CheckCircle2 },
    { label: 'Ảnh confidence thấp', value: format(data.aiFraud.lowConfidence || 0), helper: 'cần kiểm duyệt', icon: AlertTriangle },
    { label: 'QR bị dùng lặp', value: format(data.aiFraud.duplicateQr || 0), helper: 'rủi ro cao', icon: QrCode },
    { label: 'Check-in sai GPS', value: format(data.aiFraud.wrongGps || 0), helper: '>150m', icon: MapPin },
    { label: 'Khối lượng bất thường', value: format(data.aiFraud.abnormalVolume || 0), helper: 'vượt ngưỡng', icon: ShieldAlert },
  ] : [];

  const displayPointSources = data?.pointSources || [];
  const displayProgressGoals = data?.progressGoals || [];
  const displayHeatmap = data?.heatmap || [];
  const displayCumulativeGrowth = data?.cumulativeGrowth || [];
  const displayVoucherStats = data?.voucherStats || [];

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="rounded-xl bg-blue-50 p-4 border border-blue-200 flex items-center gap-3">
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          <p className="text-sm font-medium text-blue-800">Đang tải dữ liệu thực từ API (/admin/dashboard/stats)...</p>
        </div>
      )}

      {isError && (
        <div className="rounded-xl bg-rose-50 p-4 border border-rose-200 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-500" />
          <p className="text-sm font-medium text-rose-800">Lỗi gọi API: Không thể lấy dữ liệu từ backend.</p>
        </div>
      )}

      <AdminPageHeader
        eyebrow="Admin Dashboard"
        title="Tổng quan hệ thống"
        description="Theo dõi toàn bộ EcoHabit: người dùng, đối tác, điểm thu gom, giao dịch, điểm thưởng, voucher, AI và chống gian lận."
        action={isLoading && <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {displayKpis.map((metric) => (
          <AdminStatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <AdminSection title="Việc cần xử lý">
          {displayTaskQueue.length > 0 ? (
            <div className="space-y-3">
              {displayTaskQueue.map((task) => (
                <div key={task.label} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 ring-1 ring-slate-200">
                      {task.icon && <task.icon className="h-4 w-4" />}
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
          ) : (
            <p className="text-sm text-slate-500">Không có việc cần xử lý.</p>
          )}
        </AdminSection>

        <AdminSection title="Gauge / Progress mục tiêu">
          {displayProgressGoals.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {displayProgressGoals.map((goal) => (
                <GaugeCard key={goal.label} {...goal} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Chưa thiết lập mục tiêu.</p>
          )}
        </AdminSection>

        <AdminSection title="Heatmap hoạt động">
          {displayHeatmap.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-1.5">
                {displayHeatmap.flatMap((row, rowIndex) =>
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
              <p className="text-sm text-slate-500">Mật độ hoạt động theo giờ/ngày trong tuần.</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Chưa có dữ liệu phân bổ theo giờ.</p>
          )}
        </AdminSection>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <AdminSection title="Stacked Bar Chart - Kg rác theo ngày và loại rác">
            <StackedWasteChart data={displayDailyWaste} />
          </AdminSection>
        </div>
        <div className="xl:col-span-2">
          <AdminSection title="Donut Chart - Tỷ lệ loại rác">
            <DonutChart data={displayWasteShare} />
          </AdminSection>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AdminSection title="Line Chart - Người dùng, scan AI, giao dịch">
          <SparkLine
            data={displaySystemTrend}
            lines={[
              { key: 'users', color: '#2563eb', label: 'Người dùng mới' },
              { key: 'scans', color: '#7c3aed', label: 'Scan AI' },
              { key: 'transactions', color: '#059669', label: 'Giao dịch' },
            ]}
          />
        </AdminSection>

        <AdminSection title="Area Chart - Tăng trưởng tích lũy">
          {displayCumulativeGrowth.length > 0 ? (
            <>
              <AreaChart data={displayCumulativeGrowth} />
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-emerald-50 p-3">
                  <p className="text-xs font-semibold text-emerald-700">Rác tích lũy</p>
                  <p className="mt-1 text-lg font-extrabold text-emerald-900">{data?.kpi?.totalKg || 0} tấn</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3">
                  <p className="text-xs font-semibold text-blue-700">Điểm đã cấp</p>
                  <p className="mt-1 text-lg font-extrabold text-blue-900">{data?.kpi?.totalPoints || 0}</p>
                </div>
                <div className="rounded-xl bg-slate-100 p-3">
                  <p className="text-xs font-semibold text-slate-600">Người dùng</p>
                  <p className="mt-1 text-lg font-extrabold text-slate-900">{data?.kpi?.totalUsers || 0}</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">Chưa có dữ liệu tăng trưởng dài hạn.</p>
          )}
        </AdminSection>
      </div>

      <AdminSection title="Horizontal Bar Chart - Bảng xếp hạng">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <HorizontalRanking title="Top 5 điểm thu gom (theo kg rác)" data={displayRankingLocations} suffix="kg" />
          <HorizontalRanking title="Top 5 đối tác" data={displayRankingPartners} suffix="GD" />
          <HorizontalRanking title="Top 5 voucher (lượt đổi)" data={displayRankingVouchers} suffix="lượt" />
          <HorizontalRanking title="Top user tích cực" data={displayRankingUsers} suffix="giao dịch" />
        </div>
      </AdminSection>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AdminSection title="Người dùng & điểm thưởng">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Nguồn phát sinh điểm</h3>
              {displayPointSources.length > 0 ? displayPointSources.map((source) => (
                <div key={source.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-semibold text-slate-700">{source.label}</span>
                    <span className="font-bold text-slate-900">{source.value}%</span>
                  </div>
                  <ProgressBar value={source.value} color={source.color} />
                </div>
              )) : (
                <p className="text-sm text-slate-500">Chưa có thống kê điểm.</p>
              )}
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Hành vi bất thường</h3>
              <p className="text-sm text-slate-500">Đang theo dõi tự động từ hệ thống Fraud Detection.</p>
            </div>
          </div>
        </AdminSection>

        <AdminSection title="Quà tặng / Voucher">
          {displayVoucherStats.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {displayVoucherStats.map((item) => {
                const Icon = IconMap[item.id] || Ticket;
                return (
                  <div key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 ring-1 ring-slate-200">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">{item.name}</p>
                      <p className="text-base font-extrabold text-slate-900">{item.redeemed} lượt đổi</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Chưa có dữ liệu thống kê quà tặng.</p>
          )}
        </AdminSection>
      </div>

      <AdminSection title="AI & Chống gian lận">
        {displayAiFraudSignals.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {displayAiFraudSignals.map((signal) => (
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
        ) : (
          <p className="text-sm text-slate-500">Chưa có tín hiệu AI đáng chú ý.</p>
        )}
      </AdminSection>
    </div>
  );
};
