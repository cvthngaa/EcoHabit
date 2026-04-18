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
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../theme/colors';

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const PrimaryButton: React.FC<Props> = ({ label, onPress, loading, disabled, style }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn  = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 30 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();

  return (
    <Animated.View style={[styles.shadow, { transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
        disabled={disabled || loading}
        style={{ borderRadius: 50, overflow: 'hidden' }}
      >
        <LinearGradient
          colors={(disabled || loading)
            ? ['#A5D6A7', '#A5D6A7']
            : [Colors.primaryGradientStart, Colors.primaryGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {loading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator color={Colors.white} size="small" />
              <Text style={[styles.label, { marginLeft: 10 }]}>Đang xử lý...</Text>
            </View>
          ) : (
            <Text style={styles.label}>{label}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 50,
    shadowColor: Colors.primaryGradientStart,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  label: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default PrimaryButton;
