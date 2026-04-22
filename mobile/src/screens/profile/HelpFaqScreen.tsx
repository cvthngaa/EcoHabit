import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../context/ToastContext';
import Colors from '../../theme/colors';
import ProfileDetailLayout, { profileDetailStyles } from '../../components/ProfileDetailLayout';

const items = [
  { label: 'Cách tích điểm', value: 'Quét rác, làm quiz và hoàn thành nhiệm vụ', icon: 'star-outline' },
  { label: 'Cách đổi quà', value: 'Vào mục Đổi quà và xác nhận phần thưởng', icon: 'gift-outline' },
  { label: 'Lỗi quét mã', value: 'Kiểm tra camera, ánh sáng và kết nối mạng', icon: 'scan-outline' },
  { label: 'Liên hệ hỗ trợ', value: 'Phản hồi trong giờ hành chính', icon: 'chatbubble-ellipses-outline' },
];

const HelpFaqScreen: React.FC<any> = ({ navigation }) => {
  const { showToast } = useToast();

  return (
    <ProfileDetailLayout
      navigation={navigation}
      title="Trợ giúp & FAQ"
      subtitle="Tổng hợp câu hỏi thường gặp và hướng dẫn sử dụng."
      icon="help-circle-outline"
      color="#546E7A"
      heroTitle="Trợ giúp nhanh trong vài chạm"
      heroSubtitle="Tìm câu trả lời cho các vấn đề phổ biến trước khi liên hệ hỗ trợ."
      actionLabel="Liên hệ hỗ trợ"
      onAction={() => showToast('Đã ghi nhận yêu cầu hỗ trợ mẫu.', 'success')}
    >
      <View style={profileDetailStyles.card}>
        {items.map((row, index) => (
          <View key={row.label} style={[profileDetailStyles.infoRow, index > 0 && profileDetailStyles.divider]}>
            <View style={[profileDetailStyles.iconBox, { backgroundColor: 'rgba(84,110,122,0.12)' }]}>
              <Ionicons name={row.icon as any} size={16} color="#546E7A" />
            </View>
            <View style={profileDetailStyles.infoContent}>
              <Text style={profileDetailStyles.infoLabel}>{row.label}</Text>
              <Text style={profileDetailStyles.infoValue}>{row.value}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={profileDetailStyles.card}>
        <Text style={profileDetailStyles.cardTitle}>Mẹo hỗ trợ</Text>
        {[
          'Bạn nên cập nhật ứng dụng lên bản mới nhất trước khi gửi báo lỗi.',
          'Ảnh chụp màn hình sẽ giúp đội hỗ trợ xử lý vấn đề nhanh hơn.',
        ].map((tip, index) => (
          <View key={index} style={[profileDetailStyles.tipRow, index > 0 && profileDetailStyles.tipSpacing]}>
            <Ionicons name="leaf-outline" size={16} color="#546E7A" />
            <Text style={profileDetailStyles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </ProfileDetailLayout>
  );
};

export default HelpFaqScreen;
