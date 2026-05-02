import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { Tokens } from '../../theme';

/** Hamburger-style menu icon (2 bars, top full / bottom short) */
export const HeaderMenuIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
    <Rect x={6}  y={10} width={16}  height={4.5} rx={2.2} fill="#FFFFFF" />
    <Rect x={6}  y={17} width={10}  height={4.5} rx={2.2} fill="#FFFFFF" />
  </Svg>
);

/** 2×2 grid icon */
export const HeaderGridIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
    <Rect x={7}  y={7}  width={6.5} height={6.5} rx={2.4} fill="#FFFFFF" />
    <Rect x={18} y={7}  width={6.5} height={6.5} rx={2.4} fill="#FFFFFF" />
    <Rect x={7}  y={18} width={6.5} height={6.5} rx={2.4} fill="#FFFFFF" />
    <Rect x={18} y={18} width={6.5} height={6.5} rx={2.4} fill="#FFFFFF" />
  </Svg>
);

/** Notification bell with badge dot */
export const HeaderNotificationIcon = () => (
  <Svg width={23} height={23} viewBox="0 0 23 23" fill="none">
    <Path
      d="M5.9 14.1h9.6c.7 0 1.1-.8.7-1.4l-.9-1.3c-.4-.6-.6-1.3-.6-2V8.1c0-2.3-1.3-3.9-3.3-4.4v-.6c0-.6-.5-1.1-1.1-1.1S9.2 2.5 9.2 3.1v.6c-2 .5-3.3 2.1-3.3 4.4v1.3c0 .7-.2 1.4-.6 2l-.9 1.3c-.4.6 0 1.4.7 1.4h.8Z"
      fill="#FFFFFF"
    />
    <Path d="M8.4 16.1c.4 1.1 1.4 1.9 2.7 1.9s2.3-.8 2.7-1.9H8.4Z" fill="#FFFFFF" />
    <Circle cx={16.9} cy={6.3} r={3.2}  fill="#FFFFFF" opacity={0.95} />
    <Circle cx={17.8} cy={5.2} r={1.05} fill={Tokens.color.green[200]} />
  </Svg>
);
