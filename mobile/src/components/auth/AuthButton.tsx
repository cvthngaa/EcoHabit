import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  Animated,
  ActivityIndicator,
  View,
  ViewStyle,
} from 'react-native';
import { Colors, FontFamily, Semantic, Tokens } from '../../theme';

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
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 30 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  const isPrimary = variant === 'primary';

  return (
    <Animated.View
      className="rounded-full"
      style={[{ transform: [{ scale }] }, style]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={0.86}
        disabled={disabled || loading}
        className="items-center justify-center rounded-full"
        style={[
          {
            minHeight: 56,
            paddingHorizontal: Tokens.space[6],
          },
          isPrimary
            ? {
                backgroundColor: Semantic.color.action.primary,
                shadowColor: Semantic.color.action.primaryPressed,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.24,
                shadowRadius: 12,
                elevation: 8,
              }
            : {
                backgroundColor: 'rgba(252,251,250,0.18)',
                borderWidth: 1.5,
                borderColor: 'rgba(252,251,250,0.56)',
              },
          (disabled || loading) && { opacity: 0.6 },
        ]}
      >
        {loading ? (
          <View className="flex-row items-center">
            <ActivityIndicator
              color={isPrimary ? Colors.textInverse : Colors.primary}
              size="small"
            />
            <Text
              style={{
                marginLeft: Tokens.space[2],
                fontFamily: FontFamily.bold,
                fontSize: 16,
                fontWeight: '700',
                letterSpacing: 0.2,
                color: Colors.textInverse,
              }}
            >
              Đang xử lý...
            </Text>
          </View>
        ) : (
          <Text
            style={{
              fontFamily: FontFamily.bold,
              fontSize: 16,
              fontWeight: '700',
              letterSpacing: 0.2,
              color: Colors.textInverse,
            }}
          >
            {label}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AuthButton;
