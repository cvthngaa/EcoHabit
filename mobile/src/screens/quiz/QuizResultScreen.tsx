import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useGetProfile } from '../../services/auth';

const QuizResultScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { data: profile } = useGetProfile();

  const score = route.params?.score || 0;
  const total = route.params?.total || 5;
  const pointsEarned = route.params?.pointsEarned || 0;
  const userName = profile?.fullName || 'Người chơi';

  const isPerfect = score === total;
  const isGood = score >= total / 2;

  const handleClose = () => {
    // Navigate back to the main app (e.g. Home)
    navigation.popToTop();
  };

  return (
    <View className="flex-1 bg-brand">
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View 
        className="flex-row justify-end px-6 pb-4" 
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity 
          onPress={handleClose}
          className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center"
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6">
        
        {/* Top Podium Section */}
        <View className="bg-[#155A03] rounded-[32px] p-8 items-center mb-6 shadow-sm">
          <Text className="text-white font-bold text-lg mb-1">Hoàn Thành</Text>
          <Text className="text-[#FFE95C] font-black text-2xl mb-8">{userName}</Text>

          {/* Winner Avatar Mockup */}
          <View className="items-center">
            {profile?.avatarUrl ? (
              <Image
                source={{ uri: profile.avatarUrl }}
                className="w-24 h-24 rounded-full border-4 border-white mb-[-12px] z-10 shadow-lg"
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-[#FFE95C] items-center justify-center shadow-lg border-4 border-white mb-[-12px] z-10">
                <Text className="text-5xl">{isPerfect ? '👑' : isGood ? '🌟' : '💪'}</Text>
              </View>
            )}
            
            <View className="bg-white rounded-full px-5 py-2 flex-row items-center gap-2 shadow-sm">
              <Ionicons name="trophy" size={16} color="#358C5B" />
              <Text className="font-bold text-gray-800">{pointsEarned} Điểm</Text>
            </View>
          </View>
        </View>

        {/* Bottom List Section */}
        <View className="bg-white rounded-[32px] p-6 flex-1 mb-8 shadow-sm">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="font-bold text-gray-800 text-lg">Chi tiết bài làm</Text>
            <Ionicons name="stats-chart" size={20} color="#358C5B" />
          </View>

          <View className="bg-green-50 rounded-2xl p-4 flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
                <Ionicons name="checkmark" size={20} color="#1F8505" />
              </View>
              <Text className="font-bold text-gray-700">Trả lời đúng</Text>
            </View>
            <Text className="font-black text-gray-900">{score} câu</Text>
          </View>

          <View className="bg-red-50 rounded-2xl p-4 flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center">
                <Ionicons name="close" size={20} color="#EF4444" />
              </View>
              <Text className="font-bold text-gray-700">Trả lời sai</Text>
            </View>
            <Text className="font-black text-gray-900">{total - score} câu</Text>
          </View>

          <View className="bg-yellow-50 rounded-2xl p-4 flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-[#FFE95C]/50 rounded-full items-center justify-center">
                <Ionicons name="star" size={20} color="#EAB308" />
              </View>
              <Text className="font-bold text-gray-700">Điểm thưởng</Text>
            </View>
            <Text className="font-black text-gray-900">+{pointsEarned}</Text>
          </View>
          
          <View className="mt-auto">
             <Text className="text-center text-gray-400 text-xs italic">
               Bảng xếp hạng sẽ được cập nhật trong phiên bản tới!
             </Text>
          </View>
        </View>

      </View>
    </View>
  );
};

export default QuizResultScreen;
