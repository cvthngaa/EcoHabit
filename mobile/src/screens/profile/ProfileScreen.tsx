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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Colors from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useGetProfile } from '../../services/auth';
import { useGetMyBadges } from '../../services/badges';
import Svg, { Path, Polygon } from 'react-native-svg';
import SharedHeaderBackground from '../../components/SharedHeaderBackground';
import { useSettings } from '../../context/SettingsContext';

type ProfileMenuRoute =
  | 'PersonalInfo'
  | 'Wallet'
  | 'Leaderboard'
  | 'PrivacySecurity'
  | 'LanguageSettings'
  | 'AppearanceSettings'
  | 'LocationSettings'
  | 'HelpFaq'
  | 'RateApp'
  | 'ShareEcoHabit'
  | 'Badges';

const menuItems: Array<{
  route: ProfileMenuRoute;
  icon: string;
  label: string;
  color: string;
  group: 'account' | 'app' | 'support';
}> = [
    { route: 'PersonalInfo', icon: 'person-outline', label: 'Thông tin cá nhân', color: Colors.primary, group: 'account' },
    { route: 'Wallet', icon: 'wallet-outline', label: 'Lịch sử điểm', color: '#6A1B9A', group: 'account' },
    { route: 'Leaderboard', icon: 'podium-outline', label: 'Bảng xếp hạng', color: '#FF8F00', group: 'app' },
    { route: 'PrivacySecurity', icon: 'key-outline', label: 'Đổi mật khẩu', color: '#6A1B9A', group: 'account' },
    { route: 'LanguageSettings', icon: 'language-outline', label: 'Ngôn ngữ', color: '#00838F', group: 'app' },
    { route: 'AppearanceSettings', icon: 'color-palette-outline', label: 'Giao diện', color: '#F57F17', group: 'app' },
    { route: 'LocationSettings', icon: 'location-outline', label: 'Vị trí & bản đồ', color: '#E65100', group: 'app' },
    { route: 'HelpFaq', icon: 'help-circle-outline', label: 'Trợ giúp & FAQ', color: '#546E7A', group: 'support' },
    { route: 'RateApp', icon: 'star-outline', label: 'Đánh giá ứng dụng', color: '#F57F17', group: 'support' },
    { route: 'ShareEcoHabit', icon: 'share-social-outline', label: 'Chia sẻ EcoHabit', color: Colors.primary, group: 'support' },
  ];



const HexagonBadge = ({ level }: { level: string | number }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', width: 90, height: 90 }}>
    <Svg height="40" width="100" style={{ position: 'absolute' }}>
      <Path d="M 20 5 Q 0 20 20 35 Q 35 20 20 5" fill="#E4C89D" />
      <Path d="M 80 5 Q 100 20 80 35 Q 65 20 80 5" fill="#E4C89D" />
    </Svg>
    <Svg height="76" width="76" viewBox="0 0 100 100">
      <Polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="#ED9B33" stroke="white" strokeWidth="6" strokeLinejoin="round" />
    </Svg>
    <Text style={{ position: 'absolute', color: 'white', fontSize: 32, fontWeight: 'bold' }}>{level}</Text>
  </View>
);

