import React, { useState } from 'react';
import {
 View,
 Text,
 FlatList,
 TouchableOpacity,
 ActivityIndicator,
 RefreshControl,
 Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useGetLeaderboard, LeaderboardPeriod } from '../../services/leaderboard';
import { useSettings } from '../../context/SettingsContext';
import SharedHeaderBackground from '../../components/SharedHeaderBackground';

const getRankChange = (rank: number, userId: string) => {
 // Deterministic mock to simulate comparing with last week
 const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
 const changeValue = (hash % 5) - 2;
 if (changeValue > 0) return { text: `+${changeValue}`, type: 'up' };
 if (changeValue < 0) return { text: `${changeValue}`, type: 'down' };
 return { text: '+0', type: 'neutral' };
};

const getAvatarStyle = (rank: number) => {
 switch (rank) {
 case 1: return { emoji: '🐊', bg: '#628165' };
 case 2: return { emoji: '🐧', bg: '#C5DFD0' };
 case 3: return { emoji: '🐿️', bg: '#EB9338' };
 case 4: return { emoji: '🐹', bg: '#EB9338' };
 case 5: return { emoji: '🐷', bg: '#A6C88D' };
 case 6: return { emoji: '🐨', bg: '#867873' };
 case 7: return { emoji: '🐻', bg: '#FCC588' };
 case 8: return { emoji: '🐸', bg: '#B3D495' };
 default: return { emoji: '🐶', bg: '#D0D0D0' };
 }
};

const AvatarImage = ({ avatarUrl, rank, size = 40 }: { avatarUrl: string | null, rank: number, size?: number }) => {
 const [imgError, setImgError] = useState(false);
 const isValidUrl = avatarUrl && typeof avatarUrl === 'string' && avatarUrl.trim() !== '' && avatarUrl !== 'null' && avatarUrl !== 'undefined';
 
 if (isValidUrl && !imgError) {
 return (
 <Image
 source={{ uri: avatarUrl }}
 style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#E0E0E0' }}
 onError={() => setImgError(true)}
 />
 );
 }
 const fallback = getAvatarStyle(rank);
 return (
 <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: fallback.bg, alignItems: 'center', justifyContent: 'center' }}>
 <Text style={{ fontSize: size * 0.5 }}>
 {fallback.emoji}
 </Text>
 </View>
 );
};

