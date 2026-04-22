import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  View,
  ViewStyle,
} from 'react-native';
import Colors from '../../theme/colors';

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
  style?: ViewStyle;
}

const AuthButton: React.FC<Props> = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 30 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  const isPrimary = variant === 'primary';

  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={0.85}
        disabled={disabled || loading}
        style={[
          styles.btn,
          isPrimary ? styles.btnPrimary : styles.btnOutline,
          (disabled || loading) && styles.btnDisabled,
        ]}
      >
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={isPrimary ? '#fff' : Colors.primary} size="small" />
            <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelOutline, { marginLeft: 10 }]}>
              Đang xử lý...
            </Text>
          </View>
        ) : (
          <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelOutline]}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 50,
  },
  btn: {
    height: 56,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  btnPrimary: {
    backgroundColor: '#2E5D3A',
    shadowColor: '#1B3A1E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  btnOutline: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  labelPrimary: {
    color: '#FFFFFF',
  },
  labelOutline: {
    color: '#FFFFFF',
  },
});

export default AuthButton;
