import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Colors from '../../theme/colors';
import DraggableBottomSheet from '../../components/DraggableBottomSheet';
import { useToast } from '../../context/ToastContext';

const { width } = Dimensions.get('window');

const SCAN_SHEET_COLLAPSED_HEIGHT = 232;
const SCAN_SHEET_EXPANDED_HEIGHT = 348;

const scanTips = [
  'Giữ camera thẳng và ổn định',
  'Đảm bảo ánh sáng đủ để nhận diện',
  'Đặt vật thể chiếm khoảng 70% khung hình',
];

const ScanScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { showToast } = useToast();
  const [permission, requestPermission] = useCameraPermissions();

  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [sheetInstanceKey, setSheetInstanceKey] = useState(0);

  const cameraRef = useRef<CameraView | null>(null);

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        tabBarStyle: { display: 'none' },
      });
      setSheetInstanceKey(prev => prev + 1);

      return () => {
        navigation.setOptions({
          tabBarStyle: undefined,
        });
      };
    }, [navigation]),
  );

  const navigateToAnalysis = useCallback((imageUri: string) => {
    const parent = navigation.getParent?.();

    if (parent?.navigate) {
      parent.navigate('ScanAnalysis', { imageUri });
      return;
    }

    navigation.navigate('ScanAnalysis', { imageUri });
  }, [navigation]);

  const handleLibraryPick = useCallback(async () => {
    if (isPickingImage) return;

    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!mediaPermission.granted) {
      showToast('Cần quyền thư viện ảnh để chọn ảnh', 'error');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsEditing: true,
      quality: 0.9,
    });

    if (pickerResult.canceled || !pickerResult.assets[0]?.uri) {
      return;
    }

    setIsPickingImage(true);
    try {
      navigateToAnalysis(pickerResult.assets[0].uri);
    } finally {
      setIsPickingImage(false);
    }
  }, [isPickingImage, navigateToAnalysis, showToast]);

  const handleCapture = useCallback(async () => {
    if (isCapturing) return;

    if (!permission?.granted) {
      const response = await requestPermission();
      if (!response.granted) {
        showToast('Cần quyền camera để chụp ảnh phân loại rác', 'error');
        return;
      }
    }

    if (!cameraRef.current || !isCameraReady) {
      showToast('Camera đang khởi tạo, vui lòng thử lại sau một chút', 'error');
      return;
    }

    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        shutterSound: false,
      });

      if (!photo?.uri) {
        showToast('Không thể chụp ảnh. Vui lòng thử lại.', 'error');
        return;
      }

      navigateToAnalysis(photo.uri);
    } catch (error) {
      console.log('[ScanScreen] Failed to capture image', error);
      showToast('Không thể chụp ảnh. Vui lòng thử lại.', 'error');
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, isCameraReady, navigateToAnalysis, permission?.granted, requestPermission, showToast]);

  const handleGoBack = useCallback(() => {
    const parent = navigation.getParent?.();

    if (parent?.canGoBack?.()) {
      parent.goBack();
      return;
    }

    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Home');
  }, [navigation]);

  return (
    <View className="flex-1 bg-[#0A1628]">
      <View className="flex-1 overflow-hidden bg-[#08111D]">
        {permission?.granted ? (
          <CameraView
            ref={cameraRef}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            facing="back"
            enableTorch={torchEnabled}
            onCameraReady={() => setIsCameraReady(true)}
          />
        ) : (
          <LinearGradient
            colors={['#08111D', '#10243B', '#16314D']}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          />
        )}

        <View className="absolute inset-0 bg-[#05101C]/35" pointerEvents="none" />
        <LinearGradient
          colors={['rgba(3,10,18,0.72)', 'transparent', 'rgba(3,10,18,0.24)', 'rgba(255,255,255,0)']}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          pointerEvents="none"
        />

        <View
          className="absolute left-0 right-0 flex-row items-center justify-between px-5"
          style={{ paddingTop: insets.top + 8 }}
        >
          <View className="flex-row items-center">
            <TouchableOpacity
              className="mr-3 h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/15"
              onPress={handleGoBack}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-back" size={21} color={Colors.white} />
            </TouchableOpacity>

            <View>
              <Text className="text-[19px] font-extrabold tracking-[0.2px] text-white">
                Quét & Phân loại
              </Text>
              <Text className="mt-1 text-[12px] font-medium text-white/70">
                Chụp nhanh món đồ để AI nhận diện
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className={`h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/15 ${!permission?.granted ? 'opacity-50' : ''}`}
            onPress={() => setTorchEnabled(value => !value)}
            disabled={!permission?.granted}
            activeOpacity={0.85}
          >
            <Ionicons name={torchEnabled ? 'flash' : 'flash-outline'} size={21} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <View className="items-center">
            <View
              className="relative rounded-[34px] border border-white/10 bg-white/5"
              style={{ width: width - 80, height: Math.min(width - 80, 330) * 1.02, maxWidth: 330 }}
            >
              <View className="absolute inset-0 rounded-[34px] bg-black/12" />
              <View className="absolute left-0 top-0 h-[68px] w-[68px] rounded-tl-[30px] border-l-[5px] border-t-[5px] border-[#FFD24D]" />
              <View className="absolute right-0 top-0 h-[68px] w-[68px] rounded-tr-[30px] border-r-[5px] border-t-[5px] border-[#FFD24D]" />
              <View className="absolute bottom-0 left-0 h-[68px] w-[68px] rounded-bl-[30px] border-b-[5px] border-l-[5px] border-[#FFD24D]" />
              <View className="absolute bottom-0 right-0 h-[68px] w-[68px] rounded-br-[30px] border-b-[5px] border-r-[5px] border-[#FFD24D]" />
            </View>
          </View>
        </View>

        {!permission && (
          <View className="absolute inset-0 items-center justify-center px-6">
            <View className="w-full max-w-[320px] rounded-[28px] bg-[#07151E]/80 px-6 py-7">
              <ActivityIndicator size="small" color={Colors.white} />
              <Text className="mt-4 text-center text-[16px] font-bold text-white">
                Đang kiểm tra quyền camera...
              </Text>
            </View>
          </View>
        )}

        {permission && !permission.granted && (
          <View className="absolute inset-0 items-center justify-center px-6">
            <View className="w-full max-w-[340px] rounded-[30px] bg-[#07151E]/84 px-6 py-7">
              <View className="mx-auto h-[62px] w-[62px] items-center justify-center rounded-[22px] bg-white/10">
                <Ionicons name="camera-outline" size={32} color={Colors.white} />
              </View>
              <Text className="mt-4 text-center text-[18px] font-extrabold text-white">
                Cần quyền camera để quét trực tiếp
              </Text>
              <Text className="mt-3 text-center text-[13px] leading-5 text-white/75">
                Sau khi cấp quyền, camera sẽ mở ngay trên màn hình scan để bạn chụp và phân loại.
              </Text>
              <TouchableOpacity
                className="mt-6 self-center rounded-full bg-[#4CAF50] px-6 py-3"
                onPress={requestPermission}
                activeOpacity={0.85}
              >
                <Text className="text-[14px] font-bold text-white">Cấp quyền camera</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isPickingImage && (
          <View className="absolute inset-0 items-center justify-center bg-black/45 px-6">
            <ActivityIndicator size="large" color={Colors.white} />
            <Text className="mt-3 text-[14px] font-semibold text-white">
              Đang mở ảnh từ thư viện...
            </Text>
          </View>
        )}
      </View>

      <DraggableBottomSheet
        key={sheetInstanceKey}
        collapsedHeight={SCAN_SHEET_COLLAPSED_HEIGHT + insets.bottom}
        expandedHeight={SCAN_SHEET_EXPANDED_HEIGHT + insets.bottom}
        bottomInset={insets.bottom}
        initialSnap="expanded"
      >
        <View className="flex-1 px-5 pb-6">
          <View className="rounded-[24px] bg-[#F5F8F2] px-4 py-4">
            <View className="mt-4">
              {scanTips.map(tip => (
                <View key={tip} className="mb-2 flex-row items-center">
                  <View className="mr-3 h-2 w-2 rounded-full bg-[#4CAF50]" />
                  <Text className="flex-1 text-[13px] text-[#5D7C61]">{tip}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            className={`mt-4 rounded-[24px] bg-[#F1F8E9] p-4 ${isPickingImage ? 'opacity-70' : ''}`}
            onPress={handleLibraryPick}
            disabled={isPickingImage}
            activeOpacity={0.85}
          >
            <View className="flex-row items-center">
              <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-white">
                <Ionicons name="images-outline" size={22} color={Colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-[#1B3A1E]">Mở thư viện ảnh</Text>
                <Text className="mt-1 text-[12px] text-[#5D7C61]">
                  Chọn ảnh rác đã chụp sẵn để AI phân tích
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </View>
          </TouchableOpacity>
        </View>
      </DraggableBottomSheet>

      <View
        className="absolute self-center items-center"
        style={{ bottom: Math.max(insets.bottom + 18, 28) }}
      >
        <TouchableOpacity
          className={`${isCapturing || isPickingImage ? 'opacity-70' : ''}`}
          onPress={handleCapture}
          disabled={isCapturing || isPickingImage}
          activeOpacity={0.9}
        >
          <View className="h-[90px] w-[90px] items-center justify-center rounded-full border-[5px] border-white/95 bg-white/12 shadow-2xl">
            <LinearGradient
              colors={[Colors.primaryGradientStart, Colors.primaryLight]}
              style={{
                width: 72,
                height: 72,
                borderRadius: 999,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isCapturing ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <View
                    style={{
                      position: 'absolute',
                      width: 50,
                      height: 50,
                      borderRadius: 999,
                      backgroundColor: 'rgba(255,255,255,0.16)',
                    }}
                  />
                  <Ionicons name="scan" size={24} color={Colors.white} />
                </>
              )}
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ScanScreen;
