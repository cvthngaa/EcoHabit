import React from 'react';
import { Image, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../../theme/colors';
import { RewardHistoryItem } from './types';

type RewardHistoryCardProps = {
 item: RewardHistoryItem;
};

const RewardHistoryCard: React.FC<RewardHistoryCardProps> = ({ item }) => (
 <View className="bg-white rounded-2xl p-3.5 mb-3 flex-row elevation-sm">
 <View className="w-[58px] h-[58px] rounded-2xl items-center justify-center mr-3 overflow-hidden" style={{ backgroundColor: item.bg }}>
 {item.thumbnailUrl ? (
 <Image source={{ uri: item.thumbnailUrl }} className="w-full h-full" resizeMode="cover" />
 ) : (
 <Ionicons name={item.iconName as any} size={24} color={item.color} />
 )}
 </View>

 <View className="flex-1">
 <View className="flex-row items-start justify-between gap-2">
 <Text className="flex-1 text-textPrimary text-[15px] leading-[20px] font-bold" numberOfLines={2}>{item.name}</Text>
 <View className="rounded-full bg-successLight px-2 py-1">
 <Text className="text-primary text-[10px] font-bold">{item.status}</Text>
 </View>
 </View>

 <Text className="text-primary text-xs font-semibold mt-1">{item.category}</Text>
 <Text className="text-textMuted text-xs mt-1.5">Đã đổi lúc {item.time} - {item.date}</Text>

 <View className="self-start flex-row items-center gap-1 rounded-full bg-warningLight px-2.5 py-1 mt-2.5">
 <Ionicons name="star" size={12} color={Colors.warning} />
 <Text className="text-warning text-xs font-bold">{item.pointsUsed} điểm</Text>
 </View>
 </View>
 </View>
);

export default RewardHistoryCard;
