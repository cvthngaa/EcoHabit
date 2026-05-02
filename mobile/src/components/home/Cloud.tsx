import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface CloudProps {
  top: number;
  delay: number;
  duration: number;
  scale?: number;
  opacity?: number;
  type?: number;
}

export const Cloud: React.FC<CloudProps> = ({ top, delay, duration, scale = 1, opacity = 0.5, type = 1 }) => {
  const translateX = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: width + 100,
          duration: duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -100,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    const timeout = setTimeout(() => {
      animation.start();
    }, delay);

    return () => {
      clearTimeout(timeout);
      animation.stop();
    };
  }, [translateX, duration, delay]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top,
        opacity,
        transform: [{ translateX }, { scale }],
      }}
      pointerEvents="none"
    >
      {type === 1 && <CloudFluffy />}
      {type === 2 && <CloudLarge />}
      {type === 3 && <CloudWide />}
      {type === 4 && <CloudPill />}
      {type === 5 && <CloudPillSmall />}
      {type === 6 && <CloudDot />}
    </Animated.View>
  );
};

/* ── Type 1: Fluffy cloud ──────────────────────────── */
const CloudFluffy = () => (
  <Svg width="80" height="52" viewBox="0 292 268 180" fill="none">
    <Path fillRule="evenodd" clipRule="evenodd" d="M407.676 13.2559C430.67 13.2559 450.707 25.916 461.197 44.646C468.176 41.8837 475.784 40.3658 483.746 40.3658C513.415 40.3658 538.161 61.4421 543.828 89.4391C553.564 98.8885 559.615 112.115 559.615 126.755C559.615 155.471 536.336 178.75 507.62 178.75C498.357 178.75 489.66 176.328 482.127 172.082C471.235 182.006 456.752 188.056 440.855 188.056C421.283 188.056 403.852 178.883 392.629 164.602C382.006 173.437 368.351 178.75 353.455 178.75C319.599 178.75 292.153 151.304 292.153 117.448C292.153 85.0428 317.297 58.5103 349.14 56.296C356.911 31.3587 380.179 13.2559 407.676 13.2559Z" fill="white" />
  </Svg>
);

/* ── Type 2: Large irregular cloud ─────────────────── */
const CloudLarge = () => (
  <Svg width="100" height="65" viewBox="0 0 360 232" fill="none">
    <Path fillRule="evenodd" clipRule="evenodd" d="M311.847 93.3264C314.835 81.3588 314.913 68.4868 311.494 55.7278C300.75 15.6311 259.536 -8.16413 219.439 2.57976C196.697 8.67351 179.199 24.5695 170.273 44.5042C154.773 35.0441 135.577 31.7035 116.653 36.7743C91.5918 43.4893 73.493 63.2173 67.6782 86.7403C62.154 86.832 56.5518 87.5958 50.9732 89.0906C14.2974 98.9178 -7.46755 136.616 2.35968 173.292C12.1869 209.967 49.885 231.732 86.5607 221.905C98.7337 218.643 109.264 212.311 117.542 203.965C134.343 220.842 159.458 228.511 184.111 221.905C197.928 218.203 209.628 210.545 218.321 200.477C235.421 225.544 267.074 238.327 298.045 230.028C337.239 219.526 360.498 179.24 349.996 140.046C344.331 118.903 329.999 102.397 311.847 93.3264Z" fill="white" />
  </Svg>
);

/* ── Type 3: Wide cloud ────────────────────────────── */
const CloudWide = () => (
  <Svg width="120" height="60" viewBox="966 41 430 211" fill="none">
    <Path fillRule="evenodd" clipRule="evenodd" d="M1160.05 41.1489C1192.19 41.1489 1220.65 56.9207 1238.1 81.1474C1240.55 80.9371 1243.02 80.8298 1245.51 80.8298C1276.32 80.8298 1303.3 97.1859 1318.25 121.687C1322.27 120.914 1326.42 120.509 1330.67 120.509C1366.75 120.509 1395.99 149.754 1395.99 185.829C1395.99 221.904 1366.75 251.148 1330.67 251.148V251.149H1048.64V251.149C1003.12 251.149 966.223 214.252 966.223 168.737C966.223 123.221 1003.12 86.3239 1048.64 86.3239C1058.16 86.3239 1067.3 87.9384 1075.81 90.9085C1092.18 61.2428 1123.77 41.1489 1160.05 41.1489Z" fill="white" />
  </Svg>
);

/* ── Type 4: Pill-shaped cloud group ───────────────── */
const CloudPill = () => (
  <Svg width="90" height="32" viewBox="147 411 542 107" fill="none">
    <Path d="M147.493 428.891C147.493 419.093 155.437 411.149 165.236 411.149H520.589C530.388 411.149 538.332 419.093 538.332 428.891C538.332 438.69 546.275 446.634 556.074 446.634H600.432C610.105 446.634 617.947 454.476 617.947 464.149C617.947 473.822 625.789 481.664 635.462 481.664H670.608C680.407 481.664 688.35 489.608 688.35 499.406C688.35 509.205 680.407 517.149 670.608 517.149H315.255C305.456 517.149 297.512 509.205 297.512 499.406C297.512 489.608 289.569 481.664 279.77 481.664H244.624C234.95 481.664 227.109 473.822 227.109 464.149C227.109 454.476 219.267 446.634 209.594 446.634H165.236C155.437 446.634 147.493 438.69 147.493 428.891Z" fill="white" />
  </Svg>
);

/* ── Type 5: Small pill cloud ──────────────────────── */
const CloudPillSmall = () => (
  <Svg width="48" height="32" viewBox="0 0 48 32" fill="none">
    <Path
      d="M14.5 28C10.3579 28 7 24.6421 7 20.5C7 16.6384 9.91427 13.458 13.666 13.045C14.7351 8.52841 18.7909 5 23.5 5C27.9152 5 31.7583 8.16383 33.0903 12.3392C36.7029 12.569 39.5 15.5414 39.5 19.1667C39.5 22.8486 36.5152 25.8333 32.8333 25.8333H14.5Z"
      fill="white"
    />
  </Svg>
);

/* ── Type 6: Dot cloud ─────────────────────────────── */
const CloudDot = () => (
  <Svg width="20" height="20" viewBox="967 618 41 41" fill="none">
    <Path d="M967.723 638.126C967.723 627.093 976.667 618.149 987.7 618.149C998.733 618.149 1007.68 627.093 1007.68 638.126C1007.68 649.159 998.733 658.103 987.7 658.103C976.667 658.103 967.723 649.159 967.723 638.126Z" fill="white" />
  </Svg>
);
