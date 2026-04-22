import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../theme/colors';

type ForumTab = 'all' | 'discussion' | 'question' | 'challenge' | 'event';
type PostType = 'discussion' | 'question' | 'challenge' | 'event';

const forumTabs: Array<{
  key: ForumTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { key: 'all', label: 'Tất cả', icon: 'apps-outline' },
  { key: 'discussion', label: 'Chia sẻ', icon: 'chatbubble-ellipses-outline' },
  { key: 'question', label: 'Hỏi đáp', icon: 'help-circle-outline' },
  { key: 'challenge', label: 'Thử thách', icon: 'flag-outline' },
  { key: 'event', label: 'Sự kiện', icon: 'calendar-outline' },
];

const communityStats = [
  { label: 'Bài viết hôm nay', value: '128', icon: 'newspaper-outline' as const },
  { label: 'Thử thách đang chạy', value: '06', icon: 'trophy-outline' as const },
  { label: 'Thành viên tích cực', value: '1.2k', icon: 'people-outline' as const },
];

const hashtags = ['#songxanh', '#taiche', '#giamnhua', '#checkindiemxanh', '#quatangxanh'];

const communityPosts = [
  {
    id: 'p1',
    type: 'discussion' as const,
    author: 'Lan Anh',
    role: 'Thủ lĩnh xanh',
    time: '12 phút trước',
    title: 'Mẹo phân loại hộp sữa và giấy bạc tại nhà',
    excerpt:
      'Mình gom riêng giấy bạc sạch, ép dẹp hộp sữa rồi rửa nhanh bằng nước để không bị ám mùi trước khi mang đi đổi.',
    tags: ['#phanloairac', '#taiche', '#songxanh'],
    likes: 42,
    comments: 11,
    accent: '#1565C0',
    badge: 'Mẹo hay',
  },
  {
    id: 'p2',
    type: 'question' as const,
    author: 'Minh Khang',
    role: 'Người mới',
    time: '28 phút trước',
    title: 'Pin cũ và bóng đèn hỏng nên mang đi đâu là đúng?',
    excerpt:
      'Mình ở quận 3, đang tìm chỗ thu gom rác nguy hại uy tín. Có ai biết điểm nào trong app đang hỗ trợ không?',
    tags: ['#hoidap', '#racnguyhai'],
    likes: 15,
    comments: 18,
    accent: '#E65100',
    badge: 'Cần hỗ trợ',
  },
  {
    id: 'p3',
    type: 'challenge' as const,
    author: 'EcoHabit Team',
    role: 'Ban tổ chức',
    time: '1 giờ trước',
    title: 'Thử thách 7 ngày không dùng ly nhựa',
    excerpt:
      'Mang bình cá nhân hoặc ly cá nhân khi mua đồ uống, check-in mỗi ngày để mở khóa huy hiệu và nhận thêm điểm xanh.',
    tags: ['#thuthach', '#khongnhua', '#diemxanh'],
    likes: 96,
    comments: 24,
    accent: Colors.primary,
    badge: 'Hot tuần này',
  },
  {
    id: 'p4',
    type: 'event' as const,
    author: 'Câu lạc bộ Xanh',
    role: 'Đơn vị tổ chức',
    time: '2 giờ trước',
    title: 'Cuối tuần dọn rác bờ kênh và đổi quà cây xanh',
    excerpt:
      'Sáng Chủ nhật, tập trung tại công viên lúc 7:00. Có nước refill, túi phân loại và quà tặng hạt giống cho người tham gia.',
    tags: ['#sukien', '#donrac', '#offline'],
    likes: 63,
    comments: 9,
    accent: '#6A1B9A',
    badge: 'Sắp diễn ra',
  },
];

const typeMeta = {
  discussion: { label: 'Chia sẻ', icon: 'chatbubble-ellipses-outline', color: '#1565C0' },
  question: { label: 'Hỏi đáp', icon: 'help-circle-outline', color: '#E65100' },
  challenge: { label: 'Thử thách', icon: 'flag-outline', color: Colors.primary },
  event: { label: 'Sự kiện', icon: 'calendar-outline', color: '#6A1B9A' },
};

