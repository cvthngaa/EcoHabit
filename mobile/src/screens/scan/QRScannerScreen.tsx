import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  BarcodeScanningResult,
  CameraView,
  scanFromURLAsync,
  useCameraPermissions,
} from 'expo-camera';
import Colors from '../../theme/colors';
import { useToast } from '../../context/ToastContext';

const { width } = Dimensions.get('window');
const FRAME_SIZE = width * 0.65;

const scanTips = [
  'Giữ camera ổn định khi quét',
  'Đảm bảo mã QR không bị che khuất',
  'Có thể chọn ảnh QR sẵn có từ thư viện',
];

const QRScannerScreen: React.FC = () => {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isProcessingRef = useRef(false);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [scanLineAnim]);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulseAnim]);

  useEffect(() => () => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
  }, []);

  const finishScan = useCallback((data: string, source: 'camera' | 'library') => {
    if (isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;
    setScanned(true);
    showToast(
      source === 'camera'
        ? 'Check-in thành công! +50 điểm xanh'
        : 'Đã quét QR từ thư viện thành công! +50 điểm xanh',
      'success',
    );
    console.log('[QRScannerScreen] Scanned QR data:', data);

    successTimeoutRef.current = setTimeout(() => {
      nav.goBack();
    }, 1600);
  }, [nav, showToast]);

  const handleBarcodeScanned = useCallback(({ data }: BarcodeScanningResult) => {
    if (!data || isProcessingRef.current) {
      return;
    }

    finishScan(data, 'camera');
  }, [finishScan]);

  const handlePickFromLibrary = useCallback(async () => {
    if (isPickingImage) {
      return;
    }

    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!mediaPermission.granted) {
      showToast('Cần quyền thư viện ảnh để chọn ảnh QR', 'error');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsEditing: false,
      quality: 1,
    });

    if (pickerResult.canceled || !pickerResult.assets[0]?.uri) {
      return;
    }

    setIsPickingImage(true);

    try {
      const scannedCodes = await scanFromURLAsync(pickerResult.assets[0].uri, ['qr']);
      const qrCode = scannedCodes.find(item => item.data);

      if (!qrCode?.data) {
        showToast('Không tìm thấy mã QR trong ảnh đã chọn', 'error');
        return;
      }

      finishScan(qrCode.data, 'library');
    } catch (error) {
      console.log('[QRScannerScreen] Failed to scan QR from library image', error);
      showToast('Không thể đọc mã QR từ ảnh đã chọn', 'error');
    } finally {
      setIsPickingImage(false);
    }
  }, [finishScan, isPickingImage, showToast]);

  const handleRequestPermission = useCallback(async () => {
    const result = await requestPermission();

    if (!result.granted) {
      showToast('Bạn cần cấp quyền camera để quét QR trực tiếp', 'error');
    }
  }, [requestPermission, showToast]);

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, FRAME_SIZE - 4],
  });

  return (
    <View style={styles.root}>
      <View style={styles.camera}>
        {permission?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            enableTorch={torchEnabled}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          />
        ) : (
          <LinearGradient
            colors={['#0A1628', '#0D2137', '#112233']}
            style={StyleSheet.absoluteFillObject}
          />
        )}

        <View style={styles.overlay} />

        {!permission && (
          <View style={styles.permissionCard}>
            <ActivityIndicator size="small" color={Colors.white} />
            <Text style={styles.permissionTitle}>Đang kiểm tra quyền camera...</Text>
          </View>
        )}

        {permission && !permission.granted && (
          <View style={styles.permissionCard}>
            <View style={styles.permissionIcon}>
              <Ionicons name="camera-outline" size={32} color={Colors.white} />
            </View>
            <Text style={styles.permissionTitle}>Cần quyền camera để quét QR trực tiếp</Text>
            <Text style={styles.permissionSubtitle}>
              Sau khi cấp quyền, bạn có thể quét ngay trong màn hình này mà không phải mở
              ứng dụng camera khác.
            </Text>
            <TouchableOpacity
              style={styles.permissionBtn}
              onPress={handleRequestPermission}
              activeOpacity={0.85}
            >
              <Text style={styles.permissionBtnTxt}>Cấp quyền camera</Text>
            </TouchableOpacity>
          </View>
        )}

        <Animated.View style={[styles.frame, { transform: [{ scale: pulseAnim }] }]}>
          {(['TL', 'TR', 'BL', 'BR'] as const).map(pos => (
            <View key={pos} style={[styles.corner, styles[`c${pos}`]]} />
          ))}

          <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineTranslate }] }]}>
            <LinearGradient
              colors={['transparent', Colors.primaryLight, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.scanLineGrad}
            />
          </Animated.View>

          <View style={styles.qrIcon}>
            <Ionicons
              name={scanned ? 'checkmark-circle' : 'qr-code-outline'}
              size={48}
              color={scanned ? 'rgba(76,175,80,0.88)' : 'rgba(255,255,255,0.15)'}
            />
          </View>
        </Animated.View>

        <Text style={styles.instructionText}>Đưa mã QR vào khung để quét</Text>
        <Text style={styles.subText}>Quét mã QR tại điểm thu gom để check-in</Text>

        {isPickingImage && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.white} />
            <Text style={styles.loadingText}>Đang đọc mã QR từ ảnh...</Text>
          </View>
        )}
      </View>

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Quét mã QR</Text>
        <TouchableOpacity
          style={[styles.flashBtn, !permission?.granted && styles.flashBtnDisabled]}
          onPress={() => setTorchEnabled(value => !value)}
          disabled={!permission?.granted}
        >
          <Ionicons
            name={torchEnabled ? 'flash' : 'flash-outline'}
            size={22}
            color={Colors.white}
          />
        </TouchableOpacity>
      </View>

      <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Quét trực tiếp bằng camera</Text>
        <Text style={styles.sheetSubtitle}>
          Nếu bạn đã có ảnh chứa QR, hãy chọn từ thư viện ngay bên dưới.
        </Text>

        {scanTips.map(tip => (
          <View key={tip} style={styles.tipRow}>
            <View style={styles.tipDot} />
            <Text style={styles.tipTxt}>{tip}</Text>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.libraryButtonWrap, isPickingImage && styles.libraryButtonWrapDisabled]}
          onPress={handlePickFromLibrary}
          disabled={isPickingImage}
          activeOpacity={0.85}
        >
          <View style={styles.libraryButton}>
            <View style={styles.libraryIconWrap}>
              <Ionicons name="images-outline" size={22} color={Colors.primary} />
            </View>
            <View style={styles.libraryTextWrap}>
              <Text style={styles.libraryTitle}>Chọn ảnh từ thư viện</Text>
              <Text style={styles.librarySubtitle}>Hỗ trợ đọc QR từ ảnh có sẵn</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A1628' },
  camera: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },

  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: Colors.primaryLight, borderWidth: 3 },
  cTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  cTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  cBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  cBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },

  scanLine: { position: 'absolute', top: 0, left: 10, right: 10, height: 2 },
  scanLineGrad: { height: 2, width: '100%' },
  qrIcon: { opacity: 0.7 },

  instructionText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 32,
    textAlign: 'center',
  },
  subText: { fontSize: 13, color: 'rgba(255,255,255,0.72)', marginTop: 6 },

  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { fontSize: 18, fontWeight: '700', color: Colors.white },
  flashBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashBtnDisabled: { opacity: 0.5 },

  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 18,
    paddingHorizontal: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
  },
  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  sheetSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 14,
    lineHeight: 19,
  },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primaryLight },
  tipTxt: { fontSize: 13, color: Colors.textSecondary, flex: 1 },

  libraryButtonWrap: { marginTop: 16, borderRadius: 22, overflow: 'hidden' },
  libraryButtonWrapDisabled: { opacity: 0.7 },
  libraryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  libraryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  libraryTextWrap: { flex: 1 },
  libraryTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  librarySubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  permissionCard: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(7,21,30,0.78)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    zIndex: 3,
  },
  permissionIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  permissionTitle: { fontSize: 17, fontWeight: '700', color: Colors.white, textAlign: 'center' },
  permissionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  permissionBtn: {
    marginTop: 18,
    backgroundColor: Colors.primaryLight,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  permissionBtnTxt: { fontSize: 14, fontWeight: '700', color: Colors.white },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  loadingText: { marginTop: 12, fontSize: 14, fontWeight: '600', color: Colors.white },
});

export default QRScannerScreen;
