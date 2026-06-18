import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../../context/ToastContext';
import Colors from '../../theme/colors';
import SharedHeaderBackground from '../../components/SharedHeaderBackground';
import AuthInput from '../../components/auth/AuthInput';
import { useChangePassword, useVerifyOtp, useGetProfile } from '../../services/auth';
import { useSendChangePasswordOtp } from '../../services/auth/use-send-change-password-otp';
import { useSettings } from '../../context/SettingsContext';
import DraggableBottomSheet from '../../components/DraggableBottomSheet';

const { height } = Dimensions.get('window');

const tips = [
  'Mật khẩu nên chứa ít nhất 6 ký tự, bao gồm chữ cái và số.',
  'Không sử dụng mật khẩu dễ đoán như ngày sinh hay tên của bạn.',
  'Tránh dùng chung một mật khẩu cho nhiều ứng dụng khác nhau.'
];

const PrivacySecurityScreen: React.FC<any> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { data: profile } = useGetProfile();
  const { appearance } = useSettings();
  const changePassword = useChangePassword();
  const sendOtp = useSendChangePasswordOtp();
  const verifyOtp = useVerifyOtp();

  const [isOtpSheetVisible, setIsOtpSheetVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');

  const handleNextStep = () => {
    if (!oldPassword) {
      showToast('Vui lòng nhập mật khẩu hiện tại.', 'warning');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự.', 'warning');
      return;
    }

    sendOtp.mutate({ oldPassword }, {
      onSuccess: () => {
        showToast('Mã OTP đã được gửi đến email của bạn.', 'success');
        setIsOtpSheetVisible(true);
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng thử lại sau.';
        showToast(Array.isArray(message) ? message[0] : message, 'error');
      }
    });
  };

  const handleConfirmOtp = () => {
    if (!otp || otp.length !== 6) {
      showToast('Vui lòng nhập mã OTP gồm 6 chữ số.', 'warning');
      return;
    }
    if (!profile?.email) {
      showToast('Không tìm thấy thông tin email.', 'error');
      return;
    }

    verifyOtp.mutate(
      { email: profile.email, otp },
      {
        onSuccess: () => {
          changePassword.mutate(
            { oldPassword, newPassword },
            {
              onSuccess: () => {
                showToast('Đổi mật khẩu thành công.', 'success');
                setOldPassword('');
                setNewPassword('');
                setOtp('');
                setIsOtpSheetVisible(false);
                navigation.goBack();
              },
              onError: (error: any) => {
                const message = error?.response?.data?.message || 'Đổi mật khẩu thất bại.';
                showToast(Array.isArray(message) ? message[0] : message, 'error');
              }
            }
          );
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message || 'Mã OTP không hợp lệ.';
          showToast(Array.isArray(message) ? message[0] : message, 'error');
        }
      }
    );
  };

  const isPending = sendOtp.isPending || verifyOtp.isPending || changePassword.isPending;

  return (
    <View className={`flex-1 ${appearance === 'nature' ? 'bg-transparent' : 'bg-[#F9FAFB]'}`}>
      <SharedHeaderBackground className="absolute top-0 left-0 right-0 h-[340px]" />

      <View style={{ paddingTop: insets.top + 10 }} className="px-5 pb-4 flex-row items-center justify-between z-10">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center bg-white/20 rounded-xl"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#3A3A3A" />
        </TouchableOpacity>

        <Text className="text-lg font-bold text-[#3A3A3A]">Đổi mật khẩu</Text>

        <View className="w-10" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 30, flexGrow: 1 }}
        className="flex-1 z-10"
      >
        <View className="items-center z-20 mt-4 mb-6">
          <View className="relative w-[180px] h-[180px]">
            <Image source={require('../../../assets/Reset password-amico.png')} className="w-full h-full" resizeMode="contain" />
          </View>
        </View>

        <View className={`${appearance === 'nature' ? 'bg-white/90' : 'bg-white'} rounded-t-[36px] px-6 pt-12 pb-8 flex-1 min-h-[500px]`}>

          <Text className="text-2xl font-black text-[#3A3A3A] mb-2 text-center">
            Thiết lập mật khẩu mới
          </Text>
          <Text className="text-[#6B7280] text-center mb-8 px-4 leading-5">
            Nhập mật khẩu hiện tại và mật khẩu mới để thay đổi.
          </Text>

          <View>
            <View className="mb-2">
              <AuthInput
                iconName="lock-closed-outline"
                placeholder="Nhập mật khẩu hiện tại"
                isPassword
                value={oldPassword}
                onChangeText={setOldPassword}
              />
            </View>
            <View className="mb-4">
              <AuthInput
                iconName="key-outline"
                placeholder="Nhập mật khẩu mới"
                isPassword
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>
          </View>

          <TouchableOpacity
            style={{ backgroundColor: Colors.primary }}
            className="rounded-full py-4 flex-row items-center justify-center shadow-lg shadow-black/10 mb-8 mt-4"
            onPress={handleNextStep}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Text className="text-white font-bold mr-2 text-[15px]">
                  Tiếp tục
                </Text>
                <Ionicons name="arrow-forward" size={18} color="white" />
              </>
            )}
          </TouchableOpacity>

          <View className="bg-[#F9FAFB] rounded-2xl p-5 border border-[#F3F4F6]">
            <View className="flex-row items-center mb-3">
              <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
              <Text className="font-bold text-[#3A3A3A] ml-2">Lưu ý an toàn</Text>
            </View>
            {tips.map((tip, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <View className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 mr-2" />
                <Text className="text-sm text-[#6B7280] flex-1 leading-5">{tip}</Text>
              </View>
            ))}
          </View>

        </View>
      </ScrollView>

      <View className="absolute inset-0 z-50 elevation-5" pointerEvents="box-none">
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
            <Text className="mb-2 text-center font-bold text-[32px] text-[#3A3A3A]">
              Xác thực OTP
            </Text>
            <Text className="mb-8 text-center font-semibold text-[14px] text-[#6B7280]">
              Nhập mã 6 số được gửi tới {profile?.email}
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
              <TouchableOpacity
                style={{ backgroundColor: Colors.primary }}
                className="rounded-full py-4 flex-row items-center justify-center shadow-lg shadow-black/10"
                onPress={handleConfirmOtp}
                disabled={isPending}
              >
                {isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Text className="text-white font-bold mr-2 text-[15px]">
                      Xác nhận đổi mật khẩu
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="white" />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="mt-4 py-3 items-center justify-center"
                onPress={() => setIsOtpSheetVisible(false)}
              >
                <Text className="text-[#6B7280] font-bold">Hủy bỏ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </DraggableBottomSheet>
      </View>

    </View>
  );
};

export default PrivacySecurityScreen;
