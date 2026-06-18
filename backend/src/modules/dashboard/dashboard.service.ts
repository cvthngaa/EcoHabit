import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
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
import { PartnerApprovalStatus } from '../partner/enum/partner-approval-status.enum';
import { FraudStatus } from '../fraud/enums/fraud-status.enum';
import { PointTransaction } from '../points/entities/point-transaction.entity';
import { ClassificationStatus } from '../ai/enums/classification-status.enum';
import { LocationStatus } from '../locations/enums/location-status.enum';

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
    @InjectRepository(PointTransaction)
    private readonly pointTransactionRepository: Repository<PointTransaction>,
  ) { }

  async getDashboardStats(filter: 'today' | 'week' | 'month' | 'year' = 'month') {
    const range = this.getDateRange(filter);
    const dateWhere = { createdAt: Between(range.start, range.end) };

    // Execute all queries concurrently
    const [
      totalUsers,
      partners,
      locations,
      transactions,
      fraudFlagsCount,
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
      this.dropoffTransactionRepository.find({
        where: dateWhere,
        relations: ['location', 'location.partnerProfile', 'acceptedWasteType', 'user'],
      }),
      this.fraudFlagRepository.count({ where: { status: FraudStatus.OPEN } }),
      this.aiFeedbackRepository.find(),
      this.trashClassificationRepository.count(),
      this.userRepository.find({ relations: ['dropoffTransactions'] }),
      this.rewardRepository.find({ relations: ['redemptions'] }),
      this.redemptionRepository.find({ where: dateWhere, order: { createdAt: 'DESC' }, relations: ['user', 'reward'], take: 10 }),
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
      status: LocationStatus.APPROVED,
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
    const activeFraudFlags = fraudFlags.filter(f => [FraudStatus.OPEN, FraudStatus.REVIEWING].includes(f.status));
    activeFraudFlags.forEach(f => {
      if (f.flagCode === 'DUPLICATE_QR') duplicateQr++;
      if (f.flagCode === 'LOCATION_MISMATCH' || f.flagCode === 'CHECKIN_TOO_FAR') wrongGps++;
      if (f.flagCode === 'ABNORMAL_VOLUME') abnormalVolume++;
    });

    // Chart Data & System Trend
    const trendBuckets = this.getChartBuckets(filter);

    const chartData = this.buildWasteChartData(verifiedTransactions, filter);

    // We fetch points & scans & new users dynamically if possible
    const trendStats = await Promise.all([
      this.userRepository.createQueryBuilder('u').select('DATE(u.created_at)', 'date').addSelect('COUNT(u.id)', 'count').where('u.created_at >= :date', { date: range.start }).groupBy('DATE(u.created_at)').getRawMany(),
      this.trashClassificationRepository.createQueryBuilder('tc').select('DATE(tc.created_at)', 'date').addSelect('COUNT(tc.id)', 'count').where('tc.created_at >= :date', { date: range.start }).groupBy('DATE(tc.created_at)').getRawMany(),
      this.dropoffTransactionRepository.createQueryBuilder('tx').select('DATE(tx.created_at)', 'date').addSelect('COUNT(tx.id)', 'count').addSelect('SUM(tx.points_awarded)', 'points').where('tx.created_at >= :date', { date: range.start }).groupBy('DATE(tx.created_at)').getRawMany()
    ]);
    const [userStats, scanStats, txStats] = trendStats;

    const systemTrend = trendBuckets.map(bucket => {
      const uCount = userStats
        .filter(s => bucket.matches(new Date(s.date)))
        .reduce((sum, s) => sum + Number(s.count || 0), 0);
      const sCount = scanStats
        .filter(s => bucket.matches(new Date(s.date)))
        .reduce((sum, s) => sum + Number(s.count || 0), 0);
      const tStat = txStats
        .filter(s => bucket.matches(new Date(s.date)))
        .reduce((sum, s) => ({
          count: sum.count + Number(s.count || 0),
          points: sum.points + Number(s.points || 0),
        }), { count: 0, points: 0 });

      return {
        label: bucket.label,
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

  async getPartnerDashboardStats(
    userId: string,
    filter: 'today' | 'week' | 'month' | 'year' = 'month',
  ) {
    const partner = await this.partnerRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'roleTypes'],
    });

    if (!partner) {
      throw new NotFoundException('Không tìm thấy hồ sơ đối tác');
    }

    if (partner.approvalStatus !== PartnerApprovalStatus.APPROVED) {
      throw new ForbiddenException('Tài khoản đối tác chưa được duyệt');
    }

    const range = this.getDateRange(filter);
    const dateWhere = range ? { createdAt: Between(range.start, range.end) } : {};

    const [locations, transactions, rewards, redemptions] = await Promise.all([
      this.locationRepository.find({
        where: { partnerProfile: { id: partner.id } },
        relations: ['acceptedWasteTypes'],
      }),
      this.dropoffTransactionRepository.find({
        where: {
          location: { partnerProfile: { id: partner.id } },
          ...dateWhere,
        },
        relations: ['location', 'acceptedWasteType', 'user'],
        order: { createdAt: 'DESC' },
      }),
      this.rewardRepository.find({
        where: { partnerProfile: { id: partner.id } },
        relations: ['redemptions'],
      }),
      this.redemptionRepository.find({
        where: {
          reward: { partnerProfile: { id: partner.id } },
          ...dateWhere,
        },
        relations: ['user', 'reward'],
        order: { createdAt: 'DESC' },
        take: 10,
      }),
    ]);

    const verifiedTransactions = transactions.filter((tx) => tx.status === DropoffStatus.VERIFIED);
    const pendingTransactions = transactions.filter((tx) => tx.status === DropoffStatus.PENDING);
    const pendingTransactionsList = pendingTransactions.slice(0, 6);

    const totalKg = verifiedTransactions.reduce((sum, tx) => sum + this.toKg(tx.quantityValue, tx.quantityUnit), 0);
    const totalPoints = verifiedTransactions.reduce((sum, tx) => sum + (tx.pointsAwarded || 0), 0);
    const approvedLocations = locations.filter((loc) => loc.status === LocationStatus.APPROVED).length;

    const locationStats = locations.map((location) => {
      const locationTxs = verifiedTransactions.filter((tx) => tx.location?.id === location.id);
      const kg = locationTxs.reduce((sum, tx) => sum + this.toKg(tx.quantityValue, tx.quantityUnit), 0);
      const wasteTotals: Record<string, number> = {};

      locationTxs.forEach((tx) => {
        const wasteType = tx.acceptedWasteType?.wasteType || 'other';
        wasteTotals[wasteType] = (wasteTotals[wasteType] || 0) + this.toKg(tx.quantityValue, tx.quantityUnit);
      });

      const topWaste = Object.entries(wasteTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'other';

      return {
        id: location.id,
        name: location.name || 'Điểm thu gom',
        checkins: locationTxs.length,
        kg: Math.round(kg * 10) / 10,
        topWaste,
        status: location.status || LocationStatus.PENDING,
        trend: '—',
      };
    }).sort((a, b) => b.kg - a.kg).slice(0, 5);

    const voucherStats = rewards.map((reward) => {
      const redeemed = reward.redemptions?.length || 0;
      const remaining = reward.stock || 0;
      const total = redeemed + remaining;

      return {
        id: reward.id,
        name: reward.name || 'Voucher',
        redeemed,
        remaining,
        expireDays: null,
        useRate: total > 0 ? Math.round((redeemed / total) * 100) : 0,
      };
    }).sort((a, b) => b.redeemed - a.redeemed).slice(0, 4);

    const chartData = this.buildWasteChartData(verifiedTransactions, filter);

    const transactionActivities = transactions.slice(0, 5).map((tx) => ({
      id: `tx-${tx.id}`,
      type: 'checkin',
      text: `${tx.user?.fullName || 'Người dùng'} gửi rác tại ${tx.location?.name || 'Điểm thu gom'}`,
      sub: `Thu gom ${tx.quantityValue || 0} ${tx.quantityUnit || ''} ${tx.acceptedWasteType?.wasteType || ''}`.trim(),
      time: tx.createdAt.toISOString(),
      status: tx.status === DropoffStatus.VERIFIED ? 'success' : tx.status === DropoffStatus.PENDING ? 'pending' : 'info',
      icon: '♻️',
    }));

    const redemptionActivities = redemptions.slice(0, 5).map((redemption) => ({
      id: `red-${redemption.id}`,
      type: 'reward',
      text: `${redemption.user?.fullName || 'Người dùng'} đổi quà ${redemption.reward?.name || ''}`.trim(),
      sub: `Đã dùng ${redemption.pointsSpent || 0} điểm`,
      time: redemption.createdAt.toISOString(),
      status: 'info',
      icon: '🎁',
    }));

    const activityFeed = [...transactionActivities, ...redemptionActivities]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);

    return {
      kpi: {
        totalKg: Math.round(totalKg),
        totalTransactions: transactions.length,
        pendingTransactions: pendingTransactions.length,
        verifiedTransactions: verifiedTransactions.length,
        totalPoints: Math.round(totalPoints),
        totalLocations: locations.length,
        approvedLocations,
        pendingTransactionsList,
      },
      chartData,
      activityFeed,
      locationStats,
      voucherStats,
    };
  }

  private getDateRange(filter: 'today' | 'week' | 'month' | 'year') {
    const now = new Date();
    const start = new Date(now);

    if (filter === 'today') {
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
    }

    if (filter === 'week') {
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
    }

    if (filter === 'month') {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
    }

    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    return { start, end: now };
  }

  private toKg(value?: number | null, unit?: string | null) {
    const quantity = value || 0;
    return unit === 'GRAM' ? quantity / 1000 : quantity;
  }

  private buildWasteChartData(transactions: DropoffTransaction[], filter: 'today' | 'week' | 'month' | 'year') {
    const buckets = this.getChartBuckets(filter);

    return buckets.map((bucket) => {
      const dayData: Record<string, number | string> = {
        label: bucket.label,
        plastic: 0,
        paper: 0,
        metal: 0,
        glass: 0,
        battery: 0,
        other: 0,
      };

      transactions.forEach((tx) => {
        if (!bucket.matches(tx.createdAt)) return;

        const wasteType = tx.acceptedWasteType?.wasteType?.toLowerCase() || 'other';
        const kg = this.toKg(tx.quantityValue, tx.quantityUnit);

        if (wasteType.includes('nhựa') || wasteType.includes('plastic')) dayData.plastic = Number(dayData.plastic) + kg;
        else if (wasteType.includes('giấy') || wasteType.includes('paper')) dayData.paper = Number(dayData.paper) + kg;
        else if (wasteType.includes('kim loại') || wasteType.includes('metal')) dayData.metal = Number(dayData.metal) + kg;
        else if (wasteType.includes('thủy tinh') || wasteType.includes('thuỷ tinh') || wasteType.includes('glass')) dayData.glass = Number(dayData.glass) + kg;
        else if (wasteType.includes('pin') || wasteType.includes('battery')) dayData.battery = Number(dayData.battery) + kg;
        else dayData.other = Number(dayData.other) + kg;
      });

      Object.keys(dayData).forEach((key) => {
        if (key !== 'label') dayData[key] = Math.round(Number(dayData[key]) * 10) / 10;
      });

      return dayData;
    });
  }

  private getChartBuckets(filter: 'today' | 'week' | 'month' | 'year') {
    const now = new Date();

    if (filter === 'today') {
      const dateStr = now.toISOString().split('T')[0];
      return [{
        label: 'Hôm nay',
        matches: (date: Date) => date.toISOString().split('T')[0] === dateStr,
      }];
    }

    if (filter === 'year') {
      return Array.from({ length: now.getMonth() + 1 }, (_, month) => ({
        label: `T${month + 1}`,
        matches: (date: Date) => date.getFullYear() === now.getFullYear() && date.getMonth() === month,
      }));
    }

    if (filter === 'month') {
      return Array.from({ length: now.getDate() }, (_, i) => {
        const day = i + 1;
        return {
          label: `${day}/${now.getMonth() + 1}`,
          matches: (date: Date) =>
            date.getFullYear() === now.getFullYear()
            && date.getMonth() === now.getMonth()
            && date.getDate() === day,
        };
      });
    }

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];

      return {
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        matches: (date: Date) => date.toISOString().split('T')[0] === dateStr,
      };
    });
  }
}
