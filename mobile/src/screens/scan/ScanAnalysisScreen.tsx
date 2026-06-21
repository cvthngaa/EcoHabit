import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    Animated,
    Modal,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import Colors from '../../theme/colors';
import WasteBadge from '../../components/WasteBadge';
import ScanningAnimation from '../../components/ScanningAnimation';
import SharedHeaderBackground from '../../components/SharedHeaderBackground';
import { useToast } from '../../context/ToastContext';
import {
    AIClassificationResult,
    WasteType,
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
    const [results, setResults] = useState<AIClassificationResult[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [showManualPicker, setShowManualPicker] = useState(false);
    const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
    const [imageRotation, setImageRotation] = useState(90);

    const resultSlideAnim = useRef(new Animated.Value(400)).current;

    const handleBackToScan = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    useEffect(() => {
        if (imageUri) {
            Image.getSize(
                imageUri,
                (w, h) => setImageSize({ width: w, height: h }),
                () => setImageSize({ width: 4, height: 3 })
            );
        } else {
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
                    setResults(aiResult);
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
        if (results.length > 0) {
            const totalPoints = results.reduce((sum, r) => sum + r.pointsEarned, 0);
            const totalAwarded = results.reduce((sum, r) => sum + (r.awarded ? r.pointsEarned : 0), 0);
            if (totalPoints > 0) {
                if (totalAwarded > 0) {
                    showToast(`+${totalAwarded} điểm xanh đã được cộng vào tài khoản!`, 'success');
                } else {
                    showToast('Xác nhận phân loại thành công!', 'success');
                }
            } else {
                showToast('Đã lưu kết quả phân loại!', 'success');
            }
        }

        navigation.goBack();
    }, [navigation, results, showToast]);

    const handleManualPick = useCallback(async (category: WasteCategory) => {
        const currentResult = results[activeIndex];
        if (!currentResult?.classificationId) {
            showToast('Không tìm thấy mã phân loại để gửi phản hồi. Vui lòng quét lại.', 'error');
            setShowManualPicker(false);
            return;
        }

        setShowManualPicker(false);

        try {
            await submitFeedbackAsync({
                classificationId: currentResult.classificationId,
                isCorrect: false,
                correctedLabel: category.label,
                correctedWasteType: CATEGORY_TO_WASTE_TYPE[category.id] ?? 'OTHER',
                note: `User corrected low-confidence AI result from "${currentResult.label}" to "${category.label}".`,
            });

            showToast(`Đã gửi phản hồi: ${category.label}. Cảm ơn bạn đã đóng góp!`, 'success');
            navigation.goBack();
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || 'Không thể gửi phản hồi. Vui lòng thử lại.';
            showToast(msg, 'error');
        }
    }, [activeIndex, navigation, results, showToast, submitFeedbackAsync]);

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
        if (results.length === 0) return null;

        const currentResult = results[activeIndex];
        const totalPoints = results.reduce((sum, r) => sum + r.pointsEarned, 0);

        const handleScroll = (event: any) => {
            const x = event.nativeEvent.contentOffset.x;
            const index = Math.round(x / width);
            if (index !== activeIndex && index >= 0 && index < results.length) {
                setActiveIndex(index);
            }
        };

        const screenHeight = Dimensions.get('window').height;
        const maxImageWidth = width - 32;
        const maxImageHeight = screenHeight * 0.4;
        
        const isRotated = imageRotation === 90 || imageRotation === 270;
        const effectiveRatio = isRotated 
            ? imageSize.height / imageSize.width 
            : imageSize.width / imageSize.height;
        
        let wrapperWidth = maxImageWidth;
        let wrapperHeight = wrapperWidth / effectiveRatio;
        
        if (wrapperHeight > maxImageHeight) {
            wrapperHeight = maxImageHeight;
            wrapperWidth = wrapperHeight * effectiveRatio;
        }

        const innerWidth = isRotated ? wrapperHeight : wrapperWidth;
        const innerHeight = isRotated ? wrapperWidth : wrapperHeight;

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
                    <Text className="text-[18px] font-bold text-[#3A3A3A]">Kết quả AI ({results.length} vật thể)</Text>
                    <TouchableOpacity
                        className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-white/50"
                        onPress={() => setImageRotation(prev => (prev + 90) % 360)}
                    >
                        <Ionicons name="refresh" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                </SharedHeaderBackground>

                <Animated.ScrollView
                    style={{ transform: [{ translateY: resultSlideAnim }] }}
                    contentContainerStyle={{
                        paddingTop: 8,
                        paddingBottom: insets.bottom + 24,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{ paddingHorizontal: 16, marginBottom: 12, alignItems: 'center' }}>
                        <View style={{
                            width: wrapperWidth,
                            height: wrapperHeight,
                            borderRadius: 16,
                            overflow: 'hidden',
                            backgroundColor: '#E7F1E7',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <View style={{
                                width: innerWidth,
                                height: innerHeight,
                                transform: [{ rotate: `${imageRotation}deg` }],
                                position: 'relative'
                            }}>
                                {imageUri ? (
                                    <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} />
                                ) : null}
                                {results.map((item, index) => {
                                    if (!item.boundingBox) return null;
                                    const [xmin, ymin, xmax, ymax] = item.boundingBox;
                                    const x = xmin * innerWidth;
                                    const y = ymin * innerHeight;
                                    const w = (xmax - xmin) * innerWidth;
                                    const h = (ymax - ymin) * innerHeight;
                                    const isActive = index === activeIndex;

                                return (
                                    <TouchableOpacity
                                        key={`bbox-${item.classificationId || index}`}
                                        onPress={() => setActiveIndex(index)}
                                        activeOpacity={0.9}
                                        style={{
                                            position: 'absolute',
                                            left: x,
                                            top: y,
                                            width: w,
                                            height: h,
                                            borderWidth: isActive ? 3 : 2,
                                            borderColor: isActive ? Colors.primary : 'rgba(255,255,255,0.7)',
                                            borderRadius: 8,
                                            zIndex: isActive ? 10 : 1
                                        }}
                                    >
                                        <View style={{
                                            position: 'absolute',
                                            bottom: -28,
                                            left: -3,
                                            backgroundColor: isActive ? Colors.primary : 'rgba(0,0,0,0.6)',
                                            paddingHorizontal: 8,
                                            paddingVertical: 4,
                                            borderRadius: 6,
                                            maxWidth: 150,
                                        }}>
                                            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }} numberOfLines={1}>
                                                {item.label}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                            </View>
                        </View>
                    </View>

                    {results.length > 1 && (
                        <View className="mb-4 flex-row justify-center space-x-1.5">
                            {results.map((_, idx) => (
                                <View
                                    key={idx}
                                    className={`h-2 rounded-full ${idx === activeIndex ? 'w-6 bg-[#4CAF50]' : 'w-2 bg-[#C8E6C9]'}`}
                                    style={{ marginHorizontal: 3 }}
                                />
                            ))}
                        </View>
                    )}

                    <Animated.ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    >
                        {results.map((item, index) => {
                            return (
                                <View key={item.classificationId || index} style={{ width, paddingHorizontal: 16 }}>
                                    <View className="mb-4 rounded-[24px] bg-white p-4 shadow-sm shadow-black/5">
                                        {/* Header: Icon + Name + Badge + Edit */}
                                        <View className="flex-row items-center mb-3">
                                            <View
                                                className="h-[56px] w-[56px] items-center justify-center rounded-[18px] mr-3"
                                                style={{ backgroundColor: item.category.bg }}
                                            >
                                                <Ionicons name={item.category.icon as any} size={28} color={item.category.color} />
                                            </View>
                                            <View className="flex-1">
                                                <View className="flex-row items-center mb-1">
                                                    <Text
                                                        className="text-[18px] font-extrabold tracking-[-0.5px]"
                                                        style={{ color: item.category.color }}
                                                    >
                                                        {item.label}
                                                    </Text>
                                                    <TouchableOpacity onPress={() => setShowManualPicker(true)} className="ml-2 p-1">
                                                        <Ionicons name="pencil" size={16} color={Colors.textMuted} />
                                                    </TouchableOpacity>
                                                </View>
                                                <View className="self-start">
                                                    <WasteBadge type={item.category.type} />
                                                </View>
                                            </View>
                                            {item.pointsEarned > 0 && (
                                                <View className="items-end justify-center ml-2">
                                                    <Text className="text-[16px] font-bold text-[#FF8F00]">+{item.pointsEarned}</Text>
                                                    <Text className="text-[10px] font-semibold text-[#FF8F00]">ĐIỂM</Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* Disposal tip */}
                                        <View className="w-full rounded-[16px] bg-[#F1F8E9] p-3 mb-3">
                                            <View className="mb-1 flex-row items-center">
                                                <Ionicons name="bulb" size={14} color={Colors.primary} />
                                                <Text className="ml-1 text-[13px] font-bold text-[#2E7D32]">Hướng dẫn xử lý</Text>
                                            </View>
                                            <Text className="text-[12px] leading-[18px] text-[#5D7C61]" numberOfLines={2}>{item.disposalTip}</Text>
                                        </View>

                                        {/* Nearest location */}
                                        {item.nearestLocation ? (
                                            <TouchableOpacity className="w-full flex-row items-center rounded-[16px] bg-[#F5F9F5] p-3">
                                                <View className="mr-3 h-8 w-8 items-center justify-center rounded-xl bg-[#E7F1E7]">
                                                    <Ionicons name="navigate" size={16} color={Colors.primary} />
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-[12px] font-bold text-[#1B3A1E]">Điểm thu gom gần nhất</Text>
                                                    <Text className="text-[11px] text-[#8FA892] mt-0.5" numberOfLines={1}>
                                                        {item.nearestLocation.name} · {item.nearestLocation.distance.toFixed(1)} km
                                                    </Text>
                                                </View>
                                                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                                            </TouchableOpacity>
                                        ) : (
                                            <View className="w-full flex-row items-center rounded-[16px] bg-[#F5F9F5] p-3">
                                                <View className="mr-3 h-8 w-8 items-center justify-center rounded-xl bg-[#FCE4EC]">
                                                    <Ionicons name="location-outline" size={16} color={Colors.textMuted} />
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-[12px] font-bold text-[#1B3A1E]">Điểm thu gom gần nhất</Text>
                                                    <Text className="text-[11px] text-[#8FA892] mt-0.5" numberOfLines={1}>Không tìm thấy quanh đây</Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </Animated.ScrollView>

                    <View className="mb-4 flex-row px-4">
                        <TouchableOpacity
                            className="mr-3 h-[52px] flex-1 flex-row items-center justify-center rounded-full border border-[#C8E6C9] bg-white"
                            onPress={handleBackToScan}
                        >
                            <Ionicons name="refresh" size={20} color={Colors.textSecondary} />
                            <Text className="ml-1.5 text-[15px] font-semibold text-[#5D7C61]">Quét lại</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-[2] overflow-hidden rounded-full shadow-sm shadow-primary/30"
                            onPress={handleSaveResult}
                            activeOpacity={0.85}
                        >
                            <LinearGradient colors={[Colors.primaryGradientStart, Colors.primaryLight]} style={{ height: 52, borderRadius: 999 }}>
                                <View className="h-full items-center justify-center px-4">
                                    <Text className="text-[15px] font-bold text-white">
                                        Lưu kết quả {totalPoints > 0 ? `(+${totalPoints}d)` : ''}
                                    </Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
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
