import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import CustomDatePicker from '../../components/CustomDatePicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../../context/ToastContext';
import Colors from '../../theme/colors';
import { useGetProfile, useUpdateProfile } from '../../services/auth';
import { useUploadImage } from '../../services/uploads';
import SharedHeaderBackground from '../../components/SharedHeaderBackground';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import AuthInput from '../../components/auth/AuthInput';

const PersonalInfoScreen: React.FC<any> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { logout } = useAuth();
  const { appearance } = useSettings();

  const { data: profile, isLoading, refetch } = useGetProfile();
  const updateProfile = useUpdateProfile();
  const uploadImage = useUploadImage();

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setAvatarUrl(profile.avatarUrl || null);
      setDateOfBirth(profile.dateOfBirth ? new Date(profile.dateOfBirth) : null);
      setLocalAvatarUri(null);
    }
  }, [profile]);

  const isSaving = updateProfile.isPending || uploadImage.isPending;
  const avatarPreview = localAvatarUri || avatarUrl;

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast('Cần quyền thư viện ảnh để chọn ảnh đại diện.', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setLocalAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const trimmedName = fullName.trim();

    if (!trimmedName) {
      showToast('Vui lòng nhập họ và tên.', 'error');
      return;
    }

    try {
      let nextAvatarUrl = avatarUrl;

      if (localAvatarUri) {
        const uploadResult = await uploadImage.mutateAsync(localAvatarUri);
        nextAvatarUrl = uploadResult.url;
      }

      await updateProfile.mutateAsync({
        fullName: trimmedName,
        avatarUrl: nextAvatarUrl || null,
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : null,
      });
      await refetch();
      showToast('Đã lưu thông tin.', 'success');
      navigation.goBack();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Cập nhật thất bại, vui lòng thử lại.';
      showToast(Array.isArray(message) ? message[0] : message, 'error');
    }
  };

  const hasChanges = (fullName.trim() !== (profile?.fullName || '')) || localAvatarUri !== null || (dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : null) !== (profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : null);

  return (
    <View className={`flex-1 ${appearance === 'nature' ? 'bg-transparent' : 'bg-[#F9FAFB]'}`}>
      <SharedHeaderBackground className="absolute top-0 left-0 right-0 h-[220px]" />

      <View style={{ paddingTop: insets.top + 10 }} className="px-5 pb-4 flex-row items-center justify-between z-10">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center bg-white/20 rounded-xl"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#3A3A3A" />
        </TouchableOpacity>

        <Text className="text-lg font-bold text-[#3A3A3A]">Hồ sơ cá nhân</Text>

        {hasChanges ? (
          <TouchableOpacity
            className="w-10 h-10 bg-white rounded-full items-center justify-center"
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Ionicons name="save-outline" size={20} color="#3A3A3A" />
            )}
          </TouchableOpacity>
        ) : (
          <View className="w-10" />
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 30, flexGrow: 1 }}
          className="flex-1 z-10"
        >
          <View className="items-center z-20 mt-4">
            <View className="relative">
              <View className="w-[110px] h-[110px] rounded-full border-4 border-white bg-gray-200 items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <Image source={{ uri: avatarPreview }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <Text className="text-4xl font-bold text-gray-400">
                    {profile?.fullName?.charAt(0).toUpperCase() || '?'}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                className="absolute bottom-0 right-1 w-8 h-8 bg-primary rounded-full items-center justify-center border-2 border-white"
                onPress={handlePickAvatar}
              >
                <Ionicons name="pencil" size={14} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View className={`${appearance === 'nature' ? 'bg-white/90' : 'bg-white'} rounded-t-[36px] px-6 pt-16 pb-8 mt-[-55px] flex-1 min-h-[500px]`}>

            <View className="flex-row items-center justify-between py-6 border-b border-[#F3F4F6]">
              <Text className="text-[#9CA3AF] font-bold text-[14px]">Họ và tên</Text>
              <View className="flex-row items-center flex-1 justify-end ml-4">
                {isEditingName ? (
                  <TextInput
                    ref={nameInputRef}
                    className="text-[#1F2937] font-bold text-[14px] text-right flex-1 mr-2"
                    value={fullName}
                    onChangeText={setFullName}
                    onBlur={() => setIsEditingName(false)}
                    autoFocus
                  />
                ) : (
                  <Text className="text-[#1F2937] font-bold text-[14px] mr-2 flex-shrink" numberOfLines={1}>
                    {fullName || 'Chưa cập nhật'}
                  </Text>
                )}
                {!isEditingName && (
                  <TouchableOpacity onPress={() => setIsEditingName(true)}>
                    <Ionicons name="pencil-outline" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View className="flex-row items-center justify-between py-6 border-b border-[#F3F4F6]">
              <Text className="text-[#9CA3AF] font-bold text-[14px]">Email</Text>
              <View className="flex-row items-center flex-1 justify-end ml-4">
                <Text className="text-[#1F2937] font-bold text-[14px] mr-2 flex-shrink" numberOfLines={1}>
                  {profile?.email || 'Chưa cập nhật'}
                </Text>
                <View style={{ width: 16 }} />
              </View>
            </View>

            <TouchableOpacity
              className="flex-row items-center justify-between py-6 border-b border-[#F3F4F6]"
              onPress={() => setShowDatePicker(true)}
            >
              <Text className="text-[#9CA3AF] font-bold text-[14px]">Ngày sinh</Text>
              <View className="flex-row items-center flex-1 justify-end ml-4">
                <Text className="text-[#1F2937] font-bold text-[14px] mr-2 flex-shrink" numberOfLines={1}>
                  {dateOfBirth ? dateOfBirth.toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                </Text>
                <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            <CustomDatePicker
              visible={showDatePicker}
              onClose={() => setShowDatePicker(false)}
              date={dateOfBirth}
              maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
              onConfirm={(selectedDate) => {
                setDateOfBirth(selectedDate);
              }}
            />



            <TouchableOpacity
              style={{ backgroundColor: Colors.primary }}
              className="rounded-full py-4 flex-row items-center justify-center mb-4 mt-auto"
              onPress={() => navigation.navigate('PrivacySecurity')}
            >
              <Text className="text-white font-bold mr-2 text-[15px]">Đổi mật khẩu</Text>
              <Ionicons name="lock-closed" size={16} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white border border-[#FF4D4D] rounded-full py-4 flex-row items-center justify-center"
              onPress={() => logout()}
            >
              <Text className="text-[#FF4D4D] font-bold mr-2 text-[15px]">Đăng xuất</Text>
              <Ionicons name="log-out-outline" size={18} color="#FF4D4D" />
            </TouchableOpacity>

          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default PersonalInfoScreen;
