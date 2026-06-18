import React from 'react';
import { Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../../theme/colors';
import { RewardShopItem } from './types';

type RedeemRewardModalProps = {
 reward: RewardShopItem | null;
 userPoints: number;
 redeeming: boolean;
 bottomInset: number;
 onClose: () => void;
 onConfirm: (reward: RewardShopItem) => void;
};

const RedeemRewardModal: React.FC<RedeemRewardModalProps> = ({
 reward,
 userPoints,
 redeeming,
 bottomInset,
 onClose,
 onConfirm,
}) => (
 <Modal
 visible={!!reward}
 transparent
 animationType="slide"
 onRequestClose={onClose}
 >
 <TouchableOpacity
 className="flex-1 bg-black/40 justify-end"
 onPress={() => !redeeming && onClose()}
 activeOpacity={1}
 >
 <View className="bg-offWhite rounded-t-[32px] p-6 items-center" style={{ paddingBottom: bottomInset + 16 }}>
 <View className="w-11 h-1.5 rounded-full bg-border mb-4" />

 {reward ? (
 <>
 <View className="w-[104px] h-[104px] rounded-[30px] items-center justify-center overflow-hidden mb-4" style={{ backgroundColor: reward.bg }}>
 {reward.thumbnailUrl ? (
 <Image source={{ uri: reward.thumbnailUrl }} className="w-full h-full" resizeMode="cover" />
 ) : (
 <Ionicons name={reward.iconName as any} size={46} color={reward.color} />
 )}
 </View>

 <Text className="text-textPrimary text-center text-[21px] leading-7 font-black mb-1.5">{reward.name}</Text>
 <Text className="text-textSecondary text-center text-[13px] leading-5 mb-1.5">{reward.description}</Text>
 <Text className="text-[13px] font-black mb-3.5" style={{ color: reward.color }}>{reward.category}</Text>

 <View className="flex-row items-center gap-1.5 mb-3">
 <Ionicons name="star" size={18} color={Colors.warning} />
 <Text className="text-warning text-[22px] font-black">{reward.points} điểm xanh</Text>
 </View>

 <View className="rounded-full bg-surfaceLight px-3.5 py-2 flex-row items-center mb-5">
 <Text className="text-textSecondary text-xs font-bold">Số dư: </Text>
 <Text className="text-primary text-xs font-black">{userPoints}</Text>
 <Text className="text-textSecondary text-xs font-bold"> → </Text>
 <Text className={`text-xs font-black ${userPoints - reward.points >= 0 ? 'text-primary' : 'text-error'}`}>
 {userPoints - reward.points}
 </Text>
 </View>

 <TouchableOpacity
 className={`w-full rounded-full overflow-hidden mb-2.5 ${redeeming ? 'opacity-70' : ''}`}
 onPress={() => !redeeming && onConfirm(reward)}
 disabled={redeeming}
 activeOpacity={0.86}
 >
 <LinearGradient
 colors={[Colors.primary, Colors.primaryLight]}
 className="h-[54px] rounded-full items-center justify-center flex-row gap-2"
 >
 <Ionicons name="gift" size={18} color={Colors.white} />
 <Text className="text-white text-base font-black">
 {redeeming ? 'Đang xử lý...' : 'Xác nhận đổi quà'}
 </Text>
 </LinearGradient>
 </TouchableOpacity>

 <TouchableOpacity className="py-3" onPress={onClose} disabled={redeeming}>
 <Text className="text-textMuted text-[15px] font-extrabold">Hủy</Text>
 </TouchableOpacity>
 </>
 ) : null}
 </View>
 </TouchableOpacity>
 </Modal>
);

export default RedeemRewardModal;
