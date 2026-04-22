import React from 'react';
import { StyleProp, StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

type NatureBackgroundProps = {
  style?: StyleProp<ViewStyle>;
  opacity?: number;
};

const cloudGroups = [
  { x: 58, y: 118, scale: 1.06 },
  { x: 286, y: 90, scale: 0.98 },
  { x: 338, y: 172, scale: 0.48 },
];

const birdGroups = [
  { x: 252, y: 60, scale: 1.08 },
  { x: 168, y: 110, scale: 0.42 },
  { x: 298, y: 122, scale: 0.48 },
];

const distantTrees = [
  { x: 78, y: 348, scale: 0.68, canopy: '#355746', trunk: '#53624A' },
  { x: 96, y: 346, scale: 0.82, canopy: '#3E624C', trunk: '#53624A' },
  { x: 228, y: 360, scale: 0.56, canopy: '#53764F', trunk: '#62745A' },
  { x: 296, y: 334, scale: 0.74, canopy: '#547951', trunk: '#5F7357' },
];

const foregroundTrees = [
  { x: 94, y: 492, scale: 0.78, foliage: '#A7C98A', trunk: '#3C4434' },
  { x: 118, y: 516, scale: 0.52, foliage: '#BDD79E', trunk: '#3C4434' },
  { x: 148, y: 472, scale: 0.6, foliage: '#B6D290', trunk: '#3C4434' },
  { x: 302, y: 474, scale: 0.94, foliage: '#5E775B', trunk: '#314132' },
  { x: 364, y: 496, scale: 0.8, foliage: '#C6DBA9', trunk: '#3C4434' },
];

const drawBird = (x: number, y: number, scale: number) => (
  <Path
    key={`${x}-${y}`}
    d={`
      M ${x} ${y}
      q ${8 * scale} ${-8 * scale} ${16 * scale} 0
      q ${8 * scale} ${8 * scale} ${16 * scale} 0
    `}
    fill="none"
    stroke="#1C263F"
    strokeWidth={2.4 * scale}
    strokeLinecap="round"
  />
);

const drawCloud = (x: number, y: number, scale: number) => (
  <G key={`${x}-${y}`} transform={`translate(${x}, ${y}) scale(${scale})`}>
    <Ellipse cx="0" cy="18" rx="18" ry="12" fill="#F9B39F" />
    <Ellipse cx="22" cy="10" rx="22" ry="18" fill="#F7A28E" />
    <Ellipse cx="40" cy="18" rx="16" ry="12" fill="#F9B39F" />
    <Rect x="-18" y="18" width="74" height="10" rx="5" fill="#F9B39F" />
  </G>
);

const drawRoundTree = (
  x: number,
  y: number,
  scale: number,
  foliage: string,
  trunk: string
) => (
  <G key={`${x}-${y}`} transform={`translate(${x}, ${y}) scale(${scale})`}>
    <Rect x="-2.5" y="12" width="5" height="34" rx="2.5" fill={trunk} />
    <Circle cx="0" cy="2" r="16" fill={foliage} />
    <Circle cx="-10" cy="8" r="10" fill={foliage} opacity={0.92} />
    <Circle cx="10" cy="8" r="10" fill={foliage} opacity={0.9} />
    <Path
      d="M 0 16 C -3 22 -4 28 -4 35"
      fill="none"
      stroke={trunk}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M 0 18 C 3 24 4 30 4 37"
      fill="none"
      stroke={trunk}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </G>
);

const drawSlimTree = (
  x: number,
  y: number,
  scale: number,
  canopy: string,
  trunk: string
) => (
  <G key={`${x}-${y}`} transform={`translate(${x}, ${y}) scale(${scale})`}>
    <Rect x="-2" y="4" width="4" height="30" rx="2" fill={trunk} />
    <Circle cx="0" cy="0" r="10" fill={canopy} />
  </G>
);

const NatureBackground: React.FC<NatureBackgroundProps> = ({ style, opacity = 1 }) => {
  const { width, height } = useWindowDimensions();

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style, { opacity }]}>
      <Svg width={width} height={height} viewBox="0 0 400 760" preserveAspectRatio="xMidYMid slice">
        <Rect width="400" height="760" fill="#E3EFE1" />

        {cloudGroups.map((cloud) => drawCloud(cloud.x, cloud.y, cloud.scale))}
        {birdGroups.map((bird) => drawBird(bird.x, bird.y, bird.scale))}

        <Path
          d="M 0 224 C 42 198 88 244 138 216 C 186 188 246 166 296 196 C 334 218 366 232 400 216 L 400 330 L 0 330 Z"
          fill="#EEF3D8"
          opacity="0.94"
        />
        <Path
          d="M 0 258 C 44 228 86 278 144 248 C 198 218 246 212 300 238 C 344 260 372 270 400 258 L 400 358 L 0 358 Z"
          fill="#E4EDC6"
          opacity="0.72"
        />
        <Path
          d="M 0 298 C 42 280 82 330 142 308 C 194 290 254 274 304 298 C 340 316 370 324 400 316 L 400 388 L 0 388 Z"
          fill="#D8E6B2"
          opacity="0.9"
        />
        <Path
          d="M 0 370 C 46 338 88 392 144 360 C 198 330 248 330 304 356 C 350 376 374 382 400 380 L 400 444 L 0 444 Z"
          fill="#A9C58D"
        />
        <Path
          d="M 0 392 C 56 360 98 420 150 392 C 200 366 248 368 306 392 C 344 408 374 410 400 408 L 400 470 L 0 470 Z"
          fill="#617E5F"
        />
        <Path
          d="M 0 430 C 42 402 98 462 154 432 C 214 398 260 408 320 436 C 352 450 378 456 400 452 L 400 516 L 0 516 Z"
          fill="#49654B"
        />
        <Path
          d="M 0 470 C 42 446 92 498 146 474 C 198 452 250 454 302 478 C 346 498 374 504 400 500 L 400 566 L 0 566 Z"
          fill="#78965B"
        />
        <Path
          d="M 0 494 C 58 456 104 544 168 512 C 226 482 278 486 340 520 C 366 536 384 544 400 540 L 400 610 L 0 610 Z"
          fill="#97B56C"
        />
        <Path
          d="M 0 550 C 54 510 112 596 178 556 C 242 518 306 530 372 564 C 384 570 392 574 400 572 L 400 760 L 0 760 Z"
          fill="#445F49"
        />
        <Path
          d="M 0 586 C 52 554 110 642 184 600 C 244 566 298 580 364 612 C 382 620 392 624 400 622 L 400 760 L 0 760 Z"
          fill="#6F8B58"
        />

        {distantTrees.map((tree) =>
          drawSlimTree(tree.x, tree.y, tree.scale, tree.canopy, tree.trunk)
        )}
        {foregroundTrees.map((tree) =>
          drawRoundTree(tree.x, tree.y, tree.scale, tree.foliage, tree.trunk)
        )}
      </Svg>
    </View>
  );
};

export const BackgroundTrees = NatureBackground;

export default NatureBackground;
