import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../theme/colors';

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
  ...rest
}) => {
  const [showPass, setShowPass] = useState(false);

  return (
    <View style={styles.wrap}>
      <View style={[
        styles.box,
        error ? styles.boxError : null,
      ]}>
        <View style={styles.iconWrap}>
          <Ionicons
            name={iconName}
            size={18}
            color={error ? Colors.error : '#6B8F71'}
          />
        </View>

        <TextInput
          style={styles.input}
          placeholderTextColor="#A0B8A3"
          secureTextEntry={isPassword && !showPass}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPass(v => !v)}
            style={styles.eyeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPass ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#8FA892"
            />
          </TouchableOpacity>
        )}

        {isValid && !isPassword && (
          <View style={styles.validBadge}>
            <Ionicons name="checkmark" size={14} color="#fff" />
          </View>
        )}
      </View>

      {!!error && (
        <View style={styles.errRow}>
          <Ionicons name="alert-circle" size={12} color={Colors.error} />
          <Text style={styles.errText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F7EE',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 54,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  boxError: {
    borderColor: Colors.errorBorder,
    backgroundColor: Colors.errorLight,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(46, 125, 50, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    height: '100%',
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 4,
  },
  validBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 4,
    paddingLeft: 4,
  },
  errText: {
    fontSize: 11,
    color: Colors.error,
    fontWeight: '500',
  },
});

export default AuthInput;
