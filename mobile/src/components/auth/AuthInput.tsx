import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, Semantic, Tokens } from '../../theme';

interface AuthInputProps extends TextInputProps {
  iconName: keyof typeof Ionicons.glyphMap;
  error?: string;
  isPassword?: boolean;
  isValid?: boolean;
}

const AuthInput: React.FC<AuthInputProps> = ({
  iconName,
  error,
  isPassword = false,
  isValid = false,
  value,
  onChangeText,
  placeholder,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? Colors.errorBorder
    : focused
      ? Semantic.color.action.primary
      : Semantic.color.border.default;

  const backgroundColor = error
    ? Colors.errorLight
    : Semantic.color.bg.surfaceAlt;

  const iconColor = error
    ? Colors.error
    : Semantic.color.action.brand;

  return (
    <View style={{ marginBottom: Tokens.space[3] }}>
      <View
        className="relative flex-row items-center rounded-2xl"
        style={{
          minHeight: 54,
          paddingHorizontal: Tokens.space[3],
          backgroundColor,
          borderWidth: 1.5,
          borderColor,
        }}
      >
        <View
          className="items-center justify-center rounded-xl mr-3"
          style={{
            width: 32,
            height: 32,
            backgroundColor: `${Semantic.color.action.brand}14`,
          }}
        >
          <Ionicons name={iconName} size={18} color={iconColor} />
        </View>

        <TextInput
          className="flex-1"
          style={{
            height: '100%',
            fontSize: 14,
            color: Colors.textPrimary,
            fontFamily: FontFamily.medium,
            fontWeight: '500',
            paddingVertical: Tokens.space[2],
          }}
          placeholder={placeholder}
          placeholderTextColor={error ? Colors.error : Colors.textMuted}
          secureTextEntry={isPassword && !showPass}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPass((v) => !v)}
            className="p-1"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPass ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        )}

        {isValid && !isPassword && (
          <View
            className="items-center justify-center rounded-full"
            style={{
              width: 22,
              height: 22,
              backgroundColor: Semantic.color.action.primary,
            }}
          >
            <Ionicons name="checkmark" size={14} color={Colors.textInverse} />
          </View>
        )}
      </View>

      {!!error && (
        <View
          className="flex-row items-center"
          style={{
            marginTop: 5,
            gap: Tokens.space[1],
            paddingLeft: Tokens.space[1],
          }}
        >
          <Ionicons name="alert-circle" size={12} color={Colors.error} />
          <Text
            style={{
              fontFamily: FontFamily.medium,
              fontSize: 11,
              color: Colors.error,
              fontWeight: '500',
            }}
          >
            {error}
          </Text>
        </View>
      )}
    </View>
  );
};

export default AuthInput;