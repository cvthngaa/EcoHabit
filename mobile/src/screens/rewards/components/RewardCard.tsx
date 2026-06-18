import React from 'react';
import { ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../../theme/colors';
import { RewardShopItem } from './types';

type RewardCardProps = {
 reward: RewardShopItem;
 canRedeem: boolean;
 onPress: () => void;
 onRedeem: () => void;
};

const RewardCard: React.FC<RewardCardProps> = ({ reward, canRedeem, onPress, onRedeem }) => {
 const outOfStock = reward.stock === 0;

 return (
 <TouchableOpacity
 className="w-[164px] mr-4 rounded-[24px] overflow-hidden bg-surface"
 onPress={onPress}
 activeOpacity={0.88}
 style={{
 height: 220,
 }}
 >
 <ImageBackground
 source={reward.thumbnailUrl ? { uri: reward.thumbnailUrl } : undefined}
 className="w-full h-full flex-1 justify-end"
 style={{ backgroundColor: reward.bg || Colors.primaryLight }}
 resizeMode="cover"
 >
 {!reward.thumbnailUrl && (
 <View className="absolute inset-0 flex items-center justify-center">
 <Ionicons name={reward.iconName as any} size={64} color={reward.color} />
 </View>
 )}

 {/* Gradient Overlay for Text Readability */}
 <LinearGradient
 colors={['transparent', 'rgba(0,0,0,0.85)']}
 className="absolute bottom-0 left-0 right-0 h-[120px]"
 />

 {/* Tag (e.g. TOP 1) */}
 {reward.tag ? (
 <View className="absolute top-3 left-3 rounded-full bg-warning px-2.5 py-1 z-10 ">
 <Text className="text-white text-[10px] font-extrabold tracking-wider">{reward.tag}</Text>
 </View>
 ) : null}

 {/* Content Overlay */}
 <View className="p-4 z-10">
 <Text className="text-[11px] text-white/80 font-semibold mb-0.5" numberOfLines={1}>
 {reward.category}
 </Text>
 <Text className="text-[16px] font-extrabold text-white mb-2 leading-tight" numberOfLines={2}>
 {reward.name}
 </Text>

 <View className="flex-row items-center justify-between">
 {/* Price / Points */}
 <View className="flex-row items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-1 backdrop-blur-md">
 <Ionicons name="star" size={12} color={Colors.warning} />
 <Text className="text-white text-[13px] font-extrabold">{reward.points}</Text>
 </View>

 {/* Add Button */}
 <TouchableOpacity
 className="w-9 h-9 rounded-full flex items-center justify-center "
 style={{ backgroundColor: outOfStock ? Colors.textMuted : Colors.primary }}
 onPress={onRedeem}
 disabled={outOfStock}
 activeOpacity={0.8}
 >
 {outOfStock ? (
 <Text className="text-white text-[10px] font-bold">Hết</Text>
 ) : (
 <Ionicons name="add" size={24} color="white" />
 )}
 </TouchableOpacity>
 </View>
 </View>
 </ImageBackground>
 </TouchableOpacity>
 );
};

export default RewardCard;
