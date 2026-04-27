import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors, FontFamily, Tokens } from '../../theme';

interface Props {
  message: string;
  linkText: string;
  onPress: () => void;
  light?: boolean;
}

const AuthFooterLink: React.FC<Props> = ({ message, linkText, onPress, light = false }) => (
  <View
    className="flex-row justify-center items-center"
    style={{ marginTop: Tokens.space[5] }}
  >
    {!!message && (
      <Text
        style={{
          fontFamily: FontFamily.regular,
          fontSize: 14,
          color: light ? 'rgba(252,251,250,0.68)' : Colors.textSecondary,
        }}
      >
        {message}
      </Text>
    )}
    <TouchableOpacity onPress={onPress} activeOpacity={0.72}>
      <Text
        style={{
          fontFamily: FontFamily.bold,
          fontSize: 14,
          fontWeight: '700',
          textDecorationLine: 'underline',
          color: light ? Colors.textInverse : Colors.primary,
        }}
      >
        {linkText}
      </Text>
    </TouchableOpacity>
  </View>
);

export default AuthFooterLink;
