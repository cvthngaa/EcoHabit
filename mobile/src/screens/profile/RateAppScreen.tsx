import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../context/ToastContext';
import Colors from '../../theme/colors';
import ProfileDetailLayout, { profileDetailStyles } from '../../components/ProfileDetailLayout';

const rows = [
  { label: 'Điều bạn thích', value: 'Giao diện xanh, quét nhanh, đổi quà rõ ràng', icon: 'thumbs-up-outline' },
  { label: 'Điều cần góp ý', value: 'Tốc độ, nội dung, trải nghiệm trên máy yếu', icon: 'create-outline' },
  { label: 'Nơi đánh giá', value: 'App Store hoặc Google Play', icon: 'storefront-outline' },
];

const RateAppScreen: React.FC<any> = ({ navigation }) => {
  const { showToast } = useToast();

  return (
    <ProfileDetailLayout
      navigation={navigation}
      title="Đánh giá ứng dụng"
      subtitle="Gửi phản hồi để giúp EcoHabit cải thiện trải nghiệm."
      icon="star-outline"
      color={Colors.warning}
      heroTitle="Ý kiến của bạn rất quan trọng"
      heroSubtitle="Mỗi đánh giá giúp đội ngũ hiểu rõ điều gì đang hoạt động tốt và cần cải thiện."
      actionLabel="Gửi đánh giá"
      onAction={() => showToast('Cảm ơn bạn đã sẵn sàng đánh giá EcoHabit.', 'success')}
    >
      <View style={profileDetailStyles.card}>
        {rows.map((row, index) => (
          <View key={row.label} style={[profileDetailStyles.infoRow, index > 0 && profileDetailStyles.divider]}>
            <View style={[profileDetailStyles.iconBox, { backgroundColor: `${Colors.warning}16` }]}>
              <Ionicons name={row.icon as any} size={16} color={Colors.warning} />
            </View>
            <View style={profileDetailStyles.infoContent}>
              <Text style={profileDetailStyles.infoLabel}>{row.label}</Text>
              <Text style={profileDetailStyles.infoValue}>{row.value}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={profileDetailStyles.card}>
        <Text style={profileDetailStyles.cardTitle}>Mẹo đánh giá</Text>
        {[
          'Một đánh giá ngắn nhưng cụ thể sẽ hữu ích hơn rất nhiều.',
          'Nếu gặp lỗi, hãy mô tả thiết bị và bước thực hiện để đội ngũ dễ tái hiện.',
        ].map((tip, index) => (
          <View key={index} style={[profileDetailStyles.tipRow, index > 0 && profileDetailStyles.tipSpacing]}>
            <Ionicons name="leaf-outline" size={16} color={Colors.warning} />
            <Text style={profileDetailStyles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </ProfileDetailLayout>
  );
};

export default RateAppScreen;
