import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../context/ToastContext';
import Colors from '../../theme/colors';
import ProfileDetailLayout, { profileDetailStyles } from '../../components/ProfileDetailLayout';

const options = [
  { key: 'vi' as const, label: 'Tiếng Việt', subtitle: 'Mặc định hiện tại' },
  { key: 'en' as const, label: 'English', subtitle: 'Bản dịch đang hoàn thiện' },
  { key: 'system' as const, label: 'Theo thiết bị', subtitle: 'Tự động đồng bộ' },
];

const LanguageSettingsScreen: React.FC<any> = ({ navigation }) => {
  const { showToast } = useToast();
  const [language, setLanguage] = useState<'vi' | 'en' | 'system'>('vi');

  return (
    <ProfileDetailLayout
      navigation={navigation}
      title="Ngôn ngữ"
      subtitle="Chọn ngôn ngữ hiển thị trong ứng dụng."
      icon="language-outline"
      color="#00838F"
      heroTitle="Ngôn ngữ phù hợp với bạn"
      heroSubtitle="EcoHabit sẽ ưu tiên ngôn ngữ bạn chọn cho toàn bộ ứng dụng."
      actionLabel="Áp dụng ngôn ngữ"
      onAction={() => showToast('Đã áp dụng lựa chọn ngôn ngữ mẫu.', 'success')}
    >
      <View style={profileDetailStyles.card}>
        <Text style={profileDetailStyles.cardTitle}>Chọn ngôn ngữ</Text>
        {options.map((option) => {
          const active = language === option.key;

          return (
            <TouchableOpacity
              key={option.key}
              style={[profileDetailStyles.optionCard, active && profileDetailStyles.optionCardActive]}
              onPress={() => setLanguage(option.key)}
            >
              <View>
                <Text style={profileDetailStyles.optionTitle}>{option.label}</Text>
                <Text style={profileDetailStyles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <Ionicons
                name={active ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={active ? '#00838F' : Colors.textMuted}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={profileDetailStyles.card}>
        <Text style={profileDetailStyles.cardTitle}>Gợi ý cho bạn</Text>
        {[
          'Một số nội dung cộng đồng có thể vẫn giữ theo ngôn ngữ gốc.',
          'Thay đổi ngôn ngữ sẽ áp dụng ngay sau khi bạn lưu thiết lập.',
        ].map((tip, index) => (
          <View key={index} style={[profileDetailStyles.tipRow, index > 0 && profileDetailStyles.tipSpacing]}>
            <Ionicons name="leaf-outline" size={16} color="#00838F" />
            <Text style={profileDetailStyles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </ProfileDetailLayout>
  );
};

export default LanguageSettingsScreen;
