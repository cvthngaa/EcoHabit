import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../theme/colors';

const typeMeta: Record<
  string,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  discussion: {
    label: 'Chia sẻ',
    icon: 'chatbubble-ellipses-outline',
    color: '#1565C0',
  },
  question: {
    label: 'Hỏi đáp',
    icon: 'help-circle-outline',
    color: '#E65100',
  },
  challenge: {
    label: 'Thử thách',
    icon: 'flag-outline',
    color: Colors.primary,
  },
  event: {
    label: 'Sự kiện',
    icon: 'calendar-outline',
    color: '#6A1B9A',
  },
};

const sampleComments = [
  {
    id: 'c1',
    author: 'Hà My',
    time: '9 phút trước',
    text: 'Mình cũng hay ép dẹp hộp sữa trước khi mang đi. Làm vậy tiết kiệm chỗ hẳn.',
  },
  {
    id: 'c2',
    author: 'Tuấn Phong',
    time: '21 phút trước',
    text: 'Nếu là giấy bạc dính dầu mỡ thì mọi người có mẹo làm sạch nào nhanh không?',
  },
  {
    id: 'c3',
    author: 'EcoHabit Team',
    time: '34 phút trước',
    text: 'Bài viết rất hữu ích, bọn mình sẽ cân nhắc đưa vào phần mẹo nổi bật trong tuần.',
  },
];

const CommunityPostDetailScreen: React.FC<any> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const post = route.params?.post || {
    title: 'Bài viết cộng đồng',
    excerpt: 'Nội dung đang được cập nhật.',
    author: 'EcoHabit',
    role: 'Cộng đồng',
    time: 'Vừa xong',
    tags: ['#ecohabit'],
    likes: 0,
    comments: 0,
    badge: 'Mới',
    type: 'discussion',
    accent: Colors.primary,
  };

  const meta = typeMeta[post.type] || typeMeta.discussion;

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <LinearGradient
          colors={[post.accent || Colors.primary, Colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 14 }]}
        >
          <View style={styles.heroTopRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="bookmark-outline" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <View style={[styles.typeBadge, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
            <Ionicons name={meta.icon} size={14} color={Colors.white} />
            <Text style={styles.typeBadgeText}>{meta.label}</Text>
          </View>

          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.subtitle}>
            {post.author} · {post.role} · {post.time}
          </Text>

          <View style={styles.heroMetaRow}>
            <View style={styles.heroStat}>
              <Ionicons name="heart-outline" size={15} color={Colors.white} />
              <Text style={styles.heroStatText}>{post.likes} lượt thích</Text>
            </View>
            <View style={styles.heroStat}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={15}
                color={Colors.white}
              />
              <Text style={styles.heroStatText}>{post.comments} bình luận</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.contentCard}>
          <View style={styles.badgeRow}>
            <Text style={styles.badgeText}>{post.badge}</Text>
          </View>

          <Text style={styles.paragraph}>{post.excerpt}</Text>
          <Text style={styles.paragraph}>
            Mọi người trong cộng đồng có thể cùng thảo luận, chia sẻ thêm kinh nghiệm thực tế
            hoặc đặt câu hỏi tiếp nối ngay bên dưới. Đây là nơi rất phù hợp để biến những mẹo
            nhỏ thành thói quen xanh bền vững hơn mỗi ngày.
          </Text>
          <Text style={styles.paragraph}>
            Nếu bạn từng thử cách này rồi, hãy để lại bình luận hoặc đăng một bài viết mới để
            kể lại kết quả của mình. Những nội dung hữu ích có thể được đội ngũ EcoHabit chọn
            làm bài nổi bật của tuần.
          </Text>

          <View style={styles.tagRow}>
            {post.tags?.map((tag: string) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="heart-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.actionText}>Thích</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={18}
              color={Colors.textSecondary}
            />
            <Text style={styles.actionText}>Bình luận</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="share-social-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.actionText}>Chia sẻ</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bình luận nổi bật</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CommunityCreatePost', { postType: post.type })}>
              <Text style={styles.sectionLink}>Viết phản hồi</Text>
            </TouchableOpacity>
          </View>

          {sampleComments.map((comment) => (
            <View key={comment.id} style={styles.commentCard}>
              <View style={styles.commentAvatar}>
                <Text style={styles.commentAvatarText}>{comment.author.charAt(0)}</Text>
              </View>
              <View style={styles.commentBody}>
                <View style={styles.commentTop}>
                  <Text style={styles.commentAuthor}>{comment.author}</Text>
                  <Text style={styles.commentTime}>{comment.time}</Text>
                </View>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F8F2' },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.white,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '900',
    color: Colors.white,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.84)',
    marginBottom: 18,
  },
  heroMetaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  heroStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroStatText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  contentCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: -18,
    padding: 18,
    borderRadius: 22,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  badgeRow: {
    marginBottom: 12,
  },
  badgeText: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 23,
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tagChip: {
    backgroundColor: '#F1F6EE',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    paddingVertical: 14,
    elevation: 2,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  commentCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  commentAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  commentAvatarText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primary,
  },
  commentBody: {
    flex: 1,
  },
  commentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  commentTime: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  commentText: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
});

export default CommunityPostDetailScreen;

