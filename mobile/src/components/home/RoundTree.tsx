import React from 'react';
import { Path, G, Rect } from 'react-native-svg';

export interface RoundTreeProps {
  x: number;
  y: number;
  scale?: number;
  opacity?: number;
  type?: 1 | 2 | 3;
}

export const RoundTree: React.FC<RoundTreeProps> = ({ x, y, scale = 1, opacity = 1, type = 1 }) => {
  return (
    <G transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
      <G transform="scale(0.35)">
        {type === 1 && (
          <G transform="translate(-67.22, -175.22)">
            <Rect x="59" y="97.6716" width="16.4495" height="77.5479" fill="#93642D"/>
            <Rect x="59.0439" y="69" width="16.4495" height="77.5479" fill="#714D22"/>
            <Rect x="38.0342" y="67.3366" width="59.5317" height="59.5317" rx="29.7659" fill="#83C082"/>
            <Rect x="41.0312" y="29.427" width="54.4795" height="54.4795" rx="27.2397" fill="#66A865"/>
            <Rect x="45.0264" width="46.0735" height="46.0735" rx="23.0368" fill="#83C082"/>
            <Path fillRule="evenodd" clipRule="evenodd" d="M38.2175 93.8829C38.0739 95.0685 38 96.2756 38 97.5C38 113.939 51.3266 127.266 67.7659 127.266C84.2051 127.266 97.5317 113.939 97.5317 97.5C97.5317 96.2756 97.4578 95.0686 97.3142 93.8829C95.5294 108.616 82.9807 120.032 67.7659 120.032C52.551 120.032 40.0023 108.616 38.2175 93.8829Z" fill="#679A66"/>
          </G>
        )}
        {type === 2 && (
          <G transform="translate(-203.22, -175.22)">
            <Rect x="195" y="97.6716" width="16.4495" height="77.5479" fill="#93642D"/>
            <Rect x="195.044" y="69" width="16.4495" height="77.5479" fill="#714D22"/>
            <Rect x="174.034" y="72.9095" width="59.5317" height="59.5317" rx="29.7659" fill="#66A865"/>
            <Rect x="177.031" y="35" width="54.4795" height="54.4795" rx="27.2397" fill="#83C082"/>
            <Path fillRule="evenodd" clipRule="evenodd" d="M174.218 99.4559C174.074 100.642 174 101.849 174 103.073C174 119.512 187.327 132.839 203.766 132.839C220.205 132.839 233.532 119.512 233.532 103.073C233.532 101.849 233.458 100.642 233.314 99.4559C231.529 114.189 218.981 125.605 203.766 125.605C188.551 125.605 176.002 114.189 174.218 99.4559Z" fill="#458244"/>
          </G>
        )}
        {type === 3 && (
          <G transform="translate(-340.22, -179)">
            <Rect x="332" y="123.515" width="16.4495" height="55.4855" fill="#93642D"/>
            <Rect x="332.044" y="103" width="16.4495" height="55.4855" fill="#714D22"/>
            <Rect x="307.038" y="80" width="66.9616" height="66.9616" rx="33.4808" fill="#66A865"/>
            <Path fillRule="evenodd" clipRule="evenodd" d="M307.245 109.859C307.083 111.193 307 112.551 307 113.928C307 132.419 321.99 147.409 340.481 147.409C358.972 147.409 373.962 132.419 373.962 113.928C373.962 112.551 373.878 111.193 373.717 109.86C371.709 126.432 357.595 139.272 340.481 139.272C323.367 139.272 309.252 126.432 307.245 109.859Z" fill="#458244"/>
          </G>
        )}
      </G>
    </G>
  );
};
