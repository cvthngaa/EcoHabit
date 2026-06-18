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
import * as Location from 'expo-location';
import Colors from '../../theme/colors';
import ConfidenceBadge from '../../components/ConfidenceBadge';
import WasteBadge from '../../components/WasteBadge';
import ScanningAnimation from '../../components/ScanningAnimation';
import SharedHeaderBackground from '../../components/SharedHeaderBackground';
import { useToast } from '../../context/ToastContext';
import {
 AIClassificationResult,
 WasteType,
 getConfidenceLevel,
 useClassifyWaste,
 useSubmitAiFeedback,
} from '../../services/ai';
import { wasteCategories, WasteCategory } from '../../services/mockData';

const { width } = Dimensions.get('window');

type AnalysisMode = 'scanning' | 'result';

const CATEGORY_TO_WASTE_TYPE: Record<number, WasteType> = {
 1: 'PLASTIC',
 2: 'PAPER',
 3: 'METAL',
 4: 'OTHER',
 5: 'GLASS',
 6: 'BATTERY',
 7: 'TEXTILE',
 8: 'E_WASTE',
};

const ScanAnalysisScreen: React.FC = () => {
 const insets = useSafeAreaInsets();
 const navigation = useNavigation<any>();
 const route = useRoute<any>();
 const { showToast } = useToast();
 const { mutateAsync: classifyWasteAsync } = useClassifyWaste();
 const { mutateAsync: submitFeedbackAsync, isPending: isSubmittingFeedback } = useSubmitAiFeedback();
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
 showToast('Không tìm thấy ảnh để phân tích.', 'error');
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
 let latitude: number | undefined;
 let longitude: number | undefined;

 try {
 const { status } = await Location.requestForegroundPermissionsAsync();
 if (status === 'granted') {
 const loc = await Location.getCurrentPositionAsync({});
 latitude = loc.coords.latitude;
 longitude = loc.coords.longitude;
 }
 } catch (err) {
 console.log('Error getting location for classification', err);
 }

 const aiResult = await classifyWasteAsync({ imageUri, latitude, longitude });
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
 } catch (error: any) {
 if (cancelled) return;
 const msg = error?.response?.data?.message || error?.message || 'Không thể gọi AI. Vui lòng kiểm tra backend và thử lại.';
 showToast(msg, 'error');
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
 showToast(`+${result.pointsEarned} điểm xanh đã được cộng vào tài khoản!`, 'success');
 } else {
 showToast('Xác nhận phân loại thành công!', 'success');
 }
 } else {
 showToast('Đã lưu kết quả phân loại!', 'success');
 }
 }

 navigation.goBack();
 }, [navigation, result, showToast]);

 const handleManualPick = useCallback(async (category: WasteCategory) => {
 if (!result?.classificationId) {
 showToast('Không tìm thấy mã phân loại để gửi phản hồi. Vui lòng quét lại.', 'error');
 setShowManualPicker(false);
 return;
 }

 setShowManualPicker(false);

 try {
 await submitFeedbackAsync({
 classificationId: result.classificationId,
 isCorrect: false,
 correctedLabel: category.label,
 correctedWasteType: CATEGORY_TO_WASTE_TYPE[category.id] ?? 'OTHER',
 note: `User corrected low-confidence AI result from "${result.label}" to "${category.label}".`,
 });

 showToast(`Đã gửi phản hồi: ${category.label}. Cảm ơn bạn đã đóng góp!`, 'success');
 navigation.goBack();
 } catch (error: any) {
 const msg = error?.response?.data?.message || error?.message || 'Không thể gửi phản hồi. Vui lòng thử lại.';
 showToast(msg, 'error');
 }
 }, [navigation, result, showToast, submitFeedbackAsync]);

 const renderScanning = () => (
 <View className="flex-1 bg-[#F5F9F5]">
 <SharedHeaderBackground
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
 Đang phân tích
 </Text>
 <View className="w-[38px]" />
 </View>
 </SharedHeaderBackground>

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
 <SharedHeaderBackground
 style={{ paddingTop: insets.top + 16 }}
 className="flex-row items-center justify-between px-5 pb-4"
 >
 <TouchableOpacity
 className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-white/15"
 onPress={handleBackToScan}
 >
 <Ionicons name="arrow-back" size={22} color={Colors.white} />
 </TouchableOpacity>
 <Text className="text-[18px] font-bold text-[#3A3A3A]">Kết quả AI</Text>
 <View className="w-[22px]" />
 </SharedHeaderBackground>

 <Animated.ScrollView
 style={{ transform: [{ translateY: resultSlideAnim }] }}
 contentContainerStyle={{
 paddingHorizontal: 16,
 paddingTop: 16,
 paddingBottom: insets.bottom + 24,
 }}
 showsVerticalScrollIndicator={false}
 >
 <View className="mb-4 items-center rounded-[24px] bg-white p-6 ">
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
 {result.success ? 'Đã nhận diện!' : 'Không xác định'}
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
 Độ tin cậy thấp. Kết quả có thể không chính xác. Hãy chụp lại hoặc chọn thủ công.
 </Text>
 </View>
 )}

 {isMediumConfidence && (
 <View className="mt-3 w-full flex-row rounded-2xl bg-[#FFF8E1] p-4">
 <Ionicons name="information-circle" size={20} color={Colors.warning} />
 <Text className="ml-2 flex-1 text-[13px] font-medium leading-5 text-[#F57F17]">
 Độ tin cậy trung bình. Vui lòng kiểm tra lại kết quả.
 </Text>
 </View>
 )}

 <View className="mt-4 w-full rounded-2xl bg-[#F1F8E9] p-4">
 <View className="mb-2 flex-row items-center">
 <Ionicons name="bulb" size={16} color={Colors.primary} />
 <Text className="ml-1.5 text-[14px] font-bold text-[#2E7D32]">
 Hướng dẫn xử lý
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
 +{result.pointsEarned} điểm xanh
 </Text>
 </View>
 </LinearGradient>
 </View>
 )}

 {result.nearestLocation ? (
 <TouchableOpacity className="mt-4 w-full flex-row items-center rounded-2xl bg-[#F5F9F5] p-4">
 <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#F1F8E9]">
 <Ionicons name="navigate" size={20} color={Colors.primary} />
 </View>
 <View className="flex-1">
 <Text className="text-[13px] font-bold text-[#1B3A1E]">
 Điểm thu gom gần nhất
 </Text>
 <Text className="mt-0.5 text-[12px] text-[#8FA892]" numberOfLines={1}>
 {result.nearestLocation.name} · {result.nearestLocation.distance.toFixed(1)} km
 </Text>
 </View>
 <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
 </TouchableOpacity>
 ) : (
 <View className="mt-4 w-full flex-row items-center rounded-2xl bg-[#F5F9F5] p-4">
 <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#FCE4EC]">
 <Ionicons name="location-outline" size={20} color={Colors.textMuted} />
 </View>
 <View className="flex-1">
 <Text className="text-[13px] font-bold text-[#1B3A1E]">
 Điểm thu gom gần nhất
 </Text>
 <Text className="mt-0.5 text-[12px] text-[#8FA892]" numberOfLines={2}>
 Không tìm thấy điểm thu gom phù hợp quanh đây
 </Text>
 </View>
 </View>
 )}
 </View>

 <View className="mb-4 flex-row">
 <TouchableOpacity
 className="mr-3 h-[52px] flex-1 flex-row items-center justify-center rounded-full border border-[#C8E6C9] bg-white"
 onPress={handleBackToScan}
 >
 <Ionicons name="refresh" size={20} color={Colors.textSecondary} />
 <Text className="ml-1.5 text-[15px] font-semibold text-[#5D7C61]">Quét lại</Text>
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
 <Text className="ml-2 text-[15px] font-bold text-white">Chọn thủ công</Text>
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
 Lưu kết quả {result.pointsEarned > 0 ? `(+${result.pointsEarned}d)` : ''}
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
 Chọn loại rác thủ công
 </Text>
 <Text className="mb-5 mt-1 text-center text-[13px] text-[#8FA892]">
 Chọn loại rác phù hợp nhất
 </Text>

 <View className="flex-row flex-wrap justify-center">
 {wasteCategories.map(cat => (
 <TouchableOpacity
 key={cat.id}
 className="mb-2.5 mr-2.5 items-center rounded-2xl px-1 py-3"
 style={{
 width: (width - 82) / 4,
 backgroundColor: cat.bg,
 opacity: isSubmittingFeedback ? 0.6 : 1,
 }}
 onPress={() => handleManualPick(cat)}
 disabled={isSubmittingFeedback}
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
