import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { QuizTopic, useGetDailyQuiz } from '../../services/quiz';
import { useToast } from '../../context/ToastContext';
import Colors from '../../theme/colors';
import SharedHeaderBackground from '../../components/SharedHeaderBackground';
import { useSettings } from '../../context/SettingsContext';

const MOCK_ICONS = [
 { icon: 'flask', color: '#FF7A7A' }, // Science
 { icon: 'earth', color: '#5B7CFA' }, // Geography
 { icon: 'basketball', color: '#D946EF' }, // Sports
 { icon: 'leaf', color: '#10B981' }, // Biology
 { icon: 'hardware-chip', color: '#F43F5E' }, // Tech
 { icon: 'wifi', color: '#8B5CF6' }, // Network
 { icon: 'sunny', color: '#F59E0B' }, // Solar
 { icon: 'airplane', color: '#3B82F6' }, // Travel
];

const QuizIntroScreen: React.FC = () => {
 const insets = useSafeAreaInsets();
 const navigation = useNavigation<any>();
 const { showToast } = useToast();
 const { appearance } = useSettings();

 const [loading, setLoading] = useState(true);
 const [topics, setTopics] = useState<QuizTopic[]>([]);
 const { refetch: refetchDailyQuiz } = useGetDailyQuiz({ enabled: false });

 useEffect(() => {
 const fetchQuiz = async () => {
 try {
 const result = await refetchDailyQuiz({ throwOnError: true });
 setTopics(result.data || []);
 setLoading(false);
 } catch (error) {
 console.log('Load quiz error:', error);
 showToast('Không tải được danh sách câu đố, vui lòng thử lại.', 'error');
 navigation.goBack();
 }
 };
 fetchQuiz();
 }, [navigation, refetchDailyQuiz, showToast]);

 const handleStartTopic = (topic: QuizTopic) => {
 if (topic.completed) {
 navigation.navigate('QuizResult', {
 score: topic.score,
 total: topic.total,
 pointsEarned: topic.pointsEarned,
 });
 } else if (topic.questions && topic.questions.length > 0) {
 navigation.navigate('QuizPlay', { questions: topic.questions, topicId: topic.id, topicName: topic.name });
 }
 };

 if (loading) {
 return (
 <View style={[styles.root, styles.centerAll]}>
 <ActivityIndicator size="large" color={Colors.primary} />
 <Text style={styles.loadingTxt}>Đang tải danh sách câu đố...</Text>
 </View>
 );
 }

 return (
 <View style={styles.root}>
 <StatusBar barStyle="light-content" />

 {/* Blue / Brand Header */}
 <SharedHeaderBackground style={[styles.header, { paddingTop: insets.top + 10, paddingBottom: 50 }]} forceGradient={true}>
 <TouchableOpacity
 onPress={() => navigation.goBack()}
 style={styles.backBtn}
 activeOpacity={0.8}
 >
 <Ionicons name="chevron-back" size={24} color="#3A3A3A" />
 </TouchableOpacity>
 <Text style={styles.headerTitle}>Chọn Chủ Đề</Text>
 <View style={{ width: 44 }} /> {/* Spacer */}
 </SharedHeaderBackground>

 {/* Main Content Sheet */}
 <View style={[styles.sheetContainer, appearance === 'nature' && { backgroundColor: 'transparent', marginTop: 0 }]}>
 <ScrollView
 contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
 showsVerticalScrollIndicator={false}
 >
 <View style={styles.grid}>
 {topics.map((topic, index) => {
 const isCompleted = topic.completed;
 // Lấy icon mock dựa theo index
 const mockStyle = MOCK_ICONS[index % MOCK_ICONS.length];

 return (
 <TouchableOpacity
 key={topic.id}
 style={[styles.card, isCompleted && { opacity: 0.7 }]}
 activeOpacity={0.8}
 onPress={() => handleStartTopic(topic)}
 >
 <View style={[styles.iconBox, { backgroundColor: `${mockStyle.color}15` }]}>
 <Ionicons name={mockStyle.icon as any} size={42} color={mockStyle.color} />
 </View>
 <Text style={[styles.cardTitle, { color: mockStyle.color }]} numberOfLines={2}>
 {topic.name}
 </Text>

 {/* Status Indicator */}
 {isCompleted && (
 <View style={styles.completedBadge}>
 <Ionicons name="checkmark-circle" size={14} color="#10B981" />
 </View>
 )}
 </TouchableOpacity>
 );
 })}
 </View>
 </ScrollView>
 </View>
 </View>
 );
};

const styles = StyleSheet.create({
 root: {
 flex: 1,
 backgroundColor: 'transparent', // Matching the app's brand color
 },
 centerAll: {
 alignItems: 'center',
 justifyContent: 'center',
 backgroundColor: '#F8F9FA',
 },
 loadingTxt: {
 marginTop: 16,
 fontWeight: '600',
 color: '#6B7280',
 fontSize: 16,
 },
 header: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'space-between',
 paddingHorizontal: 20,
 },
 backBtn: {
 width: 44,
 height: 44,
 borderRadius: 14,
 backgroundColor: 'rgba(255,255,255,0.2)',
 alignItems: 'center',
 justifyContent: 'center',
 },
 headerTitle: {
 fontSize: 20,
 fontWeight: '700',
 color: '#3A3A3A',
 },
 sheetContainer: {
 flex: 1,
 backgroundColor: '#F8F9FA',
 borderTopLeftRadius: 36,
 borderTopRightRadius: 36,
 marginTop: -20, // Overlap the header slightly
 overflow: 'hidden',
 },
 scrollContent: {
 padding: 24,
 paddingTop: 36,
 },
 grid: {
 flexDirection: 'row',
 flexWrap: 'wrap',
 justifyContent: 'space-between',
 },
 card: {
 width: '47%',
 backgroundColor: '#FFF',
 borderRadius: 24,
 paddingVertical: 32,
 paddingHorizontal: 16,
 alignItems: 'center',
 justifyContent: 'center',
 marginBottom: 20,
 },
 iconBox: {
 width: 80,
 height: 80,
 borderRadius: 24,
 alignItems: 'center',
 justifyContent: 'center',
 marginBottom: 16,
 },
 cardTitle: {
 fontSize: 15,
 fontWeight: '800',
 textAlign: 'center',
 },
 completedBadge: {
 position: 'absolute',
 top: 16,
 right: 16,
 backgroundColor: '#ECFDF5',
 padding: 4,
 borderRadius: 12,
 }
});

export default QuizIntroScreen;
