import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Colors from '../../theme/colors';
import EmptyState from '../../components/EmptyState';
import SelectableChipTabs from '../../components/SelectableChipTabs';
import { useToast } from '../../context/ToastContext';
import { rankConfig } from '../../services/mockData';
import { getProfile } from '../../services/api/auth.service';
import { getPointHistory } from '../../services/api/points.service';
import {
  getAllRewards,
  redeemReward,
} from '../../services/api/rewards.service';

const { width } = Dimensions.get('window');

const categories = [
  { id: 1, label: 'Tất cả', icon: 'grid-outline', color: Colors.primary },
  { id: 2, label: 'Mua sắm', icon: 'bag-handle-outline', color: '#1565C0' },
  { id: 3, label: 'Ăn uống', icon: 'restaurant-outline', color: '#E65100' },
  { id: 4, label: 'Cây trồng', icon: 'leaf-outline', color: '#2E7D32' },
  { id: 5, label: 'Giáo dục', icon: 'book-outline', color: '#6A1B9A' },
];

const categoryChipItems = categories.map((category) => ({
  key: category.id,
  label: category.label,
  icon: category.icon as keyof typeof Ionicons.glyphMap,
  activeColor: category.color,
}));

const rewardColors = ['#1565C0', '#E65100', '#2E7D32', '#6A1B9A', '#00838F'];
const rewardBackgrounds = ['#E3F2FD', '#FFF3E0', '#E8F5E9', '#F3E5F5', '#E0F7FA'];
const rewardEmojis = ['🎁', '☕', '🌱', '📚', '🧴'];

const getRewardTheme = (index: number) => {
  const idx = index % rewardColors.length;

  return {
    color: rewardColors[idx],
    bg: rewardBackgrounds[idx],
    emoji: rewardEmojis[idx],
  };
};

const RewardsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<'shop' | 'mine' | 'history'>('shop');
  const [activeCat, setActiveCat] = useState(1);
  const [modalItem, setModalItem] = useState<any | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  const [rewards, setRewards] = useState<any[]>([]);
  const [myRewards, setMyRewards] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [profileData, rewardsData, historyData] = await Promise.all([
        getProfile(),
        getAllRewards(),
        getPointHistory(),
      ]);

      setUserProfile(profileData);

      const mappedRewards = Array.isArray(rewardsData)
        ? rewardsData.map((reward: any, index: number) => {
            const theme = getRewardTheme(index);
            const category = categories[(index % 4) + 1].label;

            return {
              ...reward,
              points: reward.pointsCost || 0,
              color: theme.color,
              bg: theme.bg,
              emoji: theme.emoji,
              category,
              tag: reward.stock > 0 && reward.stock < 10 ? 'HOT' : null,
            };
          })
        : [];
      setRewards(mappedRewards);

      const rewardCategoryMap = new Map(
        mappedRewards.map((reward: any) => [reward.name, reward.category])
      );

      const redemptions = Array.isArray(historyData)
        ? historyData
            .filter((item: any) => item.sourceType === 'REDEMPTION')
            .map((item: any, index: number) => {
              const theme = getRewardTheme(index);
              const createdAt = new Date(item.createdAt);
              const fallbackCategory = categories[(index % 4) + 1].label;
              const itemName = item.title || 'Đổi phần thưởng';

              return {
                id: item.id || `${item.createdAt}-${index}`,
                name: itemName,
                pts: item.points,
                pointsUsed: Math.abs(item.points || 0),
                date: createdAt.toLocaleDateString('vi-VN'),
                time: createdAt.toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                category: rewardCategoryMap.get(itemName) || fallbackCategory,
                status: 'Thành công',
                color: theme.color,
                bg: theme.bg,
                emoji: theme.emoji,
              };
            })
        : [];

      setMyRewards(redemptions);
      setHistory(redemptions);
    } catch (error) {
      console.log('Error loading rewards data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const userPoints = userProfile?.pointsBalance || 0;
  const selectedCategory = categories.find((category) => category.id === activeCat)?.label;
  const filteredRewards =
    activeCat === 1
      ? rewards
      : rewards.filter((reward) => reward.category === selectedCategory);
  const filteredMyRewards =
    activeCat === 1
      ? myRewards
      : myRewards.filter((reward) => reward.category === selectedCategory);

  const rankKey = userProfile?.rank || 'bronze';
  // @ts-ignore
  const rank = rankConfig[rankKey] || rankConfig.bronze;
  const progress = rank.nextPoints
    ? Math.min((userPoints / rank.nextPoints) * 100, 100)
    : 100;

  const handleRedeem = async (item: any) => {
    if (userPoints < item.points) {
      showToast('Không đủ điểm để đổi thưởng', 'error');
      return;
    }

    setRedeeming(true);

    try {
      await redeemReward(item.id);
      showToast(`🎉 Đã đổi "${item.name}" thành công!`, 'success');
      await loadData();
    } catch (error: any) {
      console.log('Lỗi đổi quà:', error.response?.data || error);
      showToast('Đổi thưởng thất bại, vui lòng thử lại', 'error');
    } finally {
      setRedeeming(false);
      setModalItem(null);
    }
  };

  const renderCategoryFilters = (showIcons = true) => (
    <SelectableChipTabs
      items={categoryChipItems}
      activeKey={activeCat}
      onChange={setActiveCat}
      showIcons={showIcons}
    />
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.root, styles.loadingWrap]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        <LinearGradient
          colors={[Colors.primaryGradientStart, Colors.primaryLight]}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
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

          <View style={styles.tierWrap}>
            <View style={styles.tierRow}>
              <Text style={styles.tierLabel}>
                {rank.emoji} {rank.label} → {rank.next ? `${rank.next}` : 'Max'}
              </Text>
              <Text style={styles.tierPct}>{Math.round(progress)}%</Text>
            </View>
            <View style={styles.tierBar}>
              <View style={[styles.tierFill, { width: `${progress}%` as any }]} />
            </View>
          </View>
        </LinearGradient>

        <View style={styles.tabs}>
          {(['shop', 'mine', 'history'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabTxt, activeTab === tab && styles.tabTxtActive]}>
                {tab === 'shop'
                  ? '🛍️ Cửa hàng'
                  : tab === 'mine'
                    ? '🎁 Quà của tôi'
                    : '📋 Lịch sử'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'shop' ? (
          <>
            {renderCategoryFilters()}

            <View style={styles.grid}>
              {filteredRewards.map((reward) => {
                const canRedeem = userPoints >= reward.points;
                const outOfStock = reward.stock === 0;

                return (
                  <TouchableOpacity
                    key={reward.id}
                    style={[styles.rewardCard, { backgroundColor: reward.bg }]}
                    onPress={() => navigation.navigate('RewardDetail', { reward })}
                    activeOpacity={0.85}
                  >
                    {reward.tag ? (
                      <View style={styles.tag}>
                        <Text style={styles.tagTxt}>{reward.tag}</Text>
                      </View>
                    ) : null}

                    <View
                      style={[styles.rewardIcon, { backgroundColor: `${reward.color}22` }]}
                    >
                      <Text style={styles.rewardEmoji}>{reward.emoji}</Text>
                    </View>

                    <Text style={styles.rewardName}>{reward.name}</Text>

                    <View style={styles.rewardFooter}>
                      <View style={styles.ptsBadge}>
                        <Ionicons name="star" size={11} color="#F57F17" />
                        <Text style={styles.ptsBadgeTxt}>{reward.points} điểm</Text>
                      </View>

                      {outOfStock ? (
                        <View style={[styles.redeemedBadge, { backgroundColor: '#9E9E9E' }]}>
                          <Text style={styles.redeemedTxt}>Hết hàng</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.redeemBtn,
                            !canRedeem && styles.redeemBtnDisabled,
                          ]}
                          onPress={() => canRedeem && setModalItem(reward)}
                        >
                          <Text
                            style={[styles.redeemTxt, !canRedeem && { opacity: 0.5 }]}
                          >
                            Đổi ngay
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <Text style={styles.stockTxt}>Còn {reward.stock} lượt</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : activeTab === 'mine' ? (
          <>
            {renderCategoryFilters()}

            <View style={styles.myRewardsWrap}>
              {filteredMyRewards.length > 0 ? (
                filteredMyRewards.map((item) => (
                  <View
                    key={item.id}
                    style={[styles.myRewardCard, { backgroundColor: item.bg }]}
                  >
                    <View
                      style={[styles.myRewardIcon, { backgroundColor: `${item.color}22` }]}
                    >
                      <Text style={styles.rewardEmoji}>{item.emoji}</Text>
                    </View>

                    <View style={styles.myRewardInfo}>
                      <View style={styles.myRewardTopRow}>
                        <Text style={styles.myRewardName} numberOfLines={2}>
                          {item.name}
                        </Text>
                        <View style={styles.myRewardStatus}>
                          <Text style={styles.myRewardStatusTxt}>{item.status}</Text>
                        </View>
                      </View>

                      <Text style={styles.myRewardCategory}>{item.category}</Text>
                      <Text style={styles.myRewardMeta}>
                        Đã đổi lúc {item.time} - {item.date}
                      </Text>

                      <View style={styles.myRewardBottomRow}>
                        <View style={styles.ptsBadge}>
                          <Ionicons name="star" size={11} color="#F57F17" />
                          <Text style={styles.ptsBadgeTxt}>{item.pointsUsed} điểm</Text>
                        </View>
                        <Ionicons name="gift-outline" size={18} color={item.color} />
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <EmptyState
                  emoji="🎁"
                  title={
                    activeCat === 1
                      ? 'Chưa có quà đã đổi'
                      : 'Không có quà trong nhóm này'
                  }
                  subtitle={
                    activeCat === 1
                      ? 'Khi bạn đổi thành công, quà sẽ hiển thị ở đây để bạn theo dõi.'
                      : 'Hãy thử chuyển sang nhóm khác hoặc xem tất cả quà của bạn.'
                  }
                  actionLabel={activeCat === 1 ? 'Xem cửa hàng quà' : 'Xem tất cả'}
                  onAction={() =>
                    activeCat === 1 ? setActiveTab('shop') : setActiveCat(1)
                  }
                />
              )}
            </View>
          </>
        ) : (
          <View style={styles.historyWrap}>
            {history.length > 0 ? (
              history.map((item, index) => (
                <View key={item.id || index} style={styles.historyItem}>
                  <View style={styles.histIcon}>
                    <Ionicons name="gift-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.histInfo}>
                    <Text style={styles.histName}>{item.name}</Text>
                    <Text style={styles.histDate}>{item.date}</Text>
                  </View>
                  <View style={styles.histRight}>
                    <Text style={styles.histPts}>{item.pts} điểm</Text>
                    <View style={styles.histStatus}>
                      <Text style={styles.histStatusTxt}>{item.status}</Text>
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
                onAction={() => navigation.navigate('Scan')}
              />
            )}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={!!modalItem}
        transparent
        animationType="slide"
        onRequestClose={() => setModalItem(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => !redeeming && setModalItem(null)}
          activeOpacity={1}
        >
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
                  <Text style={styles.balanceVal}>{userPoints} điểm</Text>
                  <Text style={styles.balanceTxt}> → </Text>
                  <Text
                    style={[
                      styles.balanceVal,
                      {
                        color:
                          userPoints - modalItem.points >= 0
                            ? Colors.primary
                            : Colors.error,
                      },
                    ]}
                  >
                    {userPoints - modalItem.points} điểm
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.modalConfirmWrap, redeeming && { opacity: 0.7 }]}
                  onPress={() => !redeeming && handleRedeem(modalItem)}
                  disabled={redeeming}
                >
                  <LinearGradient
                    colors={[Colors.primaryGradientStart, Colors.primaryLight]}
                    style={styles.modalConfirm}
                  >
                    <Text style={styles.modalConfirmTxt}>
                      {redeeming ? 'Đang xử lý...' : 'Xác nhận đổi thưởng'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setModalItem(null)}
                  disabled={redeeming}
                >
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
  loadingWrap: { justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 20 },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    top: -30,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  ptsRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 16 },
  ptsValue: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -1,
  },
  ptsSuffix: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  headerRight: { position: 'absolute', top: 60, right: 20 },
  starBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierWrap: {},
  tierRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  tierLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  tierPct: { fontSize: 12, color: Colors.white, fontWeight: '700' },
  tierBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  tierFill: { height: '100%', backgroundColor: '#FFD54F', borderRadius: 3 },

  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 14,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  tabActive: {
    backgroundColor: Colors.white,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tabTxt: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  tabTxtActive: { color: Colors.textPrimary },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10 },
  rewardCard: {
    width: (width - 34) / 2,
    borderRadius: 20,
    padding: 14,
    position: 'relative',
  },
  tag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF5252',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagTxt: { fontSize: 10, fontWeight: '700', color: Colors.white },
  rewardIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  rewardEmoji: { fontSize: 28 },
  rewardName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
    lineHeight: 18,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ptsBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ptsBadgeTxt: { fontSize: 12, fontWeight: '700', color: '#F57F17' },
  redeemBtn: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  redeemBtnDisabled: { backgroundColor: '#E0E0E0' },
  redeemTxt: { fontSize: 11, fontWeight: '700', color: Colors.white },
  redeemedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  redeemedTxt: { fontSize: 11, fontWeight: '700', color: Colors.white },
  stockTxt: { fontSize: 10, color: Colors.textMuted },

  myRewardsWrap: { paddingHorizontal: 16, marginTop: 8, gap: 12 },
  myRewardCard: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
  },
  myRewardIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  myRewardInfo: { flex: 1 },
  myRewardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  myRewardName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  myRewardCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 6,
  },
  myRewardStatus: {
    backgroundColor: '#E8F5E9',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  myRewardStatusTxt: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  myRewardMeta: { fontSize: 12, color: Colors.textMuted, marginBottom: 10 },
  myRewardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  historyWrap: { paddingHorizontal: 16, marginTop: 8 },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  histIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  histInfo: { flex: 1 },
  histName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  histDate: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  histRight: { alignItems: 'flex-end' },
  histPts: { fontSize: 14, fontWeight: '700', color: Colors.error },
  histStatus: {
    backgroundColor: '#E8F5E9',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  histStatusTxt: { fontSize: 10, fontWeight: '700', color: Colors.primary },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: 16,
  },
  modalIcon: {
    width: 90,
    height: 90,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalEmoji: { fontSize: 42 },
  modalName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 20,
  },
  modalCat: { fontSize: 13, color: Colors.textMuted, marginBottom: 14 },
  modalPtsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  modalPts: { fontSize: 22, fontWeight: '800', color: '#F57F17' },
  modalBalance: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  balanceTxt: { fontSize: 13, color: Colors.textSecondary },
  balanceVal: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  modalConfirmWrap: {
    width: '100%',
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 10,
    elevation: 6,
  },
  modalConfirm: { height: 54, alignItems: 'center', justifyContent: 'center' },
  modalConfirmTxt: { fontSize: 16, fontWeight: '700', color: Colors.white },
  modalCancel: { paddingVertical: 12 },
  modalCancelTxt: { fontSize: 15, color: Colors.textMuted, fontWeight: '600' },
});

export default RewardsScreen;

