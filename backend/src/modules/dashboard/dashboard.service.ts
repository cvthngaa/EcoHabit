import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DropoffTransaction } from '../locations/entities/dropoff-transaction.entity';
import { Location } from '../locations/entities/location.entity';
import { Reward } from '../rewards/entities/reward.entity';
import { Redemption } from '../rewards/entities/redemption.entity';
import { DropoffStatus } from '../locations/enums/dropoff-status.enum';
import { User } from '../users/entities/user.entity';
import { PartnerProfile } from '../partner/entity/partner-profile.entity';
import { AiFeedback } from '../ai/entities/ai-feedback.entity';
import { TrashClassification } from '../ai/entities/trash-classification.entity';
import { FraudFlag } from '../fraud/entities/fraud-flag.entity';
import { ForumReport } from '../forum/entities/forum-report.entity';
import { PartnerApprovalStatus } from '../partner/enum/partner-approval-status.enum';
import { FraudStatus } from '../fraud/enums/fraud-status.enum';
import { ReportStatus } from '../forum/enums/report-status.enum';
import { PointTransaction } from '../points/entities/point-transaction.entity';
import { ClassificationStatus } from '../ai/enums/classification-status.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(DropoffTransaction)
    private readonly dropoffTransactionRepository: Repository<DropoffTransaction>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @InjectRepository(Redemption)
    private readonly redemptionRepository: Repository<Redemption>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PartnerProfile)
    private readonly partnerRepository: Repository<PartnerProfile>,
    @InjectRepository(AiFeedback)
    private readonly aiFeedbackRepository: Repository<AiFeedback>,
    @InjectRepository(TrashClassification)
    private readonly trashClassificationRepository: Repository<TrashClassification>,
    @InjectRepository(FraudFlag)
    private readonly fraudFlagRepository: Repository<FraudFlag>,
    @InjectRepository(ForumReport)
    private readonly forumReportRepository: Repository<ForumReport>,
    @InjectRepository(PointTransaction)
    private readonly pointTransactionRepository: Repository<PointTransaction>,
  ) { }

  async getDashboardStats(filter: 'today' | 'week' | 'month' | 'year' = 'month') {
    // Determine date range if needed (for simplicity, we will query all or last 7 days where specified)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Execute all queries concurrently
    const [
      totalUsers,
      partners,
      locations,
      transactions,
      fraudFlagsCount,
      forumReportsCount,
      feedbacks,
      trashScansCount,
      usersWithTx,
      rewards,
      redemptions,
      lowConfidenceAiCount,
      fraudFlags
    ] = await Promise.all([
      this.userRepository.count(),
      this.partnerRepository.find(),
      this.locationRepository.find(),
      this.dropoffTransactionRepository.find({ relations: ['location', 'location.partnerProfile', 'acceptedWasteType', 'user'] }),
      this.fraudFlagRepository.count({ where: { status: FraudStatus.OPEN } }),
      this.forumReportRepository.count({ where: { status: ReportStatus.OPEN } }),
      this.aiFeedbackRepository.find(),
      this.trashClassificationRepository.count(),
      this.userRepository.find({ relations: ['dropoffTransactions'] }),
      this.rewardRepository.find({ relations: ['redemptions'] }),
      this.redemptionRepository.find({ order: { createdAt: 'DESC' }, relations: ['user', 'reward'], take: 10 }),
      this.trashClassificationRepository.createQueryBuilder('tc').where('tc.confidence < 0.6').orWhere('tc.status = :status', { status: ClassificationStatus.FAILED }).getCount(),
      this.fraudFlagRepository.find()
    ]);

    // Aggregate Locations
    let approvedLocations = 0;
    let pendingLocations = 0;
    locations.forEach(l => {
      if ((l as any).status === 'APPROVED') approvedLocations++;
      else if ((l as any).status === 'PENDING') pendingLocations++;
    });

    // Aggregate Partners
    let pendingPartners = 0;
    partners.forEach(p => {
      if (p.approvalStatus === PartnerApprovalStatus.PENDING) pendingPartners++;
    });

    // Aggregate Transactions
    let totalKg = 0;
    let totalPoints = 0;
    const verifiedTransactions = transactions.filter(t => t.status === DropoffStatus.VERIFIED);
    const pendingTransactionsList = transactions.filter(t => t.status === DropoffStatus.PENDING).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 6);

    verifiedTransactions.forEach(tx => {
      totalPoints += (tx.pointsAwarded || 0);
      let val = tx.quantityValue || 0;
      if (tx.quantityUnit === 'GRAM') val /= 1000;
      totalKg += val;
    });

    // Ranking Locations
    const locationKgMap: Record<string, { name: string, kg: number, txCount: number }> = {};
    verifiedTransactions.forEach(tx => {
      if (tx.location) {
        let val = tx.quantityValue || 0;
        if (tx.quantityUnit === 'GRAM') val /= 1000;
        if (!locationKgMap[tx.location.id]) {
          locationKgMap[tx.location.id] = { name: tx.location.name || 'Unknown', kg: 0, txCount: 0 };
        }
        locationKgMap[tx.location.id].kg += val;
        locationKgMap[tx.location.id].txCount += 1;
      }
    });

    const rankingLocations = Object.values(locationKgMap)
      .sort((a, b) => b.kg - a.kg)
      .slice(0, 5)
      .map(l => ({ label: l.name, value: Math.round(l.kg * 10) / 10 }));

    const locationStats = Object.keys(locationKgMap).map(id => ({
      id,
      name: locationKgMap[id].name,
      checkins: locationKgMap[id].txCount,
      kg: Math.round(locationKgMap[id].kg * 10) / 10,
      topWaste: 'Nhựa', // Fallback for UI if needed, or omit if optional
      status: 'ACTIVE',
      trend: '+5%'
    })).sort((a, b) => b.kg - a.kg).slice(0, 5);

    // Ranking Users
    const rankingUsers = usersWithTx
      .map(u => ({
        label: u.fullName || u.email || 'User',
        value: u.dropoffTransactions?.length || 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Ranking Vouchers
    const rankingVouchers = rewards
      .map(r => ({
        label: r.name || 'Voucher',
        value: r.redemptions?.length || 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Ranking Partners
    const partnerVolumeMap: Record<string, { name: string, txCount: number }> = {};
    verifiedTransactions.forEach(tx => {
      if (tx.location && tx.location.partnerProfile) {
        const pId = tx.location.partnerProfile.id;
        if (!partnerVolumeMap[pId]) {
          partnerVolumeMap[pId] = { name: tx.location.partnerProfile.organizationName || 'Unknown Partner', txCount: 0 };
        }
        partnerVolumeMap[pId].txCount += 1;
      }
    });
    const rankingPartners = Object.values(partnerVolumeMap)
      .sort((a, b) => b.txCount - a.txCount)
      .slice(0, 5)
      .map(p => ({ label: p.name, value: p.txCount }));

    const voucherStats = rewards.map(r => {
      const redeemed = r.redemptions?.length || 0;
      const total = (r.stock || 0) + redeemed;
      const useRate = total > 0 ? Math.round((redeemed / total) * 100) : 0;
      return {
        id: r.id,
        name: r.name || 'Voucher',
        redeemed,
        remaining: r.stock || 0,
        expireDays: 0, // Mock removed: No expiration field in Reward
        useRate
      };
    }).sort((a, b) => b.redeemed - a.redeemed).slice(0, 4);

    let lowStockVoucherCount = 0;
    rewards.forEach(r => { if ((r.stock || 0) < 10) lowStockVoucherCount++; });

    // Activity Feed
    const activityFeed: any[] = [];
    transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5).forEach(tx => {
      activityFeed.push({
        id: `tx-${tx.id}`,
        type: 'checkin',
        text: `${tx.user?.fullName || 'Người dùng'} gửi rác tại ${tx.location?.name || 'Điểm thu gom'}`,
        sub: `Thu gom ${tx.quantityValue} ${tx.quantityUnit} ${tx.acceptedWasteType?.wasteType || ''}`,
        time: tx.createdAt.toISOString(),
        status: tx.status === DropoffStatus.VERIFIED ? 'success' : tx.status === DropoffStatus.PENDING ? 'pending' : 'info',
        icon: '♻️'
      });
    });
    redemptions.slice(0, 5).forEach(r => {
      activityFeed.push({
        id: `red-${r.id}`,
        type: 'reward',
        text: `${r.user?.fullName || 'Người dùng'} đổi quà ${r.reward?.name || ''}`,
        sub: `Đã dùng ${r.pointsSpent} điểm`,
        time: r.createdAt.toISOString(),
        status: 'info',
        icon: '🎁'
      });
    });
    activityFeed.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    // AI Feedback
    const correctFeedbacks = feedbacks.filter(f => f.isCorrect).length;
    const accuracyRate = feedbacks.length > 0 ? Math.round((correctFeedbacks / feedbacks.length) * 100) : 0;

    // Calculate AI Fraud metrics dynamically
    let duplicateQr = 0;
    let wrongGps = 0;
    let abnormalVolume = 0;
    fraudFlags.forEach(f => {
      if (f.flagCode === 'DUPLICATE_QR') duplicateQr++;
      if (f.flagCode === 'LOCATION_MISMATCH') wrongGps++;
      if (f.flagCode === 'ABNORMAL_VOLUME') abnormalVolume++;
    });

    // Chart Data & System Trend
    // Real aggregations for the last 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        dateStr: d.toISOString().split('T')[0],
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        dateObj: d,
      };
    });

    // Calculate chart data from transactions
    const chartData = days.map(day => {
      const dayData: Record<string, any> = { label: day.label, plastic: 0, paper: 0, metal: 0, glass: 0, battery: 0, other: 0 };
      verifiedTransactions.forEach(tx => {
        const txDateStr = tx.createdAt.toISOString().split('T')[0];
        if (txDateStr === day.dateStr) {
          const type = tx.acceptedWasteType?.wasteType?.toLowerCase() || 'other';
          let val = tx.quantityValue || 0;
          if (tx.quantityUnit === 'GRAM') val /= 1000;

          if (type.includes('nhựa') || type.includes('plastic')) dayData.plastic += val;
          else if (type.includes('giấy') || type.includes('paper')) dayData.paper += val;
          else if (type.includes('kim loại') || type.includes('metal')) dayData.metal += val;
          else if (type.includes('thủy tinh') || type.includes('glass')) dayData.glass += val;
          else if (type.includes('pin') || type.includes('battery')) dayData.battery += val;
          else dayData.other += val;
        }
      });
      // Round everything
      Object.keys(dayData).forEach(k => {
        if (k !== 'label') { dayData[k] = Math.round(dayData[k] * 10) / 10; }
      });
      return dayData;
    });

    // We fetch points & scans & new users dynamically if possible
    const trendStats = await Promise.all([
      this.userRepository.createQueryBuilder('u').select('DATE(u.created_at)', 'date').addSelect('COUNT(u.id)', 'count').where('u.created_at >= :date', { date: sevenDaysAgo }).groupBy('DATE(u.created_at)').getRawMany(),
      this.trashClassificationRepository.createQueryBuilder('tc').select('DATE(tc.created_at)', 'date').addSelect('COUNT(tc.id)', 'count').where('tc.created_at >= :date', { date: sevenDaysAgo }).groupBy('DATE(tc.created_at)').getRawMany(),
      this.dropoffTransactionRepository.createQueryBuilder('tx').select('DATE(tx.created_at)', 'date').addSelect('COUNT(tx.id)', 'count').addSelect('SUM(tx.points_awarded)', 'points').where('tx.created_at >= :date', { date: sevenDaysAgo }).groupBy('DATE(tx.created_at)').getRawMany()
    ]);
    const [userStats, scanStats, txStats] = trendStats;

    const systemTrend = days.map(day => {
      const dateStr = day.dateStr;
      const uCount = userStats.find(s => new Date(s.date).toISOString().split('T')[0] === dateStr)?.count || 0;
      const sCount = scanStats.find(s => new Date(s.date).toISOString().split('T')[0] === dateStr)?.count || 0;
      const tStat = txStats.find(s => new Date(s.date).toISOString().split('T')[0] === dateStr) || { count: 0, points: 0 };

      return {
        label: day.label,
        users: Number(uCount),
        scans: Number(sCount),
        transactions: Number(tStat.count),
        points: Number(tStat.points || 0)
      };
    });

    // Calculate Point Sources
    const pointSourcesRaw = await this.pointTransactionRepository.createQueryBuilder('pt')
      .select('pt.source_type', 'sourceType')
      .addSelect('SUM(pt.points)', 'totalPoints')
      .groupBy('pt.source_type')
      .getRawMany();

    let totalPtsFromSources = 0;
    pointSourcesRaw.forEach(ps => totalPtsFromSources += Number(ps.totalPoints));

    const pointSources = pointSourcesRaw.map(ps => {
      const val = Number(ps.totalPoints);
      const pct = totalPtsFromSources > 0 ? Math.round((val / totalPtsFromSources) * 100) : 0;
      let label = ps.sourceType || 'Khác';
      let color = 'bg-slate-500';
      if (label === 'DROPOFF') { label = 'Gửi rác'; color = 'bg-emerald-500'; }
      if (label === 'QUIZ') { label = 'Trắc nghiệm'; color = 'bg-blue-500'; }
      if (label === 'AI_SCAN') { label = 'Scan AI'; color = 'bg-indigo-500'; }
      if (label === 'ADMIN') { label = 'Admin cấp'; color = 'bg-amber-500'; }

      return { label, value: pct, color };
    });

    return {
      kpi: {
        totalUsers,
        totalPartners: partners.length,
        totalKg: Math.round(totalKg),
        totalTransactions: transactions.length,
        pendingTransactions: transactions.length - verifiedTransactions.length,
        verifiedTransactions: verifiedTransactions.length,
        totalPoints: Math.round(totalPoints),
        totalLocations: locations.length,
        approvedLocations,
        pendingLocations,
        pendingPartners,
        lowConfidenceAiCount,
        fraudWarningCount: fraudFlagsCount,
        openForumReports: forumReportsCount,
        lowStockVoucherCount,
        expiringVoucherCount: 0, // No expiring voucher field in DB
        pendingTransactionsList
      },
      chartData,
      activityFeed,
      locationStats,
      voucherStats,
      taskQueue: [
        { label: 'Đối tác chờ duyệt', count: pendingPartners, iconType: 'Store', level: 'PENDING' },
        { label: 'Điểm thu gom chờ duyệt', count: pendingLocations, iconType: 'MapPin', level: 'PENDING' },
        { label: 'Giao dịch thu gom nghi vấn', count: fraudFlagsCount, iconType: 'ShieldAlert', level: 'HIGH' },
        { label: 'AI confidence thấp', count: lowConfidenceAiCount, iconType: 'Bot', level: 'NEEDS_REVIEW' },
        { label: 'Báo cáo forum chưa xử lý', count: forumReportsCount, iconType: 'AlertTriangle', level: 'OPEN' },
        { label: 'Voucher sắp hết hàng', count: lowStockVoucherCount, iconType: 'Gift', level: 'LOW_STOCK' },
      ],
      rankings: {
        locations: rankingLocations,
        partners: rankingPartners,
        users: rankingUsers,
        vouchers: rankingVouchers,
      },
      systemTrend,
      aiFraud: {
        totalScans: trashScansCount,
        accuracyRate,
        lowConfidence: lowConfidenceAiCount,
        duplicateQr,
        wrongGps,
        abnormalVolume,
      },
      pointSources,
      progressGoals: [],
      cumulativeGrowth: [],
      heatmap: [],
    };
  }
}
