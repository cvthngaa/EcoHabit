import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';

interface Props {
  type: 'recyclable' | 'organic' | 'hazardous' | 'general';
  label?: string;
  size?: 'sm' | 'md';
}

const typeConfig = {
  recyclable: { color: Colors.recyclable, bg: Colors.recyclableBg, icon: 'refresh-circle' as const, defaultLabel: 'Tái chế' },
  organic:    { color: Colors.organic,    bg: Colors.organicBg,    icon: 'leaf' as const,           defaultLabel: 'Hữu cơ' },
  hazardous:  { color: Colors.hazardous,  bg: Colors.hazardousBg,  icon: 'warning' as const,        defaultLabel: 'Nguy hại' },
  general:    { color: Colors.general,    bg: Colors.generalBg,    icon: 'trash' as const,          defaultLabel: 'Thông thường' },
};

const WasteBadge: React.FC<Props> = ({ type, label, size = 'md' }) => {
  const config = typeConfig[type];
  const displayLabel = label || config.defaultLabel;

  const isSm = size === 'sm';

  return (
    <View style={[
      styles.badge,
      { backgroundColor: config.bg },
      isSm && styles.badgeSm,
    ]}>
      <Ionicons name={config.icon} size={isSm ? 12 : 16} color={config.color} />
      <Text style={[
        styles.text,
        { color: config.color },
        isSm && styles.textSm,
      ]}>
        {displayLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
  },
  textSm: {
    fontSize: 11,
  },
});

export default WasteBadge;
