export interface DashboardKpi {
  totalKg: number;
  totalTransactions: number;
  pendingTransactions: number;
  verifiedTransactions: number;
  totalPoints: number;
  totalLocations: number;
  approvedLocations: number;
  pendingTransactionsList: any[];
}

export interface ChartDataPoint {
  label: string;
  plastic: number;
  paper: number;
  metal: number;
  glass: number;
  battery: number;
  other: number;
}

export interface ActivityFeedItem {
  id: string;
  icon: string;
  type: string;
  text: string;
  sub: string;
  time: string;
  status: 'success' | 'warning' | 'pending' | 'info';
}

export interface LocationStat {
  id: string;
  name: string;
  checkins: number;
  kg: number;
  topWaste: string;
  status: string;
  trend: string;
}

export interface VoucherStat {
  id: string;
  name: string;
  redeemed: number;
  remaining: number;
  expireDays: number | null;
  useRate: number;
}

export interface DashboardStatsResponse {
  kpi: DashboardKpi;
  chartData: ChartDataPoint[];
  activityFeed: ActivityFeedItem[];
  locationStats: LocationStat[];
  voucherStats: VoucherStat[];
}