const CommunityScreen: React.FC<any> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ForumTab>('all');

  const filteredPosts = useMemo(() => {
    if (activeTab === 'all') return communityPosts;
    return communityPosts.filter((post) => post.type === activeTab);
  }, [activeTab]);

  const openCreatePost = (postType?: PostType) => {
    navigation.navigate('CommunityCreatePost', postType ? { postType } : undefined);
  };

  const openPostDetail = (post: any) => {
    navigation.navigate('CommunityPostDetail', { post });
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 96 }]}
      >
        <LinearGradient
          colors={['#0F5A2E', Colors.primary, '#69C36D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 14 }]}
        >
          <View style={styles.heroGlowTop} />
          <View style={styles.heroGlowBottom} />

          <View style={styles.heroTopRow}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="search-outline" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.heroEyebrow}>Cộng đồng EcoHabit</Text>
          <Text style={styles.heroTitle}>Diễn đàn sống xanh để hỏi, chia sẻ và cùng hành động</Text>
          <Text style={styles.heroSubtitle}>
            Nơi mọi người cùng lan tỏa mẹo tái chế, rủ nhau tham gia thử thách và tạo ra tác động thật ngoài đời.
          </Text>

          <View style={styles.statsGrid}>
            {communityStats.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <View style={styles.statIconWrap}>
                  <Ionicons name={stat.icon} size={16} color={Colors.white} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.composerCard}>
          <View style={styles.composerRow}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>E</Text>
            </View>
            <TouchableOpacity style={styles.composerInput} onPress={() => openCreatePost()}>
              <Text style={styles.composerPlaceholder}>Bạn vừa nhặt được gì thú vị hôm nay?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.composerActions}>
            <TouchableOpacity style={styles.composerAction} onPress={() => openCreatePost('discussion')}>
              <Ionicons name="image-outline" size={18} color="#1565C0" />
              <Text style={styles.composerActionText}>Ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.composerAction} onPress={() => openCreatePost('question')}>
              <Ionicons name="help-circle-outline" size={18} color="#E65100" />
              <Text style={styles.composerActionText}>Câu hỏi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.composerAction} onPress={() => openCreatePost('challenge')}>
              <Ionicons name="flag-outline" size={18} color={Colors.primary} />
              <Text style={styles.composerActionText}>Thử thách</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Khám phá theo chủ đề</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Xem lịch tuần</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
          >
            {forumTabs.map((tab) => {
              const active = activeTab === tab.key;

              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabChip, active && styles.tabChipActive]}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <Ionicons
                    name={tab.icon}
                    size={16}
                    color={active ? Colors.white : Colors.textSecondary}
                  />
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <LinearGradient
          colors={['#FFF7E8', '#F3FFE7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.challengeBanner}
        >
          <View style={styles.challengeHeader}>
            <View style={styles.challengeBadge}>
              <Ionicons name="trophy-outline" size={18} color={Colors.warning} />
              <Text style={styles.challengeBadgeText}>Thử thách nổi bật</Text>
            </View>
            <Text style={styles.challengeCountdown}>Còn 5 ngày</Text>
          </View>

          <Text style={styles.challengeTitle}>Mang bình cá nhân 5 lần trong tuần này</Text>
          <Text style={styles.challengeDescription}>
            Hoàn thành để mở huy hiệu “Ít nhựa hơn mỗi ngày” và nhận thêm 120 điểm xanh.
          </Text>

          <View style={styles.challengeFooter}>
            <View style={styles.challengeMembers}>
              <Ionicons name="people-outline" size={16} color={Colors.primary} />
              <Text style={styles.challengeMembersText}>1.248 người đang tham gia</Text>
            </View>
            <TouchableOpacity
              style={styles.challengeButton}
              onPress={() => openPostDetail(communityPosts.find((item) => item.type === 'challenge'))}
            >
              <Text style={styles.challengeButtonText}>Tham gia</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bảng tin cộng đồng</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Mới nhất</Text>
            </TouchableOpacity>
          </View>

          {filteredPosts.map((post) => {
            const meta = typeMeta[post.type];

            return (
              <TouchableOpacity
                key={post.id}
                style={styles.postCard}
                activeOpacity={0.9}
                onPress={() => openPostDetail(post)}
              >
                <View style={styles.postHeader}>
                  <View style={[styles.postAvatar, { backgroundColor: `${post.accent}18` }]}>
                    <Text style={[styles.postAvatarText, { color: post.accent }]}>
                      {post.author.charAt(0)}
                    </Text>
                  </View>

                  <View style={styles.postHeaderInfo}>
                    <Text style={styles.postAuthor}>{post.author}</Text>
                    <Text style={styles.postMeta}>
                      {post.role} · {post.time}
                    </Text>
                  </View>

                  <View style={[styles.postTypePill, { backgroundColor: `${meta.color}15` }]}>
                    <Ionicons name={meta.icon as any} size={13} color={meta.color} />
                    <Text style={[styles.postTypeText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                </View>

                <View style={styles.postBody}>
                  <View style={styles.postBadgeRow}>
                    <Text style={styles.postBadge}>{post.badge}</Text>
                  </View>
                  <Text style={styles.postTitle}>{post.title}</Text>
                  <Text style={styles.postExcerpt}>{post.excerpt}</Text>

                  <View style={styles.tagRow}>
                    {post.tags.map((tag) => (
                      <View key={tag} style={styles.tagChip}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.postFooter}>
                  <TouchableOpacity style={styles.postAction}>
                    <Ionicons name="heart-outline" size={18} color={Colors.textSecondary} />
                    <Text style={styles.postActionText}>{post.likes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.postAction}>
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={18}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.postActionText}>{post.comments}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.postAction}>
                    <Ionicons name="share-social-outline" size={18} color={Colors.textSecondary} />
                    <Text style={styles.postActionText}>Chia sẻ</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hashtag đang lên</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Theo dõi</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.trendingWrap}>
            {hashtags.map((tag) => (
              <TouchableOpacity key={tag} style={styles.trendingChip}>
                <Text style={styles.trendingChipText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 22 }]}
        onPress={() => openCreatePost()}
      >
        <LinearGradient
          colors={[Colors.primaryGradientStart, Colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabInner}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
          <Text style={styles.fabText}>Đăng bài</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F8F2' },
  scroll: {},

  hero: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  heroGlowTop: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroGlowBottom: {
    position: 'absolute',
    bottom: -55,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEyebrow: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.82)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '900',
    color: Colors.white,
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.88)',
    marginBottom: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 18,
    padding: 12,
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },

  composerCard: {
    marginTop: -18,
    marginHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
  },
  composerInput: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#F6F8F5',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  composerPlaceholder: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  composerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  composerAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F7FAF6',
  },
  composerActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  tabsRow: {
    gap: 10,
    paddingRight: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E3EDE1',
  },
  tabChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabLabelActive: {
    color: Colors.white,
  },

  challengeBanner: {
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EEF3E8',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF3D7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  challengeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.warning,
  },
  challengeCountdown: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  challengeTitle: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeMembers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  challengeMembersText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  challengeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  challengeButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.white,
  },

  postCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  postAvatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  postAvatarText: {
    fontSize: 18,
    fontWeight: '900',
  },
  postHeaderInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  postMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  postTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  postTypeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  postBody: {
    borderTopWidth: 1,
    borderTopColor: '#F1F4EF',
    paddingTop: 14,
  },
  postBadgeRow: {
    marginBottom: 8,
  },
  postBadge: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  postTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  postExcerpt: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: '#F3F7F1',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F4EF',
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },

  trendingWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  trendingChip: {
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E4EDE2',
  },
  trendingChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },

  fab: {
    position: 'absolute',
    right: 16,
  },
  fabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
    elevation: 8,
    shadowColor: Colors.primaryGradientStart,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  fabText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.white,
  },
});

export default CommunityScreen;

