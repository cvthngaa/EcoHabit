import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getProfile } from '../../services/api/auth.service';
import { getDailyTip, type DailyTipResponse } from '../../services/api/gemini.service';
import { getPointHistory } from '../../services/api/points.service';
import { getTopRewards } from '../../services/api/rewards.service';
import { Shadows, Tokens } from '../../theme';

const PRIMARY_COLOR = Tokens.color.green.primary;

const DAILY_TIP_FALLBACK: DailyTipResponse = {
  title: 'Mẹo xanh dễ làm',
  content:
    'Giữ riêng chai, lon và giấy khô trong một túi hoặc hộp nhỏ ở nhà để dễ gom và mang đi tái chế.',
  emoji: '🌿',
  source: 'fallback',
};

const timeAgo = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) return `${Math.max(1, diffMins)} phút trước`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  return `${Math.floor(diffHours / 24)} ngày trước`;
};

const getActivityDetails = (activity: any) => {
  const { sourceType, title } = activity;
  const label = title || 'Hoạt động';

  switch (sourceType) {
    case 'TRASH_CLASSIFICATION':
      return { icon: 'scan-outline' as const, label, color: PRIMARY_COLOR };
    case 'REDEMPTION':
      return { icon: 'gift-outline' as const, label, color: '#FF5252' };
    case 'DROPOFF_TRANSACTION':
      return { icon: 'location-outline' as const, label, color: '#2196F3' };
    case 'ADMIN':
      return { icon: 'star-outline' as const, label, color: '#FF9800' };
    default:
      return { icon: 'leaf-outline' as const, label, color: '#888' };
  }
};

const quickActions = [
  { id: '1', label: 'Phân loại rác', icon: 'scan-outline' as const, route: 'ScanTab', color: PRIMARY_COLOR },
  { id: '2', label: 'Điểm thu gom', icon: 'location-outline' as const, route: 'MapTab', color: '#2196F3' },
  { id: '3', label: 'Đổi quà', icon: 'gift-outline' as const, route: 'RewardsTab', color: '#E65100' },
  { id: '4', label: 'Quiz', icon: 'bulb-outline' as const, route: 'QuizIntro', color: '#FF9800' },
  { id: '5', label: 'Ví điểm', icon: 'wallet-outline' as const, route: 'Wallet', color: '#6A1B9A' },
  { id: '6', label: 'Cộng đồng', icon: 'people-outline' as const, route: 'Community', color: '#9C27B0' },
];

const dailyMissions = [
  { id: '1', title: 'Phân loại 1 vật phẩm', completed: true, rewardPoints: 50 },
  { id: '2', title: 'Check-in điểm thu gom', completed: false, rewardPoints: 100 },
  { id: '3', title: 'Làm 1 quiz', completed: false, rewardPoints: 20 },
];

const rewardPalette = [
  { color: '#1565C0', bg: '#E3F2FD', icon: 'bag-handle-outline' as const, emoji: '🛍️', category: 'Mua sắm' },
  { color: '#E65100', bg: '#FFF3E0', icon: 'ticket-outline' as const, emoji: '☕', category: 'Ăn uống' },
  { color: '#2E7D32', bg: '#E8F5E9', icon: 'leaf-outline' as const, emoji: '🌱', category: 'Cây trồng' },
  { color: '#6A1B9A', bg: '#F3E5F5', icon: 'book-outline' as const, emoji: '📚', category: 'Giáo dục' },
  { color: '#00838F', bg: '#E0F7FA', icon: 'gift-outline' as const, emoji: '🎁', category: 'Ưu đãi' },
];

const cardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.04,
  shadowRadius: 10,
  elevation: 2,
};

const mapFeaturedReward = (reward: any, index: number) => {
  const palette = rewardPalette[index % rewardPalette.length];
  const stock =
    typeof reward.stock === 'number' ? reward.stock : Number(reward.stock || 0);
  const pointsCost =
    typeof reward.pointsCost === 'number'
      ? reward.pointsCost
      : Number(reward.pointsCost || 0);
  const redeemCount =
    typeof reward.redeemCount === 'number'
      ? reward.redeemCount
      : Number(reward.redeemCount || 0);

  return {
    ...reward,
    stock,
    redeemCount,
    title: reward.name,
    pointCost: pointsCost,
    points: pointsCost,
    icon: palette.icon,
    color: palette.color,
    bg: palette.bg,
    emoji: palette.emoji,
    category: palette.category,
    tag: redeemCount > 0 ? `TOP ${index + 1}` : null,
    description:
      reward.description || 'Quà tặng đổi bằng điểm xanh từ EcoHabit.',
  };
};

