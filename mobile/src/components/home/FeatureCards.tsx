import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Xoá SharedIcon vì đã dùng Image

const FEATURES = [
 { id: 'scan', title: 'Phân loại rác', route: 'Scan', image: require('../../../assets/icons/icons8-waste-separation-100.png') },
 { id: 'badges', title: 'Huy hiệu', route: 'Badges', image: require('../../../assets/icons/icons8-medal2-100.png') },
 { id: 'rewards', title: 'Đổi quà', route: 'Rewards', image: require('../../../assets/icons/icons8-gift-100.png') },
 { id: 'quiz', title: 'Quiz', route: 'QuizIntro', image: require('../../../assets/icons/icons8-question-mark-100.png') },
 { id: 'wallet', title: 'Ví điểm', route: 'Wallet', image: require('../../../assets/icons/icons8-wallet-100.png') },
 { id: 'leaderboard', title: 'Xếp hạng', route: 'Leaderboard', image: require('../../../assets/icons/icons8-leaderboard-100.png') },
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
 source={feature.image} 
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
