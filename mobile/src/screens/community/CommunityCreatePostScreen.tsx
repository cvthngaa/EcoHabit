import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../theme/colors';
import { useToast } from '../../context/ToastContext';

type PostType = 'discussion' | 'question' | 'challenge' | 'event';

const postTypes: Array<{
  key: PostType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}> = [
  { key: 'discussion', label: 'Chia sẻ', icon: 'chatbubble-ellipses-outline', color: '#1565C0' },
  { key: 'question', label: 'Hỏi đáp', icon: 'help-circle-outline', color: '#E65100' },
  { key: 'challenge', label: 'Thử thách', icon: 'flag-outline', color: Colors.primary },
  { key: 'event', label: 'Sự kiện', icon: 'calendar-outline', color: '#6A1B9A' },
];

const suggestionTags = ['#songxanh', '#taiche', '#giamnhua', '#thuthach', '#sukien', '#hoidap'];

const CommunityCreatePostScreen: React.FC<any> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const initialType = (route.params?.postType || 'discussion') as PostType;

  const [postType, setPostType] = useState<PostType>(initialType);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['#songxanh']);

  const activeType = postTypes.find((type) => type.key === postType) || postTypes[0];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const handlePublish = () => {
    if (!title.trim() || !content.trim()) {
      showToast('Hãy nhập tiêu đề và nội dung bài viết.', 'warning');
      return;
    }

    showToast('Đã tạo bài viết mẫu trong diễn đàn cộng đồng.', 'success');
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
      >
        <LinearGradient
          colors={[activeType.color, Colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 14 }]}
        >
          <View style={styles.heroTopRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.draftBtn}>
              <Text style={styles.draftText}>Lưu nháp</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.heroEyebrow}>Tạo bài viết mới</Text>
          <Text style={styles.heroTitle}>Chia sẻ điều tích cực bạn vừa làm cho môi trường</Text>
          <Text style={styles.heroSubtitle}>
            Bạn có thể đăng mẹo, đặt câu hỏi, tạo thử thách hoặc thông báo một sự kiện xanh.
          </Text>
        </LinearGradient>

        <View style={styles.formCard}>
          <Text style={styles.label}>Loại bài viết</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeRow}
          >
            {postTypes.map((type) => {
              const active = type.key === postType;

              return (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeChip,
                    active && { backgroundColor: type.color, borderColor: type.color },
                  ]}
                  onPress={() => setPostType(type.key)}
                >
                  <Ionicons
                    name={type.icon}
                    size={16}
                    color={active ? Colors.white : type.color}
                  />
                  <Text
                    style={[
                      styles.typeChipText,
                      active && styles.typeChipTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.label}>Tiêu đề</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Ví dụ: Mẹo rửa sạch chai nhựa trước khi đem đổi"
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
          />

          <Text style={styles.label}>Nội dung</Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Kể câu chuyện, mẹo hay hoặc câu hỏi của bạn ở đây..."
            placeholderTextColor={Colors.textMuted}
            style={[styles.input, styles.textArea]}
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.label}>Hashtag gợi ý</Text>
          <View style={styles.tagWrap}>
            {suggestionTags.map((tag) => {
              const active = selectedTags.includes(tag);

              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagChip, active && styles.tagChipActive]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[styles.tagText, active && styles.tagTextActive]}>{tag}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.toolsCard}>
          <Text style={styles.toolsTitle}>Công cụ nhanh</Text>
          <View style={styles.toolsRow}>
            <TouchableOpacity style={styles.toolItem}>
              <Ionicons name="image-outline" size={18} color="#1565C0" />
              <Text style={styles.toolText}>Thêm ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolItem}>
              <Ionicons name="location-outline" size={18} color="#E65100" />
              <Text style={styles.toolText}>Đính kèm địa điểm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolItem}>
              <Ionicons name="people-outline" size={18} color={Colors.primary} />
              <Text style={styles.toolText}>Mời cộng đồng</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.publishWrap} onPress={handlePublish}>
          <LinearGradient
            colors={[activeType.color, Colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.publishBtn}
          >
            <Ionicons name="send-outline" size={18} color={Colors.white} />
            <Text style={styles.publishText}>Đăng bài</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  draftBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  draftText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.white,
  },
  heroEyebrow: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.84)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
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
  },
  formCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: -18,
    padding: 18,
    borderRadius: 22,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
    marginTop: 14,
  },
  typeRow: {
    gap: 10,
    paddingRight: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.offWhite,
    borderWidth: 1,
    borderColor: '#E2ECE0',
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  typeChipTextActive: {
    color: Colors.white,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2ECE0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: '#FBFCFB',
  },
  textArea: {
    minHeight: 150,
    lineHeight: 22,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#F2F7EF',
    borderWidth: 1,
    borderColor: '#E2ECE0',
  },
  tagChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tagTextActive: {
    color: Colors.white,
  },
  toolsCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 22,
    elevation: 2,
  },
  toolsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  toolsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toolItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F7FAF6',
    paddingVertical: 16,
    borderRadius: 16,
  },
  toolText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  publishWrap: {
    marginHorizontal: 16,
    marginTop: 18,
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 18,
    paddingVertical: 16,
    elevation: 6,
  },
  publishText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.white,
  },
});

export default CommunityCreatePostScreen;

