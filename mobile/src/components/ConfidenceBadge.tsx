import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';
import { getConfidenceLevel, getConfidenceLabel } from '../services/aiService';

interface Props {
  confidence: number; // 0.0 – 1.0
  size?: 'sm' | 'md' | 'lg';
}

const ConfidenceBadge: React.FC<Props> = ({ confidence, size = 'md' }) => {
  const level = getConfidenceLevel(confidence);
  const label = getConfidenceLabel(confidence);
  const percent = Math.round(confidence * 100);

  const config = {
    high:   { color: Colors.confidenceHigh,   bg: Colors.confidenceHighBg,   icon: 'checkmark-circle' as const },
    medium: { color: Colors.confidenceMedium,  bg: Colors.confidenceMediumBg, icon: 'alert-circle' as const },
    low:    { color: Colors.confidenceLow,     bg: Colors.confidenceLowBg,    icon: 'warning' as const },
  };

  const { color, bg, icon } = config[level];

  const sizeStyles = {
    sm: { paddingH: 8,  paddingV: 4,  iconSize: 12, fontSize: 11, percentSize: 11 },
    md: { paddingH: 12, paddingV: 6,  iconSize: 16, fontSize: 13, percentSize: 15 },
    lg: { paddingH: 16, paddingV: 10, iconSize: 20, fontSize: 15, percentSize: 20 },
  };

  const s = sizeStyles[size];

  return (
    <View style={[styles.container, { backgroundColor: bg, paddingHorizontal: s.paddingH, paddingVertical: s.paddingV }]}>
      <Ionicons name={icon} size={s.iconSize} color={color} />
      <Text style={[styles.percent, { color, fontSize: s.percentSize, fontWeight: '800' }]}>
        {percent}%
      </Text>
      <Text style={[styles.label, { color, fontSize: s.fontSize }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    gap: 6,
  },
  percent: {
    letterSpacing: -0.3,
  },
  label: {
    fontWeight: '600',
  },
});

export default ConfidenceBadge;
