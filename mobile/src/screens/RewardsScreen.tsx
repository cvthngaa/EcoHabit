import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../theme/colors';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { mockRewards, rankConfig, mockUser } from '../services/mockData';
import { getBalance, spendPoints } from '../services/walletService';

const { width } = Dimensions.get('window');

// ── Categories ────────────────────────────────────────────────────────────────

const categories = [
  { id: 1, label: 'Tất cả',   icon: 'grid-outline',           color: Colors.primary },
  { id: 2, label: 'Mua sắm', icon: 'bag-handle-outline',     color: '#1565C0' },
  { id: 3, label: 'Ăn uống', icon: 'restaurant-outline',     color: '#E65100' },
  { id: 4, label: 'Cây trồng', icon: 'leaf-outline',          color: '#2E7D32' },
  { id: 5, label: 'Giáo dục', icon: 'book-outline',           color: '#6A1B9A' },
];

// ── History mock ──────────────────────────────────────────────────────────────

const initialHistory = [
  { name: 'Túi vải tái chế', pts: -200, date: '08/04/2026', status: 'Đã giao' },
  { name: 'Voucher Cafe xanh', pts: -150, date: '02/04/2026', status: 'Đã sử dụng' },
];

// ── RewardsScreen ─────────────────────────────────────────────────────────────

const RewardsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'shop' | 'history'>('shop');
  const [activeCat, setActiveCat] = useState(1);
  const [modalItem, setModalItem] = useState<typeof mockRewards[0] | null>(null);
  const [redeemed, setRedeemed] = useState<number[]>([]);
  const [history, setHistory] = useState(initialHistory);
  const [redeeming, setRedeeming] = useState(false);

  const userPoints = getBalance();

  const filtered = activeCat === 1
    ? mockRewards
    : mockRewards.filter(r => r.category === categories.find(c => c.id === activeCat)?.label);

  const rank = rankConfig[mockUser.rank];
  const progress = rank.nextPoints ? Math.min((userPoints / rank.nextPoints) * 100, 100) : 100;

  const handleRedeem = async (item: typeof mockRewards[0]) => {
    if (userPoints < item.points) {
      showToast('Không đủ điểm để đổi thưởng', 'error');
      return;
    }

    setRedeeming(true);

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = spendPoints(item.points, item.name);
    if (result.success) {
      setRedeemed(v => [...v, item.id]);
      setHistory(prev => [{
        name: item.name,
        pts: -item.points,
        date: new Date().toLocaleDateString('vi-VN'),
        status: 'Đang xử lý',
      }, ...prev]);
      showToast(`🎉 Đã đổi "${item.name}" thành công!`, 'success');
    } else {
      showToast(result.error || 'Có lỗi xảy ra', 'error');
    }

    setRedeeming(false);
    setModalItem(null);
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 20 }]} showsVerticalScrollIndicator={false}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <LinearGradient
          colors={[Colors.primaryGradientStart, Colors.primaryLight]}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={styles.decorCircle} />
          <View>
            <Text style={styles.headerSub}>Kho điểm của bạn</Text>
            <View style={styles.ptsRow}>
              <Text style={styles.ptsValue}>{userPoints}</Text>
              <Text style={styles.ptsSuffix}> điểm xanh</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.starBadge}>
              <Ionicons name="star" size={22} color="#FFD54F" />
            </View>
          </View>

          {/* Progress to next tier */}
          <View style={styles.tierWrap}>
            <View style={styles.tierRow}>
              <Text style={styles.tierLabel}>{rank.emoji} {rank.label} → {rank.next ? `${rank.next}` : 'Max'}</Text>
              <Text style={styles.tierPct}>{Math.round(progress)}%</Text>
            </View>
            <View style={styles.tierBar}>
              <View style={[styles.tierFill, { width: `${progress}%` as any }]} />
            </View>
          </View>
        </LinearGradient>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <View style={styles.tabs}>
          {(['shop', 'history'] as const).map(t => (
            <TouchableOpacity key={t} style={[styles.tab, activeTab === t && styles.tabActive]} onPress={() => setActiveTab(t)}>
              <Text style={[styles.tabTxt, activeTab === t && styles.tabTxtActive]}>
                {t === 'shop' ? '🛍️ Cửa hàng' : '📋 Lịch sử'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'shop' ? (
          <>
            {/* ── Category filters ──────────────────────────────────────── */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
              {categories.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.catChip, activeCat === c.id && { backgroundColor: c.color }]}
                  onPress={() => setActiveCat(c.id)}
                >
                  <Ionicons name={c.icon as any} size={15} color={activeCat === c.id ? Colors.white : Colors.textSecondary} />
                  <Text style={[styles.catTxt, activeCat === c.id && { color: Colors.white }]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* ── Reward grid ───────────────────────────────────────────── */}
            <View style={styles.grid}>
              {filtered.map(r => {
                const canRedeem = userPoints >= r.points;
                const isRedeemed = redeemed.includes(r.id);
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.rewardCard, { backgroundColor: r.bg }]}
                    onPress={() => !isRedeemed && setModalItem(r)}
                    activeOpacity={0.85}
                  >
                    {r.tag ? <View style={styles.tag}><Text style={styles.tagTxt}>{r.tag}</Text></View> : null}

                    <View style={[styles.rewardIcon, { backgroundColor: r.color + '22' }]}>
                      <Text style={styles.rewardEmoji}>{r.emoji}</Text>
                    </View>

                    <Text style={styles.rewardName}>{r.name}</Text>

                    <View style={styles.rewardFooter}>
                      <View style={styles.ptsBadge}>
                        <Ionicons name="star" size={11} color="#F57F17" />
                        <Text style={styles.ptsBadgeTxt}>{r.points} đ</Text>
                      </View>
                      {isRedeemed ? (
                        <View style={styles.redeemedBadge}>
                          <Ionicons name="checkmark" size={12} color={Colors.white} />
                          <Text style={styles.redeemedTxt}>Đã đổi</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[styles.redeemBtn, !canRedeem && styles.redeemBtnDisabled]}
                          onPress={() => canRedeem && setModalItem(r)}
                        >
                          <Text style={[styles.redeemTxt, !canRedeem && { opacity: 0.5 }]}>
                            {canRedeem ? 'Đổi ngay' : 'Thiếu đ'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={styles.stockTxt}>Còn {r.stock} lượt</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : (
          /* ── History ───────────────────────────────────────────────────── */
          <View style={styles.historyWrap}>
            {history.length > 0 ? (
              history.map((h, i) => (
                <View key={i} style={styles.historyItem}>
                  <View style={styles.histIcon}>
                    <Ionicons name="gift-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.histInfo}>
                    <Text style={styles.histName}>{h.name}</Text>
                    <Text style={styles.histDate}>{h.date}</Text>
                  </View>
                  <View style={styles.histRight}>
                    <Text style={styles.histPts}>{h.pts} đ</Text>
                    <View style={styles.histStatus}>
                      <Text style={styles.histStatusTxt}>{h.status}</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <EmptyState
                emoji="🎁"
                title="Chưa có lịch sử đổi thưởng"
                subtitle="Hãy tích điểm và đổi những phần thưởng hấp dẫn!"
                actionLabel="Quét rác ngay"
                onAction={() => {}}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* ── Redeem modal ────────────────────────────────────────────────────── */}
      <Modal visible={!!modalItem} transparent animationType="slide" onRequestClose={() => setModalItem(null)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => !redeeming && setModalItem(null)} activeOpacity={1}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHandle} />
            {modalItem && (
              <>
                <View style={[styles.modalIcon, { backgroundColor: modalItem.bg }]}>
                  <Text style={styles.modalEmoji}>{modalItem.emoji}</Text>
                </View>
                <Text style={styles.modalName}>{modalItem.name}</Text>
                <Text style={styles.modalDesc}>{modalItem.description}</Text>
                <Text style={styles.modalCat}>{modalItem.category}</Text>

                <View style={styles.modalPtsRow}>
                  <Ionicons name="star" size={18} color="#F57F17" />
                  <Text style={styles.modalPts}>{modalItem.points} điểm xanh</Text>
                </View>

                <View style={styles.modalBalance}>
                  <Text style={styles.balanceTxt}>Số dư hiện tại: </Text>
                  <Text style={styles.balanceVal}>{userPoints} đ</Text>
                  <Text style={styles.balanceTxt}> → </Text>
                  <Text style={[styles.balanceVal, { color: userPoints - modalItem.points >= 0 ? Colors.primary : Colors.error }]}>
                    {userPoints - modalItem.points} đ
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.modalConfirmWrap, redeeming && { opacity: 0.7 }]}
                  onPress={() => !redeeming && handleRedeem(modalItem)}
                  disabled={redeeming}
                >
                  <LinearGradient colors={[Colors.primaryGradientStart, Colors.primaryLight]} style={styles.modalConfirm}>
                    <Text style={styles.modalConfirmTxt}>
                      {redeeming ? 'Đang xử lý...' : 'Xác nhận đổi thưởng'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalCancel} onPress={() => setModalItem(null)} disabled={redeeming}>
                  <Text style={styles.modalCancelTxt}>Hủy</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F9F5' },
  scroll: { paddingBottom: 20 },

  // Header
  header: { paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' },
  decorCircle: { position: 'absolute', top: -30, right: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.08)' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  ptsRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 16 },
  ptsValue: { fontSize: 48, fontWeight: '800', color: Colors.white, letterSpacing: -1 },
  ptsSuffix: { fontSize: 16, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  headerRight: { position: 'absolute', top: 60, right: 20 },
  starBadge: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  tierWrap: {},
  tierRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  tierLabel: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  tierPct: { fontSize: 12, color: Colors.white, fontWeight: '700' },
  tierBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden' },
  tierFill: { height: '100%', backgroundColor: '#FFD54F', borderRadius: 3 },

  // Tabs
  tabs: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, marginBottom: 8, backgroundColor: Colors.surfaceLight, borderRadius: 14, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.white, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
  tabTxt: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  tabTxtActive: { color: Colors.textPrimary },

  // Category chips
  catRow: { paddingHorizontal: 16, gap: 8, marginBottom: 16, paddingVertical: 4 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  catTxt: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10 },
  rewardCard: { width: (width - 34) / 2, borderRadius: 20, padding: 14, position: 'relative' },
  tag: { position: 'absolute', top: 10, right: 10, backgroundColor: '#FF5252', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  tagTxt: { fontSize: 10, fontWeight: '700', color: Colors.white },
  rewardIcon: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  rewardEmoji: { fontSize: 28 },
  rewardName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10, lineHeight: 18 },
  rewardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  ptsBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ptsBadgeTxt: { fontSize: 12, fontWeight: '700', color: '#F57F17' },
  redeemBtn: { backgroundColor: Colors.primaryLight, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  redeemBtnDisabled: { backgroundColor: '#E0E0E0' },
  redeemTxt: { fontSize: 11, fontWeight: '700', color: Colors.white },
  redeemedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  redeemedTxt: { fontSize: 11, fontWeight: '700', color: Colors.white },
  stockTxt: { fontSize: 10, color: Colors.textMuted },

  // History
  historyWrap: { paddingHorizontal: 16, marginTop: 8 },
  historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 16, padding: 14, marginBottom: 10, elevation: 2 },
  histIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  histInfo: { flex: 1 },
  histName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  histDate: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  histRight: { alignItems: 'flex-end' },
  histPts: { fontSize: 14, fontWeight: '700', color: Colors.error },
  histStatus: { backgroundColor: '#E8F5E9', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 },
  histStatusTxt: { fontSize: 10, fontWeight: '700', color: Colors.primary },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, alignItems: 'center' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginBottom: 16 },
  modalIcon: { width: 90, height: 90, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  modalEmoji: { fontSize: 42 },
  modalName: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', marginBottom: 4 },
  modalDesc: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginBottom: 4, lineHeight: 20 },
  modalCat: { fontSize: 13, color: Colors.textMuted, marginBottom: 14 },
  modalPtsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  modalPts: { fontSize: 22, fontWeight: '800', color: '#F57F17' },
  modalBalance: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  balanceTxt: { fontSize: 13, color: Colors.textSecondary },
  balanceVal: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  modalConfirmWrap: { width: '100%', borderRadius: 50, overflow: 'hidden', marginBottom: 10, elevation: 6 },
  modalConfirm: { height: 54, alignItems: 'center', justifyContent: 'center' },
  modalConfirmTxt: { fontSize: 16, fontWeight: '700', color: Colors.white },
  modalCancel: { paddingVertical: 12 },
  modalCancelTxt: { fontSize: 15, color: Colors.textMuted, fontWeight: '600' },
});

export default RewardsScreen;
