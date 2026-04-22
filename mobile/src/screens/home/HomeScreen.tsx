import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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

const PRIMARY_COLOR = '#1F8505';
const BACKGROUND_COLOR = '#F9FAF8';
const DAILY_TIP_FALLBACK: DailyTipResponse = {
  title: 'Meo xanh de lam',
  content:
    'Giu rieng chai, lon va giay kho trong mot tui hoac hop nho o nha de de gom va mang di tai che.',
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

const mockQuickActions = [
  { id: '1', label: 'Phân loại rác', icon: 'scan-outline' as const, route: 'ScanTab', color: PRIMARY_COLOR },
  { id: '2', label: 'Điểm thu gom', icon: 'location-outline' as const, route: 'MapTab', color: '#2196F3' },
  { id: '3', label: 'Đổi quà', icon: 'gift-outline' as const, route: 'RewardsTab', color: '#E65100' },
  { id: '4', label: 'Quiz', icon: 'bulb-outline' as const, route: 'Quiz', color: '#FF9800' },
  { id: '5', label: 'Ví điểm', icon: 'wallet-outline' as const, route: 'Wallet', color: '#6A1B9A' },
  { id: '6', label: 'Cộng đồng', icon: 'people-outline' as const, route: 'Community', color: '#9C27B0' },
];

const mockDailyMissions = [
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

  const renderSkeleton = () => (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + 20, paddingHorizontal: 20 },
      ]}
    >
      <View style={styles.headerSkeleton}>
        <View style={styles.avatarSkeleton} />
        <View style={styles.textSkeletonContainer}>
          <View style={styles.textSkeletonLine1} />
          <View style={styles.textSkeletonLine2} />
        </View>
      </View>
      <View style={styles.cardSkeleton} />
      <View style={styles.actionSkeleton} />
      <View style={styles.actionSkeleton} />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    </View>
  );

  if (loading || !userProfile) return renderSkeleton();

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY_COLOR]}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {userProfile?.avatarUrl ? (
              <Image source={{ uri: userProfile.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {userProfile?.fullName
                    ? userProfile.fullName.charAt(0).toUpperCase()
                    : 'U'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.greetingText}>
              Chào buổi sáng, {userProfile?.fullName} 👋
            </Text>
            <Text style={styles.subGreetingText}>
              Hôm nay bạn đã sống xanh chưa?
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.bellButton}>
              <Ionicons name="notifications-outline" size={24} color="#333" />
              <View style={styles.badge} />
            </TouchableOpacity>
          </View>
        </View>

        <LinearGradient
          colors={['#28A710', PRIMARY_COLOR, '#156103']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.pointsCard}
        >
          <View style={styles.pointsCardDecor} />
          <View style={styles.pointsCardTop}>
            <View>
              <Text style={styles.pointsTitle}>
                ⭐ {(userProfile?.pointsBalance || 0).toLocaleString()} điểm
              </Text>
              <Text style={styles.pointsToday}>+0 hôm nay</Text>
            </View>
            <TouchableOpacity
              style={styles.giftBtn}
              onPress={() => navigation.navigate('Rewards')}
            >
              <Text style={styles.giftBtnText}>Đổi quà 🎁</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>Tháng này: 1/30 ngày</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '10%' }]} />
            </View>
          </View>
        </LinearGradient>

        <View style={styles.quickActionsGrid}>
          {mockQuickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionCard}
              onPress={() => {
                if (action.route === 'ScanTab') navigation.navigate('Scan');
                else if (action.route === 'MapTab') navigation.navigate('Map');
                else if (action.route === 'RewardsTab')
                  navigation.navigate('Rewards');
                else if (action.route === 'Quiz') navigation.navigate('Quiz');
                else if (action.route === 'Wallet') navigation.navigate('Wallet');
                else if (action.route === 'Community') navigation.navigate('Community');
              }}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.quickActionIconBg,
                  { backgroundColor: `${action.color}15` },
                ]}
              >
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          <View style={styles.recentActivityCard}>
            {recentActivities.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Ionicons name="leaf-outline" size={32} color="#CCC" />
                <Text style={{ marginTop: 8, color: '#888' }}>
                  Chưa có hoạt động nào
                </Text>
              </View>
            ) : (
              recentActivities.map((activity, index) => {
                const details = getActivityDetails(activity);
                const isEarn = activity.type === 'EARN';

                return (
                  <View key={activity.id}>
                    <View style={styles.recentActivityItem}>
                      <View
                        style={[
                          styles.recentActivityIcon,
                          { backgroundColor: `${details.color}15` },
                        ]}
                      >
                        <Ionicons
                          name={details.icon}
                          size={20}
                          color={details.color}
                        />
                      </View>
                      <View style={styles.recentActivityInfo}>
                        <Text style={styles.recentActivityLabel}>
                          {details.label}
                        </Text>
                        <Text style={styles.recentActivityTime}>
                          {timeAgo(activity.createdAt)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.confidenceBadge,
                          {
                            backgroundColor: isEarn ? '#E8F5E9' : '#FFEBEE',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.confidenceText,
                            { color: isEarn ? PRIMARY_COLOR : '#FF5252' },
                          ]}
                        >
                          {isEarn ? '+' : '-'}
                          {Math.abs(activity.points)} đ
                        </Text>
                      </View>
                    </View>
                    {index < recentActivities.length - 1 && (
                      <View style={styles.divider} />
                    )}
                  </View>
                );
              })
            )}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.dailyTipCard}>
            <View style={styles.dailyTipHeader}>
              <View style={styles.dailyTipBadge}>
                <Text style={styles.dailyTipBadgeText}>Mẹo vặt hôm nay</Text>
              </View>
              <Text style={styles.dailyTipEmoji}>{dailyTip.emoji}</Text>
            </View>
            <Text style={styles.dailyTipTitle}>{dailyTip.title}</Text>
            <Text style={styles.dailyTipContent}>{dailyTip.content}</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quà nổi bật</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rewardsScroll}
          >
            {featuredRewards.length === 0 ? (
              <View style={[styles.rewardCard, styles.rewardCardEmpty]}>
                <Ionicons name="gift-outline" size={28} color="#B0B0B0" />
                <Text style={styles.rewardEmptyText}>
                  Chưa có quà đổi thành công
                </Text>
              </View>
            ) : (
              featuredRewards.map((reward) => (
                <TouchableOpacity
                  key={reward.id}
                  style={styles.rewardCard}
                  onPress={() =>
                    navigation.navigate('RewardDetail', { reward })
                  }
                >
                  {reward.tag && (
                    <View style={styles.rewardBadge}>
                      <Text style={styles.rewardBadgeText}>{reward.tag}</Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.rewardIconBg,
                      { backgroundColor: `${reward.color}15` },
                    ]}
                  >
                    <Ionicons
                      name={reward.icon}
                      size={28}
                      color={reward.color}
                    />
                  </View>
                  <Text style={styles.rewardTitle} numberOfLines={1}>
                    {reward.title}
                  </Text>
                  <Text style={styles.rewardMeta}>
                    {reward.redeemCount} lượt đổi
                  </Text>
                  <Text style={styles.rewardCost}>{reward.pointCost} điểm</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Nhiệm vụ hôm nay</Text>
          <View style={styles.missionCard}>
            {mockDailyMissions.map((mission, index) => (
              <View key={mission.id}>
                <View style={styles.missionItem}>
                  <TouchableOpacity style={styles.checkbox}>
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
                  <View style={styles.missionInfo}>
                    <Text
                      style={[
                        styles.missionTitle,
                        mission.completed && styles.missionCompletedText,
                      ]}
                    >
                      {mission.title}
                    </Text>
                    <Text style={styles.missionReward}>
                      +{mission.rewardPoints} điểm
                    </Text>
                  </View>
                </View>
                {index < mockDailyMissions.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 4,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  greetingText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
    textAlign: 'center',
  },
  subGreetingText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 12,
    backgroundColor: '#FF3B30',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  pointsCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24,
    overflow: 'hidden',
  },
  pointsCardDecor: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  pointsCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  pointsTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  pointsToday: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  giftBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  giftBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    marginBottom: 8,
  },
  progressText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickActionCard: {
    width: '47.5%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  recentActivityCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  recentActivityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  recentActivityIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentActivityInfo: {
    flex: 1,
  },
  recentActivityLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  recentActivityTime: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F2',
  },
  dailyTipCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#F1F8E9',
    borderWidth: 1,
    borderColor: '#DCECC8',
    shadowColor: '#86A95C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  dailyTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dailyTipBadge: {
    backgroundColor: '#DFF0C7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dailyTipBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4E7A18',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dailyTipEmoji: {
    fontSize: 26,
  },
  dailyTipTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2E4B14',
    marginBottom: 8,
  },
  dailyTipContent: {
    fontSize: 14,
    lineHeight: 21,
    color: '#4F5F41',
    fontWeight: '500',
  },
  rewardsScroll: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  rewardCard: {
    width: 130,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  rewardCardEmpty: {
    width: 180,
    justifyContent: 'center',
  },
  rewardEmptyText: {
    marginTop: 10,
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  rewardIconBg: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  rewardBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
  },
  rewardMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: '#777',
    marginBottom: 6,
  },
  rewardCost: {
    fontSize: 13,
    fontWeight: '800',
    color: PRIMARY_COLOR,
  },
  missionCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  checkbox: {
    marginRight: 14,
  },
  missionInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  missionCompletedText: {
    color: '#A0A0A0',
    textDecorationLine: 'line-through',
  },
  missionReward: {
    fontSize: 14,
    fontWeight: '800',
    color: PRIMARY_COLOR,
    marginLeft: 10,
  },
  loadingText: {
    marginTop: 16,
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  headerSkeleton: {
    flexDirection: 'row',
    marginBottom: 30,
    alignItems: 'center',
  },
  avatarSkeleton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EBEBEB',
    marginRight: 16,
  },
  textSkeletonContainer: {
    flex: 1,
  },
  textSkeletonLine1: {
    width: '60%',
    height: 18,
    backgroundColor: '#EBEBEB',
    borderRadius: 9,
    marginBottom: 10,
  },
  textSkeletonLine2: {
    width: '40%',
    height: 14,
    backgroundColor: '#EBEBEB',
    borderRadius: 7,
  },
  cardSkeleton: {
    height: 160,
    backgroundColor: '#EBEBEB',
    borderRadius: 20,
    marginBottom: 24,
  },
  actionSkeleton: {
    height: 90,
    backgroundColor: '#EBEBEB',
    borderRadius: 20,
    marginBottom: 16,
  },
});

export default HomeScreen;

