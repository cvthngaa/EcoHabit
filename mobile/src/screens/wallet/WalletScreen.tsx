import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../theme/colors';
import EmptyState from '../../components/EmptyState';
import SharedHeaderBackground from '../../components/SharedHeaderBackground';
import CustomDatePicker from '../../components/CustomDatePicker';
import { useGetProfile } from '../../services/auth';
import { useGetPointHistory } from '../../services/points';
import { PointTransaction } from '../../services/points/types';
import { useSettings } from '../../context/SettingsContext';

type WalletFilter = 'all' | 'earn' | 'spend';

type WalletTransactionView = {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
  date: string;
  rawDate: Date;
  icon: keyof typeof Ionicons.glyphMap;
};

const rankConfig = {
  bronze: { emoji: '🥉', label: 'Đồng', next: 'Bạc', nextPoints: 1000 },
  silver: { emoji: '🥈', label: 'Bạc', next: 'Vàng', nextPoints: 2500 },
  gold: { emoji: '🥇', label: 'Vàng', next: 'Kim cương', nextPoints: 5000 },
  diamond: { emoji: '💎', label: 'Kim cương', next: null, nextPoints: null },
};

const getRankKey = (points: number): keyof typeof rankConfig => {
  if (points >= 5000) return 'diamond';
  if (points >= 2500) return 'gold';
  if (points >= 1000) return 'silver';
  return 'bronze';
};

const getTransactionIcon = (sourceType?: string): keyof typeof Ionicons.glyphMap => {
  switch (sourceType) {
    case 'TRASH_CLASSIFICATION':
      return 'scan-outline';
    case 'QUIZ':
      return 'bulb-outline';
    case 'REDEMPTION':
      return 'gift-outline';
    case 'DROPOFF_TRANSACTION':
      return 'location-outline';
    case 'ADMIN':
      return 'star-outline';
    default:
      return 'leaf-outline';
  }
};

const getFallbackTitle = (sourceType?: string) => {
  switch (sourceType) {
    case 'TRASH_CLASSIFICATION':
      return 'Phân loại rác';
    case 'QUIZ':
      return 'Hoàn thành quiz';
    case 'REDEMPTION':
      return 'Đổi phần thưởng';
    case 'DROPOFF_TRANSACTION':
      return 'Giao rác tại điểm thu gom';
    case 'ADMIN':
      return 'Điểm thưởng hệ thống';
    default:
      return 'Hoạt động điểm xanh';
  }
};

const formatDateTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const mapPointTransaction = (tx: PointTransaction): WalletTransactionView => {
  const points = Number(tx.points ?? 0);
  const sourceType = typeof tx.sourceType === 'string' ? tx.sourceType : undefined;
  const explicitType = typeof tx.type === 'string' ? tx.type.toUpperCase() : '';
  const type = explicitType === 'SPEND' || points < 0 ? 'spend' : 'earn';
  const title = typeof tx.title === 'string' && tx.title.trim().length > 0
    ? tx.title
    : getFallbackTitle(sourceType);

  return {
    id: String(tx.id ?? `${sourceType ?? 'tx'}-${tx.createdAt ?? Math.random()}`),
    type,
    amount: Math.abs(points),
    description: title,
    date: formatDateTime(tx.createdAt),
    rawDate: new Date(tx.createdAt || Date.now()),
    icon: getTransactionIcon(sourceType),
  };
};

const WalletScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { appearance } = useSettings();
  const [activeFilter, setActiveFilter] = useState<WalletFilter>('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const countAnim = useRef(new Animated.Value(0)).current;

  const {
    data: profile,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useGetProfile();
  const {
    data: pointHistory = [],
    isLoading: isHistoryLoading,
    isRefetching,
    refetch: refetchPointHistory,
  } = useGetPointHistory();

  const transactions = useMemo(
    () => pointHistory.map(mapPointTransaction),
    [pointHistory],
  );

  const filteredTransactions = useMemo(() => {
    let result = transactions;
    if (activeFilter !== 'all') {
      result = result.filter((tx) => tx.type === activeFilter);
    }
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter((tx) => tx.rawDate >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((tx) => tx.rawDate <= end);
    }
    return result;
  }, [activeFilter, transactions, startDate, endDate]);

  const earnedTotal = useMemo(
    () => transactions
      .filter((tx) => tx.type === 'earn')
      .reduce((sum, tx) => sum + tx.amount, 0),
    [transactions],
  );

  const spentTotal = useMemo(
    () => transactions
      .filter((tx) => tx.type === 'spend')
      .reduce((sum, tx) => sum + tx.amount, 0),
    [transactions],
  );

  const balanceFromHistory = earnedTotal - spentTotal;
  const balance = typeof profile?.pointsBalance === 'number'
    ? profile.pointsBalance
    : balanceFromHistory;
  const rank = rankConfig[getRankKey(balance)];
  const progress = rank.nextPoints ? Math.min((balance / rank.nextPoints) * 100, 100) : 100;
  const loading = isProfileLoading || isHistoryLoading;

  useEffect(() => {
    Animated.timing(countAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [countAnim]);

  const onRefresh = () => {
    void Promise.all([refetchProfile(), refetchPointHistory()]);
  };

  const filters = [
    { key: 'all' as const, label: 'Tất cả', icon: 'list-outline' },
    { key: 'earn' as const, label: 'Nhận điểm', icon: 'trending-up-outline' },
    { key: 'spend' as const, label: 'Sử dụng', icon: 'trending-down-outline' },
  ];

  const renderTransaction = ({ item: tx, index }: { item: WalletTransactionView, index: number }) => {
    const isEarn = tx.type === 'earn';

    return (
      <Animated.View
        key={tx.id}
        className={`flex-row items-center px-4 py-3.5 ${index < filteredTransactions.length - 1 ? 'border-b border-[#F0F0F0]' : ''}`}
        style={{ opacity: countAnim }}
      >
        <View className={`w-11 h-11 rounded-xl items-center justify-center mr-3 ${isEarn ? 'bg-[#EAF6ED]' : 'bg-[#FCEAE9]'}`}>
          <Ionicons
            name={tx.icon}
            size={20}
            color={isEarn ? Colors.earn : Colors.spend}
          />
        </View>
        <View className="flex-1">
          <Text className="text-[14px] font-semibold text-gray-800">{tx.description}</Text>
          <Text className="text-[12px] text-gray-500 mt-0.5">{tx.date || 'Vừa xong'}</Text>
        </View>
        <Text className={`text-[15px] font-bold ${isEarn ? 'text-[#2D8A4E]' : 'text-[#D33F3F]'}`}>
          {isEarn ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')} đ
        </Text>
      </Animated.View>
    );
  };

  return (
    <View className={`flex-1 ${appearance === 'nature' ? 'bg-transparent' : 'bg-[#F9FAFB]'}`}>
      <SharedHeaderBackground className="absolute top-0 left-0 right-0 h-[500px]" />

      <View style={{ paddingTop: insets.top + 16 }} className="px-5 z-30">
        <Text className="text-[20px] font-bold text-[#3A3A3A] mb-10 text-center">Ví điểm xanh</Text>

        <View style={{ backgroundColor: Colors.primary }} className="rounded-[24px] p-5 shadow-xl shadow-green-900/40 relative overflow-hidden">
          {/* Card background decoration */}
          <View className="absolute -right-8 -top-10 w-40 h-40 rounded-full bg-white/10" />
          <View className="absolute -bottom-10 -left-8 w-32 h-32 rounded-full bg-white/10" />

          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-white/90 font-semibold text-[13px] mb-1">Số dư điểm xanh</Text>
              <Text className="text-white font-extrabold text-[36px] tracking-tight">{balance.toLocaleString('vi-VN')}</Text>
            </View>
            <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center border border-white/20">
              <Text className="text-[14px] mr-1.5">{rank.emoji}</Text>
              <Text className="text-white font-bold text-[12px]">{rank.label}</Text>
            </View>
          </View>

          <View className="flex-row justify-between pt-4 border-t border-white/20">
            <View className="items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mb-1.5">
                <Ionicons name="arrow-down-outline" size={18} color="white" />
              </View>
              <Text className="text-white text-[11px] font-medium">Nhận</Text>
              <Text className="text-white font-bold text-[12px] mt-0.5">+{earnedTotal.toLocaleString('vi-VN')}</Text>
            </View>

            <View className="items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mb-1.5">
                <Ionicons name="arrow-up-outline" size={18} color="white" />
              </View>
              <Text className="text-white text-[11px] font-medium">Dùng</Text>
              <Text className="text-white font-bold text-[12px] mt-0.5">-{spentTotal.toLocaleString('vi-VN')}</Text>
            </View>

            <View className="items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mb-1.5">
                <Ionicons name="swap-horizontal-outline" size={18} color="white" />
              </View>
              <Text className="text-white text-[11px] font-medium">Giao dịch</Text>
              <Text className="text-white font-bold text-[12px] mt-0.5">{transactions.length}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={`flex-1 ${appearance === 'nature' ? 'bg-white/90' : 'bg-white'} rounded-t-[36px] px-5 z-20`} style={{ marginTop: -80, paddingTop: 100 }}>
        <View className="flex-row gap-2 mb-4">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border ${isActive ? 'bg-[#3E7B4C] border-[#3E7B4C]' : 'bg-white border-gray-200'}`}
                onPress={() => setActiveFilter(filter.key)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={filter.icon as keyof typeof Ionicons.glyphMap}
                  size={16}
                  color={isActive ? Colors.white : Colors.textSecondary}
                />
                <Text className={`text-[13px] font-semibold ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="flex-row items-center gap-2 mb-4">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-between px-3 py-2.5 rounded-xl border border-gray-200 bg-[#F9FAFB]"
            onPress={() => setStartDatePickerVisible(true)}
          >
            <Text className={`text-[13px] ${startDate ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}>
              {startDate ? startDate.toLocaleDateString('vi-VN') : 'Từ ngày'}
            </Text>
            <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>

          <Text className="text-gray-400">-</Text>

          <TouchableOpacity
            className="flex-1 flex-row items-center justify-between px-3 py-2.5 rounded-xl border border-gray-200 bg-[#F9FAFB]"
            onPress={() => setEndDatePickerVisible(true)}
          >
            <Text className={`text-[13px] ${endDate ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}>
              {endDate ? endDate.toLocaleDateString('vi-VN') : 'Đến ngày'}
            </Text>
            <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>

          {(startDate || endDate) && (
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center rounded-xl bg-red-50"
              onPress={() => { setStartDate(null); setEndDate(null); }}
            >
              <Ionicons name="close" size={18} color="#D33F3F" />
            </TouchableOpacity>
          )}
        </View>

        <Text className="text-[16px] font-bold text-gray-800 mb-3">Lịch sử giao dịch</Text>

        {loading && !isRefetching ? (
          <View className="bg-white rounded-[20px] py-5 items-center justify-center gap-2">
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text className="text-[13px] font-semibold text-gray-500">Đang tải giao dịch...</Text>
          </View>
        ) : filteredTransactions.length > 0 ? (
          <FlatList
            data={filteredTransactions}
            keyExtractor={(item) => item.id}
            renderItem={renderTransaction}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} colors={[Colors.primary]} />
            }
          />
        ) : (
          <View className="mt-8">
            <EmptyState
              emoji="📭"
              title="Chưa có giao dịch"
              subtitle={`Chưa có giao dịch ${activeFilter === 'earn' ? 'nhận điểm' : activeFilter === 'spend' ? 'sử dụng điểm' : 'điểm xanh'} nào`}
            />
          </View>
        )}
      </View>

      <CustomDatePicker
        visible={isStartDatePickerVisible}
        onClose={() => setStartDatePickerVisible(false)}
        date={startDate}
        onConfirm={setStartDate}
        maximumDate={endDate || new Date()}
      />
      <CustomDatePicker
        visible={isEndDatePickerVisible}
        onClose={() => setEndDatePickerVisible(false)}
        date={endDate}
        onConfirm={setEndDate}
        maximumDate={new Date()}
      />
    </View>
  );
};

export default WalletScreen;