const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const { appearance } = useSettings();

  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { refetch: refetchProfile } = useGetProfile({ enabled: false });
  const { data: myBadges = [], refetch: refetchBadges } = useGetMyBadges();

  const loadData = useCallback(async () => {
    try {
      const profileResult = await refetchProfile({ throwOnError: true });
      if (!profileResult.data) {
        throw new Error('Profile data unavailable');
      }
      setUserProfile(profileResult.data);
      await refetchBadges();
    } catch (error) {
      console.log('Lỗi tải dữ liệu người dùng:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refetchProfile]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const openProfileDetail = (route: ProfileMenuRoute | 'Logout') => {
    if (route === 'Logout') {
      logout();
    } else {
      navigation.navigate(route);
    }
  };

  const grouped = {
    account: menuItems.filter((item) => item.group === 'account'),
    app: menuItems.filter((item) => item.group === 'app'),
    support: menuItems.filter((item) => item.group === 'support'),
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#CDE1B9' }}>
        <ActivityIndicator size="large" color="#ED9B33" />
      </View>
    );
  }

  const name = userProfile?.fullName || 'Người dùng';
  const email = userProfile?.email || '';
  const initial = name.charAt(0).toUpperCase();
  const avatarUrl = userProfile?.avatarUrl;
  const points = userProfile?.pointsBalance || 0;

  const currentRank = points >= 10000 ? { label: 5 } :
    points >= 5000 ? { label: 4 } : points >= 2500 ? { label: 3 } : points >= 1000 ? { label: 2 } : { label: 1 };

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <SharedHeaderBackground className="absolute top-0 left-0 right-0 h-[500px]" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 20, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ED9B33']} tintColor="#ED9B33" />
        }
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: insets.top + 10, paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
            <Ionicons name="chevron-back" size={24} color="#3A3A3A" />
          </TouchableOpacity>
          <Text style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#3A3A3A', marginRight: 34 }}>Hồ sơ</Text>
        </View>

        {/* Avatar Area */}
        <View style={{ alignItems: 'center', marginTop: 30 }}>
          <View style={{ width: 140, height: 140, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ position: 'absolute', width: 150, height: 150, borderRadius: 75, borderWidth: 5, borderColor: '#485444', borderTopColor: 'transparent', borderRightColor: 'transparent', transform: [{ rotate: '-15deg' }] }} />
            <View style={{ position: 'absolute', width: 130, height: 130, borderRadius: 65, borderWidth: 3, borderColor: '#485444', borderBottomColor: 'transparent', borderLeftColor: 'transparent', transform: [{ rotate: '45deg' }] }} />

            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={{ width: 110, height: 110, borderRadius: 55, backgroundColor: '#485444', borderWidth: 2, borderColor: '#485444' }} />
            ) : (
              <View style={{ width: 110, height: 110, borderRadius: 55, backgroundColor: '#485444', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#485444' }}>
                <Text style={{ fontSize: 44, fontWeight: 'bold', color: 'white' }}>{initial}</Text>
              </View>
            )}

            <TouchableOpacity
              className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-[#ED9B33] items-center justify-center border-[3px] border-white"
              onPress={() => openProfileDetail('PersonalInfo')}
            >
              <Ionicons name="pencil" size={14} color="white" />
            </TouchableOpacity>
          </View>

          <Text className="text-xl font-extrabold text-[#3A3A3A] mt-4 mb-0.5">{name}</Text>
          <Text className="text-sm text-[#5D734B]">{email}</Text>
        </View>


        {/* Badges Section */}
        <View className="px-5 mt-8 mb-2">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-[15px] font-bold text-[#3A3A3A]">🏅 Huy hiệu của bạn</Text>
            <TouchableOpacity onPress={() => openProfileDetail('Badges')}>
              <Text className="text-[13px] text-[#7CA854] font-semibold">Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingRight: 4 }}
          >
            {myBadges.map((badge, index) => (
              <View
                key={index}
                className={`items-center bg-white/90 rounded-2xl p-3 w-[75px] relative border border-[#E1EED3] ${!badge.isEarned ? 'opacity-50' : ''}`}
              >
                <Text className="text-[28px] mb-1">{badge.icon || '🏅'}</Text>
                <Text className="text-[10px] font-semibold text-center text-[#5D734B]" numberOfLines={1}>
                  {badge.name}
                </Text>
                {!badge.isEarned && (
                  <View className="absolute top-1.5 right-1.5">
                    <Ionicons name="lock-closed" size={10} color="#A3C385" />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Menu Card */}
        <View style={{
          flex: 1,
          backgroundColor: appearance === 'nature' ? 'rgba(255, 255, 255, 0.9)' : 'white',
          marginTop: 20,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          paddingTop: 30,
          paddingHorizontal: 25,
          minHeight: 400
        }}>
          {[
            { title: '👤 Tài khoản', items: grouped.account },
            { title: '⚙️ Cài đặt ứng dụng', items: grouped.app },
            { title: '💬 Hỗ trợ', items: grouped.support },
          ].map((group) => (
            <View key={group.title} className="mb-6">
              <Text className="text-xs font-bold text-[#A3C385] mb-2 uppercase tracking-wide">{group.title}</Text>

              {group.items.map((item, index) => (
                <View key={item.route}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}
                    activeOpacity={0.7}
                    onPress={() => openProfileDetail(item.route)}
                  >
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: `${item.color}15`, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#3A3A3A', flex: 1 }}>{item.label}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#C5D9AE" />
                  </TouchableOpacity>
                  {index < group.items.length - 1 && <View style={{ height: 1, backgroundColor: '#F5F9F0', marginLeft: 60 }} />}
                </View>
              ))}
            </View>
          ))}

          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 mt-2 py-4 bg-[#FFF5F5] rounded-[20px]"
            activeOpacity={0.8}
            onPress={() => openProfileDetail('Logout')}
          >
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text className="text-[15px] font-bold text-[#D32F2F]">Đăng xuất</Text>
          </TouchableOpacity>

          <Text className="text-center mt-6 mb-4 text-[11px] text-[#A3C385]">EcoHabit v1.0.0 · Made with 💚</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
