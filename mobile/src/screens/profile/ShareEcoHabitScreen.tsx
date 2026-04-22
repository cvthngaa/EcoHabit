import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../context/ToastContext';
import Colors from '../../theme/colors';
import ProfileDetailLayout, { profileDetailStyles } from '../../components/ProfileDetailLayout';

const rows = [
  { label: 'Lời mời nhanh', value: 'Cùng mình dùng EcoHabit để sống xanh hơn mỗi ngày nhé!', icon: 'paper-plane-outline' },
  { label: 'Thưởng giới thiệu', value: 'Tính năng mời bạn bè đang được hoàn thiện', icon: 'people-outline' },
  { label: 'Kênh gợi ý', value: 'Zalo, Messenger, Facebook hoặc sao chép liên kết', icon: 'link-outline' },
];

const ShareEcoHabitScreen: React.FC<any> = ({ navigation }) => {
  const { showToast } = useToast();

  return (
    <ProfileDetailLayout
      navigation={navigation}
      title="Chia sẻ EcoHabit"
      subtitle="Mời bạn bè cùng tham gia sống xanh với EcoHabit."
      icon="share-social-outline"
      color={Colors.primary}
      heroTitle="Lan tỏa thói quen xanh"
      heroSubtitle="Chia sẻ ứng dụng để bạn bè cùng quét rác, tích điểm và đổi quà."
      actionLabel="Chia sẻ ngay"
      onAction={() => showToast('Nội dung chia sẻ mẫu đã sẵn sàng.', 'success')}
    >
      <View style={profileDetailStyles.card}>
        {rows.map((row, index) => (
          <View key={row.label} style={[profileDetailStyles.infoRow, index > 0 && profileDetailStyles.divider]}>
            <View style={[profileDetailStyles.iconBox, { backgroundColor: `${Colors.primary}16` }]}>
              <Ionicons name={row.icon as any} size={16} color={Colors.primary} />
            </View>
            <View style={profileDetailStyles.infoContent}>
              <Text style={profileDetailStyles.infoLabel}>{row.label}</Text>
              <Text style={profileDetailStyles.infoValue}>{row.value}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={profileDetailStyles.card}>
        <Text style={profileDetailStyles.cardTitle}>Gợi ý chia sẻ</Text>
        {[
          'Chia sẻ đúng nhóm bạn quan tâm đến môi trường sẽ hiệu quả hơn.',
          'Bạn có thể dùng lời mời ngắn gọn và thực tế để tăng tỉ lệ tham gia.',
        ].map((tip, index) => (
          <View key={index} style={[profileDetailStyles.tipRow, index > 0 && profileDetailStyles.tipSpacing]}>
            <Ionicons name="leaf-outline" size={16} color={Colors.primary} />
            <Text style={profileDetailStyles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </ProfileDetailLayout>
  );
};

export default ShareEcoHabitScreen;
