import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Colors from '../../theme/colors';
import { useToast } from '../../context/ToastContext';

import { getProfile } from '../../services/api/auth.service';
import { redeemReward } from '../../services/api/rewards.service';

const RewardDetailScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  
  const [redeeming, setRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const reward = (route.params as any)?.reward;

  useEffect(() => {
    if (!reward) return;
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        setUserPoints(profile?.pointsBalance || 0);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [reward]);

  if (!reward) return null;

  const canRedeem = userPoints !== null && userPoints >= reward.points;

  const handleRedeem = async () => {
    if (!canRedeem || redeemed) return;
    setRedeeming(true);
    
    try {
      await redeemReward(reward.id);
      setRedeemed(true);
      setUserPoints(prev => (prev || 0) - reward.points);
      showToast(`🎉 Đã đổi "${reward.name}" thành công!`, 'success');
      // nav.goBack() can be called here or let the user see the success state
    } catch (error: any) {
      console.log('Lỗi đổi quà:', error.response?.data || error);
      showToast('Đổi thưởng thất bại, vui lòng thử lại', 'error');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        {/* Header image area */}
        <LinearGradient
          colors={[reward.color + '30', reward.bg]}
          style={[styles.headerArea, { paddingTop: insets.top + 16 }]}
        >
          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>

          {/* Large emoji */}
          <View style={[styles.emojiWrap, { backgroundColor: reward.color + '22' }]}>
            <Text style={styles.emoji}>{reward.emoji}</Text>
          </View>

          {/* Tag */}
          {reward.tag ? (
            <View style={styles.tag}>
              <Text style={styles.tagTxt}>{reward.tag}</Text>
            </View>
          ) : null}
        </LinearGradient>

        {/* Detail card */}
        <View style={styles.detailCard}>
          <Text style={styles.name}>{reward.name}</Text>
          <Text style={styles.category}>{reward.category}</Text>
          <Text style={styles.desc}>{reward.description}</Text>

          {/* Points required */}
          <View style={styles.ptsRow}>
            <Ionicons name="star" size={22} color="#F57F17" />
            <Text style={styles.ptsValue}>{reward.points}</Text>
            <Text style={styles.ptsSuffix}>điểm xanh</Text>
          </View>

          {/* Info grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="cube-outline" size={20} color="#1565C0" />
              </View>
              <Text style={styles.infoLabel}>Còn lại</Text>
              <Text style={styles.infoValue}>{reward.stock} lượt</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#FFF8E1' }]}>
                <Ionicons name="wallet-outline" size={20} color="#F57F17" />
              </View>
              <Text style={styles.infoLabel}>Số dư</Text>
              <Text style={[styles.infoValue, { color: canRedeem ? Colors.primary : Colors.error }]}>{userPoints} đ</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: canRedeem ? '#E8F5E9' : '#FFEBEE' }]}>
                <Ionicons name={canRedeem ? 'checkmark-circle-outline' : 'alert-circle-outline'} size={20} color={canRedeem ? Colors.primary : Colors.error} />
              </View>
              <Text style={styles.infoLabel}>Trạng thái</Text>
              <Text style={[styles.infoValue, { color: canRedeem ? Colors.primary : Colors.error }]}>{canRedeem ? 'Đủ điểm' : 'Thiếu điểm'}</Text>
            </View>
          </View>

          {/* Balance preview */}
          {canRedeem && !redeemed && (
            <View style={styles.balancePreview}>
              <Text style={styles.balTxt}>Sau khi đổi: </Text>
              <Text style={styles.balVal}>{userPoints} → {(userPoints || 0) - reward.points} điểm</Text>
            </View>
          )}
        </View>

        {/* Terms */}
        <View style={styles.termsCard}>
          <View style={styles.termsHeader}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.textMuted} />
            <Text style={styles.termsTitle}>Điều kiện sử dụng</Text>
          </View>
          <Text style={styles.termsText}>• Quà sẽ được gửi trong vòng 3-5 ngày làm việc</Text>
          <Text style={styles.termsText}>• Không hoàn lại điểm sau khi đổi</Text>
          <Text style={styles.termsText}>• Liên hệ hotline nếu cần hỗ trợ</Text>
        </View>
      </ScrollView>

      {/* Bottom action */}
      <View style={[styles.bottomAction, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.redeemWrap, (!canRedeem || redeeming || redeemed || reward.stock === 0) && { opacity: 0.6 }]}
          onPress={handleRedeem}
          disabled={!canRedeem || redeeming || redeemed || reward.stock === 0}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={redeemed ? ['#66BB6A', '#43A047'] : [Colors.primaryGradientStart, Colors.primaryLight]}
            style={styles.redeemBtn}
          >
            <Ionicons name={redeemed ? 'checkmark-circle' : 'gift'} size={22} color={Colors.white} />
            <Text style={styles.redeemTxt}>
              {reward.stock === 0 ? 'Hết hàng' : redeemed ? 'Đã đổi thành công!' : redeeming ? 'Đang xử lý...' : `Đổi ngay · ${reward.points} điểm`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F9F5' },
  scroll: {},

  headerArea: { alignItems: 'center', paddingBottom: 28, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backBtn: { alignSelf: 'flex-start', width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, marginBottom: 16 },
  emojiWrap: { width: 120, height: 120, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emoji: { fontSize: 56 },
  tag: { position: 'absolute', top: 60, right: 20, backgroundColor: '#FF5252', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagTxt: { fontSize: 11, fontWeight: '700', color: Colors.white },

  detailCard: { backgroundColor: Colors.white, marginHorizontal: 16, marginTop: -16, borderRadius: 24, padding: 24, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, marginBottom: 16 },
  name: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  category: { fontSize: 13, color: Colors.textMuted, fontWeight: '600', marginBottom: 12 },
  desc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, marginBottom: 20 },

  ptsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  ptsValue: { fontSize: 28, fontWeight: '800', color: '#F57F17' },
  ptsSuffix: { fontSize: 15, color: Colors.textMuted, fontWeight: '600' },

  infoGrid: { flexDirection: 'row', gap: 10 },
  infoItem: { flex: 1, alignItems: 'center', backgroundColor: Colors.offWhite, borderRadius: 16, padding: 14, gap: 6 },
  infoIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  infoValue: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary },

  balancePreview: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, backgroundColor: Colors.surfaceLight, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16 },
  balTxt: { fontSize: 13, color: Colors.textSecondary },
  balVal: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  termsCard: { backgroundColor: Colors.white, marginHorizontal: 16, borderRadius: 18, padding: 18, marginBottom: 16 },
  termsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  termsTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  termsText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 22, marginBottom: 2 },

  bottomAction: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 16, paddingHorizontal: 20, elevation: 16, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12 },
  redeemWrap: { borderRadius: 50, overflow: 'hidden', elevation: 6 },
  redeemBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 56, borderRadius: 50 },
  redeemTxt: { fontSize: 16, fontWeight: '700', color: Colors.white },
});

export default RewardDetailScreen;

