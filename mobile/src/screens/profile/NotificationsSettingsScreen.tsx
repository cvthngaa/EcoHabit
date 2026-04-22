import React, { useState } from 'react';
import { View, Text, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../context/ToastContext';
import Colors from '../../theme/colors';
import ProfileDetailLayout, { profileDetailStyles } from '../../components/ProfileDetailLayout';

const NotificationsSettingsScreen: React.FC<any> = ({ navigation }) => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState({
    dailyMission: true,
    rewardAlert: true,
    nearbyPoints: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ProfileDetailLayout
      navigation={navigation}
      title="Thông báo"
      subtitle="Tùy chỉnh các loại thông báo bạn muốn nhận."
      icon="notifications-outline"
      color={Colors.info}
      heroTitle="Nhắc bạn sống xanh đúng lúc"
      heroSubtitle="Nhận thông báo về nhiệm vụ, quà thưởng và điểm thu gom gần bạn."
      actionLabel="Lưu thiết lập"
      onAction={() => showToast('Đã lưu thiết lập thông báo mẫu.', 'success')}
    >
      <View style={profileDetailStyles.card}>
        <Text style={profileDetailStyles.cardTitle}>Loại thông báo</Text>
        {[
          { key: 'dailyMission' as const, label: 'Nhiệm vụ hằng ngày' },
          { key: 'rewardAlert' as const, label: 'Ưu đãi đổi quà' },
          { key: 'nearbyPoints' as const, label: 'Điểm thu gom gần bạn' },
        ].map((item, index) => (
          <View key={item.key} style={[profileDetailStyles.toggleRow, index > 0 && profileDetailStyles.divider]}>
            <Text style={profileDetailStyles.toggleText}>{item.label}</Text>
            <Switch
              value={settings[item.key]}
              onValueChange={() => toggleSetting(item.key)}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={Colors.white}
            />
          </View>
        ))}
      </View>

      <View style={profileDetailStyles.card}>
        <Text style={profileDetailStyles.cardTitle}>Gợi ý cho bạn</Text>
        {[
          'Bạn có thể tắt thông báo không quan trọng nhưng vẫn giữ thông báo nhiệm vụ.',
          'Thông báo quà thưởng giúp bạn không bỏ lỡ ưu đãi theo điểm xanh.',
        ].map((tip, index) => (
          <View key={index} style={[profileDetailStyles.tipRow, index > 0 && profileDetailStyles.tipSpacing]}>
            <Ionicons name="leaf-outline" size={16} color={Colors.info} />
            <Text style={profileDetailStyles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </ProfileDetailLayout>
  );
};

export default NotificationsSettingsScreen;