export default function LeaderboardScreen() {
 const insets = useSafeAreaInsets();
 const navigation = useNavigation();
 const { appearance } = useSettings();
 const [period, setPeriod] = useState<LeaderboardPeriod>('all_time');
 const { data: leaderboard, isLoading, refetch, isRefetching } = useGetLeaderboard(period, 20);

 const top3 = leaderboard ? leaderboard.slice(0, 3) : [];
 const restList = leaderboard ? leaderboard.slice(3) : [];

 const rank1 = top3.find(u => u.rank === 1);
 const rank2 = top3.find(u => u.rank === 2);
 const rank3 = top3.find(u => u.rank === 3);

 const renderItem = ({ item }: { item: any }) => {
 const { rank, fullName, points, userId, avatarUrl } = item;
 const isMe = item.isMe;
 const change = getRankChange(rank, userId);

 return (
 <View className="flex-row items-center mb-3">
 {/* Rank Number (Outside the box) */}
 <View className="w-10 items-center justify-center mr-2">
 <Text className="text-lg font-bold text-gray-800">{rank.toString().padStart(2, '0')}</Text>
 </View>
 
 {/* The Pill container */}
 <View className={`flex-1 flex-row items-center bg-[#F4F6F8] rounded-[24px] py-2 px-3 ${isMe ? 'border border-[#75554B]' : ''}`}>
 <View className="mr-3 rounded-full bg-white">
 <AvatarImage avatarUrl={avatarUrl} rank={rank} size={40} />
 </View>
 
 <View className="flex-1">
 <Text className={`text-[15px] font-bold mb-0.5 text-gray-800`}>
 {fullName}
 </Text>
 <View className="flex-row items-center">
 <View className="w-4 h-4 bg-orange-400 rounded-full items-center justify-center mr-1">
 <Text className="text-white text-[10px] font-bold">C</Text>
 </View>
 <Text className="text-xs text-gray-500">{points.toLocaleString()} pts</Text>
 </View>
 </View>
 
 <View className="flex-row items-center ml-2">
 <Text className={`text-sm font-bold mr-1 ${change.type === 'up' ? 'text-green-500' : change.type === 'down' ? 'text-[#974B3A]' : 'text-gray-400'}`}>
 {change.text}
 </Text>
 {change.type !== 'neutral' && (
 <Ionicons 
 name={change.type === 'up' ? 'caret-up' : 'caret-down'} 
 size={12} 
 color={change.type === 'up' ? '#22c55e' : '#974B3A'} 
 />
 )}
 </View>
 </View>
 </View>
 );
 };

 return (
 <View className="flex-1 bg-transparent">
 <SharedHeaderBackground className="absolute top-0 left-0 right-0 h-[460px]" />

 <View className="px-5 pb-2" style={{ paddingTop: insets.top + 10 }}>
 <View className="flex-row items-center justify-between z-10">
 <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center bg-white/20 rounded-full">
 <Ionicons name="chevron-back" size={24} color="#3A3A3A" />
 </TouchableOpacity>
 <Text className="text-xl font-bold text-[#3A3A3A]">Bảng xếp hạng</Text>
 <View className="w-10" />
 </View>
 </View>

 <View className="flex-row items-end justify-center h-[260px] px-4 z-10 mt-8">
  {rank2 && (
  <View className="items-center mx-1 w-[80px]">
  <View className="mb-2 z-10 items-center ">
  <View className="p-0.5 bg-white rounded-full mb-1">
  <AvatarImage avatarUrl={rank2.avatarUrl} rank={rank2.rank} size={56} />
  </View>
  <Text className="text-white text-[10px] font-bold text-center px-1">{rank2.fullName}</Text>
  </View>
  <View className="w-full h-[110px] bg-[#974B3A] rounded-t-[20px] items-center pt-3 ">
  <Text className="text-white text-3xl font-bold">2</Text>
  </View>
 </View>
 )}

  {rank1 && (
  <View className="items-center mx-1 z-20 w-[90px]">
  <View className="mb-1 z-10 items-center ">
  <View className="p-1 bg-white rounded-full mb-1">
  <AvatarImage avatarUrl={rank1.avatarUrl} rank={rank1.rank} size={72} />
  </View>
  <Text className="text-white text-xs font-bold text-center px-1">{rank1.fullName}</Text>
  </View>
  <View className="bg-[#D9772B] px-3 py-1 rounded-md mb-2 z-20 border border-white/20">
  <Text className="text-white text-xs font-bold">Winner</Text>
  </View>
  <View className="w-full h-[140px] bg-[#637B60] rounded-t-[24px] items-center pt-4 ">
  <Text className="text-white text-4xl font-bold">1</Text>
  </View>
 </View>
 )}

  {rank3 && (
  <View className="items-center mx-1 w-[80px]">
  <View className="mb-2 z-10 items-center ">
  <View className="p-0.5 bg-white rounded-full mb-1">
  <AvatarImage avatarUrl={rank3.avatarUrl} rank={rank3.rank} size={56} />
  </View>
  <Text className="text-white text-[10px] font-bold text-center px-1">{rank3.fullName}</Text>
  </View>
  <View className="w-full h-[90px] bg-[#E07D14] rounded-t-[20px] items-center pt-3 ">
  <Text className="text-white text-3xl font-bold">3</Text>
  </View>
 </View>
 )}
 </View>

 <View className={`flex-1 rounded-t-[36px] pt-6 px-5 mt-[-10px] z-20 ${appearance === 'nature' ? 'bg-white/90' : 'bg-white'}`}>
 {isLoading && !isRefetching ? (
 <View className="flex-1 items-center justify-center">
 <ActivityIndicator size="large" color="#D9772B" />
 </View>
 ) : (
 <FlatList
 data={restList}
 keyExtractor={item => item.userId}
 renderItem={renderItem}
 showsVerticalScrollIndicator={false}
 contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
 refreshControl={
 <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#D9772B" />
 }
 />
 )}
 </View>
 </View>
 );
}
