import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, G, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tokens } from '../../theme';
import { RoundTree } from './RoundTree';

const { width } = Dimensions.get('window');
const WAVE_HEIGHT = 80;

interface HeroHeaderProps {
  fullName: string;
  avatarUrl?: string | null;
  pointsBalance: number;
  pointsToday?: number;
  onPressNotification?: () => void;
  onPressRedeem?: () => void;
  onPressAvatar?: () => void;
}

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
};



const HeroWave = () => (
  <Svg
    width={width}
    height={WAVE_HEIGHT}
    viewBox={`0 0 ${width} ${WAVE_HEIGHT}`}
    style={{ position: 'absolute', bottom: 0, left: 0, overflow: 'visible' }}
  >
    <Path
      d={`
        M 0 ${WAVE_HEIGHT * 0.85}
        C 
          ${width * 0.10} ${WAVE_HEIGHT * 0.85},
          ${width * 0.15} ${WAVE_HEIGHT * 0.25},
          ${width * 0.35} ${WAVE_HEIGHT * 0.85}
        C 
          ${width * 0.50} ${WAVE_HEIGHT * 1.30},
          ${width * 0.6} ${WAVE_HEIGHT * 0.40},
          ${width * 0.70} ${WAVE_HEIGHT * 0.40}
        C 
          ${width * 0.74} ${WAVE_HEIGHT * 0.40},
          ${width * 0.76} ${WAVE_HEIGHT * 0.45},
          ${width * 0.80} ${WAVE_HEIGHT * 0.45}
        C 
          ${width * 0.90} ${WAVE_HEIGHT * 0.45},
          ${width * 0.95} ${WAVE_HEIGHT * 0.20},
          ${width} ${WAVE_HEIGHT * 0.25}
        L ${width} ${WAVE_HEIGHT}
        L 0 ${WAVE_HEIGHT}
        Z
      `}
      fill={Tokens.color.base.canvas}
    />
    <RoundTree x={width * 0.86} y={WAVE_HEIGHT * 0.44} scale={0.6} />
    <RoundTree x={width * 0.92} y={WAVE_HEIGHT * 0.35} scale={1.1} />
    <RoundTree x={width * 0.98} y={WAVE_HEIGHT * 0.24} scale={0.75} />
  </Svg>
);
const HeroHeader: React.FC<HeroHeaderProps> = ({
  fullName,
  avatarUrl,
  onPressNotification,
  onPressRedeem,
  onPressAvatar,
}) => {
  const insets = useSafeAreaInsets();
  const greeting = getGreeting();
  const firstName = fullName?.split(' ').pop() || fullName || 'Bạn';

  return (
    <View className="mb-2">
      {/* overflow:hidden clamp wave vào đúng vùng gradient */}
      <View style={{ overflow: 'hidden' }}>
        <LinearGradient
          colors={[
            Tokens.color.green[400],
            Tokens.color.green.primary,
            Tokens.color.green[600],
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + Tokens.space[3], paddingBottom: WAVE_HEIGHT }}
          className="px-5"
        >
          {/* ── Top row: Avatar + Greeting + Bell ─────────────── */}
          <View className="mb-5 mt-2 flex-row items-center">
            {/* Avatar */}
            <TouchableOpacity onPress={onPressAvatar} activeOpacity={0.85}>
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="h-11 w-11 rounded-full border-2 border-white/60"
                />
              ) : (
                <View className="h-11 w-11 items-center justify-center rounded-full border-2 border-white/50 bg-white/25">
                  <Text className="text-[18px] font-extrabold text-white">
                    {fullName?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Greeting text */}
            <View className="mx-3 flex-1">
              <Text className="mb-0.5 text-[15px] font-bold text-white">
                {greeting}, {firstName} 👋
              </Text>
              <Text className="text-[12px] font-medium text-white/80">
                Hôm nay bạn đã sống xanh chưa?
              </Text>
            </View>

            {/* Notification bell */}
            <TouchableOpacity
              onPress={onPressNotification}
              activeOpacity={0.8}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/[0.18]"
            >
              <Ionicons name="notifications-outline" size={22} color="#fff" />
              {/* Unread dot */}
              <View
                className="absolute right-2 top-2 h-2 w-2 rounded-full border border-white bg-[#FF3B30]"
                style={{ borderColor: Tokens.color.green.primary }}
              />
            </TouchableOpacity>
          </View>


        </LinearGradient>

        <HeroWave />
      </View>
    </View>
  );
};

export default HeroHeader;

