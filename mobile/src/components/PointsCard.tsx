import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Tokens } from '../theme';

const PRIMARY_COLOR = Tokens.color.green.primary;

interface PointsCardProps {
  pointsBalance: number;
  onPressRedeem: () => void;
}

const PointsCard: React.FC<PointsCardProps> = ({ pointsBalance, onPressRedeem }) => {
  return (
    <LinearGradient
      colors={['#28A710', PRIMARY_COLOR, Tokens.color.green[600]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        marginHorizontal: Tokens.space[5],
        borderRadius: 20,
        padding: Tokens.space[5],
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
        marginBottom: Tokens.space[6],
        overflow: 'hidden',
      }}
    >
      <View className="absolute right-[-30px] top-[-50px] h-[150px] w-[150px] rounded-full bg-white/10" />
      <View className="mb-5 flex-row items-start justify-between">
        <View>
          <Text className="mb-1 text-[26px] font-extrabold text-white">
            ⭐ {(pointsBalance || 0).toLocaleString()} điểm
          </Text>
          <Text className="text-[14px] font-semibold text-white/90">
            +0 hôm nay
          </Text>
        </View>
        <TouchableOpacity
          className="rounded-lg bg-white/25 px-[14px] py-2"
          onPress={onPressRedeem}
        >
          <Text className="text-[13px] font-bold text-white">Đổi quà 🎁</Text>
        </TouchableOpacity>
      </View>
      <View className="mt-2">
        <Text className="mb-2 text-[13px] font-semibold text-white/90">
          Tháng này: 1/30 ngày
        </Text>
        <View className="h-2 overflow-hidden rounded-full bg-white/30">
          <View className="h-full w-[10%] rounded-full bg-white" />
        </View>
      </View>
    </LinearGradient>
  );
};

export default PointsCard;
