import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, Semantic, Tokens } from '../../theme';

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
  <View
    className="flex-row items-center justify-between"
    style={{ marginBottom: Tokens.space[5], marginTop: Tokens.space[1] }}
  >
    <TouchableOpacity
      className="flex-row items-center"
      style={{ gap: Tokens.space[2] }}
      onPress={onToggleRemember}
      activeOpacity={0.72}
    >
      <View
        className="items-center justify-center"
        style={{
          width: 20,
          height: 20,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: remembered ? Colors.primary : Semantic.color.border.subtle,
          backgroundColor: remembered ? Colors.primary : Colors.white,
        }}
      >
        {remembered && <Ionicons name="checkmark" size={12} color={Colors.textInverse} />}
      </View>
      <Text
        style={{
          fontFamily: FontFamily.medium,
          fontSize: 13,
          fontWeight: '500',
          color: Colors.textSecondary,
        }}
      >
        Ghi nhớ
      </Text>
    </TouchableOpacity>

    {onForgotPassword && (
      <TouchableOpacity onPress={onForgotPassword} activeOpacity={0.72}>
        <Text
          style={{
            fontFamily: FontFamily.semibold,
            fontSize: 13,
            fontWeight: '600',
            color: Colors.primary,
          }}
        >
          Quên mật khẩu?
        </Text>
      </TouchableOpacity>
    )}
  </View>
);

export default RememberForgotRow;
