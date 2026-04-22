import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../theme/colors';
import { useToast } from '../../context/ToastContext';
import {
  generateQuiz,
  QuizDifficulty,
  QuizQuestion,
} from '../../services/api/quiz.service';

const { width } = Dimensions.get('window');
const PTS_PER_Q = 10;

const TOPIC_OPTIONS = [
  { value: 'phan loai rac', label: 'Phân loại rác', icon: 'leaf-outline' as const },
  { value: 'tai che nhua', label: 'Tái chế nhựa', icon: 'water-outline' as const },
  { value: 'rac dien tu', label: 'Rác điện tử', icon: 'phone-portrait-outline' as const },
  { value: 'song xanh', label: 'Sống xanh', icon: 'earth-outline' as const },
];

const DIFFICULTY_OPTIONS: {
  value: QuizDifficulty;
  label: string;
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: 'easy', label: 'Dễ', hint: 'Kiến thức nhập môn, dễ làm quen', icon: 'sunny-outline' },
  { value: 'medium', label: 'Vừa', hint: 'Cân bằng giữa ghi nhớ và suy luận', icon: 'flash-outline' },
  { value: 'hard', label: 'Khó', hint: 'Nâng độ thử thách với câu hỏi sâu hơn', icon: 'flame-outline' },
];

const COUNT_OPTIONS = [3, 5, 7, 10];

const QuizScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshingQuiz, setRefreshingQuiz] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(TOPIC_OPTIONS[0].value);
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty>('easy');
  const [selectedCount, setSelectedCount] = useState(5);
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [showExp, setShowExp] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [ans, setAns] = useState<(boolean | null)[]>([]);

  const slideA = useRef(new Animated.Value(0)).current;
  const fadeA = useRef(new Animated.Value(1)).current;
  const scaleA = useRef(new Animated.Value(0)).current;

  const selectedTopicLabel = useMemo(
    () => TOPIC_OPTIONS.find((option) => option.value === selectedTopic)?.label ?? selectedTopic,
    [selectedTopic],
  );
  const selectedDifficultyMeta = useMemo(
    () =>
      DIFFICULTY_OPTIONS.find((option) => option.value === selectedDifficulty) ??
      DIFFICULTY_OPTIONS[0],
    [selectedDifficulty],
  );

  const resetQuizProgress = useCallback(() => {
    setCur(0);
    setSel(null);
    setShowExp(false);
    setScore(0);
    setDone(false);
    setAns([]);
    scaleA.setValue(0);
    slideA.setValue(0);
    fadeA.setValue(1);
  }, [fadeA, scaleA, slideA]);

  const loadQuiz = useCallback(
    async (showLoader = true) => {
      try {
        setHasStarted(true);

        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshingQuiz(true);
        }

        const data = await generateQuiz({
          topic: selectedTopicLabel,
          difficulty: selectedDifficulty,
          count: selectedCount,
        });

        const questions = Array.isArray(data.questions) ? data.questions : [];

        if (!questions.length) {
          throw new Error('Quiz API returned empty questions');
        }

        setQuizQuestions(questions);
        setCur(0);
        setSel(null);
        setShowExp(false);
        setScore(0);
        setDone(false);
        setAns(questions.map(() => null));
        scaleA.setValue(0);
        slideA.setValue(0);
        fadeA.setValue(1);

        if (data.source === 'fallback') {
          showToast('Hệ thống đang dùng bộ câu hỏi dự phòng.', 'info');
        }
      } catch (error) {
        console.log('Load quiz error:', error);
        showToast('Không tải được câu hỏi quiz, vui lòng thử lại.', 'error');
        setQuizQuestions([]);
        resetQuizProgress();
      } finally {
        setLoading(false);
        setRefreshingQuiz(false);
      }
    },
    [
      fadeA,
      resetQuizProgress,
      scaleA,
      selectedCount,
      selectedDifficulty,
      selectedTopicLabel,
      showToast,
      slideA,
    ],
  );

  const startQuiz = () => {
    loadQuiz(true);
  };

  const restart = () => {
    loadQuiz(false);
  };

  const backToSetup = () => {
    setHasStarted(false);
    setQuizQuestions([]);
    resetQuizProgress();
  };

  const q = quizQuestions[cur];
  const pct = quizQuestions.length > 0 ? ((cur + 1) / quizQuestions.length) * 100 : 0;

  const handleSelect = (index: number) => {
    if (sel !== null || !q) return;

    setSel(index);
    setShowExp(true);

    const isCorrect = index === q.correctIndex;
    const nextAnswers = [...ans];
    nextAnswers[cur] = isCorrect;
    setAns(nextAnswers);

    if (isCorrect) {
      setScore((prev) => prev + PTS_PER_Q);
    }

    Animated.spring(scaleA, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleNext = () => {
    if (!q) return;

    if (cur >= quizQuestions.length - 1) {
      setDone(true);
      return;
    }

    Animated.timing(fadeA, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCur((prev) => prev + 1);
      setSel(null);
      setShowExp(false);
      scaleA.setValue(0);
      slideA.setValue(width * 0.3);

      Animated.parallel([
        Animated.timing(fadeA, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideA, {
          toValue: 0,
          tension: 60,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const optStyle = (index: number) => {
    if (!q || sel === null) return styles.optDef;
    if (index === q.correctIndex) return styles.optOk;
    if (index === sel) return styles.optBad;
    return styles.optDim;
  };

  if (!hasStarted) {
    return (
      <View style={styles.root}>
        <LinearGradient colors={['#F1F8E9', '#E8F5E9', '#FFF']} style={StyleSheet.absoluteFill} />

        <ScrollView
          contentContainerStyle={[styles.setupScroll, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 28 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hdr}>
            <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.hdrTitle}>Quiz Eco</Text>
            <View style={styles.placeholderBtn} />
          </View>

          <LinearGradient
            colors={[Colors.primaryGradientStart, Colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroBadge}>
              <Ionicons name="sparkles-outline" size={18} color={Colors.white} />
              <Text style={styles.heroBadgeText}>Quiz AI cá nhân hóa</Text>
            </View>
            <Text style={styles.heroTitle}>Chọn bộ câu hỏi bạn muốn luyện hôm nay</Text>
            <Text style={styles.heroSubtitle}>
              Tạo nhanh một bộ quiz mới theo chủ đề, độ khó và số câu phù hợp với bạn.
            </Text>
          </LinearGradient>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Chủ đề</Text>
            <Text style={styles.sectionHint}>Chọn nội dung bạn muốn AI tạo câu hỏi.</Text>
            <View style={styles.topicGrid}>
              {TOPIC_OPTIONS.map((option) => {
                const active = option.value === selectedTopic;

                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.topicChip, active && styles.topicChipActive]}
                    onPress={() => setSelectedTopic(option.value)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.topicIcon, active && styles.topicIconActive]}>
                      <Ionicons
                        name={option.icon}
                        size={18}
                        color={active ? Colors.white : Colors.primary}
                      />
                    </View>
                    <Text style={[styles.topicLabel, active && styles.topicLabelActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Độ khó</Text>
            <Text style={styles.sectionHint}>Bạn có thể bắt đầu nhẹ nhàng hoặc tăng thử thách.</Text>
            <View style={styles.stack}>
              {DIFFICULTY_OPTIONS.map((option) => {
                const active = option.value === selectedDifficulty;

                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.difficultyCard, active && styles.difficultyCardActive]}
                    onPress={() => setSelectedDifficulty(option.value)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.difficultyIcon, active && styles.difficultyIconActive]}>
                      <Ionicons
                        name={option.icon}
                        size={18}
                        color={active ? Colors.white : Colors.primary}
                      />
                    </View>
                    <View style={styles.difficultyTextWrap}>
                      <Text style={[styles.difficultyLabel, active && styles.difficultyLabelActive]}>
                        {option.label}
                      </Text>
                      <Text style={[styles.difficultyHint, active && styles.difficultyHintActive]}>
                        {option.hint}
                      </Text>
                    </View>
                    {active && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Số câu</Text>
            <Text style={styles.sectionHint}>Bộ ngắn để chơi nhanh, bộ dài để luyện kỹ hơn.</Text>
            <View style={styles.countRow}>
              {COUNT_OPTIONS.map((count) => {
                const active = count === selectedCount;

                return (
                  <TouchableOpacity
                    key={count}
                    style={[styles.countChip, active && styles.countChipActive]}
                    onPress={() => setSelectedCount(count)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.countValue, active && styles.countValueActive]}>{count}</Text>
                    <Text style={[styles.countLabel, active && styles.countLabelActive]}>câu</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="checkmark-done-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.summaryTitle}>Bộ quiz sắp tạo</Text>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryPill}>
                <Text style={styles.summaryPillText}>{selectedTopicLabel}</Text>
              </View>
              <View style={styles.summaryPill}>
                <Text style={styles.summaryPillText}>{selectedDifficultyMeta.label}</Text>
              </View>
              <View style={styles.summaryPill}>
                <Text style={styles.summaryPillText}>{selectedCount} câu</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.startWrap} onPress={startQuiz} activeOpacity={0.9}>
            <LinearGradient
              colors={[Colors.primaryGradientStart, Colors.primaryLight]}
              style={styles.startBtn}
            >
              <View>
                <Text style={styles.startTitle}>Bắt đầu quiz</Text>
                <Text style={styles.startSubtitle}>AI sẽ tạo bộ câu hỏi mới ngay bây giờ</Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={28} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.root}>
        <LinearGradient colors={['#F1F8E9', '#E8F5E9', '#FFF']} style={StyleSheet.absoluteFill} />
        <View style={[styles.centerWrap, { paddingTop: insets.top + 20 }]}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingTitle}>Đang tạo bộ quiz cho bạn</Text>
          <Text style={styles.loadingSub}>
            Chủ đề {selectedTopicLabel.toLowerCase()}, độ khó {selectedDifficultyMeta.label.toLowerCase()},
            {' '}gồm {selectedCount} câu.
          </Text>
        </View>
      </View>
    );
  }

  if (!quizQuestions.length || !q) {
    return (
      <View style={styles.root}>
        <LinearGradient colors={['#F1F8E9', '#E8F5E9', '#FFF']} style={StyleSheet.absoluteFill} />
        <View style={[styles.centerWrap, { paddingTop: insets.top + 20 }]}>
          <Ionicons name="alert-circle-outline" size={54} color={Colors.warning} />
          <Text style={styles.loadingTitle}>Chưa có câu hỏi</Text>
          <Text style={styles.loadingSub}>
            Không tải được quiz lúc này. Bạn có thể thử tạo lại hoặc đổi cấu hình bộ câu hỏi.
          </Text>
          <TouchableOpacity style={styles.retryWrap} onPress={() => loadQuiz(true)}>
            <LinearGradient
              colors={[Colors.primaryGradientStart, Colors.primaryLight]}
              style={styles.retryBtn}
            >
              <Ionicons name="refresh" size={18} color={Colors.white} />
              <Text style={styles.retryTxt}>Thử lại</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={backToSetup} style={styles.secondaryAction}>
            <Text style={styles.secondaryActionText}>Đổi bộ câu hỏi</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => nav.goBack()} style={styles.backHomeBtn}>
            <Text style={styles.backHomeTxt}>Quay về</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (done) {
    const correctCount = ans.filter((item) => item === true).length;

    return (
      <View style={styles.root}>
        <LinearGradient colors={['#E8F5E9', '#C8E6C9', '#A5D6A7']} style={StyleSheet.absoluteFill} />
        <View style={[styles.doneWrap, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.doneContent}>
            <View style={styles.trophy}>
              <Text style={{ fontSize: 56 }}>
                {correctCount === quizQuestions.length ? '🏆' : correctCount >= 3 ? '🌟' : '💪'}
              </Text>
            </View>
            <Text style={styles.doneTitle}>
              {correctCount === quizQuestions.length
                ? 'Xuất sắc!'
                : correctCount >= 3
                  ? 'Tuyệt vời!'
                  : 'Cố gắng hơn nhé!'}
            </Text>
            <Text style={styles.doneSub}>
              Bạn trả lời đúng {correctCount}/{quizQuestions.length} câu
            </Text>

            <View style={styles.scoreCard}>
              <LinearGradient
                colors={[Colors.primaryGradientStart, Colors.primaryLight]}
                style={styles.scoreGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="star" size={28} color="#FFD54F" />
                <Text style={styles.scoreVal}>+{score}</Text>
                <Text style={styles.scoreSuf}>điểm xanh</Text>
              </LinearGradient>
            </View>

            <View style={styles.dots}>
              {ans.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: item ? Colors.primaryLight : Colors.error,
                    },
                  ]}
                >
                  <Ionicons
                    name={item ? 'checkmark' : 'close'}
                    size={14}
                    color={Colors.white}
                  />
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.restartWrap} onPress={restart} disabled={refreshingQuiz}>
              <LinearGradient
                colors={[Colors.primaryGradientStart, Colors.primaryLight]}
                style={styles.restartBtn}
              >
                {refreshingQuiz ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <Ionicons name="refresh" size={20} color={Colors.white} />
                    <Text style={styles.restartTxt}>Chơi lại bộ này</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={backToSetup} style={styles.secondaryAction}>
              <Text style={styles.secondaryActionText}>Đổi chủ đề hoặc độ khó</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => nav.goBack()} style={styles.backHomeBtn}>
              <Text style={styles.backHomeTxt}>Quay về trang chủ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#F1F8E9', '#E8F5E9', '#FFF']} style={StyleSheet.absoluteFill} />

      <View style={[styles.hdr, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={backToSetup}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.hdrTitle}>Quiz Eco</Text>
        <View style={styles.scoreBadge}>
          <Ionicons name="star" size={14} color="#F57F17" />
          <Text style={styles.scoreBadgeTxt}>{score}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaPill}>
          <Text style={styles.metaPillText}>{selectedTopicLabel}</Text>
        </View>
        <View style={styles.metaPill}>
          <Text style={styles.metaPillText}>{selectedDifficultyMeta.label}</Text>
        </View>
        <View style={styles.metaPill}>
          <Text style={styles.metaPillText}>{selectedCount} câu</Text>
        </View>
      </View>

      <View style={styles.progWrap}>
        <View style={styles.progBar}>
          <View style={[styles.progFill, { width: `${pct}%` as const }]} />
        </View>
        <Text style={styles.progTxt}>
          {cur + 1}/{quizQuestions.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.qCard,
            { opacity: fadeA, transform: [{ translateX: slideA }] },
          ]}
        >
          <Text style={styles.qEmoji}>{q.emoji}</Text>
          <Text style={styles.qText}>{q.question}</Text>

          <View style={styles.stack}>
            {q.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.optBtn, optStyle(index)]}
                onPress={() => handleSelect(index)}
                activeOpacity={0.8}
                disabled={sel !== null}
              >
                <View
                  style={[
                    styles.optIdx,
                    sel !== null &&
                      index === q.correctIndex && { backgroundColor: Colors.primary },
                    sel === index &&
                      index !== q.correctIndex && { backgroundColor: Colors.error },
                  ]}
                >
                  <Text
                    style={[
                      styles.optIdxTxt,
                      sel !== null &&
                        (index === q.correctIndex || index === sel) && {
                          color: Colors.white,
                        },
                    ]}
                  >
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.optTxt,
                    sel !== null &&
                      index === q.correctIndex && {
                        color: Colors.primary,
                        fontWeight: '700',
                      },
                    sel === index &&
                      index !== q.correctIndex && { color: Colors.error },
                  ]}
                  numberOfLines={3}
                >
                  {option}
                </Text>

                {sel !== null && index === q.correctIndex && (
                  <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                )}
                {sel === index && index !== q.correctIndex && (
                  <Ionicons name="close-circle" size={22} color={Colors.error} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {showExp && (
            <Animated.View
              style={[styles.expCard, { transform: [{ scale: scaleA }] }]}
            >
              <View style={styles.expHeader}>
                <Ionicons name="bulb" size={18} color={Colors.primary} />
                <Text style={styles.expTitle}>Giải thích</Text>
              </View>
              <Text style={styles.expText}>{q.explanation}</Text>
            </Animated.View>
          )}
        </Animated.View>

        {sel !== null && (
          <TouchableOpacity style={styles.nxtWrap} onPress={handleNext} activeOpacity={0.85}>
            <LinearGradient
              colors={[Colors.primaryGradientStart, Colors.primaryLight]}
              style={styles.nxtBtn}
            >
              <Text style={styles.nxtTxt}>
                {cur >= quizQuestions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={{ height: insets.bottom + 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F9F5' },
  setupScroll: {
    paddingHorizontal: 20,
    gap: 18,
  },
  centerWrap: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSub: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  retryWrap: {
    width: '100%',
    borderRadius: 50,
    overflow: 'hidden',
    elevation: 6,
    marginTop: 24,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
  },
  retryTxt: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  backHomeBtn: {
    paddingVertical: 14,
    marginTop: 4,
  },
  backHomeTxt: {
    fontSize: 15,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  secondaryAction: {
    paddingVertical: 10,
    marginTop: 8,
  },
  secondaryActionText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '700',
  },
  hdr: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  placeholderBtn: {
    width: 40,
    height: 40,
  },
  hdrTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  heroCard: {
    borderRadius: 28,
    padding: 22,
    gap: 10,
    elevation: 8,
    shadowColor: Colors.primaryGradientStart,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '800',
    color: Colors.white,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.88)',
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionHint: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  topicChip: {
    width: '47%',
    minHeight: 88,
    borderRadius: 18,
    backgroundColor: Colors.offWhite,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    justifyContent: 'space-between',
  },
  topicChipActive: {
    backgroundColor: '#EAF7EE',
    borderColor: Colors.primary,
  },
  topicIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicIconActive: {
    backgroundColor: Colors.primary,
  },
  topicLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  topicLabelActive: {
    color: Colors.primary,
  },
  stack: {
    gap: 10,
  },
  difficultyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.offWhite,
    padding: 14,
    gap: 12,
  },
  difficultyCardActive: {
    backgroundColor: '#F1F8E9',
    borderColor: Colors.primary,
  },
  difficultyIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultyIconActive: {
    backgroundColor: Colors.primary,
  },
  difficultyTextWrap: {
    flex: 1,
  },
  difficultyLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  difficultyLabelActive: {
    color: Colors.primary,
  },
  difficultyHint: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  difficultyHintActive: {
    color: Colors.textPrimary,
  },
  countRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  countChip: {
    width: 74,
    height: 74,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countChipActive: {
    borderColor: Colors.primary,
    backgroundColor: '#EAF7EE',
  },
  countValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  countValueActive: {
    color: Colors.primary,
  },
  countLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  countLabelActive: {
    color: Colors.primary,
  },
  summaryCard: {
    backgroundColor: '#F8FCF8',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#DCEEDC',
    padding: 18,
    gap: 14,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryPill: {
    backgroundColor: Colors.white,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#DCEEDC',
  },
  summaryPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  startWrap: {
    borderRadius: 26,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.primaryGradientStart,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
  },
  startBtn: {
    minHeight: 72,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  startTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.white,
  },
  startSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  metaPill: {
    backgroundColor: Colors.white,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#DCEEDC',
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreBadgeTxt: { fontSize: 14, fontWeight: '800', color: '#F57F17' },
  progWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  progBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progFill: {
    height: '100%',
    backgroundColor: Colors.primaryLight,
    borderRadius: 4,
  },
  progTxt: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  qCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    marginBottom: 20,
  },
  qEmoji: { fontSize: 42, textAlign: 'center', marginBottom: 16 },
  qText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 24,
  },
  optBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
  },
  optDef: { backgroundColor: Colors.offWhite, borderColor: Colors.border },
  optOk: { backgroundColor: '#E8F5E9', borderColor: Colors.primary },
  optBad: { backgroundColor: '#FFEBEE', borderColor: Colors.error },
  optDim: {
    backgroundColor: Colors.offWhite,
    borderColor: Colors.border,
    opacity: 0.5,
  },
  optIdx: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optIdxTxt: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  optTxt: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  expCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  expHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  expTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  expText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  nxtWrap: {
    borderRadius: 50,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: Colors.primaryGradientStart,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    marginBottom: 10,
  },
  nxtBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 50,
  },
  nxtTxt: { fontSize: 16, fontWeight: '700', color: Colors.white },
  doneWrap: { flex: 1, paddingHorizontal: 20 },
  doneContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  trophy: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    elevation: 8,
  },
  doneTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  doneSub: { fontSize: 15, color: Colors.textSecondary, marginBottom: 28 },
  scoreCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 24, elevation: 8 },
  scoreGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 18,
  },
  scoreVal: { fontSize: 32, fontWeight: '800', color: Colors.white },
  scoreSuf: { fontSize: 16, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  dots: { flexDirection: 'row', gap: 10, marginBottom: 32 },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restartWrap: {
    width: '100%',
    borderRadius: 50,
    overflow: 'hidden',
    elevation: 6,
    marginBottom: 8,
  },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 50,
  },
  restartTxt: { fontSize: 16, fontWeight: '700', color: Colors.white },
});

export default QuizScreen;

