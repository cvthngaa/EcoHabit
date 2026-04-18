import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../theme/colors';
import { mockUser, mockTransactions, ecoTips, rankConfig } from '../services/mockData';
import { getBalance } from '../services/walletService';
import { getProfile } from '../services/api/auth.service';

const { width } = Dimensions.get('window');

// ── Greeting helper ───────────────────────────────────────────────────────────

function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Chào buổi sáng', emoji: '☀️' };
  if (h < 18) return { text: 'Chào buổi chiều', emoji: '🌤️' };
  return { text: 'Chào buổi tối', emoji: '🌙' };
}

// ── Mock stats ────────────────────────────────────────────────────────────────

const stats = [
  { icon: 'leaf', label: 'kg Rác tái chế', value: '12.4', color: '#2E7D32', bg: '#E8F5E9' },
  { icon: 'star', label: 'Điểm xanh', value: '840', color: '#F57F17', bg: '#FFF8E1' },
  { icon: 'trophy', label: 'Thành tích', value: '7', color: '#1565C0', bg: '#E3F2FD' },
  { icon: 'flame', label: 'Ngày liên tiếp', value: '14', color: '#B71C1C', bg: '#FFEBEE' },
];

const recentActivities = [
  { icon: 'scan', color: Colors.primary, bg: '#E8F5E9', label: 'Quét rác nhựa', sub: '2 phút trước', pts: '+20' },
  { icon: 'location', color: '#1565C0', bg: '#E3F2FD', label: 'Giao rác tại điểm B3', sub: '1 giờ trước', pts: '+50' },
  { icon: 'gift', color: '#6A1B9A', bg: '#F3E5F5', label: 'Đổi thưởng túi tái chế', sub: 'Hôm nay', pts: '-200' },
  { icon: 'ribbon', color: '#F57F17', bg: '#FFF8E1', label: 'Đạt huy hiệu "Người xanh"', sub: 'Hôm qua', pts: '+30' },
];

// ── HomeScreen ────────────────────────────────────────────────────────────────

