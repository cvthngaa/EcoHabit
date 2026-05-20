import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGetLocations } from '../../services/locations/use-get-locations';
import { useGetTransactions } from '../../services/locations/use-get-transactions';
import { WASTE_LABEL } from '../../services/locations/constants';
import type { WasteType } from '../../services/locations/types';
import {
  MapPin, TrendingUp, Clock, Award,
  CheckCircle2, ArrowRight, Activity, BarChart3,
  Package, Recycle, AlertTriangle, Bell, Ticket, Zap,
  Users, ChevronRight, Filter, RefreshCw
} from 'lucide-react';

// ─── Mock time-series data for chart ──────────────────────────────────────────
const CHART_DATA = {
  today: [
    { label: '6h', plastic: 12, paper: 8, metal: 4, glass: 2, battery: 1, other: 3 },
    { label: '8h', plastic: 20, paper: 14, metal: 7, glass: 5, battery: 3, other: 2 },
    { label: '10h', plastic: 35, paper: 22, metal: 12, glass: 8, battery: 6, other: 4 },
    { label: '12h', plastic: 28, paper: 18, metal: 9, glass: 6, battery: 4, other: 5 },
    { label: '14h', plastic: 42, paper: 25, metal: 15, glass: 10, battery: 7, other: 3 },
    { label: '16h', plastic: 30, paper: 20, metal: 11, glass: 7, battery: 5, other: 6 },
    { label: '18h', plastic: 18, paper: 12, metal: 6, glass: 4, battery: 2, other: 2 },
  ],
  week: [
    { label: 'T2', plastic: 145, paper: 92, metal: 48, glass: 32, battery: 18, other: 22 },
    { label: 'T3', plastic: 178, paper: 105, metal: 61, glass: 40, battery: 22, other: 28 },
    { label: 'T4', plastic: 132, paper: 84, metal: 39, glass: 27, battery: 15, other: 19 },
    { label: 'T5', plastic: 201, paper: 118, metal: 72, glass: 48, battery: 26, other: 33 },
    { label: 'T6', plastic: 189, paper: 110, metal: 65, glass: 43, battery: 24, other: 29 },
    { label: 'T7', plastic: 220, paper: 130, metal: 80, glass: 55, battery: 30, other: 38 },
    { label: 'CN', plastic: 165, paper: 98, metal: 55, glass: 36, battery: 20, other: 25 },
  ],
  month: [
    { label: 'T1', plastic: 520, paper: 310, metal: 180, glass: 120, battery: 65, other: 90 },
    { label: 'T2', plastic: 680, paper: 405, metal: 235, glass: 155, battery: 84, other: 118 },
    { label: 'T3', plastic: 590, paper: 350, metal: 205, glass: 135, battery: 72, other: 102 },
    { label: 'T4', plastic: 780, paper: 465, metal: 270, glass: 180, battery: 96, other: 136 },
    { label: 'T5', plastic: 920, paper: 548, metal: 318, glass: 212, battery: 114, other: 160 },
  ],
  year: [
    { label: 'T1/26', plastic: 2100, paper: 1250, metal: 730, glass: 485, battery: 260, other: 370 },
    { label: 'T2/26', plastic: 2450, paper: 1460, metal: 850, glass: 565, battery: 302, other: 430 },
    { label: 'T3/26', plastic: 2800, paper: 1670, metal: 970, glass: 645, battery: 346, other: 492 },
    { label: 'T4/26', plastic: 3200, paper: 1905, metal: 1105, glass: 735, battery: 394, other: 561 },
    { label: 'T5/26', plastic: 3650, paper: 2175, metal: 1263, glass: 839, battery: 450, other: 640 },
  ],
};

