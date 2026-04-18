import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import SocialButton from '../components/SocialButton';
import Divider from '../components/Divider';
import Colors from '../theme/colors';
import { login } from '../services/api/auth.service';
import { saveToken } from '../store/auth.store';

// ── Validation helper ─────────────────────────────────────────────────────────

const isValidEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^(0|\+84)[3-9]\d{8}$/.test(v);

// ── Component ─────────────────────────────────────────────────────────────────

interface FormErrors {
  email?: string;
  password?: string;
}

interface Props {
  onLogin?: () => void;
  onGoRegister?: () => void;
}

const LoginScreen: React.FC<Props> = ({ onLogin, onGoRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () =>
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();

  // ── Validation (local only, chưa có API) ─────────────────────────────────
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

  // ── Submit ─────────────────────────────────────────────────────────────
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
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Nền gradient nhẹ */}
      <LinearGradient
        colors={['#E8F5E9', '#F1F8E9', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
      />

      {/* Blob trang trí góc trên */}
      <View style={styles.blob}>
        <LinearGradient
          colors={[Colors.primaryGradientStart, Colors.primaryLight]}
          style={{ flex: 1 }}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo ─────────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <LinearGradient
                colors={[Colors.primaryGradientStart, Colors.primaryLight]}
                style={styles.logo}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="leaf" size={36} color={Colors.white} />
              </LinearGradient>
              {/* Badge lá nhỏ */}
              <View style={styles.leafBadge}>
                <Ionicons name="leaf" size={13} color={Colors.primaryLight} />
              </View>
            </View>
            <Text style={styles.appName}>EcoHabit</Text>
            <Text style={styles.tagline}>Sống xanh · Vì tương lai</Text>
          </View>

          {/* ── Form card ────────────────────────────────────────────────── */}
          <Animated.View
            style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}
          >
            <Text style={styles.title}>Chào mừng trở lại 👋</Text>
            <Text style={styles.subtitle}>Đăng nhập để tiếp tục hành trình xanh</Text>

            <InputField
              label="Email hoặc Số điện thoại"
              iconName="mail-outline"
              placeholder="example@email.com"
              keyboardType="email-address"
              value={email}
              onChangeText={t => {
                setEmail(t);
                if (errors.email) setErrors(e => ({ ...e, email: undefined }));
              }}
              error={errors.email}
            />

            <InputField
              label="Mật khẩu"
              iconName="lock-closed-outline"
              placeholder="Nhập mật khẩu của bạn"
              isPassword
              value={password}
              onChangeText={t => {
                setPassword(t);
                if (errors.password) setErrors(e => ({ ...e, password: undefined }));
              }}
              error={errors.password}
            />

            {/* Quên mật khẩu */}
            <TouchableOpacity style={styles.forgot} onPress={() => { }}>
              <Text style={styles.forgotText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <PrimaryButton label="Đăng nhập" onPress={handleLogin} loading={loading} />

            <Divider label="hoặc đăng nhập với" />

            <SocialButton provider="google" onPress={() => { }} />
            <SocialButton provider="facebook" onPress={() => { }} />

            {/* Link Đăng ký */}
            <View style={styles.footer}>
              <Text style={styles.footerTxt}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={onGoRegister}>
                <Text style={styles.footerLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Eco message */}
          <View style={styles.eco}>
            <Ionicons name="earth-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.ecoText}>Mỗi hành động nhỏ tạo nên thay đổi lớn 🌱</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.offWhite },

  blob: {
    position: 'absolute',
    top: -80, right: -80,
    width: 220, height: 220,
    borderRadius: 110,
    overflow: 'hidden',
    opacity: 0.12,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 32,
  },

  // Header / logo
  header: { alignItems: 'center', marginBottom: 28 },
  logoWrap: { position: 'relative', marginBottom: 12 },
  logo: {
    width: 80, height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryGradientStart,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  leafBadge: {
    position: 'absolute',
    bottom: -4, right: -4,
    width: 22, height: 22,
    borderRadius: 11,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  appName: { fontSize: 28, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },
  tagline: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 28,
    padding: 24,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6, letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 22, lineHeight: 20 },

  // Forgot
  forgot: { alignSelf: 'flex-end', marginTop: -4, marginBottom: 18 },
  forgotText: { fontSize: 13, color: Colors.primaryLight, fontWeight: '600' },

  // Footer link
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerTxt: { fontSize: 13, color: Colors.textSecondary },
  footerLink: { fontSize: 13, color: Colors.primary, fontWeight: '700' },

  // Eco
  eco: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, gap: 6 },
  ecoText: { fontSize: 11, color: Colors.textMuted },
});

export default LoginScreen;
