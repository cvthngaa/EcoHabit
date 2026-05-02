import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tokens } from '../../theme';
import { Tree } from './Tree';
import { Cloud } from './Cloud';
import { HeaderMenuIcon, HeaderGridIcon, HeaderNotificationIcon } from './HeaderIcons';

const { width } = Dimensions.get('window');
export const HEADER_HEIGHT = width * (177 / 401);
export const WAVE_LOWEST_TOP = (176 / 177) * HEADER_HEIGHT;

const BELL_CENTER_TOP = ((65 + 50) / 177) * HEADER_HEIGHT;

interface HeroHeaderProps {
  fullName: string;
  pointsBalance: number;
  pointsToday?: number;
  onPressNotification?: () => void;
  onPressRedeem?: () => void;
}

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
};

const HeroBackground = () => (
  <Svg
    width={width}
    height={HEADER_HEIGHT}
    viewBox="0 -50 401 177"
    style={{ position: 'absolute', top: 0, left: 0 }}
  >
    <Defs>
      <SvgLinearGradient id="headerGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor={Tokens.color.green[400]} />
        <Stop offset="0.5" stopColor={Tokens.color.green.primary} />
        <Stop offset="1" stopColor={Tokens.color.green[600]} />
      </SvgLinearGradient>
    </Defs>
    <Path
      d="M0 126C0 126 53.6009 100.096 90 101.5C121.904 102.731 136.135 123.986 168 126C223.517 129.509 245.515 71.0278 301 75C318.303 76.2387 327.484 87.3743 344.5 84C361.34 80.6607 364.043 56.8186 381 59.5C389.899 60.9072 401 63.5 401 63.5V-50H0V126Z"
      fill="url(#headerGrad)"
    />
  </Svg>
);

const HeroForeground = () => (
  <Svg
    width={width}
    height={HEADER_HEIGHT}
    viewBox="0 -50 401 177"
    style={{ position: 'absolute', top: 0, left: 0 }}
    pointerEvents="none"
  >
    {/* ── Layer 1 (far background) ── */}
    <Tree x={250} y={88} scale={0.45} type={6} />
    <Tree x={278} y={86} scale={0.4} type={8} />
    <Tree x={308} y={84} scale={0.45} type={6} />
    <Tree x={338} y={82} scale={0.4} type={8} />
    <Tree x={368} y={74} scale={0.45} type={6} />
    <Tree x={392} y={68} scale={0.4} type={8} />

    {/* Mist covering Layer 1 */}
    <Rect x="0" y="-50" width="100%" height="250" fill="#FFFFFF" opacity={0.45} />

    {/* ── Layer 2 (mid-ground) ── */}
    <Tree x={248} y={92} scale={0.7} type={9} />
    <Tree x={272} y={90} scale={0.75} type={1} />
    <Tree x={298} y={88} scale={0.7} type={10} />
    <Tree x={325} y={87} scale={0.75} type={7} />
    <Tree x={350} y={80} scale={0.7} type={9} />
    <Tree x={378} y={72} scale={0.75} type={1} />
    <Tree x={398} y={68} scale={0.6} type={7} />

    {/* Mist covering Layer 2 */}
    <Rect x="0" y="-50" width="100%" height="250" fill="#FFFFFF" opacity={0.25} />

    {/* ── Layer 3 (foreground) ── */}
    <Tree x={242} y={96} scale={1.2} type={15} />
    <Tree x={262} y={94} scale={1.3} type={4} />
    <Tree x={282} y={92} scale={1.1} type={1} />
    <Tree x={300} y={91} scale={1.2} type={11} />
    <Tree x={318} y={90} scale={1.05} type={9} />
    <Tree x={338} y={89} scale={1.35} type={4} />
    <Tree x={355} y={84} scale={1.1} type={7} />
    <Tree x={370} y={78} scale={0.9} type={6} />
    <Tree x={383} y={75} scale={1.05} type={8} />
    <Tree x={396} y={72} scale={1.3} type={1} />

    {/* ── Foreground overlap to hide tree trunks ── */}
    <Path
      d="M0 126C0 126 53.6009 100.096 90 101.5C121.904 102.731 136.135 123.986 168 126C223.517 129.509 245.515 71.0278 301 75C318.303 76.2387 327.484 87.3743 344.5 84C361.34 80.6607 364.043 56.8186 381 59.5C389.899 60.9072 401 63.5 401 63.5V200H0Z"
      fill={Tokens.color.base.canvas}
    />
  </Svg>
);

const HeroHeader: React.FC<HeroHeaderProps> = ({
  fullName,
  onPressNotification,
  onPressRedeem,
}) => {
  const insets = useSafeAreaInsets();
  const greeting = getGreeting();
  const firstName = fullName?.split(' ').pop() || fullName || 'Bạn';

  return (
    <View className="mb-2" style={{ height: HEADER_HEIGHT }}>
      <HeroBackground />

      {/* Animated Clouds */}
      <Cloud top={20} delay={0} duration={18000} scale={1.5} opacity={0.4} type={1} />
      <Cloud top={60} delay={6000} duration={25000} scale={1.0} opacity={0.25} type={3} />
      <Cloud top={10} delay={14000} duration={22000} scale={1.2} opacity={0.3} type={5} />
      <Cloud top={35} delay={10000} duration={20000} scale={0.8} opacity={0.2} type={6} />

      <HeroForeground />

      <View style={{ paddingTop: insets.top + Tokens.space[2] }} className="px-4">

        {/* ── Top row: Hamburger (left) + Grid (right) ── */}
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
          // activeOpacity={0.75}
          // className="h-10 w-10 items-center justify-center rounded-xl bg-white/20"
          >
            <HeaderMenuIcon />
          </TouchableOpacity>

          <TouchableOpacity
          // activeOpacity={0.75}
          // className="h-10 w-10 items-center justify-center rounded-xl bg-white/20"
          >
            <HeaderGridIcon />
          </TouchableOpacity>
        </View>

        {/* ── Greeting text ── */}
        <View>
          <Text className="mb-0.5 text-[15px] font-bold text-white">
            {greeting}, {firstName} 👋
          </Text>
          <Text className="text-[12px] font-medium text-white/80">
            Hôm nay bạn đã sống xanh chưa?
          </Text>
        </View>

      </View>

      {/* ── Notification bell: floating at right-side wave boundary ── */}
      <TouchableOpacity
        onPress={onPressNotification}
        activeOpacity={0.75}
        style={{
          position: 'absolute',
          top: BELL_CENTER_TOP + 25,
          right: 16,
          width: 35,
          height: 35,
          borderRadius: 12,
          backgroundColor: Tokens.color.green[200],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="notifications" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default HeroHeader;