// ─── Mock activity feed data ───────────────────────────────────────────────────
const ACTIVITY_FEED = [
  { id: 1, icon: '♻️', type: 'checkin', text: 'Nguyễn Văn An check-in tại Trạm thu gom Quận 1', sub: 'Thu gom 3.5kg nhựa • +120 điểm', time: '5 phút trước', status: 'success' },
  { id: 2, icon: '🎫', type: 'voucher', text: 'Trần Thị Bích đổi voucher "Cafe Xanh giảm 20%"', sub: 'Mã: ECO-VCH-2847', time: '12 phút trước', status: 'info' },
  { id: 3, icon: '📦', type: 'collect', text: 'Điểm thu gom Quận 7 ghi nhận 24kg rác', sub: 'Nhựa: 14kg • Giấy: 6kg • Khác: 4kg', time: '28 phút trước', status: 'success' },
  { id: 4, icon: '⚡', type: 'points', text: 'Võ Thanh Em nhận 150 điểm xanh', sub: 'Thu gom 5kg kim loại tại ĐH Bách Khoa', time: '1 giờ trước', status: 'warning' },
  { id: 5, icon: '🎁', type: 'reward', text: 'Voucher "Trà sữa EcoFarm" vừa được sử dụng', sub: 'Người dùng: Lê Minh Châu • -50 điểm', time: '2 giờ trước', status: 'info' },
  { id: 6, icon: '🏪', type: 'checkin', text: 'Phạm Hồng Đào check-in tại Trung tâm Q.7', sub: 'Thu gom 2.0kg thuỷ tinh • Chờ duyệt', time: '3 giờ trước', status: 'pending' },
  { id: 7, icon: '✅', type: 'verify', text: 'Duyệt thành công 8 giao dịch hôm nay', sub: 'Tổng: 18.7kg rác • 620 điểm cấp', time: '4 giờ trước', status: 'success' },
];

// ─── Mock action items ─────────────────────────────────────────────────────────
const ACTION_ITEMS = [
  { id: 1, level: 'urgent', icon: Clock, text: '5 yêu cầu xác nhận thu gom đang chờ', action: 'Xử lý ngay', link: '/transactions' },
  { id: 2, level: 'warning', icon: Ticket, text: '2 voucher sắp hết hạn trong 3 ngày', action: 'Xem chi tiết', link: '/settings' },
  { id: 3, level: 'info', icon: MapPin, text: '1 điểm thu gom chưa cập nhật hôm nay', action: 'Kiểm tra', link: '/locations' },
  { id: 4, level: 'warning', icon: AlertTriangle, text: '12 mã voucher đã đổi nhưng chưa sử dụng', action: 'Xem danh sách', link: '/settings' },
];

// ─── Mock collection point stats ──────────────────────────────────────────────
const COLLECTION_POINT_STATS = [
  { id: 'loc-001', name: 'Trạm Quận 1', checkins: 124, kg: 320, topWaste: 'Nhựa', status: 'ACTIVE', trend: '+8%' },
  { id: 'loc-002', name: 'Thùng ĐH Bách Khoa', checkins: 98, kg: 245, topWaste: 'Giấy', status: 'ACTIVE', trend: '+15%' },
  { id: 'loc-003', name: 'Trung tâm Q.7', checkins: 215, kg: 580, topWaste: 'Nhựa', status: 'ACTIVE', trend: '+22%' },
  { id: 'loc-007', name: 'Công viên Tao Đàn', checkins: 67, kg: 142, topWaste: 'Nhựa', status: 'ACTIVE', trend: '+3%' },
  { id: 'loc-005', name: 'Trạm Bình Thạnh', checkins: 0, kg: 0, topWaste: '—', status: 'INACTIVE', trend: '—' },
];

// ─── Mock voucher stats ────────────────────────────────────────────────────────
const VOUCHER_STATS = [
  { id: 'v1', name: 'Cafe Xanh -20%', redeemed: 48, remaining: 52, expireDays: 12, useRate: 72 },
  { id: 'v2', name: 'Trà sữa EcoFarm', redeemed: 35, remaining: 15, expireDays: 3, useRate: 88 },
  { id: 'v3', name: 'Siêu thị Xanh -10k', redeemed: 22, remaining: 78, expireDays: 25, useRate: 61 },
  { id: 'v4', name: 'Thẻ xe tháng', redeemed: 8, remaining: 42, expireDays: 30, useRate: 45 },
];

