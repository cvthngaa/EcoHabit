import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../theme/colors';
import EmptyState from '../components/EmptyState';
import { mockUser, mockTransactions, rankConfig, WalletTransaction } from '../services/mockData';
import { getBalance, getTransactions } from '../services/walletService';

const { width } = Dimensions.get('window');

// ── WalletScreen ──────────────────────────────────────────────────────────────

const WalletScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<'all' | 'earn' | 'spend'>('all');
  const countAnim = useRef(new Animated.Value(0)).current;

  const balance = getBalance();
  const transactions = getTransactions(activeFilter);
  const rank = rankConfig[mockUser.rank];
  const progress = rank.nextPoints ? Math.min((balance / rank.nextPoints) * 100, 100) : 100;

  // Count-up animation
  useEffect(() => {
    Animated.timing(countAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const filters = [
    { key: 'all' as const,   label: 'Tất cả',     icon: 'list-outline' },
    { key: 'earn' as const,  label: 'Nhận điểm',   icon: 'trending-up-outline' },
    { key: 'spend' as const, label: 'Sử dụng',     icon: 'trending-down-outline' },
  ];

  const renderTransaction = (tx: WalletTransaction, index: number) => {
    const isEarn = tx.type === 'earn';
    return (
      <Animated.View
        key={tx.id}
        style={[
          styles.txItem,
          index < transactions.length - 1 && styles.txBorder,
          { opacity: countAnim },
        ]}
      >
        <View style={[styles.txIcon, { backgroundColor: isEarn ? Colors.successLight : Colors.errorLight }]}>
          <Ionicons
            name={tx.icon as any}
            size={20}
            color={isEarn ? Colors.earn : Colors.spend}
          />
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txDesc}>{tx.description}</Text>
          <Text style={styles.txDate}>{tx.date}</Text>
        </View>
        <Text style={[styles.txAmount, { color: isEarn ? Colors.earn : Colors.spend }]}>
          {isEarn ? '+' : '-'}{tx.amount} đ
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <LinearGradient
          colors={[Colors.primaryGradientStart, Colors.primaryLight, '#66BB6A']}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Decorative circles */}
          <View style={[styles.decorCircle, styles.decorCircle1]} />
          <View style={[styles.decorCircle, styles.decorCircle2]} />

          <Text style={styles.headerLabel}>Ví điểm xanh</Text>

          {/* Balance */}
          <View style={styles.balanceRow}>
            <View style={styles.coinIcon}>
              <Text style={styles.coinEmoji}>🍃</Text>
            </View>
            <View>
              <Text style={styles.balanceValue}>{balance.toLocaleString()}</Text>
              <Text style={styles.balanceSuffix}>điểm xanh</Text>
            </View>
          </View>

          {/* Rank progress */}
          <View style={styles.rankCard}>
            <View style={styles.rankRow}>
              <Text style={styles.rankEmoji}>{rank.emoji}</Text>
              <Text style={styles.rankLabel}>Hạng {rank.label}</Text>
              {rank.next && (
                <Text style={styles.rankNext}>→ {rank.next} ({rank.nextPoints} đ)</Text>
              )}
            </View>
            <View style={styles.rankBar}>
              <View style={[styles.rankFill, { width: `${progress}%` as any }]} />
            </View>
            <Text style={styles.rankPct}>{Math.round(progress)}%</Text>
          </View>

          {/* Quick stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>+{mockTransactions.filter(t => t.type === 'earn').reduce((s, t) => s + t.amount, 0)}</Text>
              <Text style={styles.statLabel}>Tổng nhận</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>-{mockTransactions.filter(t => t.type === 'spend').reduce((s, t) => s + t.amount, 0)}</Text>
              <Text style={styles.statLabel}>Đã dùng</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockTransactions.length}</Text>
              <Text style={styles.statLabel}>Giao dịch</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Filter tabs ─────────────────────────────────────────────────── */}
        <View style={styles.filterRow}>
          {filters.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterTab, activeFilter === f.key && styles.filterTabActive]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={f.icon as any}
                size={16}
                color={activeFilter === f.key ? Colors.white : Colors.textSecondary}
              />
              <Text style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Transactions ────────────────────────────────────────────────── */}
        <View style={styles.txSection}>
          <Text style={styles.txTitle}>Lịch sử giao dịch</Text>

          {transactions.length > 0 ? (
            <View style={styles.txCard}>
              {transactions.map((tx, i) => renderTransaction(tx, i))}
            </View>
          ) : (
            <EmptyState
              emoji="📭"
              title="Chưa có giao dịch"
              subtitle={`Chưa có giao dịch ${activeFilter === 'earn' ? 'nhận điểm' : 'sử dụng điểm'} nào`}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: {},

  // Header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorCircle1: { width: 180, height: 180, top: -40, right: -40 },
  decorCircle2: { width: 120, height: 120, bottom: -30, left: -20 },

  headerLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginBottom: 8,
  },

  // Balance
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  coinIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  coinEmoji: { fontSize: 28 },
  balanceValue: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -1,
  },
  balanceSuffix: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginTop: -2,
  },

  // Rank
  rankCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  rankEmoji: { fontSize: 18 },
  rankLabel: { fontSize: 14, fontWeight: '700', color: Colors.white },
  rankNext: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  rankBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  rankFill: {
    height: '100%',
    backgroundColor: '#FFD54F',
    borderRadius: 3,
  },
  rankPct: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 4,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Filters
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
  },

  // Transactions
  txSection: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  txTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  txCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  txBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  txIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  txDate: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default WalletScreen;
