import React from 'react';
import { View, Text } from 'react-native';
import { Tokens } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY_COLOR = Tokens.color.green.primary;

export interface RecentActivitiesCardProps {
  recentActivities?: any[];
}

const MOCK_RECENT_ACTIVITIES = [
  {
    id: 'mock-1',
    sourceType: 'TRASH_CLASSIFICATION',
    title: 'Phân loại rác nhựa',
    type: 'EARN',
    points: 20,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-2',
    sourceType: 'QUIZ',
    title: 'Hoàn thành quiz tái chế',
    type: 'EARN',
    points: 50,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-3',
    sourceType: 'PERSONAL_CUP',
    title: 'Ghi nhận mang bình nước cá nhân',
    type: 'EARN',
    points: 15,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'mock-4',
    sourceType: 'PLASTIC_BAG_SAVED',
    title: 'Tiết kiệm túi nilon',
    type: 'EARN',
    points: 10,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

const timeAgo = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) return `${Math.max(1, diffMins)} phút trước`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  return `${Math.floor(diffHours / 24)} ngày trước`;
};

const getActivityCuteDetails = (activity: any) => {
  const { sourceType, title } = activity;
  const label = title || 'Hoạt động';

  switch (sourceType) {
    case 'TRASH_CLASSIFICATION':
      return { icon: 'scan-outline' as const, label: label === 'Hoạt động' ? 'Phân loại rác nhựa' : label, color: PRIMARY_COLOR };
    case 'QUIZ':
      return { icon: 'bulb-outline' as const, label: label === 'Hoạt động' ? 'Hoàn thành quiz tái chế' : label, color: '#A15C00' };
    case 'PERSONAL_CUP':
      return { icon: 'water-outline' as const, label: label === 'Hoạt động' ? 'Ghi nhận mang bình nước cá nhân' : label, color: '#1565C0' };
    case 'PLASTIC_BAG_SAVED':
      return { icon: 'leaf-outline' as const, label: label === 'Hoạt động' ? 'Tiết kiệm túi nilon' : label, color: '#358C5B' };
    case 'REDEMPTION':
      return { icon: 'gift-outline' as const, label: label === 'Hoạt động' ? 'Đổi quà nhận ưu đãi' : label, color: '#C62828' };
    case 'DROPOFF_TRANSACTION':
      return { icon: 'location-outline' as const, label: label === 'Hoạt động' ? 'Giao dịch tại điểm gom' : label, color: '#0B57D0' };
    case 'ADMIN':
      return { icon: 'star-outline' as const, label: label === 'Hoạt động' ? 'Điểm thưởng hệ thống' : label, color: '#FF9800' };
    default:
      return { icon: 'leaf-outline' as const, label, color: '#6E726E' };
  }
};

const cardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.04,
  shadowRadius: 16,
  elevation: 2,
};

const RecentActivitiesCard: React.FC<RecentActivitiesCardProps> = ({ recentActivities = [] }) => {
  const isMocked = recentActivities.length === 0;
  const displayActivities = isMocked ? MOCK_RECENT_ACTIVITIES : recentActivities;

  return (
    <View className="mb-6">
      <View className="mx-5 mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-[18px] font-extrabold text-text">
            Hoạt động gần đây
          </Text>
          <Text className="ml-1 text-[18px]">🌱</Text>
        </View>
        {isMocked && (
          <View className="rounded-full bg-status-successBg px-2.5 py-0.5 border border-primary/20">
            <Text className="text-[10px] font-bold text-primary">Dữ liệu mẫu</Text>
          </View>
        )}
      </View>
      <View
        className="mx-5 rounded-[32px] bg-surface px-6 py-7"
        style={{ ...cardShadow, borderRadius: 32 }}
      >
        {displayActivities.map((activity, index) => {
          const details = getActivityCuteDetails(activity);
          const isEarn = activity.type === 'EARN';
          const isLast = index === displayActivities.length - 1;
          const isFirstNode = index === 0;

          // Temporal fading effect (matches reference photo upcoming states)
          const opacityVal = index === 0 ? 1 : index === 1 ? 0.95 : index === 2 ? 0.85 : 0.7;

          // Point status colors
          const badgeBgColor = isEarn ? PRIMARY_COLOR : '#C62828';
          const pointsSign = isEarn ? '+' : '-';
          const pointsVal = activity.points ? Math.abs(activity.points) : 0;
          const pointsSuffix = isEarn ? '🌱' : '🎁';

          // Node shapes: first is solid circle with white icon, others are rings with colored icons
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

              {/* Node wrapper with shadow */}
              <View
                className="z-10 mr-3.5 h-10 w-10 items-center justify-center rounded-full"
                style={{
                  backgroundColor: nodeBg,
                  shadowColor: details.color,
                  shadowOffset: { width: 0, height: isFirstNode ? 3 : 1.5 },
                  shadowOpacity: isFirstNode ? 0.22 : 0.08,
                  shadowRadius: isFirstNode ? 5 : 3,
                  elevation: isFirstNode ? 2.5 : 1.5,
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

              {/* Middle contents */}
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

              {/* Right solid badge */}
              <View className="pt-0.5">
                <View
                  className="rounded-full px-3 py-1.5 items-center justify-center flex-row"
                  style={{
                    backgroundColor: badgeBgColor,
                    shadowColor: badgeBgColor,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.22,
                    shadowRadius: 6,
                    elevation: 3,
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
        })}
      </View>
    </View>
  );
};

export default RecentActivitiesCard;
