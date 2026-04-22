import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../../theme/colors';

interface Props {
  message: string;
  linkText: string;
  onPress: () => void;
  light?: boolean;
}

const AuthFooterLink: React.FC<Props> = ({ message, linkText, onPress, light = false }) => (
  <View style={styles.row}>
    {!!message && (
      <Text style={[styles.message, light && styles.messageLight]}>{message}</Text>
    )}
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.link, light && styles.linkLight]}>{linkText}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  messageLight: {
    color: 'rgba(255,255,255,0.6)',
  },
  link: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  linkLight: {
    color: '#FFFFFF',
  },
});

export default AuthFooterLink;
