import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../theme/colors';
import { useToast } from '../context/ToastContext';
import { collectionPoints } from '../services/mockData';

const { width } = Dimensions.get('window');

// ── Filters ───────────────────────────────────────────────────────────────────

const filters = ['Tất cả', 'Nhựa', 'Giấy', 'Kim loại', 'Hữu cơ', 'Pin', 'Thủy tinh'];

const typeColors: Record<string, string> = {
  Nhựa: '#1565C0', Giấy: '#5D4037', 'Kim loại': '#546E7A',
  'Hữu cơ': '#2E7D32', Pin: '#E65100', 'Thủy tinh': '#00838F', 'Tổng hợp': Colors.primary,
};

// ── MapScreen ─────────────────────────────────────────────────────────────────

const MapScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [filter, setFilter] = useState('Tất cả');
  const [selected, setSelected] = useState<typeof collectionPoints[0] | null>(null);

  const filtered = filter === 'Tất cả'
    ? collectionPoints
    : collectionPoints.filter(l => l.types.includes(filter));

  const handleNavigate = (point: typeof collectionPoints[0]) => {
    showToast(`Đang mở chỉ đường đến ${point.name}...`, 'info');
  };

  const handleCall = (phone: string) => {
    showToast('Đang gọi điện...', 'info');
  };

  return (
    <View style={styles.root}>
      {/* ── Mock map area ─────────────────────────────────────────────────── */}
      <LinearGradient
        colors={['#C8E6C9', '#A5D6A7', '#81C784']}
        style={styles.mapArea}
      >
        {/* Map grid pattern */}
        <View style={styles.mapGrid} pointerEvents="none">
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={`h${i}`} style={[styles.mapLineH, { top: i * 70 }]} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={`v${i}`} style={[styles.mapLineV, { left: i * 70 }]} />
          ))}
        </View>

        {/* Road simulation */}
        <View style={[styles.road, { top: '40%', left: 0, right: 0, height: 12 }]} />
        <View style={[styles.road, { left: '30%', top: 0, bottom: 0, width: 12 }]} />

        {/* Map pins */}
        {collectionPoints.map((loc, i) => (
          <TouchableOpacity
            key={loc.id}
            style={[
              styles.pin,
              { top: 80 + (i % 3) * 100, left: 40 + (i % 4) * 75 },
              selected?.id === loc.id && styles.pinSelected,
            ]}
            onPress={() => setSelected(selected?.id === loc.id ? null : loc)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={loc.open ? [Colors.primaryGradientStart, Colors.primaryLight] : ['#9E9E9E', '#757575']}
              style={styles.pinGrad}
            >
              <Ionicons name="location" size={18} color={Colors.white} />
            </LinearGradient>
            <View style={styles.pinTail} />
          </TouchableOpacity>
        ))}

        {/* My location indicator */}
        <View style={styles.myLocation}>
          <View style={styles.myLocationDot} />
          <View style={styles.myLocationRing} />
        </View>

        {/* Map controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapCtrlBtn}>
            <Ionicons name="add" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapCtrlBtn}>
            <Ionicons name="remove" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapCtrlBtn}>
            <Ionicons name="locate" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Distance ring */}
        <View style={styles.radiusCircle} />
      </LinearGradient>

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.topTitle}>Điểm thu gom</Text>
        <TouchableOpacity style={styles.topFilterBtn}>
          <Ionicons name="options-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Search bar ────────────────────────────────────────────────────── */}
      <View style={[styles.searchBar, { top: insets.top + 56 }]}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
        <Text style={styles.searchPlaceholder}>Tìm điểm thu gom gần đây...</Text>
        <View style={styles.searchBadge}>
          <Text style={styles.searchBadgeTxt}>{filtered.length}</Text>
        </View>
      </View>

      {/* ── Bottom sheet ──────────────────────────────────────────────────── */}
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        {/* Drag handle */}
        <View style={styles.sheetHandle} />

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterTxt, filter === f && styles.filterTxtActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Selected location detail */}
        {selected && (
          <View style={styles.selectedCard}>
            <View style={styles.selectedTop}>
              <LinearGradient colors={[Colors.primaryGradientStart, Colors.primaryLight]} style={styles.selectedIcon}>
                <Ionicons name="location" size={20} color={Colors.white} />
              </LinearGradient>
              <View style={styles.selectedInfo}>
                <Text style={styles.selectedName}>{selected.name}</Text>
                <Text style={styles.selectedAddr}>{selected.address}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: selected.open ? Colors.successLight : Colors.errorLight }]}>
                <View style={[styles.statusDotBig, { backgroundColor: selected.open ? Colors.success : Colors.error }]} />
                <Text style={[styles.statusBadgeTxt, { color: selected.open ? Colors.success : Colors.error }]}>
                  {selected.open ? 'Mở cửa' : 'Đóng cửa'}
                </Text>
              </View>
            </View>
            <View style={styles.selectedMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.metaText}>{selected.hours}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="call-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.metaText}>{selected.phone}</Text>
              </View>
            </View>
            <View style={styles.selectedTagRow}>
              {selected.types.split(', ').map(t => (
                <View key={t} style={[styles.typeTag, { backgroundColor: (typeColors[t] || Colors.primary) + '18' }]}>
                  <Text style={[styles.typeTagTxt, { color: typeColors[t] || Colors.primary }]}>{t}</Text>
                </View>
              ))}
            </View>
            <View style={styles.selectedActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleNavigate(selected)}>
                <LinearGradient colors={[Colors.primaryGradientStart, Colors.primaryLight]} style={styles.actionBtnGrad}>
                  <Ionicons name="navigate" size={16} color={Colors.white} />
                  <Text style={styles.actionBtnTxt}>Chỉ đường</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnOutline} onPress={() => handleCall(selected.phone)}>
                <Ionicons name="call-outline" size={16} color={Colors.primary} />
                <Text style={styles.actionBtnOutlineTxt}>Gọi điện</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Location list */}
        <Text style={styles.listTitle}>Gần bạn ({filtered.length} điểm)</Text>
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.map((loc, i) => (
            <TouchableOpacity
              key={loc.id}
              style={[styles.listItem, selected?.id === loc.id && styles.listItemActive]}
              onPress={() => setSelected(selected?.id === loc.id ? null : loc)}
              activeOpacity={0.8}
            >
              <View style={[styles.listIcon, { backgroundColor: loc.open ? Colors.surfaceLight : '#F5F5F5' }]}>
                <Ionicons name="location" size={20} color={loc.open ? Colors.primary : '#9E9E9E'} />
              </View>
              <View style={styles.listInfo}>
                <Text style={styles.listName}>{loc.name}</Text>
                <Text style={styles.listAddr}>{loc.address}</Text>
                <Text style={styles.listType}>{loc.types}</Text>
              </View>
              <View style={styles.listRight}>
                <Text style={styles.listDist}>{loc.distance}</Text>
                <View style={[styles.statusDot, { backgroundColor: loc.open ? Colors.primaryLight : '#9E9E9E' }]} />
                <Text style={[styles.statusTxt, { color: loc.open ? Colors.primary : '#9E9E9E' }]}>
                  {loc.open ? 'Mở cửa' : 'Đóng cửa'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.offWhite },

  // Map
  mapArea: { height: '52%', position: 'relative', overflow: 'hidden' },
  mapGrid: { ...StyleSheet.absoluteFillObject },
  mapLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.35)' },
  mapLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.35)' },
  road: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 6 },

  // Pins
  pin: { position: 'absolute', alignItems: 'center' },
  pinSelected: { transform: [{ scale: 1.2 }] },
  pinGrad: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  pinTail: { width: 0, height: 0, borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: Colors.primaryLight },

  // My location
  myLocation: { position: 'absolute', top: 220, left: '48%', alignItems: 'center', justifyContent: 'center' },
  myLocationDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#1565C0', borderWidth: 2, borderColor: Colors.white, elevation: 4 },
  myLocationRing: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(21,101,192,0.2)', borderWidth: 1, borderColor: 'rgba(21,101,192,0.4)' },

  radiusCircle: { position: 'absolute', top: 160, left: '20%', width: 200, height: 200, borderRadius: 100, borderWidth: 1.5, borderColor: 'rgba(46,125,50,0.4)', backgroundColor: 'rgba(46,125,50,0.08)' },

  mapControls: { position: 'absolute', right: 16, bottom: 20, gap: 8 },
  mapCtrlBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6 },

  // Top bar
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10 },
  topTitle: { fontSize: 20, fontWeight: '800', color: Colors.white, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  topFilterBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },

  // Search
  searchBar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 14, paddingHorizontal: 14, height: 46, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 10 },
  searchPlaceholder: { flex: 1, fontSize: 14, color: Colors.textMuted },
  searchBadge: { backgroundColor: Colors.primaryLight, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  searchBadgeTxt: { fontSize: 11, fontWeight: '700', color: Colors.white },

  // Bottom sheet
  sheet: { flex: 1, backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, paddingHorizontal: 16, marginTop: -20, elevation: 16, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 16 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 12 },

  // Filters
  filters: { gap: 8, paddingRight: 4, marginBottom: 12 },
  filterChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: Colors.surfaceLight, borderWidth: 1.5, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primaryLight },
  filterTxt: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  filterTxtActive: { color: Colors.white },

  // Selected card
  selectedCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight + '40',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  selectedTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  selectedIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  selectedInfo: { flex: 1 },
  selectedName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  selectedAddr: { fontSize: 12, color: Colors.textMuted },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusDotBig: { width: 6, height: 6, borderRadius: 3 },
  statusBadgeTxt: { fontSize: 10, fontWeight: '700' },

  selectedMeta: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },

  selectedTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 12 },
  typeTag: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  typeTagTxt: { fontSize: 11, fontWeight: '700' },

  selectedActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  actionBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  actionBtnTxt: { fontSize: 13, fontWeight: '700', color: Colors.white },
  actionBtnOutline: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, paddingVertical: 10 },
  actionBtnOutlineTxt: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  // List
  listTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  list: { flex: 1 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', borderRadius: 10, paddingHorizontal: 4 },
  listItemActive: { backgroundColor: Colors.surfaceLight, paddingHorizontal: 8, marginHorizontal: -4 },
  listIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  listInfo: { flex: 1 },
  listName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  listAddr: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  listType: { fontSize: 11, color: Colors.primaryLight, fontWeight: '600', marginTop: 2 },
  listRight: { alignItems: 'flex-end', gap: 3 },
  listDist: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusTxt: { fontSize: 10, fontWeight: '600' },
});

export default MapScreen;
