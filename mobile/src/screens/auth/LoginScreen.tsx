import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
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
import { login } from '../../services/api/auth.service';
import { saveToken } from '../../store/auth.store';

const { width, height } = Dimensions.get('window');
const TOP_H = height * 0.32;

const isValidEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^(0|\+84)[3-9]\d{8}$/.test(v);

interface FormErrors { email?: string; password?: string }
interface Props { onLogin?: () => void; onGoRegister?: () => void; onGoBack?: () => void }

const LoginWave = () => (
  <Svg width={width} height={CURVE_HEIGHT} viewBox={`0 0 ${width} ${CURVE_HEIGHT}`} style={s.waveSvg}>
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
      fill="#FFFFFF"
    />
  </Svg>
);

const LoginScreen: React.FC<Props> = ({ onLogin, onGoRegister, onGoBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

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
      const data = await login(email, password);
      if (data.access_token || data.token) {
        await saveToken(data.access_token || data.token);
      }
      onLogin?.();
    } catch (error: any) {
      Alert.alert('Đăng nhập thất bại', error?.response?.data?.message || 'Tài khoản hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Photo background top */}
      <View style={s.top}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop' }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        {/* Dark overlay to make back button visible */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.2)' }]} />

        <View style={s.backWrap}>
          <BackButton onPress={() => onGoBack?.()} color="#fff" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }} />
        </View>
      </View>

      {/* White card with curved top */}
      <KeyboardAvoidingView style={s.cardWrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Broad wave transition like the reference */}
        <View style={s.curveContainer}>
          <View style={s.waveShadow} />
          <LoginWave />
          <View style={s.waveLeaf}>
            <Ionicons name="leaf" size={34} color="#5F9751" style={s.waveLeafLarge} />
            <Ionicons name="leaf" size={26} color="#78AF69" style={s.waveLeafSmall} />
          </View>
        </View>

        <ScrollView style={s.scroll} contentContainerStyle={s.scrollInner} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} bounces={false}>
          <Text style={s.title}>Chào mừng trở lại</Text>
          <Text style={s.subtitle}>Đăng nhập tài khoản của bạn</Text>
          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <AuthInput iconName="person-outline" placeholder="Email hoặc SĐT" value={email}
              onChangeText={t => { setEmail(t); if (errors.email) setErrors(e => ({ ...e, email: undefined })); }}
              error={errors.email} keyboardType="email-address" />
            <AuthInput iconName="lock-closed-outline" placeholder="Mật khẩu" isPassword value={password}
              onChangeText={t => { setPassword(t); if (errors.password) setErrors(e => ({ ...e, password: undefined })); }}
              error={errors.password} />
          </Animated.View>
          <RememberForgotRow remembered={remember} onToggleRemember={() => setRemember(v => !v)} onForgotPassword={() => { }} />
          <AuthButton label="Đăng nhập" onPress={handleLogin} loading={loading} />
          <SocialLoginRow />
          <AuthFooterLink message="Bạn chưa có tài khoản?  " linkText="Đăng ký" onPress={() => onGoRegister?.()} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const CURVE_HEIGHT = 186;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  top: { height: TOP_H + CURVE_HEIGHT, overflow: 'hidden' },
  backWrap: { position: 'absolute', top: Platform.OS === 'ios' ? 56 : 44, left: 20, zIndex: 10 },
  cardWrap: { flex: 1, marginTop: -CURVE_HEIGHT - 150 },
  curveContainer: {
    height: CURVE_HEIGHT,
    position: 'relative',
    zIndex: 5,
    overflow: 'hidden',
  },
  waveSvg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  waveShadow: {
    // position: 'absolute',
    // left: 0,
    // right: 0,
    // bottom: 6,
    // height: CURVE_HEIGHT,
    // shadowColor: '#173C21',
    // shadowOffset: { width: 0, height: -8 },
    // shadowOpacity: 0.05,
    // shadowRadius: 16,
    // elevation: 2,
  },
  waveLeaf: {
    position: 'absolute',
    top: 34,
    right: 22,
    zIndex: 10,
    width: 64,
    height: 54,
  },
  waveLeafLarge: {
    position: 'absolute',
    right: 0,
    top: 8,
    transform: [{ rotate: '22deg' }],
  },
  waveLeafSmall: {
    position: 'absolute',
    left: 0,
    top: 0,
    transform: [{ rotate: '-25deg' }],
  },
  scroll: { flex: 1, backgroundColor: '#fff', marginTop: -1 },
  scrollInner: { paddingHorizontal: 28, paddingTop: 2, paddingBottom: 30 },
  title: { fontSize: 30, fontWeight: '800', color: '#1B3A1E', textAlign: 'center', marginBottom: 6, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#8FA892', textAlign: 'center', marginBottom: 28, fontWeight: '500' },
});

export default LoginScreen;

