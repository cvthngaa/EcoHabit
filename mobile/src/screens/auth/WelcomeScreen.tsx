import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import AuthButton from '../../components/auth/AuthButton';
import AuthFooterLink from '../../components/auth/AuthFooterLink';
import { Colors, Semantic, Tokens } from '../../theme';

const { height } = Dimensions.get('window');

interface Props {
  onGoLogin?: () => void;
  onGoRegister?: () => void;
}

const WelcomeScreen: React.FC<Props> = ({ onGoLogin, onGoRegister }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const btnFade = useRef(new Animated.Value(0)).current;
  const btnSlide = useRef(new Animated.Value(30)).current;

  const leaf1Y = useRef(new Animated.Value(0)).current;
  const leaf2Y = useRef(new Animated.Value(0)).current;
  const leaf3Y = useRef(new Animated.Value(0)).current;
  const leaf1Rotate = useRef(new Animated.Value(0)).current;
  const leaf2Rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(btnFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(btnSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();

    const floatLeaf = (anim: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: -12, duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 12, duration, useNativeDriver: true }),
        ])
      ).start();

    const rotateLeaf = (anim: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
        ])
      ).start();

    floatLeaf(leaf1Y, 3000);
    floatLeaf(leaf2Y, 2500);
    floatLeaf(leaf3Y, 3500);
    rotateLeaf(leaf1Rotate, 4000);
    rotateLeaf(leaf2Rotate, 3500);
  }, [btnFade, btnSlide, fadeAnim, leaf1Rotate, leaf1Y, leaf2Rotate, leaf2Y, leaf3Y, slideAnim]);

  const leaf1RotateStr = leaf1Rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '15deg'],
  });
  const leaf2RotateStr = leaf2Rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['10deg', '-20deg'],
  });

  return (
    <View className="flex-1">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={[Tokens.color.green[800], Tokens.color.green[700], Semantic.color.action.primary, Tokens.color.green[800]]}
        locations={[0, 0.34, 0.68, 1]}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      />

      <Animated.View
        className="absolute right-[-10px]"
        style={{
          top: height * 0.08,
          transform: [{ translateY: leaf1Y }, { rotate: leaf1RotateStr }],
        }}
      >
        <Ionicons name="leaf" size={80} color="rgba(252,251,250,0.14)" />
      </Animated.View>

      <Animated.View
        className="absolute left-[-30px]"
        style={{
          top: height * 0.25,
          transform: [{ translateY: leaf2Y }, { rotate: leaf2RotateStr }],
        }}
      >
        <Ionicons name="leaf" size={120} color="rgba(252,251,250,0.1)" />
      </Animated.View>

      <Animated.View
        className="absolute right-5"
        style={{
          top: height * 0.55,
          transform: [{ translateY: leaf3Y }],
        }}
      >
        <Ionicons name="leaf" size={60} color="rgba(252,251,250,0.12)" />
      </Animated.View>

      <View className="absolute right-[-60px] top-[-40px] h-[200px] w-[200px] rounded-full border border-base-canvas/10" />
      <View
        className="absolute left-[-50px] h-[150px] w-[150px] rounded-full border border-base-canvas/10"
        style={{ top: height * 0.4 }}
      />
      <View
        className="absolute right-[-30px] h-[100px] w-[100px] rounded-full border border-base-canvas/10"
        style={{ bottom: height * 0.15 }}
      />

      <View
        className="flex-1 justify-between px-8 pb-12"
        style={{ paddingTop: height * 0.12 }}
      >
        <View className="flex-1 justify-center">
          <Animated.View
            className="mb-6"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View className="h-14 w-14 items-center justify-center rounded-lg border border-base-canvas/25 bg-base-canvas/15">
              <Ionicons name="leaf" size={32} color={Colors.textInverse} />
            </View>
          </Animated.View>

          <Animated.Text
            className="mb-4 font-bold text-[44px] leading-[52px] text-base-canvas"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {'Sống xanh\nmỗi ngày\ncùng\nEcoHabit'}
          </Animated.Text>

          <Animated.Text
            className="font-semibold text-[16px] leading-6 text-base-canvas/75"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            Hãy bắt đầu hành trình bảo vệ môi trường cùng những thói quen nhỏ.
          </Animated.Text>
        </View>

        <Animated.View
          className="pb-5"
          style={{
            opacity: btnFade,
            transform: [{ translateY: btnSlide }],
          }}
        >
          <AuthButton
            label="Đăng nhập"
            onPress={() => onGoLogin?.()}
            variant="outline"
            style={{ marginBottom: Tokens.space[1] }}
          />

          <AuthFooterLink
            message=""
            linkText="Tạo tài khoản mới"
            onPress={() => onGoRegister?.()}
            light
          />
        </Animated.View>
      </View>
    </View>
  );
};

export default WelcomeScreen;