const HomeScreen: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await getProfile();
        setUser(userData);
        console.log(userData)
      } catch (error) {
        console.log("Lỗi tải thông tin user", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const greeting = getGreeting();
  const balance = getBalance();
  const rank = rankConfig[mockUser.rank];

  // Tip carousel auto-scroll
  const tipScrollRef = useRef<FlatList>(null);
  const [activeTip, setActiveTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTip(prev => {
        const next = (prev + 1) % ecoTips.length;
        tipScrollRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const headerOpacity = scrollY.interpolate({ inputRange: [0, 80], outputRange: [1, 0.95], extrapolate: 'clamp' });

  return (
    <View style={styles.root}>
      {/* Gradient header background */}
      <LinearGradient
        colors={[Colors.primaryGradientStart, Colors.primaryLight, '#E8F5E9']}
        style={[styles.headerBg, { paddingTop: insets.top + 10 }]}
      />

      <Animated.ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 110 }]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* ── Wallet Card ──────────────────────────────────────────────────── */}
        <LinearGradient
          colors={[Colors.primaryGradientStart, Colors.primary, Colors.primaryLight]}
          style={styles.walletCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.walletDecorCircle} />
          <View style={styles.walletTop}>
            <View>
              <Text style={styles.walletLabel}>Ví điểm xanh</Text>
              <View style={styles.walletBalRow}>
                <Text style={styles.walletBalance}>{balance.toLocaleString()}</Text>
                <Text style={styles.walletUnit}>điểm</Text>
              </View>
            </View>
            <View style={styles.walletRankBadge}>
              <Text style={styles.walletRankEmoji}>{rank.emoji}</Text>
              <Text style={styles.walletRankText}>{rank.label}</Text>
            </View>
          </View>
          <View style={styles.walletDivider} />
          <View style={styles.walletBottom}>
            <View style={styles.walletStat}>
              <Ionicons name="trending-up" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.walletStatTxt}>+120 tuần này</Text>
            </View>
            <View style={styles.walletStat}>
              <Ionicons name="flame" size={14} color="#FFD54F" />
              <Text style={styles.walletStatTxt}>{mockUser.streak} ngày liên tiếp</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Big CTA Button ───────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.ctaWrap} activeOpacity={0.9}>
          <LinearGradient
            colors={['#1B5E20', '#2E7D32', '#43A047']}
            style={styles.ctaBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.ctaIconWrap}>
              <Ionicons name="camera" size={28} color={Colors.white} />
            </View>
            <View>
              <Text style={styles.ctaTitle}>📸 Chụp rác ngay</Text>
              <Text style={styles.ctaSub}>Nhận diện AI & tích điểm</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.6)" />
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Stats grid ──────────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Tổng quan của bạn</Text>
        <View style={styles.statsGrid}>
          {stats.map((s, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: s.bg }]}>
              <View style={[styles.statIconWrap, { backgroundColor: s.color + '22' }]}>
                <Ionicons name={s.icon as any} size={22} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Quick actions ───────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Hành động nhanh</Text>
        <View style={styles.quickRow}>
          {[
            { icon: 'scan', label: 'Quét rác', color: Colors.primary },
            { icon: 'map', label: 'Điểm thu gom', color: '#1565C0' },
            { icon: 'wallet', label: 'Ví điểm', color: '#F57F17' },
            { icon: 'gift', label: 'Đổi thưởng', color: '#6A1B9A' },
          ].map((q, i) => (
            <TouchableOpacity key={i} style={styles.quickItem} activeOpacity={0.8}>
              <LinearGradient
                colors={[q.color + 'EE', q.color]}
                style={styles.quickIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name={q.icon as any} size={24} color={Colors.white} />
              </LinearGradient>
              <Text style={styles.quickLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Eco tip carousel ─────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>💡 Mẹo xanh hôm nay</Text>
        <FlatList
          ref={tipScrollRef}
          data={ecoTips}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => String(item.id)}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
            setActiveTip(idx);
          }}
          renderItem={({ item }) => (
            <LinearGradient
              colors={[Colors.primaryGradientStart, Colors.primaryLight]}
              style={[styles.tipCard, { width: width - 32 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.tipHeader}>
                <Text style={styles.tipEmoji}>{item.emoji}</Text>
                <Text style={styles.tipTitle}>{item.title}</Text>
              </View>
              <Text style={styles.tipText}>{item.text}</Text>
            </LinearGradient>
          )}
        />
        {/* Page indicators */}
        <View style={styles.tipDots}>
          {ecoTips.map((_, i) => (
            <View key={i} style={[styles.tipDot, i === activeTip && styles.tipDotActive]} />
          ))}
        </View>

        {/* ── Recent activity ─────────────────────────────────────────────── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Xem tất cả</Text></TouchableOpacity>
        </View>
        <View style={styles.activityCard}>
          {recentActivities.map((a, i) => (
            <View key={i} style={[styles.actRow, i < recentActivities.length - 1 && styles.actBorder]}>
              <View style={[styles.actIcon, { backgroundColor: a.bg }]}>
                <Ionicons name={a.icon as any} size={20} color={a.color} />
              </View>
              <View style={styles.actInfo}>
                <Text style={styles.actLabel}>{a.label}</Text>
                <Text style={styles.actSub}>{a.sub}</Text>
              </View>
              <Text style={[styles.actPts, { color: a.pts.startsWith('+') ? Colors.earn : Colors.spend }]}>
                {a.pts} đ
              </Text>
            </View>
          ))}
        </View>

        {/* ── Challenge banner ────────────────────────────────────────────── */}
        <View style={styles.challengeCard}>
          <View style={styles.challengeLeft}>
            <Text style={styles.challengeTag}>🔥 Thử thách tuần</Text>
            <Text style={styles.challengeTitle}>Thu gom 5 kg rác nhựa</Text>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[Colors.primaryGradientStart, Colors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: '62%' as any }]}
              />
            </View>
            <Text style={styles.progressTxt}>3.1 / 5 kg · 62%</Text>
          </View>
          <View style={styles.challengeRight}>
            <Text style={styles.challengeReward}>🎁</Text>
            <Text style={styles.challengeRewardTxt}>+200 điểm</Text>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </Animated.ScrollView>

      {/* ── Top header overlay ──────────────────────────────────────────────── */}
      <Animated.View style={[styles.topBar, { paddingTop: insets.top + 10, opacity: headerOpacity }]}>
        <View>
          <Text style={styles.greeting}>{greeting.text}! {greeting.emoji}</Text>
          <Text style={styles.username}>
            {loading ? "Đang tải..." : user?.fullName || "Người dùng ẩn danh"}
          </Text>
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.topBarBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.white} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarInitial}>
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F9F5' },

  headerBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 220 },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 14,
  },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  username: { fontSize: 20, color: Colors.white, fontWeight: '800', marginTop: 2 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topBarBtn: { position: 'relative' },
  notifDot: { position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF5252', borderWidth: 1, borderColor: Colors.white },
  avatarSmall: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.white },
  avatarInitial: { fontSize: 16, fontWeight: '700', color: Colors.white },

  scroll: { paddingHorizontal: 16, paddingBottom: 30 },

  // Wallet Card
  walletCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.primaryGradientStart,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  walletDecorCircle: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  walletTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  walletLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  walletBalRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 },
  walletBalance: { fontSize: 36, fontWeight: '800', color: Colors.white, letterSpacing: -1 },
  walletUnit: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  walletRankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  walletRankEmoji: { fontSize: 14 },
  walletRankText: { fontSize: 12, color: Colors.white, fontWeight: '700' },
  walletDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 14,
  },
  walletBottom: {
    flexDirection: 'row',
    gap: 20,
  },
  walletStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  walletStatTxt: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

  // CTA
  ctaWrap: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: Colors.primaryGradientStart,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 14,
  },
  ctaIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTitle: { fontSize: 17, fontWeight: '800', color: Colors.white },
  ctaSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12, marginTop: 20 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 12 },
  seeAll: { fontSize: 13, color: Colors.primaryLight, fontWeight: '600' },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: (width - 42) / 2, borderRadius: 18, padding: 16, alignItems: 'flex-start' },
  statIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, fontWeight: '500' },

  // Quick actions
  quickRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quickItem: { alignItems: 'center', width: (width - 52) / 4 },
  quickIcon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8 },
  quickLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', textAlign: 'center' },

  // Tip carousel
  tipCard: { borderRadius: 20, padding: 20, marginRight: 0 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  tipEmoji: { fontSize: 28 },
  tipTitle: { fontSize: 15, color: Colors.white, fontWeight: '700' },
  tipText: { fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 22 },
  tipDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  tipDotActive: { backgroundColor: Colors.primaryLight, width: 18 },

  // Activity
  activityCard: { backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 12 },
  actRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  actBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  actIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  actInfo: { flex: 1 },
  actLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  actSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  actPts: { fontSize: 14, fontWeight: '700' },

  // Challenge
  challengeCard: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 20, padding: 18, marginTop: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 12, borderLeftWidth: 4, borderLeftColor: Colors.primaryLight },
  challengeLeft: { flex: 1 },
  challengeTag: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, marginBottom: 6 },
  challengeTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  progressBar: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressTxt: { fontSize: 11, color: Colors.textMuted, marginTop: 6, fontWeight: '500' },
  challengeRight: { alignItems: 'center', justifyContent: 'center', paddingLeft: 16 },
  challengeReward: { fontSize: 32 },
  challengeRewardTxt: { fontSize: 12, fontWeight: '700', color: Colors.primary, marginTop: 4 },
});

export default HomeScreen;
