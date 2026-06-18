import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Colors from '../../theme/colors';
import EmptyState from '../../components/EmptyState';
import SharedHeaderBackground from '../../components/SharedHeaderBackground';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import { useGetProfile } from '../../services/auth';
import { useGetAllRewards, useGetMyRedemptions, useRedeemReward } from '../../services/rewards';
import RewardCard from './components/RewardCard';
import RewardHistoryCard from './components/RewardHistoryCard';
import RedeemRewardModal from './components/RedeemRewardModal';
import { RewardHistoryItem, RewardShopItem } from './components/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const categories = [
  { id: 1, label: 'Tất cả', icon: 'sparkles-outline', color: Colors.primary },
  { id: 2, label: 'Mua sắm', icon: 'bag-handle-outline', color: Colors.info },
  { id: 3, label: 'Ăn uống', icon: 'cafe-outline', color: Colors.warning },
  { id: 4, label: 'Cây trồng', icon: 'leaf-outline', color: Colors.primary },
  { id: 5, label: 'Học tập', icon: 'book-outline', color: Colors.facebook },
];

const rewardThemes = [
  { color: Colors.info, bg: Colors.infoLight, iconName: 'bag-handle-outline' },
  { color: Colors.warning, bg: Colors.warningLight, iconName: 'cafe-outline' },
  { color: Colors.primary, bg: Colors.successLight, iconName: 'leaf-outline' },
  { color: Colors.facebook, bg: Colors.infoLight, iconName: 'book-outline' },
  { color: Colors.hazardous, bg: Colors.hazardousBg, iconName: 'gift-outline' },
];

const getRewardTheme = (index: number) => rewardThemes[index % rewardThemes.length];

const normalizeSearchText = (value?: string | number | null) =>
  String(value ?? '').trim().toLowerCase();

