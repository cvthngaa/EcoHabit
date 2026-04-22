import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import AuthButton from '../../components/auth/AuthButton';
import AuthFooterLink from '../../components/auth/AuthFooterLink';

const { width, height } = Dimensions.get('window');

interface Props {
  onGoLogin?: () => void;
  onGoRegister?: () => void;
}

const WelcomeScreen: React.FC<Props> = ({ onGoLogin, onGoRegister }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const btnFade = useRef(new Animated.Value(0)).current;
  const btnSlide = useRef(new Animated.Value(30)).current;

  // Leaf floating animations
  const leaf1Y = useRef(new Animated.Value(0)).current;
  const leaf2Y = useRef(new Animated.Value(0)).current;
  const leaf3Y = useRef(new Animated.Value(0)).current;
  const leaf1Rotate = useRef(new Animated.Value(0)).current;
  const leaf2Rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main content animation
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

    // Floating leaf animations
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
  }, []);

  const leaf1RotateStr = leaf1Rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '15deg'],
  });
  const leaf2RotateStr = leaf2Rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['10deg', '-20deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background gradient */}
      <LinearGradient
        colors={['#1a3c2a', '#1B5E20', '#2E7D32', '#1a3c2a']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          styles.leafDecor,
          styles.leaf1,
          { transform: [{ translateY: leaf1Y }, { rotate: leaf1RotateStr }] },
        ]}
      >
        <Ionicons name="leaf" size={80} color="rgba(76, 175, 80, 0.15)" />
      </Animated.View>

      <Animated.View
        style={[
          styles.leafDecor,
          styles.leaf2,
          { transform: [{ translateY: leaf2Y }, { rotate: leaf2RotateStr }] },
        ]}
      >
        <Ionicons name="leaf" size={120} color="rgba(76, 175, 80, 0.1)" />
      </Animated.View>

      <Animated.View
        style={[
          styles.leafDecor,
          styles.leaf3,
          { transform: [{ translateY: leaf3Y }] },
        ]}
      >
        <Ionicons name="leaf" size={60} color="rgba(76, 175, 80, 0.12)" />
      </Animated.View>

      {/* Additional decorative circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />

      {/* Content */}
      <View style={styles.content}>
        {/* Top section - logo + text */}
        <View style={styles.topSection}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.logoCircle}>
              <Ionicons name="leaf" size={32} color="#fff" />
            </View>
          </Animated.View>

          <Animated.Text
            style={[
              styles.mainTitle,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {'Sống xanh\nmỗi ngày\ncùng\nEcoHabit'}
          </Animated.Text>

          <Animated.Text
            style={[
              styles.subText,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            Hãy bắt đầu hành trình bảo vệ môi trường 🌱
          </Animated.Text>
        </View>

        {/* Bottom section - buttons */}
        <Animated.View
          style={[
            styles.bottomSection,
            {
              opacity: btnFade,
              transform: [{ translateY: btnSlide }],
            },
          ]}
        >
          <AuthButton
            label="Đăng nhập"
            onPress={() => onGoLogin?.()}
            variant="outline"
            style={styles.signInBtn}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Leaf decorations
  leafDecor: {
    position: 'absolute',
  },
  leaf1: {
    top: height * 0.08,
    right: -10,
  },
  leaf2: {
    top: height * 0.25,
    left: -30,
  },
  leaf3: {
    top: height * 0.55,
    right: 20,
  },

  // Decorative circles
  circle: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.08)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: -40,
    right: -60,
  },
  circle2: {
    width: 150,
    height: 150,
    top: height * 0.4,
    left: -50,
  },
  circle3: {
    width: 100,
    height: 100,
    bottom: height * 0.15,
    right: -30,
  },

  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    paddingTop: height * 0.12,
    paddingBottom: 50,
  },

  topSection: {
    flex: 1,
    justifyContent: 'center',
  },

  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 175, 80, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },

  mainTitle: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 52,
    letterSpacing: -1,
    marginBottom: 16,
  },

  subText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '500',
    lineHeight: 24,
  },

  bottomSection: {
    paddingBottom: 20,
  },

  signInBtn: {
    marginBottom: 4,
  },
});

export default WelcomeScreen;

