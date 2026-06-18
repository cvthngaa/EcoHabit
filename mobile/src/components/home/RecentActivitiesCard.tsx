import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tokens } from '../../theme';

const PRIMARY_COLOR = Tokens.color.green.primary;

export interface RecentActivitiesCardProps {
 recentActivities?: Array<{
 id?: string | number;
 sourceType?: string;
 title?: string;
 type?: string;
 points?: number;
 createdAt?: string;
 }>;
}

const timeAgo = (dateStr?: string) => {
 if (!dateStr) return 'Vừa xong';

 const date = new Date(dateStr);
 if (Number.isNaN(date.getTime())) return 'Vừa xong';

 const now = new Date();
 const diffMs = now.getTime() - date.getTime();
 const diffMins = Math.floor(diffMs / 60000);

 if (diffMins < 60) return `${Math.max(1, diffMins)} phút trước`;

 const diffHours = Math.floor(diffMins / 60);
 if (diffHours < 24) return `${diffHours} giờ trước`;

 return `${Math.floor(diffHours / 24)} ngày trước`;
};

const getActivityDetails = (activity: NonNullable<RecentActivitiesCardProps['recentActivities']>[number]) => {
 const { sourceType, title } = activity;
 const label = title || 'Hoạt động';

 switch (sourceType) {
 case 'TRASH_CLASSIFICATION':
 return { icon: 'scan-outline' as const, label: title || 'Phân loại rác', color: PRIMARY_COLOR };
 case 'QUIZ':
 return { icon: 'bulb-outline' as const, label: title || 'Hoàn thành quiz', color: '#A15C00' };
 case 'REDEMPTION':
 return { icon: 'gift-outline' as const, label: title || 'Đổi phần thưởng', color: '#C62828' };
 case 'DROPOFF_TRANSACTION':
 return { icon: 'location-outline' as const, label: title || 'Giao rác tại điểm thu gom', color: '#0B57D0' };
 case 'ADMIN':
 return { icon: 'star-outline' as const, label: title || 'Điểm thưởng hệ thống', color: '#FF9800' };
 default:
 return { icon: 'leaf-outline' as const, label, color: '#6E726E' };
 }
};

const cardShadow = {
 };

const RecentActivitiesCard: React.FC<RecentActivitiesCardProps> = ({ recentActivities = [] }) => {
 return (
 <View className="mb-6">
 <View className="mx-5 mb-4 flex-row items-center justify-between">
 <View className="flex-row items-center">
 <Text className="text-[18px] font-extrabold text-text">
 Hoạt động gần đây
 </Text>
 <Text className="ml-1 text-[18px]">🌱</Text>
 </View>
 </View>

 <View
 className="mx-5 rounded-[32px] bg-surface px-6 py-7"
 style={{ ...cardShadow, borderRadius: 32 }}
 >
 {recentActivities.length === 0 ? (
 <View className="items-center justify-center py-3">
 <Ionicons name="leaf-outline" size={28} color="#B0B0B0" />
 <Text className="mt-2 text-center text-[13px] font-semibold text-text-muted">
 Chưa có hoạt động điểm xanh
 </Text>
 </View>
 ) : (
 recentActivities.map((activity, index) => {
 const details = getActivityDetails(activity);
 const normalizedType = activity.type?.toUpperCase();
 const points = Number(activity.points ?? 0);
 const isEarn = normalizedType === 'EARN' || points >= 0;
 const isLast = index === recentActivities.length - 1;
 const isFirstNode = index === 0;
 const opacityVal = index === 0 ? 1 : index === 1 ? 0.95 : index === 2 ? 0.85 : 0.7;
 const badgeBgColor = isEarn ? PRIMARY_COLOR : '#C62828';
 const pointsSign = isEarn ? '+' : '-';
 const pointsVal = Math.abs(points);
 const pointsSuffix = isEarn ? '🌱' : '🎁';
 const nodeBg = isFirstNode ? details.color : '#FFFFFF';
 const nodeBorders = isFirstNode ? {} : { borderColor: details.color, borderWidth: 3 };

 return (
 <View
 key={activity.id || index}
 className={`relative flex-row items-start ${isLast ? 'pb-0' : 'pb-6'}`}
 style={{ opacity: opacityVal }}
 >
 {!isLast && (
 <View
 className="absolute left-[19px] top-10 bottom-0 w-0 border-l-2 border-dashed"
 style={{ borderLeftColor: `${PRIMARY_COLOR}30` }}
 />
 )}

 <View
 className="z-10 mr-3.5 h-10 w-10 items-center justify-center rounded-full"
 style={{
 backgroundColor: nodeBg,
 borderRadius: 20,
 ...nodeBorders,
 }}
 >
 <Ionicons
 name={details.icon}
 size={isFirstNode ? 18 : 16}
 color={isFirstNode ? '#FFFFFF' : details.color}
 />
 </View>

 <View className="flex-1 pt-0.5 pr-2">
 <Text className="text-[14px] font-bold text-text mb-0.5 leading-snug">
 {details.label}
 </Text>
 <Text
 className="text-[11px] font-semibold"
 style={{ color: isFirstNode ? `${PRIMARY_COLOR}B0` : '#888888' }}
 >
 {timeAgo(activity.createdAt)}
 </Text>
 </View>

 <View className="pt-0.5">
 <View
 className="rounded-full px-3 py-1.5 items-center justify-center flex-row"
 style={{
 backgroundColor: badgeBgColor,
 borderRadius: 999,
 }}
 >
 <Text className="text-[11px] font-extrabold text-white">
 {pointsSign}{pointsVal} {pointsSuffix}
 </Text>
 </View>
 </View>
 </View>
 );
 })
 )}
 </View>
 </View>
 );
};

export default RecentActivitiesCard;
