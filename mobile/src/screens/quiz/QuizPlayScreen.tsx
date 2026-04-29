import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, ActivityIndicator, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { QuizQuestion, useSubmitDailyQuiz } from '../../services/quiz';
import { useToast } from '../../context/ToastContext';

const QuizPlayScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { showToast } = useToast();
  const { mutateAsync: submitDailyQuizAsync } = useSubmitDailyQuiz();
  
  const questions: QuizQuestion[] = route.params?.questions || [];
  const total = questions.length;

  const topicId = route.params?.topicId;
  const topicName = route.params?.topicName || 'Daily Eco Quiz';

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [ans, setAns] = useState<(number | null)[]>(new Array(total).fill(null));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fadeA = useRef(new Animated.Value(1)).current;
  const slideA = useRef(new Animated.Value(0)).current;

  const question = questions[currentIdx];
  const pct = total > 0 ? ((currentIdx + 1) / total) * 100 : 0;
  const isAnswered = selectedIdx !== null;
  const isCorrect = isAnswered && selectedIdx === question?.correctIndex;

  useEffect(() => {
    fadeA.setValue(0);
    slideA.setValue(50);
    Animated.parallel([
      Animated.timing(fadeA, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideA, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentIdx]);

  const handleSelect = (idx: number) => {
    if (selectedIdx !== null || !question) return;
    setSelectedIdx(idx);
    const nextAnswers = [...ans];
    nextAnswers[currentIdx] = idx;
    setAns(nextAnswers);
  };

  const handleNext = async () => {
    if (!question) return;

    if (currentIdx >= total - 1) {
      // Submit
      setIsSubmitting(true);
      try {
        const finalAnswers = [...ans] as number[];
        finalAnswers[currentIdx] = selectedIdx!; 
        const result = await submitDailyQuizAsync({ topicId, answers: finalAnswers });
        
        navigation.replace('QuizResult', {
          score: result.score,
          total: result.total,
          pointsEarned: result.pointsEarned,
        });
      } catch (err) {
        console.log('Submit quiz error:', err);
        showToast('Lỗi khi nộp bài quiz.', 'error');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    Animated.timing(fadeA, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIdx(prev => prev + 1);
      setSelectedIdx(null);
    });
  };

  if (!question) {
    return (
      <View className="flex-1 bg-brand items-center justify-center">
        <Text className="text-white">Không tìm thấy câu hỏi.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 p-4 bg-white rounded-full">
            <Text className="text-brand">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View 
        className="flex-row items-center justify-between px-6 pb-4" 
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center shadow-sm"
        >
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text className="font-bold text-lg text-white">{topicName}</Text>
        <View className="w-10 h-10" />
      </View>

      {/* Progress */}
      <View className="px-6 mb-2">
        <View className="h-2.5 w-full bg-white/30 rounded-full overflow-hidden">
          <View className="h-full bg-[#FFE95C] rounded-full" style={{ width: `${pct}%` }} />
        </View>
      </View>
      
      <View className="flex-row justify-between px-6 mb-8">
        <Text className="text-white/90 font-semibold text-sm">Question {currentIdx + 1} of {total}</Text>
        <View className="flex-row items-center gap-1">
          <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.9)" />
          <Text className="text-white/90 font-semibold text-sm">Eco</Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeA, transform: [{ translateY: slideA }] }}>
          
          {/* Question Card */}
          <View className="bg-white rounded-[32px] p-8 mb-8 shadow-sm min-h-[160px] justify-center items-center">
             <Text className="text-center text-gray-800 text-lg font-bold leading-relaxed">
              {question.question}
             </Text>
          </View>

          {/* Options */}
          <View className="gap-4">
            {question.options.map((option, index) => {
              const isSelected = selectedIdx === index;
              const isThisCorrect = index === question.correctIndex;
              
              let containerClass = "bg-white/20 border-2 border-transparent";
              let textClass = "text-white";
              let letterBoxClass = "bg-white/30";
              let letterClass = "text-white font-black";

              if (isAnswered) {
                if (isThisCorrect) {
                  containerClass = "bg-green-400 border-green-400";
                  textClass = "text-white font-bold";
                  letterBoxClass = "bg-white/40";
                  letterClass = "text-white";
                } else if (isSelected) {
                  containerClass = "bg-red-400 border-red-400";
                  textClass = "text-white font-bold";
                  letterBoxClass = "bg-white/40";
                  letterClass = "text-white";
                } else {
                  containerClass = "bg-white/10 opacity-60";
                }
              } else if (isSelected) {
                  containerClass = "bg-[#FFE95C] border-[#FFE95C]";
                  textClass = "text-gray-900 font-bold";
                  letterBoxClass = "bg-white";
                  letterClass = "text-gray-900";
              }

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  disabled={isAnswered}
                  onPress={() => handleSelect(index)}
                  className={`flex-row items-center p-4 rounded-2xl ${containerClass}`}
                >
                  <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${letterBoxClass} shadow-sm`}>
                    <Text className={`text-lg ${letterClass}`}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text className={`flex-1 text-base font-semibold ${textClass}`}>{option}</Text>
                  
                  {isAnswered && isThisCorrect && (
                     <Ionicons name="checkmark-circle" size={24} color="white" />
                  )}
                  {isAnswered && isSelected && !isThisCorrect && (
                     <Ionicons name="close-circle" size={24} color="white" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {isAnswered && (
            <View className="mt-8 p-5 bg-white/10 rounded-2xl border border-white/20">
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="bulb" size={20} color="#FFE95C" />
                <Text className="font-bold text-[#FFE95C] text-base">Giải thích</Text>
              </View>
              <Text className="text-white text-sm leading-relaxed">{question.explanation}</Text>
            </View>
          )}

        </Animated.View>
      </ScrollView>

      {/* Bottom Check/Next Button */}
      {isAnswered && (
        <View className="absolute bottom-0 left-0 right-0 p-6 bg-brand">
          <TouchableOpacity
            onPress={handleNext}
            disabled={isSubmitting}
            activeOpacity={0.85}
            className="bg-white py-5 rounded-full items-center shadow-lg"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#358C5B" />
            ) : (
              <Text className="text-brand font-bold text-lg">
                {currentIdx >= total - 1 ? 'Hoàn thành' : 'Tiếp theo'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default QuizPlayScreen;
