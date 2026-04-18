import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  Animated, ScrollView, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../theme/colors';
import ConfidenceBadge from '../components/ConfidenceBadge';
import WasteBadge from '../components/WasteBadge';
import ScanningAnimation from '../components/ScanningAnimation';
import { useToast } from '../context/ToastContext';
import { classifyWaste, AIClassificationResult, getConfidenceLevel } from '../services/aiService';
import { wasteCategories, WasteCategory } from '../services/mockData';
import { earnPoints } from '../services/walletService';

const { width, height } = Dimensions.get('window');

// ── Tips for scanning ─────────────────────────────────────────────────────────

const scanTips = [
  'Giữ camera thẳng và ổn định',
  'Đảm bảo ánh sáng đủ để nhận diện',
  'Đặt vật thể chiếm 70% khung hình',
];

// ── ScanScreen (Multi-step: idle → scanning → result) ─────────────────────────

type ScanMode = 'idle' | 'scanning' | 'result';

const ScanScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [mode, setMode] = useState<ScanMode>('idle');
  const [result, setResult] = useState<AIClassificationResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [showManualPicker, setShowManualPicker] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const resultSlideAnim = useRef(new Animated.Value(400)).current;

  // ── Simulated progress ────────────────────────────────────────────────────

  useEffect(() => {
    if (mode !== 'scanning') return;

    setProgress(0);
    const startTime = Date.now();
    const duration = 3000; // 3 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 95); // cap at 95 until real result
      setProgress(pct);
    }, 50);

    return () => clearInterval(interval);
  }, [mode]);

  // ── Handle scan ───────────────────────────────────────────────────────────

  const handleScan = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast('Cần quyền thư viện ảnh để quét', 'error');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });

    if (pickerResult.canceled || !pickerResult.assets[0]?.uri) {
      return;
    }

    setMode('scanning');
    resultSlideAnim.setValue(400);

    // Start pulse
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ]),
    );
    pulse.start();

    try {
      const aiResult = await classifyWaste(pickerResult.assets[0].uri);
      pulse.stop();
      pulseAnim.setValue(1);
      setProgress(100);

      // Short delay to show 100%
      setTimeout(() => {
        setResult(aiResult);
        setMode('result');
        Animated.spring(resultSlideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 9,
        }).start();
      }, 400);
    } catch (err) {
      pulse.stop();
      pulseAnim.setValue(1);
      setMode('idle');
      showToast('Không thể gọi AI. Vui lòng kiểm tra đăng nhập và kết nối backend.', 'error');
    }
  }, [showToast]);

  // ── Handle save result ────────────────────────────────────────────────────

  const handleSaveResult = () => {
    if (result && result.pointsEarned > 0) {
      earnPoints(result.pointsEarned, `Quét ${result.label}`, 'scan');
      showToast(`+${result.pointsEarned} điểm xanh đã được cộng!`, 'success');
    }
    handleReset();
  };

  // ── Handle manual pick ────────────────────────────────────────────────────

  const handleManualPick = (category: WasteCategory) => {
    setShowManualPicker(false);
    const points = category.points;
    earnPoints(points, `Phân loại thủ công: ${category.label}`, 'scan');
    showToast(`Đã xác nhận ${category.label} · +${points} điểm`, 'success');
    handleReset();
  };

  const handleReset = () => {
    setMode('idle');
    setResult(null);
    setProgress(0);
    resultSlideAnim.setValue(400);
  };

  // ── Render: Camera (idle) ─────────────────────────────────────────────────

  const renderCamera = () => (
    <>
      {/* Camera viewfinder mock */}
      <LinearGradient colors={['#0A1628', '#0D2137', '#112233']} style={styles.camera}>
        {/* Corner brackets */}
        {(['TL', 'TR', 'BL', 'BR'] as const).map(pos => (
          <View key={pos} style={[styles.corner, styles[`corner${pos}`]]} />
        ))}

        {/* Grid overlay */}
        <View style={styles.gridOverlay} pointerEvents="none">
          {[1, 2].map(v => (
            <View key={`v${v}`} style={[styles.gridLineV, { left: `${v * 33.3}%` as any }]} />
          ))}
          {[1, 2].map(h => (
            <View key={`h${h}`} style={[styles.gridLineH, { top: `${h * 33.3}%` as any }]} />
          ))}
        </View>

        <View style={styles.idleCenter}>
          <View style={styles.idleIconWrap}>
            <Ionicons name="camera" size={36} color={Colors.white} />
          </View>
          <Text style={styles.idleHint}>Hướng camera vào vật cần phân loại</Text>
        </View>
      </LinearGradient>

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.topTitle}>Quét & Phân loại</Text>
        <TouchableOpacity style={styles.topBtn}>
          <Ionicons name="flash-outline" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Bottom panel */}
      <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 16 }]}>
        {/* Tips */}
        <View style={styles.tipsWrap}>
          {scanTips.map((t, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipTxt}>{t}</Text>
            </View>
          ))}
        </View>

        {/* Scan button */}
        <TouchableOpacity style={styles.scanBtnWrap} onPress={handleScan} activeOpacity={0.85}>
          <LinearGradient
            colors={[Colors.primaryGradientStart, Colors.primaryLight]}
            style={styles.scanBtn}
          >
            <Ionicons name="scan" size={32} color={Colors.white} />
            <Text style={styles.scanBtnTxt}>Bắt đầu quét</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Category chips */}
        <Text style={styles.catTitle}>Loại rác phổ biến</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {wasteCategories.slice(0, 6).map(c => (
            <TouchableOpacity key={c.id} style={[styles.catItem, { backgroundColor: c.bg }]} activeOpacity={0.8}>
              <Ionicons name={c.icon as any} size={20} color={c.color} />
              <Text style={[styles.catLabel, { color: c.color }]}>{c.label}</Text>
              <Text style={[styles.catPts, { color: c.color }]}>+{c.points} đ</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );

  // ── Render: Scanning ──────────────────────────────────────────────────────

  const renderScanning = () => (
    <View style={styles.scanningContainer}>
      <View style={[styles.scanningTop, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.scanningTopTitle}>Đang phân tích</Text>
      </View>
      <View style={styles.scanningContent}>
        <ScanningAnimation progress={progress} />
      </View>
    </View>
  );

  // ── Render: Result ────────────────────────────────────────────────────────

  const renderResult = () => {
    if (!result) return null;

    const confidenceLevel = getConfidenceLevel(result.confidence);
    const isLowConfidence = confidenceLevel === 'low';
    const isMediumConfidence = confidenceLevel === 'medium';

    return (
      <View style={styles.resultContainer}>
        {/* Top section */}
        <LinearGradient
          colors={['#0A1628', '#0D2137']}
          style={[styles.resultTop, { paddingTop: insets.top + 16 }]}
        >
          <TouchableOpacity style={styles.resultBackBtn} onPress={handleReset}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.resultTopTitle}>Kết quả AI</Text>
          <View style={{ width: 22 }} />
        </LinearGradient>

        {/* Result card */}
        <Animated.ScrollView
          style={{ transform: [{ translateY: resultSlideAnim }] }}
          contentContainerStyle={[styles.resultScroll, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultCard}>
            {/* Icon */}
            <View style={[styles.resultIconWrap, { backgroundColor: result.category.bg }]}>
              <Ionicons name={result.category.icon as any} size={48} color={result.category.color} />
            </View>

            {/* Status */}
            {result.success ? (
              <Text style={styles.resultStatus}>✅ Đã nhận diện!</Text>
            ) : (
              <Text style={[styles.resultStatus, { color: Colors.warning }]}>⚠️ Không xác định</Text>
            )}

            {/* Label */}
            <Text style={[styles.resultLabel, { color: result.category.color }]}>
              {result.label}
            </Text>

            {/* Waste badge */}
            <WasteBadge type={result.category.type} />

            {/* Confidence */}
            <View style={styles.resultConfidenceWrap}>
              <ConfidenceBadge confidence={result.confidence} size="lg" />
            </View>

            {/* Warning for low confidence */}
            {isLowConfidence && (
              <View style={styles.warningBox}>
                <Ionicons name="alert-circle" size={20} color={Colors.warning} />
                <Text style={styles.warningText}>
                  Độ tin cậy thấp. Kết quả có thể không chính xác. Hãy chụp lại hoặc chọn thủ công.
                </Text>
              </View>
            )}

            {/* Medium confidence note */}
            {isMediumConfidence && (
              <View style={[styles.warningBox, { backgroundColor: Colors.warningLight }]}>
                <Ionicons name="information-circle" size={20} color={Colors.warning} />
                <Text style={[styles.warningText, { color: Colors.warning }]}>
                  Độ tin cậy trung bình. Vui lòng kiểm tra lại kết quả.
                </Text>
              </View>
            )}

            {/* Disposal tip */}
            <View style={styles.disposalCard}>
              <View style={styles.disposalHeader}>
                <Ionicons name="bulb" size={16} color={Colors.primary} />
                <Text style={styles.disposalTitle}>Hướng dẫn xử lý</Text>
              </View>
              <Text style={styles.disposalText}>{result.disposalTip}</Text>
            </View>

            {/* Points earned */}
            {result.pointsEarned > 0 && (
              <View style={styles.pointsBadge}>
                <LinearGradient colors={['#FFD54F', '#FF8F00']} style={styles.pointsGrad}>
                  <Ionicons name="star" size={18} color={Colors.white} />
                  <Text style={styles.pointsText}>+{result.pointsEarned} điểm xanh</Text>
                </LinearGradient>
              </View>
            )}

            {/* Suggestion */}
            <TouchableOpacity style={styles.suggestionCard} activeOpacity={0.8}>
              <View style={styles.suggestionIcon}>
                <Ionicons name="navigate" size={20} color={Colors.primary} />
              </View>
              <View style={styles.suggestionInfo}>
                <Text style={styles.suggestionTitle}>Điểm thu gom gần nhất</Text>
                <Text style={styles.suggestionSub}>Điểm thu gom B1 · 0.3 km</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Action buttons */}
          <View style={styles.resultActions}>
            <TouchableOpacity style={styles.retryBtn} onPress={handleReset}>
              <Ionicons name="refresh" size={20} color={Colors.textSecondary} />
              <Text style={styles.retryBtnTxt}>Quét lại</Text>
            </TouchableOpacity>

            {isLowConfidence ? (
              <TouchableOpacity
                style={styles.manualBtn}
                onPress={() => setShowManualPicker(true)}
                activeOpacity={0.85}
              >
                <LinearGradient colors={[Colors.warning, '#FF8F00']} style={styles.manualBtnGrad}>
                  <Ionicons name="hand-left" size={18} color={Colors.white} />
                  <Text style={styles.manualBtnTxt}>Chọn thủ công</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveResult} activeOpacity={0.85}>
                <LinearGradient colors={[Colors.primaryGradientStart, Colors.primaryLight]} style={styles.saveBtnGrad}>
                  <Text style={styles.saveBtnTxt}>
                    Lưu kết quả {result.pointsEarned > 0 ? `(+${result.pointsEarned}đ)` : ''}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </Animated.ScrollView>

        {/* Manual picker modal */}
        <Modal visible={showManualPicker} transparent animationType="slide" onRequestClose={() => setShowManualPicker(false)}>
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowManualPicker(false)} activeOpacity={1}>
            <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Chọn loại rác thủ công</Text>
              <Text style={styles.modalSubtitle}>Chọn loại rác phù hợp nhất</Text>
              <View style={styles.modalGrid}>
                {wasteCategories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.modalItem, { backgroundColor: cat.bg }]}
                    onPress={() => handleManualPick(cat)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={cat.icon as any} size={28} color={cat.color} />
                    <Text style={[styles.modalItemLabel, { color: cat.color }]}>{cat.label}</Text>
                    <Text style={[styles.modalItemPts, { color: cat.color }]}>+{cat.points} đ</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      {mode === 'idle' && renderCamera()}
      {mode === 'scanning' && renderScanning()}
      {mode === 'result' && renderResult()}
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A1628' },

  // Camera
  camera: { flex: 1, position: 'relative', justifyContent: 'center', alignItems: 'center' },

  corner: { position: 'absolute', width: 28, height: 28, borderColor: Colors.primaryLight, borderWidth: 3 },
  cornerTL: { top: 80, left: 50, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
  cornerTR: { top: 80, right: 50, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
  cornerBL: { bottom: 60, left: 50, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 60, right: 50, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 6 },

  gridOverlay: { ...StyleSheet.absoluteFillObject },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 0.5, backgroundColor: 'rgba(255,255,255,0.08)' },
  gridLineH: { position: 'absolute', left: 0, right: 0, height: 0.5, backgroundColor: 'rgba(255,255,255,0.08)' },

  idleCenter: { alignItems: 'center' },
  idleIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  idleHint: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', paddingHorizontal: 40 },

  // Top bar
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10 },
  topTitle: { fontSize: 18, fontWeight: '700', color: Colors.white },
  topBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },

  // Bottom panel
  bottomPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 16, paddingHorizontal: 20, elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 20 },

  // Tips
  tipsWrap: { marginBottom: 16 },
  tipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primaryLight },
  tipTxt: { fontSize: 12, color: Colors.textSecondary, flex: 1 },

  // Scan button
  scanBtnWrap: { borderRadius: 50, overflow: 'hidden', marginBottom: 20, elevation: 8, shadowColor: Colors.primaryGradientStart, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12 },
  scanBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 58, borderRadius: 50 },
  scanBtnTxt: { fontSize: 17, fontWeight: '700', color: Colors.white },

  // Category chips
  catTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  catScroll: { gap: 8, paddingRight: 4 },
  catItem: { alignItems: 'center', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  catLabel: { fontSize: 11, fontWeight: '700' },
  catPts: { fontSize: 10, fontWeight: '600' },

  // Scanning mode
  scanningContainer: { flex: 1, backgroundColor: Colors.white },
  scanningTop: { paddingHorizontal: 20, paddingBottom: 16, backgroundColor: Colors.background },
  scanningTopTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  scanningContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Result mode
  resultContainer: { flex: 1, backgroundColor: Colors.background },
  resultTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  resultBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTopTitle: { fontSize: 18, fontWeight: '700', color: Colors.white },

  resultScroll: { paddingHorizontal: 16, paddingTop: 16 },

  resultCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    marginBottom: 16,
  },
  resultIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resultStatus: { fontSize: 14, fontWeight: '600', color: Colors.primary, marginBottom: 6 },
  resultLabel: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 10, textAlign: 'center' },
  resultConfidenceWrap: { marginVertical: 12 },

  // Warning box
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.errorLight,
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    width: '100%',
  },
  warningText: { flex: 1, fontSize: 13, color: Colors.error, lineHeight: 20, fontWeight: '500' },

  // Disposal tip
  disposalCard: {
    width: '100%',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
  },
  disposalHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  disposalTitle: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  disposalText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  // Points badge
  pointsBadge: { borderRadius: 50, overflow: 'hidden', marginTop: 16, elevation: 4 },
  pointsGrad: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10 },
  pointsText: { fontSize: 15, fontWeight: '700', color: Colors.white },

  // Suggestion
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    gap: 12,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionInfo: { flex: 1 },
  suggestionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  suggestionSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  // Action buttons
  resultActions: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  retryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 52,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  retryBtnTxt: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },

  saveBtn: { flex: 2, borderRadius: 50, overflow: 'hidden', elevation: 6 },
  saveBtnGrad: { height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 50 },
  saveBtnTxt: { fontSize: 15, fontWeight: '700', color: Colors.white },

  manualBtn: { flex: 2, borderRadius: 50, overflow: 'hidden', elevation: 6 },
  manualBtnGrad: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 50 },
  manualBtnTxt: { fontSize: 15, fontWeight: '700', color: Colors.white },

  // Manual picker modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginBottom: 20 },
  modalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  modalItem: {
    width: (width - 82) / 4,
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 4,
  },
  modalItemLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  modalItemPts: { fontSize: 10, fontWeight: '600' },
});

export default ScanScreen;
