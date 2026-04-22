import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type FallingLeavesProps = {
  count?: number;
  speed?: 'slow' | 'normal';
  style?: StyleProp<ViewStyle>;
};

type LeafSpec = {
  id: number;
  delay: number;
  startX: number;
  startY: number;
  size: number;
  duration: number;
  swayA: number;
  swayB: number;
  opacity: number;
  color: string;
  startRotation: number;
  endRotation: number;
};

const leafPalette = [
  'rgba(236, 174, 109, 0.55)',
  'rgba(204, 145, 92, 0.48)',
  'rgba(151, 181, 103, 0.42)',
];

const LeafSprite: React.FC<LeafSpec & { sceneHeight: number }> = ({
  delay,
  startX,
  startY,
  size,
  duration,
  swayA,
  swayB,
  opacity,
  color,
  startRotation,
  endRotation,
  sceneHeight,
}) => {
  const translateY = useRef(new Animated.Value(startY)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fall = Animated.loop(
      Animated.timing(translateY, {
        toValue: sceneHeight + 56,
        duration,
        delay,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const sway = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: swayA,
          duration: duration * 0.34,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: swayB,
          duration: duration * 0.28,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: swayA * 0.45,
          duration: duration * 0.38,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const spin = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: duration * 0.75,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    fall.start();
    sway.start();
    spin.start();

    return () => {
      fall.stop();
      sway.stop();
      spin.stop();
    };
  }, [delay, duration, rotation, sceneHeight, swayA, swayB, translateX, translateY]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: [`${startRotation}deg`, `${endRotation}deg`],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.leaf,
        {
          left: startX,
          opacity,
          transform: [{ translateY }, { translateX }, { rotate }],
        },
      ]}
    >
      <Ionicons name="leaf" size={size} color={color} />
    </Animated.View>
  );
};

const FallingLeaves: React.FC<FallingLeavesProps> = ({
  count = 14,
  speed = 'slow',
  style,
}) => {
  const { width, height } = useWindowDimensions();
  const speedMultiplier = speed === 'slow' ? 1.35 : 1;

  const leaves = useMemo<LeafSpec[]>(
    () =>
      Array.from({ length: count }, (_, index) => ({
        id: index,
        delay: Math.random() * 9000,
        startX: Math.random() * width,
        startY: -(60 + Math.random() * 180),
        size: 14 + Math.random() * 18,
        duration: (15000 + Math.random() * 9000) * speedMultiplier,
        swayA: (12 + Math.random() * 18) * (Math.random() > 0.5 ? 1 : -1),
        swayB: (16 + Math.random() * 26) * (Math.random() > 0.5 ? -1 : 1),
        opacity: 0.3 + Math.random() * 0.24,
        color: leafPalette[Math.floor(Math.random() * leafPalette.length)],
        startRotation: -26 + Math.random() * 18,
        endRotation: 18 + Math.random() * 34,
      })),
    [count, speedMultiplier, width]
  );

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.overlay, style]}>
      {leaves.map((leaf) => (
        <LeafSprite key={leaf.id} {...leaf} sceneHeight={height} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    zIndex: 60,
    elevation: 60,
  },
  leaf: {
    position: 'absolute',
    top: -40,
    zIndex: 61,
    elevation: 61,
  },
});

export default FallingLeaves;
