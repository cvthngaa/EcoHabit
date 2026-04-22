import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../theme/colors';

interface Props {
  onFacebook?: () => void;
  onGoogle?: () => void;
  onApple?: () => void;
}

const SocialLoginRow: React.FC<Props> = ({
  onFacebook,
  onGoogle,
  onApple,
}) => (
  <View style={styles.container}>
    {/* Divider */}
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
      <View style={styles.dividerLine} />
    </View>

    {/* Social icons */}
    <View style={styles.iconsRow}>
      <TouchableOpacity
        style={[styles.iconBtn, { backgroundColor: '#E8F0FE' }]}
        onPress={onFacebook}
        activeOpacity={0.7}
      >
        <Ionicons name="logo-facebook" size={24} color="#1877F2" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.iconBtn, { backgroundColor: '#FEF0E8' }]}
        onPress={onGoogle}
        activeOpacity={0.7}
      >
        <Ionicons name="logo-google" size={24} color="#DB4437" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.iconBtn, { backgroundColor: '#F0F0F0' }]}
        onPress={onApple}
        activeOpacity={0.7}
      >
        <Ionicons name="logo-apple" size={24} color="#000000" />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E8E0',
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  iconBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
});

export default SocialLoginRow;
