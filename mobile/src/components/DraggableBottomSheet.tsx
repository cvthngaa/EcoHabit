import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleProp, View, ViewStyle } from 'react-native';

type DraggableBottomSheetProps = {
  collapsedHeight: number;
  expandedHeight: number;
  visible?: boolean;
  bottomInset?: number;
  peekHeight?: number;
  initialSnap?: 'expanded' | 'collapsed' | 'minimized';
  animateOnMount?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  enableBackdropPress?: boolean;
};

const SNAP_VELOCITY = 0.45;
const DRAG_THRESHOLD = 40;
const DEFAULT_PEEK_HEIGHT = 28;
const OVERSHOOT = 18;
const MINIMIZED_TOLERANCE = 6;

const DraggableBottomSheet: React.FC<DraggableBottomSheetProps> = ({
  collapsedHeight,
  expandedHeight,
  visible = true,
  bottomInset = 0,
  peekHeight = DEFAULT_PEEK_HEIGHT,
  initialSnap = 'collapsed',
  animateOnMount = false,
  enableBackdropPress = true,
  style,
  children,
}) => {
  const sheetHeight = Math.max(expandedHeight, collapsedHeight);
  const minimizedHeight = Math.min(Math.max(peekHeight, 0), collapsedHeight);
  const expandedOffset = 0;
  const collapsedOffset = Math.max(sheetHeight - collapsedHeight, 0);
  const minimizedOffset = Math.max(sheetHeight - minimizedHeight, 0);
  const getSnapOffset = (snap: 'expanded' | 'collapsed' | 'minimized') => {
    if (snap === 'expanded') return expandedOffset;
    if (snap === 'minimized') return minimizedOffset;
    return collapsedOffset;
  };
  const initialOffset = getSnapOffset(initialSnap);

  const mountOffset = animateOnMount ? collapsedOffset : initialOffset;
  const hasAnimatedOnMountRef = useRef(false);

  const translateY = useRef(new Animated.Value(mountOffset)).current;
  const lastOffsetRef = useRef(mountOffset);
  const dragStartOffsetRef = useRef(mountOffset);
  const [isMinimized, setIsMinimized] = useState(
    mountOffset >= minimizedOffset - MINIMIZED_TOLERANCE,
  );
  const isMinimizedRef = useRef(isMinimized);

  const snapPoints = useMemo(
    () => [expandedOffset, collapsedOffset, minimizedOffset].sort((a, b) => a - b),
    [collapsedOffset, minimizedOffset],
  );

  const animateTo = (toValue: number) => {
    lastOffsetRef.current = toValue;
    Animated.spring(translateY, {
      toValue,
      useNativeDriver: true,
      stiffness: 220,
      damping: 28,
      mass: 0.9,
      overshootClamping: true,
    }).start();
  };

  useEffect(() => {
    const listenerId = translateY.addListener(({ value }) => {
      lastOffsetRef.current = value;
      const nextIsMinimized = value >= minimizedOffset - MINIMIZED_TOLERANCE;
      if (isMinimizedRef.current !== nextIsMinimized) {
        isMinimizedRef.current = nextIsMinimized;
        setIsMinimized(nextIsMinimized);
      }
    });

    return () => {
      translateY.removeListener(listenerId);
    };
  }, [minimizedOffset, translateY]);

  useEffect(() => {
    if (!visible) {
      hasAnimatedOnMountRef.current = false;
      translateY.setValue(minimizedOffset);
      lastOffsetRef.current = minimizedOffset;
      isMinimizedRef.current = true;
      setIsMinimized(true);
      return;
    }

    translateY.setValue(initialOffset);
    lastOffsetRef.current = initialOffset;
    const nextIsMinimized = initialOffset >= minimizedOffset - MINIMIZED_TOLERANCE;
    isMinimizedRef.current = nextIsMinimized;
    setIsMinimized(nextIsMinimized);
  }, [initialOffset, minimizedOffset, translateY, visible]);

  useEffect(() => {
    if (!visible || !animateOnMount || hasAnimatedOnMountRef.current) {
      return;
    }

    hasAnimatedOnMountRef.current = true;
    translateY.setValue(collapsedOffset);
    lastOffsetRef.current = collapsedOffset;

    requestAnimationFrame(() => {
      animateTo(initialOffset);
    });
  }, [animateOnMount, collapsedOffset, initialOffset, translateY, visible]);

  const findNearestSnapPoint = (value: number) =>
    snapPoints.reduce(
      (closest, point) =>
        Math.abs(point - value) < Math.abs(closest - value) ? point : closest,
      snapPoints[0],
    );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
          Math.abs(gestureState.dy) > 6,
        onPanResponderGrant: () => {
          translateY.stopAnimation((value: number) => {
            lastOffsetRef.current = value;
            dragStartOffsetRef.current = value;
          });
        },
        onPanResponderMove: (_, gestureState) => {
          const rawValue = dragStartOffsetRef.current + gestureState.dy;

          if (rawValue < expandedOffset) {
            const resistedValue =
              expandedOffset -
              Math.min((expandedOffset - rawValue) * 0.2, OVERSHOOT);
            translateY.setValue(resistedValue);
            return;
          }

          if (rawValue > minimizedOffset) {
            const resistedValue =
              minimizedOffset +
              Math.min((rawValue - minimizedOffset) * 0.2, OVERSHOOT);
            translateY.setValue(resistedValue);
            return;
          }

          translateY.setValue(rawValue);
        },
        onPanResponderRelease: (_, gestureState) => {
          const currentOffset = Math.min(
            Math.max(dragStartOffsetRef.current + gestureState.dy, expandedOffset),
            minimizedOffset,
          );
          const projected = currentOffset + gestureState.dy * 0.15;
          const clampedValue = Math.min(
            Math.max(projected, expandedOffset),
            minimizedOffset,
          );

          if (gestureState.vy > SNAP_VELOCITY) {
            if (currentOffset < collapsedOffset) {
              animateTo(collapsedOffset);
              return;
            }

            animateTo(minimizedOffset);
            return;
          }

          if (gestureState.vy < -SNAP_VELOCITY) {
            if (currentOffset > collapsedOffset) {
              animateTo(collapsedOffset);
              return;
            }

            animateTo(expandedOffset);
            return;
          }

          if (gestureState.dy > DRAG_THRESHOLD && currentOffset >= collapsedOffset) {
            animateTo(minimizedOffset);
            return;
          }

          if (gestureState.dy < -DRAG_THRESHOLD && currentOffset <= collapsedOffset) {
            animateTo(expandedOffset);
            return;
          }

          animateTo(findNearestSnapPoint(clampedValue));
        },
        onPanResponderTerminate: () => {
          animateTo(findNearestSnapPoint(lastOffsetRef.current));
        },
      }),
    [collapsedOffset, expandedOffset, minimizedOffset, snapPoints, translateY],
  );

  const overlayOpacity = translateY.interpolate({
    inputRange: [expandedOffset, minimizedOffset || 1],
    outputRange: [0.38, 0],
    extrapolate: 'clamp',
  });

  if (!visible) {
    return null;
  }

  return (
    <View className="absolute inset-0" pointerEvents="box-none">
      <Animated.View
        className="absolute inset-0 bg-black"
        pointerEvents={isMinimized ? 'none' : 'auto'}
        style={{ opacity: overlayOpacity }}
      >
        <Pressable 
          className="absolute inset-0" 
          onPress={() => {
            if (enableBackdropPress) {
              animateTo(minimizedOffset);
            }
          }} 
        />
      </Animated.View>

      <Animated.View
        className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-t-[28px] bg-white"
        style={[
          {
            height: sheetHeight,
            paddingBottom: bottomInset,
            transform: [{ translateY }],
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.16,
            shadowRadius: 20,
          },
          style,
        ]}
      >
        <View
          {...panResponder.panHandlers}
          className="items-center pb-2.5 pt-3"
        >
          <View className="h-1 w-[42px] rounded-full bg-[#D8DEE5]" />
        </View>
        {children}
      </Animated.View>
    </View>
  );
};

export default DraggableBottomSheet;