const RewardsScreen: React.FC<any> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { appearance } = useSettings();

  const [activeCat, setActiveCat] = useState(1);
  const [search, setSearch] = useState('');
  const [modalItem, setModalItem] = useState<RewardShopItem | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  const [rewards, setRewards] = useState<RewardShopItem[]>([]);
  const [history, setHistory] = useState<RewardHistoryItem[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { refetch: refetchProfile } = useGetProfile({ enabled: false });
  const { refetch: refetchAllRewards } = useGetAllRewards({ enabled: false });
  const { refetch: refetchMyRedemptions } = useGetMyRedemptions({ enabled: false });
  const { mutateAsync: redeemRewardAsync } = useRedeemReward();

  const loadData = useCallback(async () => {
    try {
      const [profileResult, rewardsResult, redemptionsResult] = await Promise.all([
        refetchProfile({ throwOnError: true }),
        refetchAllRewards({ throwOnError: true }),
        refetchMyRedemptions({ throwOnError: true }),
      ]);
      const profileData = profileResult.data;
      const rewardsData = rewardsResult.data;
      const redemptionsData = redemptionsResult.data;

      if (!profileData) {
        throw new Error('Profile data unavailable');
      }

      setUserProfile(profileData);

      const mappedRewards: RewardShopItem[] = Array.isArray(rewardsData)
        ? rewardsData.map((reward: any, index: number) => {
          const theme = getRewardTheme(index);
          const category = categories[(index % 4) + 1].label;

          return {
            ...reward,
            id: String(reward.id),
            points: reward.pointsCost || 0,
            color: theme.color,
            bg: theme.bg,
            iconName: theme.iconName,
            category,
            tag: reward.stock > 0 && reward.stock < 10 ? 'Sắp hết' : null,
          };
        })
        : [];
      setRewards(mappedRewards);

      const statusLabels: Record<string, string> = {
        PENDING: 'Chờ xử lý',
        APPROVED: 'Đã duyệt',
        FULFILLED: 'Đã nhận',
        REJECTED: 'Đã hủy',
        CANCELED: 'Đã hủy',
      };

      const redemptions: RewardHistoryItem[] = Array.isArray(redemptionsData)
        ? redemptionsData
          .map((item: any, index: number) => {
            const theme = getRewardTheme(index);
            const reward = item.reward;
            const createdAt = new Date(item.createdAt || item.updatedAt || Date.now());
            const fallbackCategory = categories[(index % 4) + 1].label;
            const itemName = reward?.name || 'Quà đã đổi';

            return {
              id: item.id || `${item.createdAt}-${index}`,
              name: itemName,
              pts: item.pointsSpent || reward?.pointsCost || 0,
              pointsUsed: Math.abs(item.pointsSpent || reward?.pointsCost || 0),
              date: createdAt.toLocaleDateString('vi-VN'),
              time: createdAt.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              category: fallbackCategory,
              status: statusLabels[item.status] || 'Đã đổi',
              color: theme.color,
              bg: theme.bg,
              iconName: theme.iconName,
              thumbnailUrl: reward?.thumbnailUrl,
            };
          })
        : [];

      setHistory(redemptions);
    } catch (error) {
      console.log('Error loading rewards data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refetchAllRewards, refetchMyRedemptions, refetchProfile]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const userPoints = userProfile?.pointsBalance || 0;
  const name = userProfile?.fullName || 'Người dùng';
  const initial = name.charAt(0).toUpperCase();
  const selectedCategory = categories.find((category) => category.id === activeCat)?.label;
  const searchValue = normalizeSearchText(search);

  const filteredRewards = useMemo(() => {
    return rewards.filter((reward) => {
      const matchesCategory = activeCat === 1 || reward.category === selectedCategory;
      const matchesSearch =
        !searchValue ||
        normalizeSearchText(reward.name).includes(searchValue) ||
        normalizeSearchText(reward.description).includes(searchValue) ||
        normalizeSearchText(reward.category).includes(searchValue);

      return matchesCategory && matchesSearch;
    });
  }, [activeCat, rewards, searchValue, selectedCategory]);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesCategory = activeCat === 1 || item.category === selectedCategory;
      const matchesSearch =
        !searchValue ||
        normalizeSearchText(item.name).includes(searchValue) ||
        normalizeSearchText(item.category).includes(searchValue);

      return matchesCategory && matchesSearch;
    });
  }, [activeCat, history, searchValue, selectedCategory]);

  const handleRedeem = async (item: RewardShopItem) => {
    if (userPoints < item.points) {
      showToast('Bạn chưa đủ điểm để đổi món quà này', 'error');
      return;
    }

    setRedeeming(true);

    try {
      await redeemRewardAsync({ rewardId: item.id });
      showToast(`Đã đổi "${item.name}" thành công!`, 'success');
      await loadData();
    } catch (error: any) {
      console.log('Lỗi đổi quà:', error.response?.data || error);
      showToast('Đổi thưởng thất bại, vui lòng thử lại', 'error');
    } finally {
      setRedeeming(false);
      setModalItem(null);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View className={`flex-1 ${appearance === 'nature' ? 'bg-transparent' : 'bg-[#F9FAFB]'}`}>
      <SharedHeaderBackground className="absolute top-0 left-0 right-0 h-[320px]" />

      <View style={{ paddingTop: insets.top + 16 }} className="px-5 z-30 pb-6">
        {/* Banner Text & Search */}
        <View className="mt-4 flex-row items-center justify-between mb-6">
          <Text className="text-[#3A3A3A] text-[24px] font-black leading-[32px] max-w-[70%]">
            Tìm móm quà{'\n'}bạn yêu thích!
          </Text>
          <View className="w-[56px] h-[56px] rounded-[20px] bg-white/20 flex items-center justify-center">
            <Ionicons name="gift" size={30} color={Colors.white} />
          </View>
        </View>

        <View className="flex-row items-center gap-2 rounded-[20px] bg-white px-4 py-4 shadow-xl shadow-black/10">
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Tìm quà, voucher, cây xanh..."
            placeholderTextColor={Colors.textMuted}
            style={{ flex: 1, color: Colors.textPrimary, fontSize: 15, fontWeight: '600', padding: 0, margin: 0 }}
          />
          {search.length > 0 ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : (
            <Ionicons name="options" size={20} color={Colors.primary} />
          )}
        </View>
      </View>

      {/* Content Container Overlapping the Header */}
      <View
        className={`flex-1 ${appearance === 'nature' ? 'bg-white/90' : 'bg-white'} rounded-t-[36px] z-20 overflow-hidden`}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingTop: 30, paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          {/* Categories */}
          <Text className="mx-5 text-[18px] font-black text-textPrimary mb-3">Danh mục</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {categories.map((c) => {
              const isActive = activeCat === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setActiveCat(c.id)}
                  activeOpacity={0.8}
                  className={`mr-2.5 px-4 py-2 rounded-full border elevation-sm ${isActive ? 'bg-primary border-primary' : 'bg-white border-borderDefault'}`}
                >
                  <Text className={`text-[13px] font-bold ${isActive ? 'text-white' : 'text-textPrimary'}`}>{c.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Popular Rewards */}
          <View className="flex-row items-center justify-between mx-5 mt-8 mb-3">
            <Text className="text-[18px] font-black text-textPrimary">Cửa hàng quà tặng</Text>
            <View className="flex-row items-center gap-1 bg-warningLight px-2 py-0.5 rounded-full border border-warning/20">
              <Ionicons name="star" size={12} color={Colors.warning} />
              <Text className="text-warning text-[11px] font-bold">{userPoints}</Text>
            </View>
          </View>

          {filteredRewards.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}>
              {filteredRewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  canRedeem={userPoints >= reward.points}
                  onPress={() => navigation.navigate('RewardDetail', { reward })}
                  onRedeem={() => setModalItem(reward)}
                />
              ))}
            </ScrollView>
          ) : (
            <View className="mx-5 mt-2">
              <EmptyState
                emoji="🎁"
                title="Không tìm thấy quà phù hợp"
                subtitle="Thử đổi từ khóa hoặc xem tất cả danh mục nhé."
                actionLabel="Xem tất cả"
                onAction={() => {
                  setSearch('');
                  setActiveCat(1);
                }}
              />
            </View>
          )}

          {/* History */}
          <Text className="mt-8 mx-5 text-[18px] font-black text-textPrimary mb-3">Lịch sử đổi quà</Text>
          <View className="px-5">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                <RewardHistoryCard key={item.id} item={item} />
              ))
            ) : (
              <EmptyState
                emoji="⏳"
                title="Chưa có lịch sử đổi quà"
                subtitle="Khi bạn đổi quà thành công, danh sách sẽ hiển thị ở đây."
              />
            )}
          </View>
        </ScrollView>
      </View>

      <RedeemRewardModal
        reward={modalItem}
        userPoints={userPoints}
        redeeming={redeeming}
        bottomInset={insets.bottom}
        onClose={() => setModalItem(null)}
        onConfirm={handleRedeem}
      />
    </View>
  );
};

export default RewardsScreen;
