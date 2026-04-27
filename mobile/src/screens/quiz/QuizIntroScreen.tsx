import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { getDailyQuiz, QuizTopic } from '../../services/api/quiz.service';
import { useToast } from '../../context/ToastContext';
import PrimaryButton from '../../components/PrimaryButton';

const QuizIntroScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<QuizTopic[]>([]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await getDailyQuiz();
        setTopics(data);
        setLoading(false);
      } catch (error) {
        console.log('Load quiz error:', error);
        showToast('Không tải được danh sách câu đố, vui lòng thử lại.', 'error');
        navigation.goBack();
      }
    };
    fetchQuiz();
  }, [navigation, showToast]);

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
      <View className="flex-1 bg-[#F5F1FA] items-center justify-center">
        <ActivityIndicator size="large" color="#B695E6" />
        <Text className="mt-4 font-semibold text-gray-500 text-base">Đang tải danh sách câu đố...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F5F1FA]">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View 
        className="flex-row items-center justify-between px-6 pb-4 bg-white rounded-b-[32px] shadow-sm z-10" 
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color="#4B5563" />
        </TouchableOpacity>
        <Text className="font-bold text-lg text-gray-800">Chọn Chủ Đề</Text>
        <View className="w-10 h-10" />
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 24 }}>
        <Text className="text-3xl font-extrabold text-gray-800 mb-2">Daily Eco Quiz</Text>
        <Text className="text-gray-500 mb-8 leading-6">
          Mỗi ngày sẽ có những bộ câu hỏi mới theo từng chủ đề. Hãy hoàn thành tất cả để nhận tối đa điểm thưởng nhé!
        </Text>

        <View className="gap-4">
          {topics.map((topic) => {
            const isCompleted = topic.completed;
            
            // Thay đổi màu sắc thẻ theo độ khó
            let cardColor = "bg-white";
            let accentColor = "#1F8505"; // Primary green
            if (topic.difficulty === 'easy') accentColor = "#4ADE80"; // Green 400
            if (topic.difficulty === 'medium') accentColor = "#FBBF24"; // Amber
            if (topic.difficulty === 'hard') accentColor = "#F87171"; // Red
            if (topic.difficulty === 'mixed') accentColor = "#3B82F6"; // Blue

            return (
              <View 
                key={topic.id} 
                className={`p-5 rounded-[24px] shadow-sm flex-row items-center justify-between ${cardColor} ${isCompleted ? 'opacity-70' : ''}`}
                style={{ shadowColor: accentColor, shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 }}
              >
                <View className="flex-1 flex-row items-center gap-4">
                  <View 
                    className="w-14 h-14 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <Text className="text-2xl">{topic.icon}</Text>
                  </View>
                  <View className="flex-1 pr-4">
                    <Text className="font-bold text-gray-800 text-lg mb-1">{topic.name}</Text>
                    <Text className="text-xs text-gray-500 mb-2" numberOfLines={2}>{topic.description}</Text>
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="flash" size={12} color={accentColor} />
                      <Text className="text-[10px] font-bold uppercase" style={{ color: accentColor }}>
                        {topic.difficulty}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity 
                  onPress={() => handleStartTopic(topic)}
                  activeOpacity={0.8}
                  className={`px-4 py-3 rounded-xl justify-center items-center`}
                  style={{ backgroundColor: isCompleted ? '#E5E7EB' : accentColor }}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark-done" size={20} color="#9CA3AF" />
                  ) : (
                    <Text className="text-white font-bold text-sm">Bắt đầu</Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default QuizIntroScreen;
