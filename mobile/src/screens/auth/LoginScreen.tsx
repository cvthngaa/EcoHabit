import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView,
  Platform, Animated, Alert, Dimensions, StatusBar, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import RememberForgotRow from '../../components/auth/RememberForgotRow';
import SocialLoginRow from '../../components/auth/SocialLoginRow';
import AuthFooterLink from '../../components/auth/AuthFooterLink';
import BackButton from '../../components/auth/BackButton';
import { Colors, Semantic, Tokens } from '../../theme';
import { useLogin } from '../../services/auth';
import { saveToken } from '../../store/auth.store';

const { width, height } = Dimensions.get('window');
const TOP_H = height * 0.32;
const CURVE_HEIGHT = 186;

const isValidEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^(0|\+84)[3-9]\d{8}$/.test(v);

interface FormErrors { email?: string; password?: string }
interface Props { 
  onLogin?: () => void; 
  onGoRegister?: () => void; 
  onGoForgotPassword?: () => void;
  onGoBack?: () => void; 
}

const LoginWave = () => (
  <Svg
    width={width}
    height={CURVE_HEIGHT}
    viewBox={`0 0 ${width} ${CURVE_HEIGHT}`}
    style={{ position: 'absolute', bottom: 0, left: 0 }}
  >
    <Path
      d={`
        M 0 ${CURVE_HEIGHT * 0.78}
        C ${width * 0.12} ${CURVE_HEIGHT * 0.78},
          ${width * 0.24} ${CURVE_HEIGHT * 0.74},
          ${width * 0.38} ${CURVE_HEIGHT * 0.63}
        C ${width * 0.54} ${CURVE_HEIGHT * 0.51},
          ${width * 0.72} ${CURVE_HEIGHT * 0.2},
          ${width} ${CURVE_HEIGHT * 0.3}
        L ${width} ${CURVE_HEIGHT}
        L 0 ${CURVE_HEIGHT}
        Z
      `}
      fill={Colors.background}
    />
  </Svg>
);

const LoginScreen: React.FC<Props> = ({ onLogin, onGoRegister, onGoForgotPassword, onGoBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const { mutateAsync: loginAsync } = useLogin();

  const shake = () =>
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();

  const validate = useCallback((): boolean => {
    const e: FormErrors = {};
    if (!email.trim()) e.email = 'Vui lòng nhập email hoặc số điện thoại';
    else if (!isValidEmail(email)) e.email = 'Email hoặc số điện thoại không hợp lệ';
    if (!password) e.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 6) e.password = 'Mật khẩu tối thiểu 6 ký tự';
    setErrors(e);
    if (Object.keys(e).length) { shake(); return false; }
    return true;
  }, [email, password]);

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await loginAsync({ email, password });
      if (data.access_token || data.token) {
        await saveToken(String(data.access_token || data.token), remember);
      }
      onLogin?.();
    } catch (error: any) {
      Alert.alert('Đăng nhập thất bại', error?.response?.data?.message || 'Tài khoản hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-canvas">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View className="overflow-hidden" style={{ height: TOP_H + CURVE_HEIGHT }}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop' }}
          className="absolute inset-0"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-green-800/35" />

        <View
          className="absolute z-10"
          style={{ top: Platform.OS === 'ios' ? 56 : 44, left: Tokens.space[5] }}
        >
          <BackButton
            onPress={() => onGoBack?.()}
            color={Colors.textInverse}
            className="bg-base-canvas/20"
          />
        </View>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        style={{ marginTop: -CURVE_HEIGHT - 150 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="relative z-[5] overflow-hidden" style={{ height: CURVE_HEIGHT }}>
          <LoginWave />
          <View className="absolute right-5 top-8 z-10 h-[54px] w-16">
            <Ionicons
              name="leaf"
              size={34}
              color={Semantic.color.action.brand}
              style={{ position: 'absolute', right: 0, top: Tokens.space[2], transform: [{ rotate: '22deg' }] }}
            />
            <Ionicons
              name="leaf"
              size={26}
              color={Tokens.color.green[400]}
              style={{ position: 'absolute', left: 0, top: 0, transform: [{ rotate: '-25deg' }] }}
            />
          </View>
        </View>

        <ScrollView
          className="-mt-px flex-1 bg-canvas"
          contentContainerClassName="px-7 pb-8 pt-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text className="mb-2 text-center font-bold text-[30px] text-text">
            Chào mừng trở lại
          </Text>
          <Text className="mb-8 text-center font-semibold text-[14px] text-text-muted">
            Đăng nhập tài khoản của bạn
          </Text>

          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <AuthInput
              iconName="person-outline"
              placeholder="Email hoặc SĐT"
              value={email}
              onChangeText={t => { setEmail(t); if (errors.email) setErrors(e => ({ ...e, email: undefined })); }}
              error={errors.email}
              keyboardType="email-address"
            />
            <AuthInput
              iconName="lock-closed-outline"
              placeholder="Mật khẩu"
              isPassword
              value={password}
              onChangeText={t => { setPassword(t); if (errors.password) setErrors(e => ({ ...e, password: undefined })); }}
              error={errors.password}
            />
          </Animated.View>

          <RememberForgotRow remembered={remember} onToggleRemember={() => setRemember(v => !v)} onForgotPassword={() => onGoForgotPassword?.()} />
          <AuthButton label="Đăng nhập" onPress={handleLogin} loading={loading} />
          <SocialLoginRow />
          <AuthFooterLink message="Bạn chưa có tài khoản?  " linkText="Đăng ký" onPress={() => onGoRegister?.()} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;
