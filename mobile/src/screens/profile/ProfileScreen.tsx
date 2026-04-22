import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Colors from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { getProfile } from '../../services/api/auth.service';
import { rankConfig } from '../../services/mockData';
import { BackgroundTrees } from '../../components/NatureBackground';
import FallingLeaves from '../../components/FallingLeaves';

type ProfileMenuRoute =
  | 'PersonalInfo'
  | 'Wallet'
  | 'NotificationsSettings'
  | 'PrivacySecurity'
  | 'LanguageSettings'
  | 'AppearanceSettings'
  | 'LocationSettings'
  | 'HelpFaq'
  | 'RateApp'
  | 'ShareEcoHabit';

const badges = [
  { icon: '🌱', label: 'Người mới', unlocked: true },
  { icon: '♻️', label: 'Nhà tái chế', unlocked: true },
  { icon: '🦸', label: 'Anh hùng', unlocked: false },
  { icon: '🌍', label: 'Xanh toàn cầu', unlocked: false },
  { icon: '🔥', label: '30 ngày', unlocked: true },
  { icon: '💎', label: 'Diamond', unlocked: false },
];

const menuItems: Array<{
  route: ProfileMenuRoute;
  icon: string;
  label: string;
  color: string;
  group: 'account' | 'app' | 'support';
}> = [
  {
    route: 'PersonalInfo',
    icon: 'person-outline',
    label: 'Thông tin cá nhân',
    color: Colors.primary,
    group: 'account',
  },
  {
    route: 'Wallet',
    icon: 'wallet-outline',
    label: 'Lịch sử điểm',
    color: '#6A1B9A',
    group: 'account',
  },
  {
    route: 'NotificationsSettings',
    icon: 'notifications-outline',
    label: 'Thông báo',
    color: '#1565C0',
    group: 'account',
  },
  {
    route: 'PrivacySecurity',
    icon: 'shield-checkmark-outline',
    label: 'Bảo mật & quyền riêng tư',
    color: '#6A1B9A',
    group: 'account',
  },
  {
    route: 'LanguageSettings',
    icon: 'language-outline',
    label: 'Ngôn ngữ',
    color: '#00838F',
    group: 'app',
  },
  {
    route: 'AppearanceSettings',
    icon: 'color-palette-outline',
    label: 'Giao diện',
    color: '#F57F17',
    group: 'app',
  },
  {
    route: 'LocationSettings',
    icon: 'location-outline',
    label: 'Vị trí & bản đồ',
    color: '#E65100',
    group: 'app',
  },
  {
    route: 'HelpFaq',
    icon: 'help-circle-outline',
    label: 'Trợ giúp & FAQ',
    color: '#546E7A',
    group: 'support',
  },
  {
    route: 'RateApp',
    icon: 'star-outline',
    label: 'Đánh giá ứng dụng',
    color: '#F57F17',
    group: 'support',
  },
  {
    route: 'ShareEcoHabit',
    icon: 'share-social-outline',
    label: 'Chia sẻ EcoHabit',
    color: Colors.primary,
    group: 'support',
  },
];

