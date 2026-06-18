import React, { useCallback, useState } from 'react';
import {
 View,
 Text,
 ScrollView,
 TouchableOpacity,
 ActivityIndicator,
 RefreshControl,
 Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HeroHeader from '../../components/home/HeroHeader';
import FeatureCards from '../../components/home/FeatureCards';
import RewardCard from '../rewards/components/RewardCard';
import RecentActivitiesCard from '../../components/home/RecentActivitiesCard';
import DailyTipCard from '../../components/home/DailyTipCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useGetProfile } from '../../services/auth';
import { useGetPointHistory } from '../../services/points';
import { useGetTopRewards } from '../../services/rewards';
import { DailyTipResponse, useGetDailyTip } from '../../services/tips';
import { Tokens } from '../../theme';
import MyQrModal from '../../components/MyQrModal';

const PRIMARY_COLOR = Tokens.color.green.primary;

const DAILY_TIP_FALLBACK: DailyTipResponse = {
 title: 'Mẹo xanh dễ làm',
 content:
 'Giữ riêng chai, lon và giấy khô trong một túi hoặc hộp nhỏ ở nhà để dễ gom và mang đi tái chế.',
 emoji: '🌿',
 source: 'fallback',
};

const rewardPalette = [
 { color: '#1565C0', bg: '#E3F2FD', icon: 'bag-handle-outline' as const, emoji: '🛍️', category: 'Mua sắm' },
 { color: '#E65100', bg: '#FFF3E0', icon: 'ticket-outline' as const, emoji: '☕', category: 'Ăn uống' },
 { color: '#2E7D32', bg: '#E8F5E9', icon: 'leaf-outline' as const, emoji: '🌱', category: 'Cây trồng' },
 { color: '#6A1B9A', bg: '#F3E5F5', icon: 'book-outline' as const, emoji: '📚', category: 'Giáo dục' },
 { color: '#00838F', bg: '#E0F7FA', icon: 'gift-outline' as const, emoji: '🎁', category: 'Ưu đãi' },
];

const cardShadow = {
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
 const [showMyQr, setShowMyQr] = useState(false);

 const { refetch: refetchProfile } = useGetProfile({ enabled: false });
 const { refetch: refetchPointHistory } = useGetPointHistory({ enabled: false });
 const { refetch: refetchTopRewards } = useGetTopRewards({ enabled: false, limit: 5 });
 const { refetch: refetchDailyTip } = useGetDailyTip({ enabled: false });

 const loadData = useCallback(async () => {
 try {
 const [profileResult, historyResult, topRewardsResult, dailyTipResult] = await Promise.all([
 refetchProfile({ throwOnError: true }),
 refetchPointHistory({ throwOnError: true }),
 refetchTopRewards({ throwOnError: true }),
 refetchDailyTip({ throwOnError: true }),
 ]);
 const profileData = profileResult.data;
 const historyRes = historyResult.data;
 const topRewardsRes = topRewardsResult.data;
 const dailyTipRes = dailyTipResult.data;

 if (!profileData) {
 throw new Error('Profile data unavailable');
 }

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
 }, [refetchDailyTip, refetchPointHistory, refetchProfile, refetchTopRewards]);

 useFocusEffect(
 useCallback(() => {
 loadData();
 }, [loadData]),
 );

 const onRefresh = useCallback(() => {
 setRefreshing(true);
 loadData();
 }, [loadData]);

 const goQuickAction = (route: string) => {
 if (route === 'ScanTab') navigation.navigate('Scan');
 else if (route === 'MapTab') navigation.navigate('Map');
 else if (route === 'RewardsTab') navigation.navigate('Rewards');
 else navigation.navigate(route);
 };

 const renderSkeleton = () => (
 <View
 className="flex-1 px-5"
 style={{ paddingTop: insets.top + Tokens.space[5], backgroundColor: 'transparent' }}
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
 <View style={{ flex: 1, backgroundColor: 'transparent' }}>
 <ScrollView
 showsVerticalScrollIndicator={false}
 contentContainerClassName="pb-5"
 refreshControl={
 <RefreshControl
 refreshing={refreshing}
 onRefresh={onRefresh}
 colors={[PRIMARY_COLOR]}
 />
 }
 >
 <HeroHeader
 fullName={userProfile?.fullName || 'Bạn'}
 pointsBalance={userProfile?.pointsBalance || 0}
 onPressNotification={() => { }}
 onPressRedeem={() => navigation.navigate('Rewards')}
 onPressMyQr={() => setShowMyQr(true)}
 />

 {/* Redesigned "Mẹo vặt hôm nay" Banner */}
 <DailyTipCard dailyTip={dailyTip} />

 <FeatureCards />

 <RecentActivitiesCard recentActivities={recentActivities} />

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
 <RewardCard
 key={reward.id}
 reward={reward}
 canRedeem={userProfile?.pointsBalance >= reward.points}
 onPress={() => navigation.navigate('RewardDetail', { reward })}
 onRedeem={() => navigation.navigate('RewardDetail', { reward })}
 />
 ))
 )}
 </ScrollView>
 </View>

 <View className="h-[120px]" />
 </ScrollView>

 <MyQrModal visible={showMyQr} onClose={() => setShowMyQr(false)} />
 </View>
 );
};

export default HomeScreen;
