import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView,
  Platform, Animated, Alert, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import BackButton from '../../components/auth/BackButton';
import { Colors, Semantic, Tokens } from '../../theme';
import { useResetPassword } from '../../services/auth';

interface Props {
  email: string;
  onGoBack?: () => void;
  onSuccess?: () => void;
}

interface Errors { password?: string; confirmPassword?: string }

const ResetPasswordScreen: React.FC<Props> = ({ email, onGoBack, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const { mutateAsync: resetPasswordAsync } = useResetPassword();

  const shake = () =>
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();

  const validate = useCallback((): boolean => {
    const e: Errors = {};
    if (!password) {
      e.password = 'Vui lòng nhập mật khẩu mới';
    } else if (password.length < 6) {
      e.password = 'Mật khẩu phải từ 6 ký tự trở lên';
    }
    
    if (!confirmPassword) {
      e.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (confirmPassword !== password) {
      e.confirmPassword = 'Mật khẩu không khớp';
    }

    setErrors(e);
    if (Object.keys(e).length > 0) {
      shake();
      return false;
    }
    return true;
  }, [password, confirmPassword]);

  const handleResetPassword = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      await resetPasswordAsync({ email, newPassword: password });
      Alert.alert('Thành công', 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập bằng mật khẩu mới.', [
        { text: 'OK', onPress: () => onSuccess?.() }
      ]);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Có lỗi xảy ra trong quá trình đổi mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  const clr = (f: keyof Errors) => { if (errors[f]) setErrors(e => ({ ...e, [f]: undefined })); };

  return (
    <View className="flex-1 bg-canvas">
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerClassName="flex-grow px-7 pb-12"
          contentContainerStyle={{ paddingTop: Platform.OS === 'ios' ? 60 : 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-6 flex-row items-start justify-between">
            <BackButton onPress={() => onGoBack?.()} color={Colors.primary} />
            <View className="relative h-[60px] w-[60px]">
              <Ionicons
                name="leaf"
                size={48}
                color={`${Semantic.color.action.brand}30`}
                style={{ transform: [{ rotate: '-40deg' }] }}
              />
              <Ionicons
                name="leaf"
                size={28}
                color={`${Semantic.color.action.brand}22`}
                style={{ position: 'absolute', top: Tokens.space[5], right: Tokens.space[2], transform: [{ rotate: '30deg' }] }}
              />
            </View>
          </View>

          <Text className="mb-2 text-center font-bold text-[32px] text-text">
            Mật khẩu mới
          </Text>
          <Text className="mb-8 text-center font-semibold text-[14px] leading-5 text-text-muted">
            Vui lòng tạo một mật khẩu mới cho tài khoản của bạn. Đảm bảo mật khẩu an toàn và dễ nhớ.
          </Text>

          <Animated.View className="mb-8" style={{ transform: [{ translateX: shakeAnim }] }}>
            <AuthInput
              iconName="lock-closed-outline"
              placeholder="Mật khẩu mới"
              isPassword
              value={password}
              onChangeText={t => { setPassword(t); clr('password'); }}
              error={errors.password}
            />
            <AuthInput
              iconName="lock-closed-outline"
              placeholder="Xác nhận mật khẩu"
              isPassword
              value={confirmPassword}
              onChangeText={t => { setConfirmPassword(t); clr('confirmPassword'); }}
              error={errors.confirmPassword}
            />
          </Animated.View>

          <AuthButton label="Cập nhật mật khẩu" onPress={handleResetPassword} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ResetPasswordScreen;
