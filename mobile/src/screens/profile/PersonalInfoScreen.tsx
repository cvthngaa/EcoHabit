import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../context/ToastContext';
import Colors from '../../theme/colors';
import ProfileDetailLayout, { profileDetailStyles } from '../../components/ProfileDetailLayout';

const infoRows = [
  { label: 'Họ và tên', value: 'Đồng bộ từ tài khoản đăng nhập', icon: 'person-outline' },
  { label: 'Email', value: 'Dùng để nhận thông báo và khôi phục tài khoản', icon: 'mail-outline' },
  { label: 'Số điện thoại', value: 'Thêm để xác thực và nhận hỗ trợ nhanh hơn', icon: 'call-outline' },
  { label: 'Ảnh đại diện', value: 'Bạn có thể đổi ảnh ở phiên bản tiếp theo', icon: 'image-outline' },
];

const tips = [
  'Giữ thông tin hồ sơ chính xác để EcoHabit gợi ý hoạt động phù hợp hơn.',
  'Email và số điện thoại giúp bảo vệ tài khoản tốt hơn khi cần khôi phục.',
];

const PersonalInfoScreen: React.FC<any> = ({ navigation }) => {
  const { showToast } = useToast();

  return (
    <ProfileDetailLayout
      navigation={navigation}
      title="Thông tin cá nhân"
      subtitle="Quản lý hồ sơ và dữ liệu tài khoản của bạn."
      icon="person-outline"
      color={Colors.primary}
      heroTitle="Hồ sơ EcoHabit"
      heroSubtitle="Cập nhật thông tin để cá nhân hóa trải nghiệm xanh mỗi ngày."
      actionLabel="Cập nhật sau"
      onAction={() => showToast('Trang hồ sơ chi tiết đang ở chế độ minh họa.', 'success')}
    >
      <View style={profileDetailStyles.card}>
        <Text style={profileDetailStyles.cardTitle}>Thông tin chính</Text>
        {infoRows.map((row, index) => (
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
        <Text style={profileDetailStyles.cardTitle}>Gợi ý cho bạn</Text>
        {tips.map((tip, index) => (
          <View key={index} style={[profileDetailStyles.tipRow, index > 0 && profileDetailStyles.tipSpacing]}>
            <Ionicons name="leaf-outline" size={16} color={Colors.primary} />
            <Text style={profileDetailStyles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </ProfileDetailLayout>
  );
};

export default PersonalInfoScreen;