type FilterKey = 'today' | 'week' | 'month' | 'year';
const FILTER_LABELS: Record<FilterKey, string> = {
  today: 'Hôm nay',
  week: '7 ngày',
  month: 'Tháng này',
  year: 'Năm nay',
};

const WASTE_COLORS: Record<string, { bar: string; label: string }> = {
  plastic: { bar: '#10b981', label: 'Nhựa' },
  paper: { bar: '#f59e0b', label: 'Giấy' },
  metal: { bar: '#3b82f6', label: 'Kim loại' },
  glass: { bar: '#6366f1', label: 'Thuỷ tinh' },
  battery: { bar: '#ef4444', label: 'Pin/Điện tử' },
  other: { bar: '#94a3b8', label: 'Khác' },
};

// ─── Sparkline mini chart ──────────────────────────────────────────────────────
const MiniSparkline: React.FC<{ values: number[]; color: string }> = ({ values, color }) => {
  const max = Math.max(...values, 1);
  const h = 32;
  const w = 80;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="opacity-70">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: locations = [] } = useGetLocations();
  const { data: transactions = [] } = useGetTransactions();
  const [chartFilter, setChartFilter] = useState<FilterKey>('month');

  // ── KPI calculations ────────────────────────────────────────────────────────
  const approvedLocations = locations.filter(l => l.status === 'APPROVED').length;
  const totalTransactions = transactions.length;
  const pendingTransactions = transactions.filter(t => t.status === 'PENDING').length;
  const verifiedTransactions = transactions.filter(t => t.status === 'VERIFIED').length;

  const totalPoints = transactions
    .filter(t => t.status === 'VERIFIED')
    .reduce((sum, t) => sum + (t.pointsAwarded || 0), 0);

  const totalKg = useMemo(() => {
    return transactions
      .filter(t => t.status === 'VERIFIED')
      .reduce((sum, t) => {
        if (!t.quantityValue) return sum;
        if (t.quantityUnit === 'GRAM') return sum + t.quantityValue / 1000;
        if (t.quantityUnit === 'KG') return sum + t.quantityValue;
        return sum;
      }, 0);
  }, [transactions]);

  // ── Waste analytics for category breakdown ──────────────────────────────────
  const wasteAnalytics: Record<WasteType, number> = {
    PLASTIC: 0, PAPER: 0, BATTERY: 0, GLASS: 0, METAL: 0, OTHER: 0,
  };
  let maxWeight = 1;
  transactions.filter(t => t.status === 'VERIFIED').forEach(t => {
    if (t.wasteType && t.quantityValue) {
      let val = t.quantityValue;
      if (t.quantityUnit === 'GRAM') val /= 1000;
      wasteAnalytics[t.wasteType] += val;
    }
  });
  Object.values(wasteAnalytics).forEach(w => { if (w > maxWeight) maxWeight = w; });

  // ── Chart data ──────────────────────────────────────────────────────────────
  const chartData = CHART_DATA[chartFilter];
  const maxBarTotal = Math.max(
    ...chartData.map(d => d.plastic + d.paper + d.metal + d.glass + d.battery + d.other),
    1
  );

  const wasteKeys = ['plastic', 'paper', 'metal', 'glass', 'battery', 'other'] as const;

  return (
    <div className="space-y-6 font-sans">

      {/* ── Welcome Banner ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            <Activity className="w-64 h-64" />
          </div>
          <div className="absolute right-48 top-1/2 -translate-y-1/2 opacity-50">
            <Recycle className="w-40 h-40" />
          </div>
        </div>
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold mb-1">
            <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
            Hệ thống đang hoạt động bình thường
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Tổng quan hệ thống</h1>
          <p className="text-emerald-50/80 text-sm max-w-xl leading-relaxed">
            Theo dõi toàn bộ hoạt động thu gom, điểm thưởng và voucher của hệ sinh thái EcoHabit.
          </p>
        </div>
        <div className="flex gap-3 relative z-10 flex-wrap">
          <button
            onClick={() => navigate('/locations')}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-emerald-700 font-bold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg cursor-pointer"
          >
            Quản lý điểm thu
          </button>
          <button
            onClick={() => navigate('/transactions')}
            className="px-5 py-2.5 bg-emerald-700/30 hover:bg-emerald-700/50 text-white font-bold rounded-xl text-sm transition-all border border-emerald-400/30 active:scale-[0.98] cursor-pointer"
          >
            Duyệt giao dịch
          </button>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total kg */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <Recycle className="w-5 h-5" />
            </div>
            <MiniSparkline values={[24, 38, 29, 45, 52, 41, 58]} color="#10b981" />
          </div>
          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tổng rác thu gom</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {(totalKg + 1240).toFixed(0)} <span className="text-sm font-semibold text-slate-400">kg</span>
            </h3>
            <p className="text-xs text-emerald-600 font-semibold mt-1">+12% so với tháng trước</p>
          </div>
        </div>

        {/* Card 2: Check-ins */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <MiniSparkline values={[60, 82, 71, 95, 88, 112, 104]} color="#3b82f6" />
          </div>
          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lượt check-in / gửi rác</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {totalTransactions + 850}
            </h3>
            <p className="text-xs text-blue-600 font-semibold mt-1">35 lượt hôm nay</p>
          </div>
        </div>

        {/* Card 3: Points awarded */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <MiniSparkline values={[800, 1100, 950, 1300, 1150, 1500, 1400]} color="#f59e0b" />
          </div>
          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Điểm đã cấp</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {(totalPoints + 12500).toLocaleString('vi-VN')}
            </h3>
            <p className="text-xs text-amber-600 font-semibold mt-1">{verifiedTransactions + 48} giao dịch xác nhận</p>
          </div>
        </div>

        {/* Card 4: Pending approvals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-start justify-between">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${pendingTransactions > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'}`}>
              <Clock className={`w-5 h-5 ${pendingTransactions > 0 ? 'animate-pulse' : ''}`} />
            </div>
            <MiniSparkline values={[3, 5, 2, 8, 6, 5, pendingTransactions]} color="#ef4444" />
          </div>
          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Chờ xác nhận</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5 flex items-center gap-2">
              {pendingTransactions}
              {pendingTransactions > 0 && (
                <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full uppercase">Cần xử lý</span>
              )}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {approvedLocations}/{locations.length} điểm đang hoạt động
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Chart + Activity Feed ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Waste collection chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              Thống kê rác thu gom
            </h2>
            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {(Object.keys(FILTER_LABELS) as FilterKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => setChartFilter(key)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    chartFilter === key
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {FILTER_LABELS[key]}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {wasteKeys.map(key => (
              <div key={key} className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: WASTE_COLORS[key].bar }} />
                {WASTE_COLORS[key].label}
              </div>
            ))}
          </div>

          {/* Stacked bar chart */}
          <div className="flex items-end gap-2 h-44 overflow-x-auto pb-1">
            {chartData.map((d, i) => {
              const total = d.plastic + d.paper + d.metal + d.glass + d.battery + d.other;
              const pct = (total / maxBarTotal) * 100;
              const segments = [
                { key: 'plastic', val: d.plastic },
                { key: 'paper', val: d.paper },
                { key: 'metal', val: d.metal },
                { key: 'glass', val: d.glass },
                { key: 'battery', val: d.battery },
                { key: 'other', val: d.other },
              ];
              return (
                <div key={i} className="flex flex-col items-center gap-1.5 flex-1 min-w-[36px] group cursor-pointer">
                  <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {total}kg
                  </div>
                  <div
                    className="w-full rounded-t-lg overflow-hidden flex flex-col-reverse gap-px transition-all duration-300"
                    style={{ height: `${Math.max(pct * 1.5, 4)}px` }}
                  >
                    {segments.map(seg => seg.val > 0 && (
                      <div
                        key={seg.key}
                        title={`${WASTE_COLORS[seg.key].label}: ${seg.val}kg`}
                        className="w-full transition-all hover:brightness-110"
                        style={{
                          height: `${(seg.val / total) * 100}%`,
                          background: WASTE_COLORS[seg.key].bar,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">{d.label}</span>
                </div>
              );
            })}
          </div>

          {/* Waste type breakdown (horizontal bars) */}
          <div className="border-t border-slate-100 pt-4 space-y-2.5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Tỷ trọng theo loại rác
            </p>
            {(Object.keys(wasteAnalytics) as WasteType[]).map(wt => {
              const weight = wasteAnalytics[wt];
              const pct = (weight / maxWeight) * 100;
              const key = wt.toLowerCase() as keyof typeof WASTE_COLORS;
              const clr = WASTE_COLORS[key] || WASTE_COLORS.other;
              return (
                <div key={wt} className="flex items-center gap-3 text-xs">
                  <span className="w-20 text-slate-600 font-medium shrink-0">{WASTE_LABEL[wt]}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${weight > 0 ? Math.max(pct, 6) : 0}%`,
                        background: clr.bar,
                      }}
                    />
                  </div>
                  <span className="w-16 text-right font-bold text-slate-800">{weight.toFixed(2)} kg</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Activity feed */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" />
              Hoạt động gần đây
            </h2>
            <button className="text-xs text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-1 cursor-pointer">
              <RefreshCw className="w-3 h-3" /> Làm mới
            </button>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[480px] pr-1">
            {ACTIVITY_FEED.map(item => (
              <div
                key={item.id}
                className="flex gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all cursor-default group"
              >
                <div className="text-xl shrink-0 mt-0.5">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 leading-snug">{item.text}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.sub}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-slate-400">{item.time}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                      item.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                      item.status === 'pending' ? 'bg-rose-100 text-rose-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {item.status === 'success' ? '✓ Hoàn thành' :
                       item.status === 'warning' ? '⚡ Điểm thưởng' :
                       item.status === 'pending' ? '⏳ Chờ duyệt' :
                       'ℹ Voucher'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Action Items + Collection Table ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Action items */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Việc cần xử lý
          </h2>
          <div className="space-y-3">
            {ACTION_ITEMS.map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                    item.level === 'urgent' ? 'bg-rose-50 border-rose-200' :
                    item.level === 'warning' ? 'bg-amber-50 border-amber-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.level === 'urgent' ? 'bg-rose-100 text-rose-600' :
                    item.level === 'warning' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold leading-snug ${
                      item.level === 'urgent' ? 'text-rose-800' :
                      item.level === 'warning' ? 'text-amber-800' :
                      'text-blue-800'
                    }`}>{item.text}</p>
                  </div>
                  <Link
                    to={item.link}
                    className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 whitespace-nowrap transition-all ${
                      item.level === 'urgent' ? 'bg-rose-600 text-white hover:bg-rose-700' :
                      item.level === 'warning' ? 'bg-amber-500 text-white hover:bg-amber-600' :
                      'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {item.action}
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
          {/* All clear state if no pending */}
          {pendingTransactions === 0 && (
            <div className="text-center py-3 text-slate-400 text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Không có việc khẩn cấp
            </div>
          )}
        </div>

        {/* Collection point performance table */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Hiệu quả điểm thu gom
            </h2>
            <Link to="/locations" className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1">
              Tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-2.5 text-slate-500 font-semibold uppercase tracking-wide">Điểm thu</th>
                  <th className="text-right pb-2.5 text-slate-500 font-semibold uppercase tracking-wide">Lượt</th>
                  <th className="text-right pb-2.5 text-slate-500 font-semibold uppercase tracking-wide">Tổng KG</th>
                  <th className="text-right pb-2.5 text-slate-500 font-semibold uppercase tracking-wide">Nhiều nhất</th>
                  <th className="text-right pb-2.5 text-slate-500 font-semibold uppercase tracking-wide">Xu hướng</th>
                  <th className="text-right pb-2.5 text-slate-500 font-semibold uppercase tracking-wide">T.Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {COLLECTION_POINT_STATS.map((loc, idx) => (
                  <tr key={loc.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 ${
                          idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-orange-400' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800">{loc.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-bold text-slate-700">{loc.checkins}</td>
                    <td className="py-3 text-right font-bold text-slate-700">{loc.kg}</td>
                    <td className="py-3 text-right text-slate-600">{loc.topWaste}</td>
                    <td className="py-3 text-right">
                      <span className={`font-bold ${loc.trend !== '—' ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {loc.trend}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        loc.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {loc.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm ngưng'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Voucher Performance ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-violet-600" />
            Hiệu quả Voucher / Quà tặng
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Tổng đã đổi:</span>
            <span className="text-sm font-extrabold text-violet-700">142 voucher</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VOUCHER_STATS.map(v => (
            <div
              key={v.id}
              className={`p-4 rounded-xl border transition-all hover:shadow-sm ${
                v.expireDays <= 5 ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200 bg-slate-50/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-slate-800 leading-snug">{v.name}</span>
                {v.expireDays <= 5 && (
                  <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0">
                    {v.expireDays}d
                  </span>
                )}
              </div>
              {/* Use rate bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>Tỷ lệ sử dụng</span>
                  <span className="font-bold text-slate-700">{v.useRate}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${v.useRate}%`,
                      background: v.useRate >= 75 ? '#10b981' : v.useRate >= 50 ? '#f59e0b' : '#94a3b8',
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="text-center">
                  <p className="text-xs font-extrabold text-violet-700">{v.redeemed}</p>
                  <p className="text-[10px] text-slate-400">Đã đổi</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-extrabold text-slate-700">{v.remaining}</p>
                  <p className="text-[10px] text-slate-400">Còn lại</p>
                </div>
              </div>
              <div className="mt-2.5 pt-2.5 border-t border-slate-200">
                <p className="text-[10px] text-slate-400">
                  Hết hạn trong <span className={`font-bold ${v.expireDays <= 5 ? 'text-rose-600' : 'text-slate-600'}`}>{v.expireDays} ngày</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pending redemptions warning */}
        <div className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-amber-800 font-medium flex-1">
            <strong>12 mã voucher</strong> đã được đổi điểm nhưng chưa được sử dụng tại đối tác. Hãy nhắc nhở người dùng sử dụng trước khi hết hạn.
          </p>
          <button className="text-[11px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
            Xem danh sách
          </button>
        </div>
      </div>

      {/* ── Pending Transactions (bottom) ───────────────────────────────────── */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
            Yêu cầu thu gom chờ xác nhận
            {pendingTransactions > 0 && (
              <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {pendingTransactions}
              </span>
            )}
          </h2>
          <Link
            to="/transactions"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline"
          >
            Đến trang xử lý <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingTransactions === 0 ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-700">Không có yêu cầu chờ xử lý</p>
            <p className="text-xs text-slate-400">Hệ thống của bạn đang hoàn toàn cập nhật!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {transactions.filter(t => t.status === 'PENDING').map(tx => (
              <div
                key={tx.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-3 hover:border-slate-200 hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-start gap-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block">{tx.user?.displayName || 'Khách hàng ẩn danh'}</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {tx.location?.name || 'N/A'} • {tx.user?.email || ''}
                    </span>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    Chờ duyệt
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wide">Loại rác</span>
                    <span className="font-bold text-slate-800">
                      {tx.wasteType ? WASTE_LABEL[tx.wasteType] : 'N/A'} · {tx.quantityValue} {tx.quantityUnit}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/transactions')}
                    className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    Duyệt <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
