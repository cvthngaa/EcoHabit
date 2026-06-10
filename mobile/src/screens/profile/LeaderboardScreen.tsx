import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../theme/colors';
import { useGetLeaderboard, LeaderboardPeriod } from '../../services/leaderboard';

const LeaderboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [period, setPeriod] = useState<LeaderboardPeriod>('all_time');

  const { data: leaderboard, isLoading, refetch, isRefetching } = useGetLeaderboard(period);

  const renderItem = ({ item }: { item: any }) => {
    const { rank, fullName, avatarUrl, points, isMe } = item;

    const isTop3 = rank <= 3;
    let rankColor: string = Colors.textMuted;
    if (rank === 1) rankColor = '#FFD700'; // Gold
    else if (rank === 2) rankColor = '#C0C0C0'; // Silver
    else if (rank === 3) rankColor = '#CD7F32'; // Bronze

    return (
      <View style={[styles.row, isMe && styles.rowMe]}>
        <View style={styles.rankCol}>
          {isTop3 ? (
            <Ionicons name="trophy" size={24} color={rankColor} />
          ) : (
            <Text style={styles.rankText}>{rank}</Text>
          )}
        </View>

        <View style={styles.userCol}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>{fullName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <Text
            style={[styles.nameText, isMe && styles.nameTextMe]}
            numberOfLines={1}
          >
            {fullName}
          </Text>
        </View>

        <View style={styles.pointsCol}>
          <Text style={styles.pointsText}>{points.toLocaleString()}</Text>
          <Text style={styles.pointsLabel}> điểm</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Colors.primaryGradientStart, Colors.primaryLight]}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bảng xếp hạng</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tabBtn, period === 'all_time' && styles.tabBtnActive]}
            onPress={() => setPeriod('all_time')}
          >
            <Text
              style={[styles.tabTxt, period === 'all_time' && styles.tabTxtActive]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, period === 'monthly' && styles.tabBtnActive]}
            onPress={() => setPeriod('monthly')}
          >
            <Text
              style={[styles.tabTxt, period === 'monthly' && styles.tabTxtActive]}
            >
              Tháng này
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, period === 'weekly' && styles.tabBtnActive]}
            onPress={() => setPeriod('weekly')}
          >
            <Text
              style={[styles.tabTxt, period === 'weekly' && styles.tabTxtActive]}
            >
              Tuần này
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {isLoading && !isRefetching ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Chưa có dữ liệu.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F9F5' },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.white },

  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: { backgroundColor: Colors.white },
  tabTxt: { fontSize: 13, fontWeight: '600', color: Colors.white },
  tabTxtActive: { color: Colors.primaryDark },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 15, color: Colors.textMuted },
  listContent: { padding: 16 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  rowMe: {
    backgroundColor: '#E8F5E9',
    borderColor: Colors.primaryLight,
    borderWidth: 1,
  },
  rankCol: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: { fontSize: 18, fontWeight: '800', color: Colors.textSecondary },
  userCol: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitial: { fontSize: 16, fontWeight: '700', color: Colors.white },
  nameText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  nameTextMe: { color: Colors.primaryDark, fontWeight: '800' },
  pointsCol: { flexDirection: 'row', alignItems: 'baseline', marginLeft: 8 },
  pointsText: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  pointsLabel: { fontSize: 11, color: Colors.textMuted },
});

export default LeaderboardScreen;
