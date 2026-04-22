import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../theme/colors';

interface Props {
  remembered: boolean;
  onToggleRemember: () => void;
  onForgotPassword?: () => void;
}

const RememberForgotRow: React.FC<Props> = ({
  remembered,
  onToggleRemember,
  onForgotPassword,
}) => (
  <View style={styles.row}>
    <TouchableOpacity
      style={styles.rememberWrap}
      onPress={onToggleRemember}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, remembered && styles.checkboxOn]}>
        {remembered && <Ionicons name="checkmark" size={12} color="#fff" />}
      </View>
      <Text style={styles.rememberText}>Ghi nhớ</Text>
    </TouchableOpacity>

    {onForgotPassword && (
      <TouchableOpacity onPress={onForgotPassword} activeOpacity={0.7}>
        <Text style={styles.forgotText}>Quên mật khẩu?</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 4,
  },
  rememberWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#C8E6C9',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxOn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rememberText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default RememberForgotRow;
