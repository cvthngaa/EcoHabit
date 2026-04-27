import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView,
  Platform, Animated, Alert, Dimensions, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import BackButton from '../../components/auth/BackButton';
import DraggableBottomSheet from '../../components/DraggableBottomSheet';
import { Colors, FontFamily, Semantic, Tokens } from '../../theme';
import { sendPasswordResetOtp, verifyOtp } from '../../services/api/auth.service';

const { height } = Dimensions.get('window');

const isValid = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^(0|\+84)[3-9]\d{8}$/.test(v);

interface Props { 
  onGoBack?: () => void;
  onVerified?: (email: string) => void;
}

const ForgotPasswordScreen: React.FC<Props> = ({ onGoBack, onVerified }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
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
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      shake();
      return false;
    } else if (!isValid(email)) {
      setError('Email không hợp lệ');
      shake();
      return false;
    }
    setError(undefined);
    return true;
  }, [email]);

  const handleSendOtp = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      await sendPasswordResetOtp(email);
      setIsOtpSheetVisible(true);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert('Lỗi', 'Mã OTP phải có 6 chữ số');
      return;
    }
    setVerifying(true);
    try {
      await verifyOtp(email, otp);
      setIsOtpSheetVisible(false);
      onVerified?.(email);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Có lỗi xảy ra khi xác thực OTP.');
    } finally {
      setVerifying(false);
    }
  };

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
            Quên mật khẩu
          </Text>
          <Text className="mb-8 text-center font-semibold text-[14px] leading-5 text-text-muted">
            Đừng lo lắng! Vui lòng nhập địa chỉ email được liên kết với tài khoản của bạn.
          </Text>

          <Animated.View className="mb-8" style={{ transform: [{ translateX: shakeAnim }] }}>
            <AuthInput
              iconName="mail-outline"
              placeholder="Nhập email của bạn"
              value={email}
              onChangeText={t => { setEmail(t); setError(undefined); }}
              error={error}
              keyboardType="email-address"
              isValid={emailValid}
            />
          </Animated.View>

          <AuthButton label="Gửi mã OTP" onPress={handleSendOtp} loading={loading} />
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
            <Text className="mb-8 text-center font-semibold text-[14px] leading-5 text-text-muted">
              Vui lòng nhập mã 6 số được gửi tới email {email} của bạn.
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
              <AuthButton label="Xác thực mã" onPress={handleVerifyOtp} loading={verifying} />
            </View>
          </View>
        </DraggableBottomSheet>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ForgotPasswordScreen;
