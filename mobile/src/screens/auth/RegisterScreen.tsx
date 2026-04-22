import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
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
import Colors from '../../theme/colors';
import { register, sendOtp, verifyOtp } from '../../services/api/auth.service';

const { width, height } = Dimensions.get('window');

const isValid = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^(0|\+84)[3-9]\d{8}$/.test(v);

interface Errors { fullName?: string; email?: string; password?: string }
interface Props { onGoLogin?: () => void }

const RegisterScreen: React.FC<Props> = ({ onGoLogin }) => {
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
    
    // 1. Hiển thị BottomSheet ngay lập tức để người dùng có thể test/chuẩn bị nhập
    setIsOtpSheetVisible(true);

    try {
      // 2. Gửi OTP ngầm
      await sendOtp(email);
    } catch (error: any) {
      setIsOtpSheetVisible(false); // Ẩn đi nếu lỗi
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
      // 2. Verify OTP
      await verifyOtp(email, otp);
      
      // 3. Tạo tài khoản
      await register(email, password, fullName);
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
    <View style={s.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header row */}
          <View style={s.headerRow}>
            <BackButton onPress={() => onGoLogin?.()} color="#2E5D3A" />
            <View style={s.leafCorner}>
              <Ionicons name="leaf" size={48} color="rgba(76,175,80,0.18)" style={{ transform: [{ rotate: '-40deg' }] }} />
              <Ionicons name="leaf" size={28} color="rgba(76,175,80,0.12)" style={{ position: 'absolute', top: 20, right: 8, transform: [{ rotate: '30deg' }] }} />
            </View>
          </View>

          {/* Title */}
          <Text style={s.title}>Đăng kí</Text>
          <Text style={s.subtitle}>Tạo tài khoản mới của bạn</Text>

          {/* Form */}
          <Animated.View style={[s.formWrap, { transform: [{ translateX: shakeAnim }] }]}>
            <AuthInput
              iconName="person-outline"
              placeholder="Họ và Tên"
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
              placeholder="••••••••"
              isPassword
              value={password}
              onChangeText={t => { setPassword(t); clr('password'); }}
              error={errors.password}
            />
          </Animated.View>

          <AuthButton label="Đăng kí" onPress={handleRegister} loading={loading} />

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

        {/* Draggable Bottom Sheet for OTP */}
        <DraggableBottomSheet
          visible={isOtpSheetVisible}
          collapsedHeight={height * 0.4}
          expandedHeight={height * 0.6}
          peekHeight={0}
          initialSnap="collapsed"
          animateOnMount={true}
          enableBackdropPress={false}
        >
          <View style={{ paddingHorizontal: 28, paddingTop: 10 }}>
            <Text style={s.title}>Xác thực OTP</Text>
            <Text style={s.subtitle}>Nhập mã 6 số được gửi tới {email}</Text>
            
            <AuthInput
              iconName="key-outline"
              placeholder="Nhập mã OTP (6 số)"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />

            <View style={{ marginTop: 20 }}>
              <AuthButton label="Xác nhận & Đăng ký" onPress={handleVerifyAndRegister} loading={verifying} />
            </View>
          </View>
        </DraggableBottomSheet>

      </KeyboardAvoidingView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: Platform.OS === 'ios' ? 60 : 48, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  leafCorner: { position: 'relative', width: 60, height: 60 },
  title: { fontSize: 32, fontWeight: '800', color: '#1B3A1E', textAlign: 'center', marginBottom: 6, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#8FA892', textAlign: 'center', marginBottom: 28, fontWeight: '500' },
  formWrap: { marginBottom: 20 },
});

export default RegisterScreen;

