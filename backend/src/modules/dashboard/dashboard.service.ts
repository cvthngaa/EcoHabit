import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DropoffTransaction } from '../locations/entities/dropoff-transaction.entity';
import { Location } from '../locations/entities/location.entity';
import { Reward } from '../rewards/entities/reward.entity';
import { Redemption } from '../rewards/entities/redemption.entity';
import { DropoffStatus } from '../locations/enums/dropoff-status.enum';

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
  ) {}

  async getDashboardStats(filter: 'today' | 'week' | 'month' | 'year' = 'month') {
    // Basic KPIs
    const totalTransactions = await this.dropoffTransactionRepository.count();
    const pendingTransactions = await this.dropoffTransactionRepository.count({
      where: { status: DropoffStatus.PENDING },
    });
    const verifiedTransactionsList = await this.dropoffTransactionRepository.find({
      where: { status: DropoffStatus.VERIFIED },
    });

    const totalPoints = verifiedTransactionsList.reduce((sum, tx) => sum + (tx.pointsAwarded || 0), 0);
    const totalKg = verifiedTransactionsList.reduce((sum, tx) => {
      let val = tx.quantityValue || 0;
      if (tx.quantityUnit === 'GRAM') val /= 1000;
      return sum + val;
    }, 0);

    const locations = await this.locationRepository.find();
    
    // Aggregations for Collection Point Performance
    const locationStats = await Promise.all(
      locations.map(async (loc) => {
        const txs = await this.dropoffTransactionRepository.find({
          where: { location: { id: loc.id }, status: DropoffStatus.VERIFIED },
          relations: ['acceptedWasteType']
        });
        
        let kg = 0;
        const wasteCounts: Record<string, number> = {};
        
        txs.forEach(tx => {
          let val = tx.quantityValue || 0;
          if (tx.quantityUnit === 'GRAM') val /= 1000;
          kg += val;
          
          if (tx.acceptedWasteType) {
            const wt = tx.acceptedWasteType.wasteType;
            if (wt) {
              wasteCounts[wt] = (wasteCounts[wt] || 0) + val;
            }
          }
        });

        let topWaste = '—';
        let maxW = 0;
        for (const [wType, wVal] of Object.entries(wasteCounts)) {
          if (wVal > maxW) {
            maxW = wVal;
            topWaste = wType;
          }
        }

        return {
          id: loc.id,
          name: loc.name,
          checkins: txs.length,
          kg: Math.round(kg * 10) / 10,
          topWaste,
          status: loc.status,
          trend: '+0%' // Placeholder for real trend calculation
        };
      })
    );

    // Sort location stats by kg descending
    locationStats.sort((a, b) => b.kg - a.kg);

    // Voucher Stats
    const rewards = await this.rewardRepository.find({ relations: ['redemptions'] });
    const voucherStats = rewards.map(r => {
      const redeemed = r.redemptions?.length || 0;
      const total = (r.stock || 0) + redeemed;
      const useRate = total > 0 ? Math.round((redeemed / total) * 100) : 0;
      return {
        id: r.id,
        name: r.name,
        redeemed,
        remaining: r.stock || 0,
        expireDays: 30, // Mocked expiration since Reward entity doesn't have it
        useRate
      };
    });

    // Recent Activity Feed
    const recentTx = await this.dropoffTransactionRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['user', 'location', 'acceptedWasteType']
    });

    const recentRedemptions = await this.redemptionRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['user', 'reward']
    });

    const activityFeed: { id: string; type: string; text: string; sub: string; time: Date; status: string }[] = [];
    
    recentTx.forEach(tx => {
      activityFeed.push({
        id: `tx-${tx.id}`,
        type: 'checkin',
        text: `${tx.user?.fullName || 'Người dùng'} gửi rác tại ${tx.location?.name || 'Điểm thu gom'}`,
        sub: `Thu gom ${tx.quantityValue} ${tx.quantityUnit} ${tx.acceptedWasteType?.wasteType || ''}`,
        time: tx.createdAt,
        status: tx.status === DropoffStatus.VERIFIED ? 'success' : tx.status === DropoffStatus.PENDING ? 'pending' : 'info'
      });
    });

    recentRedemptions.forEach(r => {
      activityFeed.push({
        id: `red-${r.id}`,
        type: 'reward',
        text: `${r.user?.fullName || 'Người dùng'} đổi quà ${r.reward?.name || ''}`,
        sub: `Đã dùng ${r.pointsSpent} điểm`,
        time: r.createdAt,
        status: 'info'
      });
    });

    // Sort combined feed
    activityFeed.sort((a, b) => b.time.getTime() - a.time.getTime());

    // Generate mock chart data based on real overall volume for now (since time-series grouping in SQL is complex for a quick iteration)
    // We will distribute the total Kg across a week
    const chartData = [
      { label: 'T2', plastic: totalKg * 0.1, paper: totalKg * 0.05, metal: 0, glass: 0, battery: 0, other: 0 },
      { label: 'T3', plastic: totalKg * 0.15, paper: totalKg * 0.08, metal: 0, glass: 0, battery: 0, other: 0 },
      { label: 'T4', plastic: totalKg * 0.12, paper: totalKg * 0.06, metal: 0, glass: 0, battery: 0, other: 0 },
      { label: 'T5', plastic: totalKg * 0.18, paper: totalKg * 0.09, metal: 0, glass: 0, battery: 0, other: 0 },
      { label: 'T6', plastic: totalKg * 0.2, paper: totalKg * 0.1, metal: 0, glass: 0, battery: 0, other: 0 },
      { label: 'T7', plastic: totalKg * 0.25, paper: totalKg * 0.12, metal: 0, glass: 0, battery: 0, other: 0 },
      { label: 'CN', plastic: totalKg * 0.15, paper: totalKg * 0.08, metal: 0, glass: 0, battery: 0, other: 0 },
    ];

    // Format chart data rounded
    chartData.forEach(d => {
      Object.keys(d).forEach(k => {
        if (k !== 'label') {
            (d as any)[k] = Math.round((d as any)[k]);
        }
      });
    });

    return {
      kpi: {
        totalKg: Math.round(totalKg),
        totalTransactions,
        pendingTransactions,
        verifiedTransactions: verifiedTransactionsList.length,
        totalPoints,
        totalLocations: locations.length,
        approvedLocations: locations.filter(l => l.status === 'APPROVED').length,
        pendingTransactionsList: await this.dropoffTransactionRepository.find({
          where: { status: DropoffStatus.PENDING },
          take: 6,
          order: { createdAt: 'DESC' },
          relations: ['user', 'location', 'acceptedWasteType']
        })
      },
      chartData,
      activityFeed: activityFeed.slice(0, 10).map(item => ({
        ...item,
        icon: item.type === 'checkin' ? '♻️' : '🎁',
        // Mock a readable time string
        time: item.time ? new Date(item.time).toLocaleDateString() : 'N/A'
      })),
      locationStats: locationStats.slice(0, 5),
      voucherStats: voucherStats.slice(0, 4)
    };
  }
}

