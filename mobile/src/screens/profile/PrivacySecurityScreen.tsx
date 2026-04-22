import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../context/ToastContext';
import Colors from '../../theme/colors';
import ProfileDetailLayout, { profileDetailStyles } from '../../components/ProfileDetailLayout';

const infoRows = [
  { label: 'Đổi mật khẩu', value: 'Khuyến nghị cập nhật mật khẩu định kỳ', icon: 'key-outline' },
  { label: 'Phiên đăng nhập', value: 'Kiểm tra thiết bị đã đăng nhập gần đây', icon: 'phone-portrait-outline' },
  { label: 'Quyền dữ liệu', value: 'Quản lý dữ liệu vị trí và hành vi sử dụng', icon: 'document-text-outline' },
  { label: 'Xác thực bổ sung', value: 'Tính năng sẽ có trong bản cập nhật tới', icon: 'lock-closed-outline' },
];

const tips = [
  'Không chia sẻ mã xác thực hoặc thông tin đăng nhập với người khác.',
  'Hãy đăng xuất khỏi các thiết bị cũ nếu bạn không còn sử dụng.',
];

const PrivacySecurityScreen: React.FC<any> = ({ navigation }) => {
  const { showToast } = useToast();

  return (
    <ProfileDetailLayout
      navigation={navigation}
      title="Bảo mật & quyền riêng tư"
      subtitle="Theo dõi quyền truy cập và các lớp bảo vệ tài khoản."
      icon="shield-checkmark-outline"
      color="#6A1B9A"
      heroTitle="Tài khoản an toàn hơn mỗi ngày"
      heroSubtitle="Kiểm soát quyền riêng tư, phiên đăng nhập và bảo mật dữ liệu cá nhân."
      actionLabel="Kiểm tra bảo mật"
      onAction={() => showToast('Đã mở kiểm tra bảo mật mẫu.', 'success')}
    >
      <View style={profileDetailStyles.card}>
        {infoRows.map((row, index) => (
          <View key={row.label} style={[profileDetailStyles.infoRow, index > 0 && profileDetailStyles.divider]}>
            <View style={[profileDetailStyles.iconBox, { backgroundColor: 'rgba(106,27,154,0.12)' }]}>
              <Ionicons name={row.icon as any} size={16} color="#6A1B9A" />
            </View>
            <View style={profileDetailStyles.infoContent}>
              <Text style={profileDetailStyles.infoLabel}>{row.label}</Text>
              <Text style={profileDetailStyles.infoValue}>{row.value}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={profileDetailStyles.card}>
        <Text style={profileDetailStyles.cardTitle}>Lưu ý an toàn</Text>
        {tips.map((tip, index) => (
          <View key={index} style={[profileDetailStyles.tipRow, index > 0 && profileDetailStyles.tipSpacing]}>
            <Ionicons name="leaf-outline" size={16} color="#6A1B9A" />
            <Text style={profileDetailStyles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </ProfileDetailLayout>
  );
};

export default PrivacySecurityScreen;
