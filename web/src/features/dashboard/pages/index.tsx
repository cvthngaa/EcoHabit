import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGetDashboardStats } from '../services/use-get-dashboard-stats';
import { LoadingState } from '../../../shared/components/LoadingState';
import { EmptyState } from '../../../shared/components/EmptyState';
import { StatCard } from '../../../shared/components/StatCard';
import { DataTable } from '../../../shared/components/DataTable';
import { WASTE_LABEL } from '../../locations/services/constants';
import type { WasteType } from '../../locations/services/types';
import {
  MapPin, Clock, Award,
  CheckCircle2, ArrowRight, Activity, BarChart3,
  Recycle, AlertTriangle, Bell, Ticket, Zap,
  Users, ChevronRight, Filter, RefreshCw
} from 'lucide-react';
import { Badge } from '../../../shared/components/Badge';

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
  const pts = values.map((v, i) => `${(i / (Math.max(values.length - 1, 1))) * w},${h - (v / max) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="opacity-70">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [chartFilter, setChartFilter] = useState<FilterKey>('month');
  
  const { data, isLoading, isError, refetch } = useGetDashboardStats(chartFilter);

  if (isLoading) {
    return <LoadingState message="Đang tải dữ liệu dashboard..." className="py-20" size="lg" />;
  }
  
  if (isError || !data) {
    return <div className="p-8 text-center text-rose-500">Lỗi khi tải dữ liệu dashboard</div>;
  }

  const { kpi, chartData, activityFeed, locationStats, voucherStats } = data;

  const totalKg = kpi.totalKg;
  const totalTransactions = kpi.totalTransactions;
  const pendingTransactions = kpi.pendingTransactions;
  const verifiedTransactions = kpi.verifiedTransactions;
  const totalPoints = kpi.totalPoints;
  const approvedLocations = kpi.approvedLocations;
  const totalLocations = kpi.totalLocations;

  const maxBarTotal = Math.max(
    ...chartData.map(d => d.plastic + d.paper + d.metal + d.glass + d.battery + d.other),
    1
  );

  const wasteKeys = ['plastic', 'paper', 'metal', 'glass', 'battery', 'other'] as const;

  // Calculate waste analytics for breakdown from chartData since we don't have transaction details here
  const wasteAnalytics: Record<string, number> = {
    plastic: 0, paper: 0, battery: 0, glass: 0, metal: 0, other: 0,
  };
  let maxWeight = 1;
  
  chartData.forEach(d => {
    wasteKeys.forEach(k => {
      wasteAnalytics[k] += d[k];
    });
  });
  
  Object.values(wasteAnalytics).forEach(w => { if (w > maxWeight) maxWeight = w; });

  // Generate dynamic action items
  const actionItems = [];
  if (pendingTransactions > 0) {
    actionItems.push({ id: 1, level: 'urgent', icon: Clock, text: `${pendingTransactions} yêu cầu xác nhận thu gom đang chờ`, action: 'Xử lý ngay', link: '/transactions' });
  }
  const expiringVouchers = voucherStats.filter(v => v.expireDays <= 5);
  if (expiringVouchers.length > 0) {
    actionItems.push({ id: 2, level: 'warning', icon: Ticket, text: `${expiringVouchers.length} voucher sắp hết hạn trong 5 ngày`, action: 'Xem chi tiết', link: '/settings' });
  }
  const inactiveLocations = totalLocations - approvedLocations;
  if (inactiveLocations > 0) {
    actionItems.push({ id: 3, level: 'info', icon: MapPin, text: `${inactiveLocations} điểm thu gom chưa duyệt/tạm ngưng`, action: 'Kiểm tra', link: '/locations' });
  }
  // Fallback if empty
  if (actionItems.length === 0) {
    actionItems.push({ id: 99, level: 'info', icon: CheckCircle2, text: 'Hệ thống đang hoạt động ổn định', action: 'Xem báo cáo', link: '#' });
  }

  const unredeemedVouchers = voucherStats.reduce((sum, v) => sum + (v.useRate < 100 && v.useRate > 0 ? 1 : 0), 0);

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
        <StatCard
          layout="vertical"
          icon={Recycle}
          iconColorClass="text-emerald-600"
          iconBgClass="bg-emerald-50"
          className="hover:shadow-md hover:-translate-y-0.5 transition-all"
          rightElement={<MiniSparkline values={[24, 38, 29, 45, 52, 41, 58]} color="#10b981" />}
          label={<span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tổng rác thu gom</span>}
          value={<>{totalKg.toFixed(0)} <span className="text-sm font-semibold text-slate-400">kg</span></>}
          description={<span className="text-xs text-emerald-600 font-semibold">Đã được xác nhận</span>}
        />

        {/* Card 2: Check-ins */}
        <StatCard
          layout="vertical"
          icon={Users}
          iconColorClass="text-blue-600"
          iconBgClass="bg-blue-50"
          className="hover:shadow-md hover:-translate-y-0.5 transition-all"
          rightElement={<MiniSparkline values={[60, 82, 71, 95, 88, 112, 104]} color="#3b82f6" />}
          label={<span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lượt check-in / gửi rác</span>}
          value={<>{totalTransactions}</>}
          description={<span className="text-xs text-blue-600 font-semibold">Tất cả giao dịch</span>}
        />

        {/* Card 3: Points awarded */}
        <StatCard
          layout="vertical"
          icon={Award}
          iconColorClass="text-amber-600"
          iconBgClass="bg-amber-50"
          className="hover:shadow-md hover:-translate-y-0.5 transition-all"
          rightElement={<MiniSparkline values={[800, 1100, 950, 1300, 1150, 1500, 1400]} color="#f59e0b" />}
          label={<span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Điểm đã cấp</span>}
          value={<>{totalPoints.toLocaleString('vi-VN')}</>}
          description={<span className="text-xs text-amber-600 font-semibold">{verifiedTransactions} giao dịch xác nhận</span>}
        />

        {/* Card 4: Pending approvals */}
        <StatCard
          layout="vertical"
          icon={Clock}
          iconColorClass={pendingTransactions > 0 ? 'text-rose-600' : 'text-slate-500'}
          iconBgClass={pendingTransactions > 0 ? 'bg-rose-50' : 'bg-slate-50'}
          iconClassName={`w-6 h-6 ${pendingTransactions > 0 ? 'animate-pulse' : ''}`}
          className="hover:shadow-md hover:-translate-y-0.5 transition-all"
          rightElement={<MiniSparkline values={[3, 5, 2, 8, 6, 5, pendingTransactions]} color="#ef4444" />}
          label={<span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Chờ xác nhận</span>}
          value={
            <>
              {pendingTransactions}
              {pendingTransactions > 0 && (
                <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full uppercase">Cần xử lý</span>
              )}
            </>
          }
          description={<span className="text-xs text-slate-400 font-medium">{approvedLocations}/{totalLocations} điểm đang hoạt động</span>}
        />
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
            {chartData.length === 0 && (
              <div className="flex items-center justify-center w-full h-full text-slate-400 text-sm">Chưa có dữ liệu</div>
            )}
            {chartData.map((d, i) => {
              const total = d.plastic + d.paper + d.metal + d.glass + d.battery + d.other;
              const pct = maxBarTotal > 0 ? (total / maxBarTotal) * 100 : 0;
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
                    className="w-full rounded-t-lg overflow-hidden flex flex-col-reverse gap-px transition-all duration-300 bg-slate-50"
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
            {wasteKeys.map(wt => {
              const weight = wasteAnalytics[wt];
              const pct = maxWeight > 0 ? (weight / maxWeight) * 100 : 0;
              const clr = WASTE_COLORS[wt] || WASTE_COLORS.other;
              // Map label back to uppercase if needed or just use WASTE_COLORS label
              const label = WASTE_COLORS[wt].label;
              return (
                <div key={wt} className="flex items-center gap-3 text-xs">
                  <span className="w-20 text-slate-600 font-medium shrink-0">{label}</span>
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
            <button onClick={() => refetch()} className="text-xs text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-1 cursor-pointer">
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} /> Làm mới
            </button>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[480px] pr-1">
            {activityFeed.length === 0 && (
               <div className="text-center text-slate-400 text-sm mt-10">Chưa có hoạt động nào</div>
            )}
            {activityFeed.map(item => (
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
                       'ℹ Thông tin'}
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
            {actionItems.map(item => {
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
          {pendingTransactions === 0 && actionItems.length <= 1 && (
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
          <DataTable
            data={locationStats}
            isLoading={isLoading}
            loadingMessage="Đang tải dữ liệu..."
            loadingMinHeight="py-8"
            emptyTitle="Chưa có dữ liệu điểm thu gom"
            emptyClassName="py-4"
            containerClassName=""
            tableClassName="text-xs"
            columns={[
              {
                header: <span className="pb-2.5 text-slate-500 font-semibold uppercase tracking-wide">Điểm thu</span>,
                render: (loc, idx) => (
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 ${
                      idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-orange-400' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800">{loc.name}</span>
                  </div>
                ),
              },
              {
                header: <span className="pb-2.5 text-slate-500 font-semibold uppercase tracking-wide">Lượt</span>,
                className: 'text-right font-bold text-slate-700',
                render: (loc) => loc.checkins,
              },
              {
                header: <span className="pb-2.5 text-slate-500 font-semibold uppercase tracking-wide">Tổng KG</span>,
                className: 'text-right font-bold text-slate-700',
                render: (loc) => loc.kg,
              },
              {
                header: <span className="pb-2.5 text-slate-500 font-semibold uppercase tracking-wide">Nhiều nhất</span>,
                className: 'text-right text-slate-600',
                render: (loc) => WASTE_LABEL[loc.topWaste as WasteType] || loc.topWaste,
              },
              {
                header: <span className="pb-2.5 text-slate-500 font-semibold uppercase tracking-wide">Xu hướng</span>,
                className: 'text-right',
                render: (loc) => (
                  <span className={`font-bold ${loc.trend !== '—' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {loc.trend}
                  </span>
                ),
              },
              {
                header: <span className="pb-2.5 text-slate-500 font-semibold uppercase tracking-wide">T.Thái</span>,
                className: 'text-right',
                render: (loc) => (
                  <Badge 
                    className={`text-[10px] ${
                      loc.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                    label={loc.status === 'APPROVED' ? 'Hoạt động' : 'Tạm ngưng'}
                  />
                ),
              },
            ]}
          />
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
            <span className="text-sm font-extrabold text-violet-700">
                {voucherStats.reduce((sum, v) => sum + v.redeemed, 0)} voucher
            </span>
          </div>
        </div>
        
        {voucherStats.length === 0 ? (
            <div className="text-center py-8 text-slate-400">Chưa có dữ liệu voucher</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {voucherStats.map(v => (
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
        )}

        {/* Pending redemptions warning */}
        {unredeemedVouchers > 0 && (
          <div className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-amber-800 font-medium flex-1">
              Có một số voucher đã đổi nhưng tỷ lệ sử dụng chưa đạt 100%.
            </p>
            <button className="text-[11px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
              Xem danh sách
            </button>
          </div>
        )}
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
          <EmptyState
            icon={<CheckCircle2 className="w-10 h-10 text-emerald-500" />}
            title="Không có yêu cầu chờ xử lý"
            description="Hệ thống của bạn đang hoàn toàn cập nhật!"
            className="py-8"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {kpi.pendingTransactionsList?.map(tx => (
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
                      {tx.acceptedWasteType?.wasteType ? WASTE_LABEL[tx.acceptedWasteType.wasteType as WasteType] : 'N/A'} · {tx.quantityValue} {tx.quantityUnit}
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