const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [featuredRewards, setFeaturedRewards] = useState<any[]>([]);
  const [dailyTip, setDailyTip] = useState<DailyTipResponse>(DAILY_TIP_FALLBACK);

  const loadData = async () => {
    try {
      const [profileData, historyRes, topRewardsRes, dailyTipRes] = await Promise.all([
        getProfile(),
        getPointHistory(),
        getTopRewards(5),
        getDailyTip(),
      ]);

      setUserProfile(profileData);
      setRecentActivities(Array.isArray(historyRes) ? historyRes.slice(0, 5) : []);
      setDailyTip(dailyTipRes || DAILY_TIP_FALLBACK);
      setFeaturedRewards(
        Array.isArray(topRewardsRes)
          ? topRewardsRes.map((reward: any, index: number) =>
            mapFeaturedReward(reward, index),
          )
          : [],
      );
    } catch (error) {
      console.log('Lỗi tải dữ liệu:', error);
      setUserProfile({
        fullName: 'Người dùng',
        pointsBalance: 0,
        avatarUrl: null,
      });
      setRecentActivities([]);
      setDailyTip(DAILY_TIP_FALLBACK);
      setFeaturedRewards([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const goQuickAction = (route: string) => {
    if (route === 'ScanTab') navigation.navigate('Scan');
    else if (route === 'MapTab') navigation.navigate('Map');
    else if (route === 'RewardsTab') navigation.navigate('Rewards');
    else navigation.navigate(route);
  };

  const renderSkeleton = () => (
    <View
      className="flex-1 bg-canvas px-5"
      style={{ paddingTop: insets.top + Tokens.space[5] }}
    >
      <View className="mb-[30px] flex-row items-center">
        <View className="mr-4 h-11 w-11 rounded-full bg-[#EBEBEB]" />
        <View className="flex-1">
          <View className="mb-2.5 h-[18px] w-3/5 rounded-full bg-[#EBEBEB]" />
          <View className="h-[14px] w-2/5 rounded-full bg-[#EBEBEB]" />
        </View>
      </View>
      <View className="mb-6 h-40 rounded-[20px] bg-[#EBEBEB]" />
      <View className="mb-4 h-[90px] rounded-[20px] bg-[#EBEBEB]" />
      <View className="mb-4 h-[90px] rounded-[20px] bg-[#EBEBEB]" />
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text className="mt-4 text-[14px] font-semibold text-text-muted">
          Đang tải dữ liệu...
        </Text>
      </View>
    </View>
  );

  if (loading || !userProfile) return renderSkeleton();

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-5"
        contentContainerStyle={{ paddingTop: insets.top + Tokens.space[5] }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY_COLOR]}
          />
        }
      >
        <View className="mb-6 flex-row items-center justify-between px-5">
          <View className="flex-1 items-start">
            {userProfile?.avatarUrl ? (
              <Image source={{ uri: userProfile.avatarUrl }} className="h-11 w-11 rounded-full" />
            ) : (
              <View className="h-11 w-11 items-center justify-center rounded-full bg-primary">
                <Text className="text-[18px] font-bold text-white">
                  {userProfile?.fullName
                    ? userProfile.fullName.charAt(0).toUpperCase()
                    : 'U'}
                </Text>
              </View>
            )}
          </View>
          <View className="flex-[4] items-center">
            <Text className="mb-1 text-center text-[17px] font-extrabold text-text">
              Chào buổi sáng, {userProfile?.fullName} 👋
            </Text>
            <Text className="text-center text-[13px] font-medium text-text-muted">
              Hôm nay bạn đã sống xanh chưa?
            </Text>
          </View>
          <View className="flex-1 items-end">
            <TouchableOpacity
              className="h-[42px] w-[42px] items-center justify-center rounded-full bg-surface"
              style={Shadows.sm}
            >
              <Ionicons name="notifications-outline" size={24} color="#333" />
              <View className="absolute right-3 top-2.5 h-2.5 w-2.5 rounded-full border-[1.5px] border-white bg-[#FF3B30]" />
            </TouchableOpacity>
          </View>
        </View>

        <LinearGradient
          colors={['#28A710', PRIMARY_COLOR, Tokens.color.green[600]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            marginHorizontal: Tokens.space[5],
            borderRadius: 20,
            padding: Tokens.space[5],
            shadowColor: PRIMARY_COLOR,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
            elevation: 8,
            marginBottom: Tokens.space[6],
            overflow: 'hidden',
          }}
        >
          <View className="absolute right-[-30px] top-[-50px] h-[150px] w-[150px] rounded-full bg-white/10" />
          <View className="mb-5 flex-row items-start justify-between">
            <View>
              <Text className="mb-1 text-[26px] font-extrabold text-white">
                ⭐ {(userProfile?.pointsBalance || 0).toLocaleString()} điểm
              </Text>
              <Text className="text-[14px] font-semibold text-white/90">
                +0 hôm nay
              </Text>
            </View>
            <TouchableOpacity
              className="rounded-lg bg-white/25 px-[14px] py-2"
              onPress={() => navigation.navigate('Rewards')}
            >
              <Text className="text-[13px] font-bold text-white">Đổi quà 🎁</Text>
            </TouchableOpacity>
          </View>
          <View className="mt-2">
            <Text className="mb-2 text-[13px] font-semibold text-white/90">
              Tháng này: 1/30 ngày
            </Text>
            <View className="h-2 overflow-hidden rounded-full bg-white/30">
              <View className="h-full w-[10%] rounded-full bg-white" />
            </View>
          </View>
        </LinearGradient>

        <View className="mb-6 flex-row flex-wrap justify-between px-5">
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              className="mb-4 w-[47.5%] flex-row items-center rounded-lg bg-surface p-[14px]"
              style={cardShadow}
              onPress={() => goQuickAction(action.route)}
              activeOpacity={0.8}
            >
              <View
                className="mr-3 h-11 w-11 items-center justify-center rounded-[14px]"
                style={{ backgroundColor: `${action.color}15` }}
              >
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text className="flex-1 text-[14px] font-semibold text-text">
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mb-6">
          <Text className="mx-5 mb-4 text-[18px] font-extrabold text-text">
            Hoạt động gần đây
          </Text>
          <View
            className="mx-5 rounded-[20px] bg-surface px-4"
            style={cardShadow}
          >
            {recentActivities.length === 0 ? (
              <View className="items-center p-5">
                <Ionicons name="leaf-outline" size={32} color="#CCC" />
                <Text className="mt-2 text-[14px] text-text-muted">
                  Chưa có hoạt động nào
                </Text>
              </View>
            ) : (
              recentActivities.map((activity, index) => {
                const details = getActivityDetails(activity);
                const isEarn = activity.type === 'EARN';

                return (
                  <View key={activity.id}>
                    <View className="flex-row items-center py-4">
                      <View
                        className="mr-3 h-11 w-11 items-center justify-center rounded-[14px]"
                        style={{ backgroundColor: `${details.color}15` }}
                      >
                        <Ionicons
                          name={details.icon}
                          size={20}
                          color={details.color}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="mb-1 text-[15px] font-bold capitalize text-text">
                          {details.label}
                        </Text>
                        <Text className="text-[12px] font-medium text-text-muted">
                          {timeAgo(activity.createdAt)}
                        </Text>
                      </View>
                      <View
                        className="rounded-[10px] px-2.5 py-1.5"
                        style={{ backgroundColor: isEarn ? '#E8F5E9' : '#FFEBEE' }}
                      >
                        <Text
                          className="text-[12px] font-extrabold"
                          style={{ color: isEarn ? PRIMARY_COLOR : '#FF5252' }}
                        >
                          {isEarn ? '+' : '-'}
                          {Math.abs(activity.points)} đ
                        </Text>
                      </View>
                    </View>
                    {index < recentActivities.length - 1 && (
                      <View className="h-px bg-border-subtle/60" />
                    )}
                  </View>
                );
              })
            )}
          </View>
        </View>

        <View className="mb-6">
          <View
            className="mx-5 rounded-xl border border-green-200 bg-green-100 p-[18px]"
            style={{
              shadowColor: '#86A95C',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 2,
            }}
          >
            <View className="mb-3 flex-row items-center justify-between">
              <View className="rounded-full bg-green-200 px-2.5 py-1.5">
                <Text className="text-[11px] font-extrabold uppercase tracking-[0.3px] text-green-700">
                  Mẹo vặt hôm nay
                </Text>
              </View>
              <Text className="text-[26px]">{dailyTip.emoji}</Text>
            </View>
            <Text className="mb-2 text-[18px] font-extrabold text-green-800">
              {dailyTip.title}
            </Text>
            <Text className="text-[14px] font-medium leading-[21px] text-text-muted">
              {dailyTip.content}
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="mx-5 mb-4 text-[18px] font-extrabold text-text">
            Quà nổi bật
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="pl-5 pr-2"
          >
            {featuredRewards.length === 0 ? (
              <View
                className="mr-3 w-[180px] items-center justify-center rounded-[18px] bg-surface p-4"
                style={cardShadow}
              >
                <Ionicons name="gift-outline" size={28} color="#B0B0B0" />
                <Text className="mt-2.5 text-center text-[13px] font-semibold text-text-muted">
                  Chưa có quà đổi thành công
                </Text>
              </View>
            ) : (
              featuredRewards.map((reward) => (
                <TouchableOpacity
                  key={reward.id}
                  className="mr-3 w-[130px] items-center rounded-[18px] bg-surface p-4"
                  style={cardShadow}
                  onPress={() =>
                    navigation.navigate('RewardDetail', { reward })
                  }
                >
                  {reward.tag && (
                    <View className="absolute right-2.5 top-2.5 z-10 rounded-sm bg-[#FF3B30] px-2 py-1">
                      <Text className="text-[9px] font-extrabold text-white">
                        {reward.tag}
                      </Text>
                    </View>
                  )}
                  <View
                    className="mb-3 h-14 w-14 items-center justify-center rounded-[18px]"
                    style={{ backgroundColor: `${reward.color}15` }}
                  >
                    <Ionicons
                      name={reward.icon}
                      size={28}
                      color={reward.color}
                    />
                  </View>
                  <Text className="mb-1.5 text-center text-[14px] font-bold text-text" numberOfLines={1}>
                    {reward.title}
                  </Text>
                  <Text className="mb-1.5 text-[11px] font-semibold text-text-muted">
                    {reward.redeemCount} lượt đổi
                  </Text>
                  <Text className="text-[13px] font-extrabold text-primary">
                    {reward.pointCost} điểm
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        <View className="mb-6">
          <Text className="mx-5 mb-4 text-[18px] font-extrabold text-text">
            Nhiệm vụ hôm nay
          </Text>
          <View
            className="mx-5 rounded-[20px] bg-surface px-4"
            style={cardShadow}
          >
            {dailyMissions.map((mission, index) => (
              <View key={mission.id}>
                <View className="flex-row items-center py-4">
                  <TouchableOpacity className="mr-[14px]">
                    {mission.completed ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={26}
                        color={PRIMARY_COLOR}
                      />
                    ) : (
                      <Ionicons
                        name="ellipse-outline"
                        size={26}
                        color="#CCC"
                      />
                    )}
                  </TouchableOpacity>
                  <View className="flex-1 flex-row items-center justify-between">
                    <Text
                      className={`flex-1 text-[15px] font-semibold ${
                        mission.completed ? 'text-[#A0A0A0] line-through' : 'text-text'
                      }`}
                    >
                      {mission.title}
                    </Text>
                    <Text className="ml-2.5 text-[14px] font-extrabold text-primary">
                      +{mission.rewardPoints} điểm
                    </Text>
                  </View>
                </View>
                {index < dailyMissions.length - 1 && (
                  <View className="h-px bg-border-subtle/60" />
                )}
              </View>
            ))}
          </View>
        </View>

        <View className="h-[120px]" />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
