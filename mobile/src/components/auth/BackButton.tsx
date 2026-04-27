import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../theme';

interface Props {
  onPress: () => void;
  color?: string;
  style?: ViewStyle;
  className?: string;
}

const BackButton: React.FC<Props> = ({ onPress, color = Colors.primary, style, className = '' }) => (
  <TouchableOpacity
    className={`h-12 w-12 items-center justify-center rounded-lg bg-base-canvas/90 ${className}`}
    style={[
      {
        ...Shadows.sm,
      },
      style,
    ]}
    onPress={onPress}
    activeOpacity={0.72}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  >
    <Ionicons name="chevron-back" size={22} color={color} />
  </TouchableOpacity>
);

export default BackButton;