const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const [notif, setNotif] = useState(true);
  const [dark, setDark] = useState(false);

  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const data = await getProfile();
      setUserProfile(data);
    } catch (error) {
      console.log('Lỗi tải dữ liệu người dùng:', error);
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

  const openProfileDetail = (route: ProfileMenuRoute) => {
    navigation.navigate(route);
  };

  const grouped = {
    account: menuItems.filter((item) => item.group === 'account'),
    app: menuItems.filter((item) => item.group === 'app'),
    support: menuItems.filter((item) => item.group === 'support'),
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.root, styles.loadingWrap]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const name = userProfile?.fullName || 'Người dùng';
  const email = userProfile?.email || '';
  const initial = name.charAt(0).toUpperCase();
  const points = userProfile?.pointsBalance || 0;

  const currentRank =
    points >= 5000
      ? rankConfig.diamond
      : points >= 2500
        ? rankConfig.gold
        : points >= 1000
          ? rankConfig.silver
          : rankConfig.bronze;

  return (
    <View style={styles.root}>
      <BackgroundTrees />

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
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => openProfileDetail('AppearanceSettings')}
            >
            <Ionicons name="settings-outline" size={22} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.avatarWrap}>
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
              style={styles.avatar}
            >
              <Text style={styles.avatarInitial}>{initial}</Text>
            </LinearGradient>
            <TouchableOpacity
              style={styles.editAvatar}
              onPress={() => openProfileDetail('PersonalInfo')}
            >
              <Ionicons name="camera" size={14} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>

          <View style={styles.rankBadge}>
            <Text style={styles.rankTxt}>{currentRank.emoji} Hạng {currentRank.label}</Text>
          </View>

          <View style={styles.statsBar}>
            {[
              { value: '14', label: 'Ngày liên tiếp' },
              { value: points.toString(), label: 'Điểm xanh' },
              { value: '7', label: 'Thành tích' },
            ].map((stat, index) => (
              <React.Fragment key={index}>
                {index > 0 && <View style={styles.statDivider} />}
                <View style={styles.statItem}>
                  <Text style={styles.statVal}>{stat.value}</Text>
                  <Text style={styles.statLbl}>{stat.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>🏅 Huy hiệu của bạn</Text>
            <TouchableOpacity onPress={() => openProfileDetail('HelpFaq')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badges}
          >
            {badges.map((badge, index) => (
              <View
                key={index}
                style={[styles.badgeItem, !badge.unlocked && styles.badgeLocked]}
              >
                <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                <Text
                  style={[
                    styles.badgeLabel,
                    !badge.unlocked && styles.badgeLabelLocked,
                  ]}
                >
                  {badge.label}
                </Text>
                {!badge.unlocked && (
                  <View style={styles.lockIcon}>
                    <Ionicons
                      name="lock-closed"
                      size={10}
                      color={Colors.textMuted}
                    />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        <LinearGradient
          colors={['#E8F5E9', '#C8E6C9']}
          style={styles.impactCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.impactTitle}>🌍 Tác động môi trường của bạn</Text>
          <View style={styles.impactRow}>
            {[
              { emoji: '🌳', value: '3', label: 'Cây đã trồng' },
              { emoji: '💧', value: '240L', label: 'Nước tiết kiệm' },
              { emoji: '🌫️', value: '18kg', label: 'CO₂ giảm' },
            ].map((item, index) => (
              <View key={index} style={styles.impactItem}>
                <Text style={styles.impactEmoji}>{item.emoji}</Text>
                <Text style={styles.impactValue}>{item.value}</Text>
                <Text style={styles.impactLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={[styles.toggleIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="notifications-outline" size={18} color="#1565C0" />
              </View>
              <Text style={styles.toggleLabel}>Thông báo</Text>
            </View>
            <Switch
              value={notif}
              onValueChange={setNotif}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={Colors.white}
            />
          </View>

          <View style={[styles.toggleRow, styles.toggleDivider]}>
            <View style={styles.toggleLeft}>
              <View style={[styles.toggleIcon, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="moon-outline" size={18} color="#6A1B9A" />
              </View>
              <Text style={styles.toggleLabel}>Giao diện tối</Text>
            </View>
            <Switch
              value={dark}
              onValueChange={setDark}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        {[
          { title: '👤 Tài khoản', items: grouped.account },
          { title: '⚙️ Cài đặt ứng dụng', items: grouped.app },
          { title: '💬 Hỗ trợ', items: grouped.support },
        ].map((group) => (
          <View key={group.title} style={styles.menuGroup}>
            <Text style={styles.menuGroupTitle}>{group.title}</Text>
            <View style={styles.menuCard}>
              {group.items.map((item, index) => (
                <TouchableOpacity
                  key={item.route}
                  style={[
                    styles.menuItem,
                    index > 0 && styles.menuDivider,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => openProfileDetail(item.route)}
                >
                  <View
                    style={[styles.menuIcon, { backgroundColor: `${item.color}18` }]}
                  >
                    <Ionicons name={item.icon as any} size={18} color={item.color} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.signOutBtn} activeOpacity={0.8} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.signOutTxt}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.version}>EcoHabit v1.0.0 · Made with 💚</Text>
      </ScrollView>
      <FallingLeaves />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F9F5' },
  loadingWrap: { justifyContent: 'center', alignItems: 'center' },
  scroll: {},

  header: { paddingHorizontal: 20, paddingBottom: 24, alignItems: 'center' },
  settingsBtn: { position: 'absolute', top: 56, right: 20 },

  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarInitial: { fontSize: 38, fontWeight: '800', color: Colors.white },
  editAvatar: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },

  name: { fontSize: 22, fontWeight: '800', color: Colors.white, marginBottom: 2 },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 10 },

  rankBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 16,
  },
  rankTxt: { fontSize: 12, fontWeight: '700', color: Colors.white },

  statsBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    overflow: 'hidden',
    width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statVal: { fontSize: 20, fontWeight: '800', color: Colors.white },
  statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)' },

  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  seeAll: { fontSize: 13, color: Colors.primaryLight, fontWeight: '600' },

  badges: { gap: 10, paddingRight: 4 },
  badgeItem: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    width: 75,
    position: 'relative',
    elevation: 2,
  },
  badgeLocked: { opacity: 0.45 },
  badgeEmoji: { fontSize: 28, marginBottom: 4 },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  badgeLabelLocked: { color: Colors.textMuted },
  lockIcon: { position: 'absolute', top: 6, right: 6 },

  impactCard: { marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 18 },
  impactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  impactRow: { flexDirection: 'row', justifyContent: 'space-around' },
  impactItem: { alignItems: 'center' },
  impactEmoji: { fontSize: 28, marginBottom: 6 },
  impactValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  impactLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
  },

  toggleCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toggleDivider: { borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },

  menuGroup: { marginHorizontal: 16, marginTop: 16 },
  menuGroupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  menuDivider: { borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: Colors.textPrimary },

  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.errorBorder,
  },
  signOutTxt: { fontSize: 15, fontWeight: '700', color: Colors.error },

  version: { textAlign: 'center', marginTop: 16, fontSize: 11, color: Colors.textMuted },
});

export default ProfileScreen;

