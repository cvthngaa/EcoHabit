import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';

interface InputFieldProps extends TextInputProps {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  error?: string;
  isPassword?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  iconName,
  error,
  isPassword = false,
  value,
  onChangeText,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    setIsFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 180, useNativeDriver: false }).start();
  };
  const onBlur = () => {
    setIsFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? Colors.errorBorder : Colors.border,
      error ? Colors.error : Colors.borderFocus,
    ],
  });

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, !!error && { color: Colors.error }]}>{label}</Text>
      <Animated.View
        style={[
          styles.box,
          { borderColor, backgroundColor: error ? Colors.errorLight : Colors.white },
        ]}
      >
        <Ionicons
          name={iconName}
          size={20}
          color={error ? Colors.error : isFocused ? Colors.primaryLight : Colors.textMuted}
          style={{ marginRight: 10 }}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={isPassword && !showPass}
          onFocus={onFocus}
          onBlur={onBlur}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPass(v => !v)} style={{ padding: 4 }}>
            <Ionicons
              name={showPass ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      {!!error && (
        <View style={styles.errRow}>
          <Ionicons name="alert-circle" size={13} color={Colors.error} />
          <Text style={styles.errText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap:   { marginBottom: 16 },
  label:  { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
    shadowColor: Colors.primaryLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  input:  { flex: 1, fontSize: 16, color: Colors.textPrimary, height: '100%' },
  errRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 4 },
  errText:{ fontSize: 11, color: Colors.error, fontWeight: '500' },
});

export default InputField;
