import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../theme/colors';
import { useGetMyBadges } from '../../services/badges';

const BadgesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const { data: badges, isLoading, refetch, isRefetching } = useGetMyBadges();

  const renderBadge = ({ item }: { item: any }) => {
    const { isEarned, icon, name, description, progress, threshold } = item;

    return (
      <View style={[styles.badgeCard, !isEarned && styles.badgeLocked]}>
        <View style={styles.badgeIconWrap}>
          <Text style={styles.badgeEmoji}>{icon || '🏅'}</Text>
          {!isEarned && (
            <View style={styles.lockIcon}>
              <Ionicons name="lock-closed" size={14} color={Colors.textMuted} />
            </View>
          )}
        </View>

        <Text style={styles.badgeName} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.badgeDesc} numberOfLines={3}>
          {description}
        </Text>

        {!isEarned && progress !== undefined && threshold > 1 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min((progress / threshold) * 100, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {progress} / {threshold}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Colors.primaryGradientStart, Colors.primaryLight]}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Huy hiệu của bạn</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {isLoading && !isRefetching ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={badges}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={renderBadge}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Chưa có huy hiệu nào.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F9F5' },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 15, color: Colors.textMuted },
  listContent: { padding: 16 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 16 },

  badgeCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  badgeLocked: { opacity: 0.5 },
  badgeIconWrap: { position: 'relative', marginBottom: 12 },
  badgeEmoji: { fontSize: 48 },
  lockIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  badgeDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  progressContainer: { width: '100%', alignItems: 'center', marginTop: 'auto' },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primaryLight,
    borderRadius: 3,
  },
  progressText: { fontSize: 10, fontWeight: '600', color: Colors.textMuted },
});

export default BadgesScreen;
