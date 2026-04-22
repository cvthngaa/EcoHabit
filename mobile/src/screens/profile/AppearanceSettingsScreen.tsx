import React, { useMemo, useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../context/ToastContext';
import Colors from '../../theme/colors';
import ProfileDetailLayout, { profileDetailStyles } from '../../components/ProfileDetailLayout';
import NatureBackground from '../../components/NatureBackground';
import FallingLeaves from '../../components/FallingLeaves';

const options = [
  {
    key: 'light' as const,
    label: 'Sang',
    icon: 'sunny-outline',
    subtitle: 'Nen sang, sach va khong hien nature background.',
  },
  {
    key: 'dark' as const,
    label: 'Toi',
    icon: 'moon-outline',
    subtitle: 'Nen toi tap trung, khong dung doi cay phia sau.',
  },
  {
    key: 'nature' as const,
    label: 'Nen',
    icon: 'images-outline',
    subtitle: 'Hien nen doi cay mau mem de giao dien huu co hon.',
  },
];

const AppearanceSettingsScreen: React.FC<any> = ({ navigation }) => {
  const { showToast } = useToast();
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'nature'>('nature');
  const [showLeaves, setShowLeaves] = useState(false);

  const previewTheme = useMemo(() => {
    if (appearance === 'dark') {
      return {
        background: '#12201A',
        header: '#1B2D25',
        card: 'rgba(255,255,255,0.08)',
        accent: '#8BC34A',
        title: '#F3F7F1',
        subtitle: 'rgba(243,247,241,0.76)',
      };
    }

    if (appearance === 'nature') {
      return {
        background: '#EAF1E6',
        header: 'rgba(255,255,255,0.74)',
        card: 'rgba(255,255,255,0.72)',
        accent: '#5E8B43',
        title: '#243B24',
        subtitle: 'rgba(36,59,36,0.72)',
      };
    }

    return {
      background: '#F7FBF4',
      header: '#FFFFFF',
      card: '#FFFFFF',
      accent: '#2E7D32',
      title: '#1B3A1E',
      subtitle: 'rgba(27,58,30,0.62)',
    };
  }, [appearance]);

  const handleSave = () => {
    const modeLabel =
      appearance === 'light'
        ? 'giao dien sang'
        : appearance === 'dark'
          ? 'giao dien toi'
          : 'giao dien nen doi cay';

    showToast(
      showLeaves ? `Da luu ${modeLabel} kem hieu ung la roi.` : `Da luu ${modeLabel}.`,
      'success'
    );
  };

  const screenBackgroundColor =
    appearance === 'dark'
      ? '#12201A'
      : appearance === 'nature'
        ? '#EAF1E6'
        : '#F7FBF4';

  const backgroundLayer = appearance === 'nature' ? <NatureBackground opacity={0.95} /> : null;
  const foregroundLayer = showLeaves ? <FallingLeaves count={7} speed="slow" /> : null;

  return (
    <ProfileDetailLayout
      navigation={navigation}
      title="Giao dien"
      subtitle="Tuy chinh cach EcoHabit hien thi tren thiet bi cua ban."
      icon="color-palette-outline"
      color={Colors.warning}
      heroTitle="Khong gian de nhin hon"
      heroSubtitle="Chon sang, toi hoac nen doi cay, va bat la roi neu ban muon mot cam giac nhe nha."
      actionLabel="Luu giao dien"
      onAction={handleSave}
      backgroundColor={screenBackgroundColor}
      backgroundLayer={backgroundLayer}
      foregroundLayer={foregroundLayer}
    >
      <View style={profileDetailStyles.card}>
        <Text style={profileDetailStyles.cardTitle}>Xem truoc</Text>
        <View style={[styles.previewShell, { backgroundColor: previewTheme.background }]}>
          {appearance === 'nature' ? <NatureBackground opacity={0.95} /> : null}
          {showLeaves ? <FallingLeaves count={7} speed="slow" /> : null}

          <View style={[styles.previewHeader, { backgroundColor: previewTheme.header }]}>
            <View>
              <Text style={[styles.previewGreeting, { color: previewTheme.title }]}>EcoHabit</Text>
              <Text style={[styles.previewCaption, { color: previewTheme.subtitle }]}>
                Ban dang xem kieu giao dien da chon
              </Text>
            </View>
            <View style={[styles.previewBadge, { backgroundColor: previewTheme.accent }]}>
              <Ionicons name="leaf-outline" size={14} color={Colors.white} />
            </View>
          </View>

          <View style={styles.previewBody}>
            <View style={[styles.previewCard, { backgroundColor: previewTheme.card }]}>
              <Text style={[styles.previewCardTitle, { color: previewTheme.title }]}>Nhiem vu hom nay</Text>
              <Text style={[styles.previewCardText, { color: previewTheme.subtitle }]}>
                Quet QR, lam quiz va tich them diem xanh.
              </Text>
            </View>
            <View
              style={[
                styles.previewCard,
                styles.previewCardSecondary,
                { backgroundColor: previewTheme.card },
              ]}
            >
              <Text style={[styles.previewCardTitle, { color: previewTheme.title }]}>Qua noi bat</Text>
              <Text style={[styles.previewCardText, { color: previewTheme.subtitle }]}>
                Binh nuoc tai che va voucher cay xanh.
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={profileDetailStyles.card}>
        <Text style={profileDetailStyles.cardTitle}>Phong cach hien thi</Text>
        <View style={styles.optionsColumn}>
          {options.map((option) => {
            const active = appearance === option.key;

            return (
              <TouchableOpacity
                key={option.key}
                style={[profileDetailStyles.optionCard, active && profileDetailStyles.optionCardActive]}
                onPress={() => setAppearance(option.key)}
              >
                <View style={styles.optionMain}>
                  <View
                    style={[
                      styles.optionIcon,
                      { backgroundColor: active ? Colors.warning : Colors.warningLight },
                    ]}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={18}
                      color={active ? Colors.white : Colors.warning}
                    />
                  </View>
                  <View style={styles.optionTextWrap}>
                    <Text style={profileDetailStyles.optionTitle}>{option.label}</Text>
                    <Text style={profileDetailStyles.optionSubtitle}>{option.subtitle}</Text>
                  </View>
                </View>
                <Ionicons
                  name={active ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={active ? Colors.warning : Colors.textMuted}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={profileDetailStyles.card}>
        <View style={profileDetailStyles.toggleRow}>
          <View style={styles.toggleTextWrap}>
            <Text style={profileDetailStyles.toggleText}>Them hieu ung la roi</Text>
            <Text style={profileDetailStyles.optionSubtitle}>
              La roi it, troi cham va nhe de giu cam giac thu gian.
            </Text>
          </View>
          <Switch
            value={showLeaves}
            onValueChange={setShowLeaves}
            trackColor={{ false: '#D7E5D2', true: Colors.warningBorder }}
            thumbColor={showLeaves ? Colors.warning : Colors.white}
          />
        </View>
      </View>

      <View style={profileDetailStyles.card}>
        <Text style={profileDetailStyles.cardTitle}>Luu y</Text>
        {[
          'Che do Sang va Toi giu bo cuc gon, khong hien nature background.',
          'Che do Nen phu hop khi ban muon giao dien mem mat hon va gan tinh than song xanh.',
          'La roi duoc giu thua va cham de tranh roi mat khi su dung hang ngay.',
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

const styles = StyleSheet.create({
  previewShell: {
    height: 260,
    borderRadius: 24,
    overflow: 'hidden',
    padding: 16,
    justifyContent: 'space-between',
  },
  previewHeader: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewGreeting: {
    fontSize: 17,
    fontWeight: '800',
  },
  previewCaption: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
  },
  previewBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBody: {
    gap: 12,
  },
  previewCard: {
    borderRadius: 20,
    padding: 16,
  },
  previewCardSecondary: {
    width: '78%',
  },
  previewCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 5,
  },
  previewCardText: {
    fontSize: 12,
    lineHeight: 18,
  },
  optionsColumn: {
    gap: 10,
  },
  optionMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  toggleTextWrap: {
    flex: 1,
    paddingRight: 16,
  },
});

export default AppearanceSettingsScreen;
