import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView,
  Platform, Animated, Alert, Dimensions, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import RememberForgotRow from '../../components/auth/RememberForgotRow';
import SocialLoginRow from '../../components/auth/SocialLoginRow';
import AuthFooterLink from '../../components/auth/AuthFooterLink';
import BackButton from '../../components/auth/BackButton';
import DraggableBottomSheet from '../../components/DraggableBottomSheet';
import { Colors, Semantic, Tokens } from '../../theme';
import { useRegister, useSendOtp, useVerifyOtp } from '../../services/auth';

const { height } = Dimensions.get('window');

const isValid = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^(0|\+84)[3-9]\d{8}$/.test(v);

interface Errors { fullName?: string; email?: string; password?: string }
interface Props { onGoLogin?: () => void; onGoBack?: () => void }

const RegisterScreen: React.FC<Props> = ({ onGoLogin, onGoBack }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isOtpSheetVisible, setIsOtpSheetVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const { mutateAsync: registerAsync } = useRegister();
  const { mutateAsync: sendOtpAsync } = useSendOtp();
  const { mutateAsync: verifyOtpAsync } = useVerifyOtp();

  const shake = () =>
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();

  const validate = useCallback((): boolean => {
    const e: Errors = {};
    if (!fullName.trim()) e.fullName = 'Vui lòng nhập họ và tên';
    if (!email.trim()) e.email = 'Vui lòng nhập email';
    else if (!isValid(email)) e.email = 'Email không hợp lệ';
    if (!password) e.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 6) e.password = 'Tối thiểu 6 ký tự';
    setErrors(e);
    if (Object.keys(e).length) { shake(); return false; }
    return true;
  }, [fullName, email, password]);

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    setIsOtpSheetVisible(true);

    try {
      await sendOtpAsync({ email });
    } catch (error: any) {
      setIsOtpSheetVisible(false);
      Alert.alert('Lỗi', error?.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    if (otp.length !== 6) {
      Alert.alert('Lỗi', 'Mã OTP phải có 6 chữ số');
      return;
    }
    setVerifying(true);
    try {
      await verifyOtpAsync({ email, otp });
      await registerAsync({ email, password, fullName });
      setIsOtpSheetVisible(false);
      Alert.alert('Thành công', 'Tạo tài khoản thành công! Vui lòng đăng nhập.', [
        { text: 'OK', onPress: () => onGoLogin?.() }
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error?.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setVerifying(false);
    }
  };

  const clr = (f: keyof Errors) => { if (errors[f]) setErrors(e => ({ ...e, [f]: undefined })); };
  const emailValid = email.length > 0 && isValid(email);

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
            Đăng ký
          </Text>
          <Text className="mb-8 text-center font-semibold text-[14px] text-text-muted">
            Tạo tài khoản mới của bạn
          </Text>

          <Animated.View className="mb-5" style={{ transform: [{ translateX: shakeAnim }] }}>
            <AuthInput
              iconName="person-outline"
              placeholder="Họ và tên"
              value={fullName}
              onChangeText={t => { setFullName(t); clr('fullName'); }}
              error={errors.fullName}
              autoCapitalize="words"
            />
            <AuthInput
              iconName="mail-outline"
              placeholder="user@mail.com"
              value={email}
              onChangeText={t => { setEmail(t); clr('email'); }}
              error={errors.email}
              keyboardType="email-address"
              isValid={emailValid}
            />
            <AuthInput
              iconName="lock-closed-outline"
              placeholder="Mật khẩu"
              isPassword
              value={password}
              onChangeText={t => { setPassword(t); clr('password'); }}
              error={errors.password}
            />
          </Animated.View>

          <AuthButton label="Đăng ký" onPress={handleRegister} loading={loading} />

          <RememberForgotRow
            remembered={remember}
            onToggleRemember={() => setRemember(v => !v)}
            onForgotPassword={() => { }}
          />

          <SocialLoginRow
            onFacebook={() => { }}
            onGoogle={() => { }}
            onApple={() => { }}
          />

          <AuthFooterLink
            message="Bạn đã có tài khoản?  "
            linkText="Đăng nhập"
            onPress={() => onGoLogin?.()}
          />
        </ScrollView>

        <DraggableBottomSheet
          visible={isOtpSheetVisible}
          collapsedHeight={height * 0.4}
          expandedHeight={height * 0.6}
          peekHeight={0}
          initialSnap="collapsed"
          animateOnMount={true}
          enableBackdropPress={false}
        >
          <View className="px-7 pt-3">
            <Text className="mb-2 text-center font-bold text-[32px] text-text">
              Xác thực OTP
            </Text>
            <Text className="mb-8 text-center font-semibold text-[14px] text-text-muted">
              Nhập mã 6 số được gửi tới {email}
            </Text>

            <AuthInput
              iconName="key-outline"
              placeholder="Nhập mã OTP (6 số)"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />

            <View className="mt-5">
              <AuthButton label="Xác nhận & Đăng ký" onPress={handleVerifyAndRegister} loading={verifying} />
            </View>
          </View>
        </DraggableBottomSheet>
      </KeyboardAvoidingView>
    </View>
  );
};

export default RegisterScreen;
