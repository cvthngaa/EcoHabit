import React from 'react';
import { Path, G, Circle } from 'react-native-svg';

export interface RoundTreeProps {
  x: number;
  y: number;
  scale?: number;
  opacity?: number;
}

export const RoundTree: React.FC<RoundTreeProps> = ({ x, y, scale = 1, opacity = 1 }) => {
  const trunkLight = "#A87B51";
  const trunkDark = "#8B5A2B";
  const leafDark = "#4B7E4B";
  const leafMid = "#649A64";
  const leafLight = "#85BD85";

  const puffs = [
    { cx: 0, cy: -55, r: 16 },
    { cx: -16, cy: -40, r: 15 },
    { cx: 16, cy: -40, r: 15 },
    { cx: -14, cy: -25, r: 12 },
    { cx: 14, cy: -25, r: 12 },
    { cx: 0, cy: -35, r: 20 },
  ];

  return (
    <G transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
      {/* Trunk */}
      <Path d="M -6 0 L 0 0 L 0 -25 L -4 -25 Z" fill={trunkLight} />
      <Path d="M 0 0 L 6 0 L 4 -25 L 0 -25 Z" fill={trunkDark} />

      {/* Dark Shadows */}
      <G transform="translate(0, 5)">
        {puffs.map((p, i) => <Circle key={`dark-${i}`} cx={p.cx} cy={p.cy} r={p.r} fill={leafDark} />)}
      </G>

      {/* Mid Base */}
      <G>
        {puffs.map((p, i) => <Circle key={`mid-${i}`} cx={p.cx} cy={p.cy} r={p.r} fill={leafMid} />)}
      </G>

      {/* Highlights (shifted top-left, slightly smaller) */}
      <G>
        <Circle cx={-6} cy={-60} r={9} fill={leafLight} />
        <Circle cx={-18} cy={-44} r={8} fill={leafLight} />
        <Circle cx={-6} cy={-38} r={11} fill={leafLight} />
      </G>
    </G>
  );
};
