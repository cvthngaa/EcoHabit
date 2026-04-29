import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../theme/colors';
import ConfidenceBadge from '../../components/ConfidenceBadge';
import WasteBadge from '../../components/WasteBadge';
import ScanningAnimation from '../../components/ScanningAnimation';
import { useToast } from '../../context/ToastContext';
import {
  AIClassificationResult,
  getConfidenceLevel,
  useClassifyWaste,
} from '../../services/ai';
import { wasteCategories, WasteCategory } from '../../services/mockData';

const { width } = Dimensions.get('window');

type AnalysisMode = 'scanning' | 'result';

const ScanAnalysisScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { showToast } = useToast();
  const { mutateAsync: classifyWasteAsync } = useClassifyWaste();
  const imageUri = route.params?.imageUri as string | undefined;

  const [mode, setMode] = useState<AnalysisMode>('scanning');
  const [result, setResult] = useState<AIClassificationResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [showManualPicker, setShowManualPicker] = useState(false);

  const resultSlideAnim = useRef(new Animated.Value(400)).current;

  const handleBackToScan = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    if (!imageUri) {
      showToast('Khong tim thay anh de phan tich.', 'error');
      navigation.goBack();
    }
  }, [imageUri, navigation, showToast]);

  useEffect(() => {
    if (mode !== 'scanning') return;

    setProgress(0);
    const startTime = Date.now();
    const duration = 3000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 95);
      setProgress(pct);
    }, 50);

    return () => clearInterval(interval);
  }, [mode]);

  useEffect(() => {
    if (!imageUri) return;

    let cancelled = false;

    const runAnalysis = async () => {
      try {
        const aiResult = await classifyWasteAsync(imageUri);
        if (cancelled) return;

        setProgress(100);

        setTimeout(() => {
          if (cancelled) return;
          setResult(aiResult);
          setMode('result');
          Animated.spring(resultSlideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 9,
          }).start();
        }, 350);
      } catch (error) {
        if (cancelled) return;
        showToast('Khong the goi AI. Vui long kiem tra backend va thu lai.', 'error');
        navigation.goBack();
      }
    };

    runAnalysis();

    return () => {
      cancelled = true;
    };
  }, [classifyWasteAsync, imageUri, navigation, resultSlideAnim, showToast]);

  const handleSaveResult = useCallback(() => {
    if (result) {
      if (result.pointsEarned > 0) {
        if (result.awarded) {
          showToast(`+${result.pointsEarned} diem xanh da duoc cong vao tai khoan!`, 'success');
        } else {
          showToast('Xac nhan phan loai thanh cong!', 'success');
        }
      } else {
        showToast('Da luu ket qua phan loai!', 'success');
      }
    }

    navigation.goBack();
  }, [navigation, result, showToast]);

  const handleManualPick = useCallback((category: WasteCategory) => {
    setShowManualPicker(false);
    showToast(`Da ghi nhan ${category.label}. Cam on ban da dong gop!`, 'success');
    navigation.goBack();
  }, [navigation, showToast]);

  const renderScanning = () => (
    <View className="flex-1 bg-[#F5F9F5]">
      <View
        className="bg-[#F5F9F5] px-5 pb-4"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-[#E7F1E7]"
            onPress={handleBackToScan}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text className="text-[18px] font-bold text-[#1B3A1E]">
            Dang phan tich
          </Text>
          <View className="w-[38px]" />
        </View>
      </View>

      <View className="flex-1 items-center justify-center">
        <ScanningAnimation progress={progress} />
      </View>
    </View>
  );

  const renderResult = () => {
    if (!result) return null;

    const confidenceLevel = getConfidenceLevel(result.confidence);
    const isLowConfidence = confidenceLevel === 'low';
    const isMediumConfidence = confidenceLevel === 'medium';

    return (
      <View className="flex-1 bg-[#F5F9F5]">
        <LinearGradient
          colors={['#0A1628', '#0D2137']}
          style={{ paddingTop: insets.top + 16 }}
          className="flex-row items-center justify-between px-5 pb-4"
        >
          <TouchableOpacity
            className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-white/15"
            onPress={handleBackToScan}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text className="text-[18px] font-bold text-white">Ket qua AI</Text>
          <View className="w-[22px]" />
        </LinearGradient>

        <Animated.ScrollView
          style={{ transform: [{ translateY: resultSlideAnim }] }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: insets.bottom + 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-4 items-center rounded-[24px] bg-white p-6 shadow-sm">
            <View
              className="mb-4 h-[100px] w-[100px] items-center justify-center rounded-[30px]"
              style={{ backgroundColor: result.category.bg }}
            >
              <Ionicons name={result.category.icon as any} size={48} color={result.category.color} />
            </View>

            <Text
              className="mb-1 text-[14px] font-semibold"
              style={{ color: result.success ? Colors.primary : Colors.warning }}
            >
              {result.success ? 'Da nhan dien!' : 'Khong xac dinh'}
            </Text>

            <Text
              className="mb-2 text-center text-[28px] font-extrabold tracking-[-0.5px]"
              style={{ color: result.category.color }}
            >
              {result.label}
            </Text>

            <WasteBadge type={result.category.type} />

            <View className="my-3">
              <ConfidenceBadge confidence={result.confidence} size="lg" />
            </View>

            {isLowConfidence && (
              <View className="mt-3 w-full flex-row rounded-2xl bg-[#FFEBEE] p-4">
                <Ionicons name="alert-circle" size={20} color={Colors.warning} />
                <Text className="ml-2 flex-1 text-[13px] font-medium leading-5 text-[#D32F2F]">
                  Do tin cay thap. Ket qua co the khong chinh xac. Hay chup lai hoac chon thu cong.
                </Text>
              </View>
            )}

            {isMediumConfidence && (
              <View className="mt-3 w-full flex-row rounded-2xl bg-[#FFF8E1] p-4">
                <Ionicons name="information-circle" size={20} color={Colors.warning} />
                <Text className="ml-2 flex-1 text-[13px] font-medium leading-5 text-[#F57F17]">
                  Do tin cay trung binh. Vui long kiem tra lai ket qua.
                </Text>
              </View>
            )}

            <View className="mt-4 w-full rounded-2xl bg-[#F1F8E9] p-4">
              <View className="mb-2 flex-row items-center">
                <Ionicons name="bulb" size={16} color={Colors.primary} />
                <Text className="ml-1.5 text-[14px] font-bold text-[#2E7D32]">
                  Huong dan xu ly
                </Text>
              </View>
              <Text className="text-[13px] leading-5 text-[#5D7C61]">{result.disposalTip}</Text>
            </View>

            {result.pointsEarned > 0 && (
              <View className="mt-4 overflow-hidden rounded-full">
                <LinearGradient colors={['#FFD54F', '#FF8F00']} style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={18} color={Colors.white} />
                    <Text className="ml-1.5 text-[15px] font-bold text-white">
                      +{result.pointsEarned} diem xanh
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            )}

            <TouchableOpacity className="mt-4 w-full flex-row items-center rounded-2xl bg-[#F5F9F5] p-4">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#F1F8E9]">
                <Ionicons name="navigate" size={20} color={Colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-[13px] font-bold text-[#1B3A1E]">
                  Diem thu gom gan nhat
                </Text>
                <Text className="mt-0.5 text-[12px] text-[#8FA892]">
                  Diem thu gom B1 · 0.3 km
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View className="mb-4 flex-row">
            <TouchableOpacity
              className="mr-3 h-[52px] flex-1 flex-row items-center justify-center rounded-full border border-[#C8E6C9] bg-white"
              onPress={handleBackToScan}
            >
              <Ionicons name="refresh" size={20} color={Colors.textSecondary} />
              <Text className="ml-1.5 text-[15px] font-semibold text-[#5D7C61]">Quet lai</Text>
            </TouchableOpacity>

            {isLowConfidence ? (
              <TouchableOpacity
                className="flex-[2] overflow-hidden rounded-full"
                onPress={() => setShowManualPicker(true)}
                activeOpacity={0.85}
              >
                <LinearGradient colors={[Colors.warning, '#FF8F00']} style={{ height: 52, borderRadius: 999 }}>
                  <View className="h-full flex-row items-center justify-center">
                    <Ionicons name="hand-left" size={18} color={Colors.white} />
                    <Text className="ml-2 text-[15px] font-bold text-white">Chon thu cong</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="flex-[2] overflow-hidden rounded-full"
                onPress={handleSaveResult}
                activeOpacity={0.85}
              >
                <LinearGradient colors={[Colors.primaryGradientStart, Colors.primaryLight]} style={{ height: 52, borderRadius: 999 }}>
                  <View className="h-full items-center justify-center">
                    <Text className="text-[15px] font-bold text-white">
                      Luu ket qua {result.pointsEarned > 0 ? `(+${result.pointsEarned}d)` : ''}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </Animated.ScrollView>

        <Modal
          visible={showManualPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowManualPicker(false)}
        >
          <TouchableOpacity
            className="flex-1 justify-end bg-black/50"
            onPress={() => setShowManualPicker(false)}
            activeOpacity={1}
          >
            <View className="rounded-t-[28px] bg-white p-6" style={{ paddingBottom: insets.bottom + 16 }}>
              <View className="mb-4 h-1 w-10 self-center rounded-full bg-[#C8E6C9]" />
              <Text className="text-center text-[20px] font-extrabold text-[#1B3A1E]">
                Chon loai rac thu cong
              </Text>
              <Text className="mb-5 mt-1 text-center text-[13px] text-[#8FA892]">
                Chon loai rac phu hop nhat
              </Text>

              <View className="flex-row flex-wrap justify-center">
                {wasteCategories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    className="mb-2.5 mr-2.5 items-center rounded-2xl px-1 py-3"
                    style={{
                      width: (width - 82) / 4,
                      backgroundColor: cat.bg,
                    }}
                    onPress={() => handleManualPick(cat)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={cat.icon as any} size={28} color={cat.color} />
                    <Text className="mt-1 text-center text-[11px] font-bold" style={{ color: cat.color }}>
                      {cat.label}
                    </Text>
                    <Text className="text-[10px] font-semibold" style={{ color: cat.color }}>
                      +{cat.points} d
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  return mode === 'scanning' ? renderScanning() : renderResult();
};

export default ScanAnalysisScreen;
