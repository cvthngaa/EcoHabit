import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../theme/colors';
import SharedHeaderBackground from './SharedHeaderBackground';
import { useSettings } from '../context/SettingsContext';

type ProfileDetailLayoutProps = {
  navigation: any;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  heroTitle: string;
  heroSubtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  backgroundColor?: string;
  backgroundLayer?: React.ReactNode;
  foregroundLayer?: React.ReactNode;
  children: React.ReactNode;
};

const ProfileDetailLayout: React.FC<ProfileDetailLayoutProps> = ({
  navigation,
  title,
  subtitle,
  icon,
  color,
  heroTitle,
  heroSubtitle,
  actionLabel,
  onAction,
  backgroundColor,
  backgroundLayer,
  foregroundLayer,
  children,
}) => {
  const insets = useSafeAreaInsets();
  const { appearance } = useSettings();

  // Determine if we should use translucent background
  // If a backgroundLayer is explicitly provided (like in Appearance preview), we assume it might be nature.
  // Or we just check global appearance.
  const isNature = backgroundLayer ? true : appearance === 'nature';

  return (
    <View style={[styles.root, backgroundColor ? { backgroundColor } : null]}>
      <SharedHeaderBackground
        className="absolute top-0 left-0 right-0 h-[380px]"
        colors={[color as any, Colors.primaryLight]}
        forceGradient={true}
      />
      {backgroundLayer}

      <View style={{ paddingTop: insets.top + 10 }} className="px-5 pb-4 flex-row items-center justify-between z-10">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center bg-white/20 rounded-xl"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#3A3A3A" />
        </TouchableOpacity>

        <Text className="text-lg font-bold text-[#3A3A3A]">{title}</Text>

        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24, flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        className="flex-1 z-10"
      >
        <View style={{ paddingHorizontal: 20, paddingBottom: 24, alignItems: 'center', marginTop: 10 }}>
          <View style={styles.heroIcon}>
            <Ionicons name={icon as any} size={28} color={Colors.white} />
          </View>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>{heroTitle}</Text>
            <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
          </View>
        </View>

        <View className={`${isNature ? 'bg-white/90' : 'bg-white'} rounded-t-[36px] px-6 pt-8 pb-8 flex-1 min-h-[500px]`}>
          {children}

          {actionLabel && onAction ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: color }]}
              onPress={onAction}
            >
              <Text style={styles.actionText}>{actionLabel}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
      {foregroundLayer}
    </View>
  );
};

export const profileDetailStyles = StyleSheet.create({
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  divider: { borderTopWidth: 1, borderTopColor: '#F3F5F3' },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  infoValue: { fontSize: 12, lineHeight: 18, color: Colors.textSecondary, marginTop: 4 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start' },
  tipSpacing: { marginTop: 10 },
  tipText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: Colors.white,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  optionCardActive: {
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.surfaceLight,
  },
  optionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  optionSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  toggleText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  appearanceRow: { flexDirection: 'row', gap: 10 },
  themeCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: Colors.offWhite,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  themeCardActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryLight,
  },
  themeLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginTop: 8 },
  themeLabelActive: { color: Colors.white },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: {},
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.86)',
    textAlign: 'center',
    marginBottom: 18,
  },
  heroCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 20,
    padding: 16,
  },
  heroTitle: { fontSize: 16, fontWeight: '800', color: Colors.white, marginBottom: 6 },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.86)',
  },
  actionButton: {
    marginTop: 18,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { fontSize: 15, fontWeight: '800', color: Colors.white },
});

export default ProfileDetailLayout;
