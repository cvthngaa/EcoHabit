import React, { useState } from 'react';
import { View, Text, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../context/ToastContext';
import Colors from '../../theme/colors';
import ProfileDetailLayout, { profileDetailStyles } from '../../components/ProfileDetailLayout';

const LocationSettingsScreen: React.FC<any> = ({ navigation }) => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState({
    preciseLocation: true,
    mapReminder: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ProfileDetailLayout
      navigation={navigation}
      title="Vị trí & bản đồ"
      subtitle="Quản lý quyền truy cập vị trí và gợi ý điểm thu gom."
      icon="location-outline"
      color="#E65100"
      heroTitle="Tìm điểm xanh gần bạn"
      heroSubtitle="EcoHabit dùng vị trí để hiển thị bản đồ, đường đi và điểm thu gom phù hợp."
      actionLabel="Cập nhật vị trí"
      onAction={() => showToast('Đã cập nhật thiết lập vị trí mẫu.', 'success')}
    >
      <View style={profileDetailStyles.card}>
        <Text style={profileDetailStyles.cardTitle}>Quyền truy cập</Text>
        {[
          { key: 'preciseLocation' as const, label: 'Vị trí chính xác' },
          { key: 'mapReminder' as const, label: 'Nhắc khi có điểm thu gom mới' },
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
          'Bật vị trí giúp đề xuất trạm thu gom chính xác hơn.',
          'Bạn vẫn có thể dùng bản đồ thủ công nếu không cấp quyền vị trí.',
        ].map((tip, index) => (
          <View key={index} style={[profileDetailStyles.tipRow, index > 0 && profileDetailStyles.tipSpacing]}>
            <Ionicons name="leaf-outline" size={16} color="#E65100" />
            <Text style={profileDetailStyles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </ProfileDetailLayout>
  );
};

export default LocationSettingsScreen;
