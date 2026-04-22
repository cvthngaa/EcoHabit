import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../theme/colors';

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

  return (
    <View style={[styles.root, backgroundColor ? { backgroundColor } : null]}>
      {backgroundLayer}
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[color, Colors.primaryLight]}
          style={[styles.header, { paddingTop: insets.top + 14 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.heroIcon}>
            <Ionicons name={icon as any} size={28} color={Colors.white} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>{heroTitle}</Text>
            <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
          </View>
        </LinearGradient>

        {children}

        {actionLabel && onAction ? (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: color }]}
            onPress={onAction}
          >
            <Text style={styles.actionText}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
      {foregroundLayer}
    </View>
  );
};

export const profileDetailStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
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
    backgroundColor: Colors.offWhite,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
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
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.white, marginBottom: 6 },
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
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  actionText: { fontSize: 15, fontWeight: '800', color: Colors.white },
});

export default ProfileDetailLayout;
