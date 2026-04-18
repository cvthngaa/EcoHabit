import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../theme/colors';

const { width } = Dimensions.get('window');

interface Props {
  progress: number; // 0–100
}

const ScanningAnimation: React.FC<Props> = ({ progress }) => {
  const pulseAnim = useRef(new Animated.Value(0.8)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse ring animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.8,  duration: 1000, useNativeDriver: true }),
      ]),
    );

    // Scan line sweep
    const scanLine = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ]),
    );

    // Staggered dots
    const dots = Animated.loop(
      Animated.stagger(200, [
        Animated.sequence([
          Animated.timing(dotAnim1, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dotAnim1, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dotAnim2, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dotAnim2, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dotAnim3, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dotAnim3, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]),
      ]),
    );

    pulse.start();
    scanLine.start();
    dots.start();

    return () => {
      pulse.stop();
      scanLine.stop();
      dots.stop();
    };
  }, []);

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 60],
  });

  return (
    <View style={styles.container}>
      {/* Background glow */}
      <View style={styles.glowContainer}>
        <Animated.View style={[styles.glowRing, styles.glowRingOuter, { transform: [{ scale: pulseAnim }] }]} />
        <Animated.View style={[styles.glowRing, styles.glowRingMiddle, {
          transform: [{ scale: Animated.multiply(pulseAnim, new Animated.Value(0.85)) }],
        }]} />
      </View>

      {/* Scanner icon area */}
      <View style={styles.scannerBox}>
        {/* Corner brackets */}
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />

        {/* Scan line */}
        <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineTranslateY }] }]}>
          <LinearGradient
            colors={['transparent', Colors.primaryLight + '80', Colors.primaryLight, Colors.primaryLight + '80', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.scanLineGrad}
          />
        </Animated.View>

        {/* Center icon */}
        <View style={styles.centerIcon}>
          <Text style={styles.centerEmoji}>🔍</Text>
        </View>
      </View>

      {/* Animated dots */}
      <View style={styles.dotsRow}>
        {[dotAnim1, dotAnim2, dotAnim3].map((anim, i) => (
          <Animated.View key={i} style={[styles.dot, { opacity: anim }]} />
        ))}
      </View>

      {/* Text */}
      <Text style={styles.title}>AI đang phân tích...</Text>
      <Text style={styles.subtitle}>Đang nhận diện loại rác trong ảnh</Text>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[Colors.primaryGradientStart, Colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` as any }]}
          />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },

  // Glow rings
  glowContainer: {
    position: 'absolute',
    top: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight + '30',
  },
  glowRingOuter: {
    width: 200,
    height: 200,
    backgroundColor: Colors.primaryLight + '08',
  },
  glowRingMiddle: {
    width: 150,
    height: 150,
    backgroundColor: Colors.primaryLight + '12',
  },

  // Scanner box
  scannerBox: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: Colors.primaryLight,
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0,  borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0,  borderBottomWidth: 0, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0,  borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0,  borderTopWidth: 0, borderBottomRightRadius: 8 },

  // Scan line
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 3,
  },
  scanLineGrad: {
    flex: 1,
    borderRadius: 2,
  },

  // Center
  centerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerEmoji: {
    fontSize: 28,
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryLight,
  },

  // Text
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 28,
  },

  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 260,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    width: 40,
    textAlign: 'right',
  },
});

export default ScanningAnimation;
