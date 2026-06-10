import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Xoá SharedIcon vì đã dùng Image

const FEATURES = [
  { id: 'scan', title: 'Phân loại rác', route: 'Scan' },
  { id: 'badges', title: 'Huy hiệu', route: 'Badges' },
  { id: 'rewards', title: 'Đổi quà', route: 'Rewards' },
  { id: 'quiz', title: 'Quiz', route: 'QuizIntro' },
  { id: 'wallet', title: 'Ví điểm', route: 'Wallet' },
  { id: 'leaderboard', title: 'Xếp hạng', route: 'Leaderboard' },
];

export const FeatureCards: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <View className="mb-6">
      <Text className="mx-5 mb-4 text-[18px] font-extrabold text-text">
        Khám phá tính năng
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-5"
      >
        {FEATURES.map((feature) => {
          return (
            <TouchableOpacity
              key={feature.id}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(feature.route)}
              className="mr-5 items-center w-[76px]"
            >
              {/* Hình tròn trắng không viền */}
              <View 
                className="mb-2.5 h-[64px] w-[64px] items-center justify-center rounded-full bg-surface overflow-hidden"
              >
                <Image 
                  source={require('../../../assets/icons/icons8-waste-separation-100.png')} 
                  className="h-full w-full" 
                  resizeMode="cover" 
                />
              </View>
              {/* Chữ mô tả bên dưới */}
              <Text
                className="text-center text-[12px] font-bold text-text leading-[16px]"
                numberOfLines={2}
              >
                {feature.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default FeatureCards;
