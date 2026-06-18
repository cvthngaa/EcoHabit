export interface AdminDashboardKpi {
  totalUsers: number;
  totalPartners: number;
  totalKg: number;
  totalTransactions: number;
  pendingTransactions: number;
  verifiedTransactions: number;
  totalPoints: number;
  totalLocations: number;
  approvedLocations: number;
  pendingLocations: number;
  pendingPartners: number;
  lowConfidenceAiCount: number;
  fraudWarningCount: number;
  lowStockVoucherCount: number;
  expiringVoucherCount: number;
  pendingTransactionsList: any[];
}

export interface AdminDashboardChartData {
  label: string;
  plastic: number;
  paper: number;
  metal: number;
  glass: number;
  battery: number;
  other: number;
}

export interface AdminDashboardActivityFeed {
  id: string;
  type: string;
  text: string;
  sub: string;
  time: string;
  status: string;
  icon: string;
}

export interface AdminDashboardLocationStat {
  id: string;
  name: string;
  checkins: number;
  kg: number;
  topWaste: string;
  status: string;
  trend: string;
}

export interface AdminDashboardVoucherStat {
  id: string;
  name: string;
  redeemed: number;
  remaining: number;
  expireDays: number;
  useRate: number;
}

export interface AdminDashboardTaskQueue {
  label: string;
  count: number;
  iconType: 'Store' | 'MapPin' | 'ShieldAlert' | 'Bot' | 'Users' | 'Gift' | 'AlertTriangle';
  level: 'PENDING' | 'HIGH' | 'NEEDS_REVIEW' | 'OPEN' | 'LOW_STOCK' | 'MEDIUM';
}

export interface AdminDashboardRankingItem {
  label: string;
  value: number;
}

export interface AdminDashboardSystemTrend {
  label: string;
  users: number;
  scans: number;
  transactions: number;
  points: number;
}

export interface AdminDashboardAiFraud {
  totalScans: number;
  accuracyRate: number;
  lowConfidence: number;
  duplicateQr: number;
  wrongGps: number;
  abnormalVolume: number;
}

export interface AdminDashboardPointSource {
  label: string;
  value: number;
  color: string;
}

export interface AdminDashboardCumulativeGrowth {
  label: string;
  kg: number;
  points: number;
  users: number;
}

export interface AdminDashboardProgressGoal {
  label: string;
  value: number;
  helper: string;
}

export interface AdminDashboardStats {
  kpi: AdminDashboardKpi;
  chartData: AdminDashboardChartData[];
  activityFeed: AdminDashboardActivityFeed[];
  locationStats: AdminDashboardLocationStat[];
  voucherStats: AdminDashboardVoucherStat[];
  taskQueue: AdminDashboardTaskQueue[];
  rankings: {
    locations: AdminDashboardRankingItem[];
    partners: AdminDashboardRankingItem[];
    users: AdminDashboardRankingItem[];
    vouchers: AdminDashboardRankingItem[];
  };
  systemTrend: AdminDashboardSystemTrend[];
  aiFraud: AdminDashboardAiFraud;
  pointSources: AdminDashboardPointSource[];
  progressGoals: AdminDashboardProgressGoal[];
  cumulativeGrowth: AdminDashboardCumulativeGrowth[];
  heatmap: number[][];
}
