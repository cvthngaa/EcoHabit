import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, Shadows, Tokens } from '../../theme';

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
  <View style={{ marginTop: Tokens.space[2] }}>
    {/* Divider */}
    <View
      className="flex-row items-center"
      style={{ marginBottom: Tokens.space[5] }}
    >
      <View className="flex-1" style={{ height: 1, backgroundColor: Colors.border }} />
      <Text
        style={{
          marginHorizontal: Tokens.space[3],
          fontFamily: FontFamily.medium,
          fontSize: 13,
          fontWeight: '500',
          color: Colors.textMuted,
        }}
      >
        Hoặc tiếp tục với
      </Text>
      <View className="flex-1" style={{ height: 1, backgroundColor: Colors.border }} />
    </View>

    {/* Social icons */}
    <View
      className="flex-row justify-center"
      style={{ gap: Tokens.space[5] }}
    >
      <TouchableOpacity
        className="items-center justify-center rounded-lg"
        style={{
          width: 56,
          height: 56,
          borderRadius: Tokens.radius.lg,
          backgroundColor: '#EAF2FF',
          ...Shadows.sm,
        }}
        onPress={onFacebook}
        activeOpacity={0.72}
      >
        <Ionicons name="logo-facebook" size={24} color={Colors.facebook} />
      </TouchableOpacity>

      <TouchableOpacity
        className="items-center justify-center rounded-lg"
        style={{
          width: 56,
          height: 56,
          borderRadius: Tokens.radius.lg,
          backgroundColor: '#FDECEC',
          ...Shadows.sm,
        }}
        onPress={onGoogle}
        activeOpacity={0.72}
      >
        <Ionicons name="logo-google" size={24} color={Colors.google} />
      </TouchableOpacity>

      <TouchableOpacity
        className="items-center justify-center rounded-lg"
        style={{
          width: 56,
          height: 56,
          borderRadius: Tokens.radius.lg,
          backgroundColor: Tokens.color.gray[100],
          ...Shadows.sm,
        }}
        onPress={onApple}
        activeOpacity={0.72}
      >
        <Ionicons name="logo-apple" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>
    </View>
  </View>
);

export default SocialLoginRow;
