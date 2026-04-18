import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Animated, Image, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import InputField    from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import Colors        from '../theme/colors';
import { register } from '../services/api/auth.service';

const isValid = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^(0|\+84)[3-9]\d{8}$/.test(v);

const pwStrength = (p: string) => {
  if (!p)          return { level: 0, label: '', color: 'transparent' };
  if (p.length < 6) return { level: 1, label: 'Yếu',       color: '#EF5350' };
  if (/[A-Z]/.test(p) && /\d/.test(p) && p.length >= 8)
                   return { level: 3, label: 'Mạnh',        color: '#2E7D32' };
  return           { level: 2, label: 'Trung bình', color: '#F57F17' };
};

interface Errors { fullName?: string; email?: string; password?: string; confirm?: string }

interface Props { onGoLogin?: () => void }

const RegisterScreen: React.FC<Props> = ({ onGoLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [avatar,   setAvatar]   = useState<string | null>(null);
  const [agreed,   setAgreed]   = useState(false);
  const [errors,   setErrors]   = useState<Errors>({});
  const [loading,  setLoading]  = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const strength  = pwStrength(password);

  const shake = () =>
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5,  duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 55, useNativeDriver: true }),
    ]).start();

  const validate = useCallback((): boolean => {
    const e: Errors = {};
    if (!fullName.trim())      e.fullName = 'Vui lòng nhập họ và tên';
    if (!email.trim())         e.email    = 'Vui lòng nhập email';
    else if (!isValid(email))  e.email    = 'Email không hợp lệ';
    if (!password)             e.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 6) e.password = 'Tối thiểu 6 ký tự';
    if (!confirm)              e.confirm  = 'Vui lòng nhập lại mật khẩu';
    else if (confirm !== password) e.confirm = 'Mật khẩu không khớp';
    setErrors(e);
    if (Object.keys(e).length) { shake(); return false; }
    return true;
  }, [fullName, email, password, confirm]);

  const pickAvatar = async () => {
    const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!p.granted) { Alert.alert('Cần quyền', 'Vui lòng cấp quyền thư viện ảnh.'); return; }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!r.canceled && r.assets[0]) setAvatar(r.assets[0].uri);
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(email, password, fullName);
      Alert.alert('Thành công', 'Tạo tài khoản thành công! Vui lòng đăng nhập.', [
        { text: 'OK', onPress: () => onGoLogin?.() }
      ]);
    } catch (error: any) {
      Alert.alert('Đăng ký thất bại', error?.response?.data?.message || 'Có lỗi xảy ra trong quá trình đăng ký.');
    } finally {
      setLoading(false);
    }
  };

  const clr = (f: keyof Errors) => { if (errors[f]) setErrors(e => ({ ...e, [f]: undefined })); };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#E8F5E9', '#F1F8E9', '#FFFFFF']} style={StyleSheet.absoluteFill} />
      <View style={styles.blob}>
        <LinearGradient colors={[Colors.primaryGradientStart, Colors.primaryLight]} style={{ flex: 1 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={onGoLogin}>
            <View style={styles.backIcon}>
              <Ionicons name="arrow-back" size={20} color={Colors.primary} />
            </View>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <LinearGradient colors={[Colors.primaryGradientStart, Colors.primaryLight]} style={styles.headerIcon}>
              <Ionicons name="person-add" size={28} color={Colors.white} />
            </LinearGradient>
            <Text style={styles.title}>Tạo tài khoản</Text>
            <Text style={styles.subtitle}>Tham gia cộng đồng xanh cùng EcoHabit 🌿</Text>
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickAvatar} activeOpacity={0.85} style={styles.avatarWrap}>
              {avatar
                ? <Image source={{ uri: avatar }} style={styles.avatar} />
                : (
                  <LinearGradient colors={[Colors.surfaceLight, Colors.border]} style={styles.avatarPlaceholder}>
                    <Ionicons name="person-outline" size={38} color={Colors.primaryLight} />
                  </LinearGradient>
                )}
              <View style={styles.cameraBadge}>
                <LinearGradient colors={[Colors.primaryGradientStart, Colors.primaryLight]} style={styles.cameraGrad}>
                  <Ionicons name="camera" size={14} color={Colors.white} />
                </LinearGradient>
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Ảnh đại diện (tùy chọn)</Text>
          </View>

          {/* Form card */}
          <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
            <InputField label="Họ và tên"        iconName="person-outline"          placeholder="Nguyễn Văn A"      value={fullName} onChangeText={t => { setFullName(t); clr('fullName'); }} error={errors.fullName} autoCapitalize="words" />
            <InputField label="Email / SĐT"       iconName="mail-outline"            placeholder="example@email.com" keyboardType="email-address" value={email} onChangeText={t => { setEmail(t); clr('email'); }} error={errors.email} />
            <InputField label="Mật khẩu"          iconName="lock-closed-outline"     placeholder="Tối thiểu 6 ký tự" isPassword value={password} onChangeText={t => { setPassword(t); clr('password'); }} error={errors.password} />

            {/* Strength bar */}
            {password.length > 0 && (
              <View style={styles.strengthRow}>
                {[1, 2, 3].map(l => (
                  <View key={l} style={[styles.strengthBar, { backgroundColor: strength.level >= l ? strength.color : Colors.border }]} />
                ))}
                <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
              </View>
            )}

            <InputField label="Nhập lại mật khẩu" iconName="shield-checkmark-outline" placeholder="Xác nhận mật khẩu"  isPassword value={confirm}  onChangeText={t => { setConfirm(t);  clr('confirm');   }} error={errors.confirm} />

            {/* Terms */}
            <TouchableOpacity style={styles.terms} onPress={() => setAgreed(v => !v)} activeOpacity={0.7}>
              <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
                {agreed && <Ionicons name="checkmark" size={12} color={Colors.white} />}
              </View>
              <Text style={styles.termsText}>
                Tôi đồng ý với{' '}
                <Text style={styles.termsLink}>Điều khoản sử dụng</Text> và{' '}
                <Text style={styles.termsLink}>Chính sách bảo mật</Text>
              </Text>
            </TouchableOpacity>

            <PrimaryButton label="Tạo tài khoản" onPress={handleRegister} loading={loading} disabled={!agreed} />

            <View style={styles.footer}>
              <Text style={styles.footerTxt}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={onGoLogin}>
                <Text style={styles.footerLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Eco pledge */}
          <LinearGradient colors={['#E8F5E9', '#C8E6C9']} style={styles.pledge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="leaf" size={14} color={Colors.primary} />
            <Text style={styles.pledgeText}>Mỗi thành viên mới = 1 cây xanh được trồng 🌳</Text>
          </LinearGradient>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.offWhite },
  blob: { position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: 90, overflow: 'hidden', opacity: 0.1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 52, paddingBottom: 36 },

  backBtn:  { marginBottom: 18 },
  backIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },

  header: { alignItems: 'center', marginBottom: 22 },
  headerIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12, elevation: 10, shadowColor: Colors.primaryGradientStart, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12 },
  title:    { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3, marginBottom: 4 },
  subtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  avatarSection: { alignItems: 'center', marginBottom: 22 },
  avatarWrap: { position: 'relative', marginBottom: 8 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: Colors.primaryLight },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, borderRadius: 14, overflow: 'hidden', borderWidth: 2, borderColor: Colors.white },
  cameraGrad: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  avatarHint: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },

  card: { backgroundColor: Colors.white, borderRadius: 28, padding: 24, elevation: 8, shadowColor: '#2E7D32', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24 },

  strengthRow:   { flexDirection: 'row', alignItems: 'center', marginTop: -8, marginBottom: 14, gap: 5 },
  strengthBar:   { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: '600' },

  terms: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 10 },
  checkbox:    { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxOn:  { backgroundColor: Colors.primary, borderColor: Colors.primary },
  termsText:   { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  termsLink:   { color: Colors.primary, fontWeight: '600' },

  footer:    { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  footerTxt: { fontSize: 13, color: Colors.textSecondary },
  footerLink:{ fontSize: 13, color: Colors.primary, fontWeight: '700' },

  pledge: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, gap: 8, marginTop: 18 },
  pledgeText: { fontSize: 13, color: Colors.primary, fontWeight: '500', flex: 1 },
});

export default RegisterScreen;
