import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';

const cfg = {
  google:   { label: 'Tiếp tục với Google',   icon: 'logo-google'   as const, color: Colors.google },
  facebook: { label: 'Tiếp tục với Facebook', icon: 'logo-facebook' as const, color: Colors.facebook },
};

const SocialButton: React.FC<{ provider: 'google' | 'facebook'; onPress: () => void }> = ({
  provider, onPress,
}) => {
  const c = cfg[provider];
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconWrap, { backgroundColor: c.color + '18' }]}>
        <Ionicons name={c.icon} size={20} color={c.color} />
      </View>
      <Text style={styles.label}>{c.label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  label:    { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
});

export default SocialButton;
