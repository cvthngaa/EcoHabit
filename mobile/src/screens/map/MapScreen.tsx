import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import Colors from '../../theme/colors';
import { useToast } from '../../context/ToastContext';
import ConfirmAlert from '../../components/ConfirmAlert';
import DraggableBottomSheet from '../../components/DraggableBottomSheet';
import SelectableChipTabs from '../../components/SelectableChipTabs';
import {
  CollectionPointItem,
  getNearbyCollectionPoints,
} from '../../services/locationService';

const DEFAULT_REGION: Region = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

const filters = ['Tất cả', 'Tổng hợp', 'Trung tâm tái chế'];
const MAP_SHEET_COLLAPSED_HEIGHT = 348;
const MAP_SHEET_EXPANDED_HEIGHT = 620;
const filterChipItems = filters.map((item) => ({
  key: item,
  label: item,
  activeColor: Colors.primaryLight,
}));

const typeColors: Record<string, string> = {
  'Tong hop': Colors.primary,
  'Trung tam tai che': '#1565C0',
};

const MapScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { showToast } = useToast();
  const mapRef = useRef<MapView | null>(null);
  const manualLocationVersion = route.params?.manualLocationVersion as number | undefined;

  const [filter, setFilter] = useState('Tất cả');
  const [selected, setSelected] = useState<CollectionPointItem | null>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [points, setPoints] = useState<CollectionPointItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('');
  const [resolvedCoordinate, setResolvedCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showAddressAlert, setShowAddressAlert] = useState(false);

  const filtered = useMemo(() => {
    if (filter === 'Tất cả') {
      return points;
    }

    return points.filter(item => item.types === filter);
  }, [filter, points]);

  const animateToRegion = useCallback((nextRegion: Region) => {
    setRegion(nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 450);
  }, []);

  const loadCollectionPoints = useCallback(async (coordinate: { latitude: number; longitude: number }) => {
    const results = await getNearbyCollectionPoints(coordinate);
    setPoints(results);
    setSelected(current =>
      current ? results.find(item => item.id === current.id) ?? results[0] ?? null : results[0] ?? null,
    );
  }, []);

  const resolveCurrentAddress = useCallback(async (latitude: number, longitude: number) => {
    try {
      const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (!geo) {
        setCurrentAddress('');
        return;
      }

      const parts = [geo.name, geo.street, geo.district, geo.city, geo.region]
        .filter(Boolean)
        .slice(0, 4);

      setCurrentAddress(parts.join(', '));
    } catch (error) {
      setCurrentAddress('');
    }
  }, []);

  const applyCoordinate = useCallback(
    async (coordinate: { latitude: number; longitude: number }, address?: string) => {
      const nextRegion: Region = {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: DEFAULT_REGION.latitudeDelta,
        longitudeDelta: DEFAULT_REGION.longitudeDelta,
      };

      setResolvedCoordinate(coordinate);
      animateToRegion(nextRegion);

      if (address) {
        setCurrentAddress(address);
      }

      const tasks: Promise<unknown>[] = [
        loadCollectionPoints(coordinate),
      ];

      if (!address) {
        tasks.push(resolveCurrentAddress(coordinate.latitude, coordinate.longitude));
      }

      const [collectionPointsResult] = await Promise.allSettled(tasks);

      if (collectionPointsResult.status === 'rejected') {
        throw collectionPointsResult.reason;
      }
    },
    [animateToRegion, loadCollectionPoints, resolveCurrentAddress],
  );

  const handleNavigate = useCallback(
    async (point: CollectionPointItem) => {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`;
      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        showToast('Khong the mo chi duong tren thiet bi nay.', 'error');
        return;
      }

      await Linking.openURL(url);
    },
    [showToast],
  );

  const handleCall = useCallback(
    async (phone: string) => {
      const url = `tel:${phone.replace(/\s+/g, '')}`;
      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        showToast('Khong the goi dien tren thiet bi nay.', 'error');
        return;
      }

      await Linking.openURL(url);
    },
    [showToast],
  );

  const requestGpsLocation = useCallback(async () => {
    setIsRefreshingLocation(true);

    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      const providerStatus = await Location.getProviderStatusAsync();

      if (!servicesEnabled) {
        showToast('Hay bat dich vu vi tri tren thiet bi roi thu lai.', 'error');
        if (!route.params?.manualLocation) {
          setShowAddressAlert(true);
        }
        animateToRegion(DEFAULT_REGION);
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        if (!route.params?.manualLocation) {
          setShowAddressAlert(true);
        }

        animateToRegion(DEFAULT_REGION);
        return;
      }

      if (Platform.OS === 'android' && !providerStatus.networkAvailable) {
        try {
          await Location.enableNetworkProviderAsync();
        } catch (providerError) { }
      }

      let current = await Location.getLastKnownPositionAsync();

      if (!current) {
        current = await Location.getCurrentPositionAsync({
          accuracy: Platform.OS === 'android'
            ? Location.Accuracy.High
            : Location.Accuracy.Balanced,
          mayShowUserSettingsDialog: true,
        });
      }

      if (!current) {
        throw new Error('LOCATION_UNAVAILABLE');
      }

      await applyCoordinate({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
    } catch (error) {
      showToast('Khong the lay vi tri hien tai. Hay kiem tra GPS hoac nhap dia chi thu cong.', 'error');
      if (!route.params?.manualLocation) {
        setShowAddressAlert(true);
      }
      animateToRegion(DEFAULT_REGION);
    } finally {
      setIsRefreshingLocation(false);
      setIsLoading(false);
    }
  }, [animateToRegion, applyCoordinate, route.params, showToast]);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      setIsLoading(true);

      const manualLocation = route.params?.manualLocation as
        | { latitude: number; longitude: number }
        | undefined;
      const manualAddress = route.params?.manualAddress as string | undefined;

      if (manualLocation && active) {
        try {
          await applyCoordinate(manualLocation, manualAddress);
          setShowAddressAlert(false);
        } catch (error) {
          showToast('Không thể tải điểm thu gom từ vị trí này', 'error');
        } finally {
          if (active) {
            setIsLoading(false);
          }
        }
        return;
      }

      if (active) {
        await requestGpsLocation();
      }
    };

    initialize();

    return () => {
      active = false;
    };
  }, [applyCoordinate, manualLocationVersion, requestGpsLocation, route.params, showToast]);

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({ tabBarStyle: undefined });
    }, [navigation]),
  );

  const handleLocateMe = useCallback(async () => {
    await requestGpsLocation();
  }, [requestGpsLocation]);

  const handleCancelAddressAlert = useCallback(() => {
    setShowAddressAlert(false);
    animateToRegion(DEFAULT_REGION);
    setCurrentAddress('');
  }, [animateToRegion]);

  const handleConfirmAddressAlert = useCallback(() => {
    setShowAddressAlert(false);
    navigation.navigate('MapAddressInput');
  }, [navigation]);

  return (
    <View className="flex-1 bg-[#F9FBF9]">
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={DEFAULT_REGION}
        region={region}
        onRegionChangeComplete={setRegion}
        showsCompass={false}
        showsUserLocation={!!resolvedCoordinate}
      >
        {resolvedCoordinate && selected && (
          <Polyline
            coordinates={[
              resolvedCoordinate,
              { latitude: selected.lat, longitude: selected.lng },
            ]}
            strokeColor={Colors.primary}
            strokeWidth={4}
            lineDashPattern={[6, 6]}
          />
        )}

        {filtered.map(point => (
          <Marker
            key={point.id}
            coordinate={{ latitude: point.lat, longitude: point.lng }}
            onPress={() => setSelected(point)}
          >
            <View
              className="items-center"
              style={selected?.id === point.id ? styles.markerWrapSelected : undefined}
            >
              <LinearGradient
                colors={
                  point.open
                    ? [Colors.primaryGradientStart, Colors.primaryLight]
                    : ['#9E9E9E', '#757575']
                }
                style={styles.markerGrad}
              >
                <Ionicons name="location" size={18} color={Colors.white} />
              </LinearGradient>
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.mapOverlay} pointerEvents="none" />

      <View
        className="absolute left-0 right-0 flex-row items-center justify-between px-5 pb-2.5"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Text className="text-[20px] font-extrabold text-white" style={styles.titleShadow}>
          Điểm thu gom gần bạn
        </Text>
      </View>

      <View
        className="absolute left-4 right-4 h-12 flex-row items-center rounded-[14px] bg-white px-[14px]"
        style={[
          { top: insets.top + 56 },
          styles.searchShadow,
        ]}
      >
        <Ionicons
          name="location-outline"
          size={18}
          color={Colors.textMuted}
          style={{ marginRight: 8 }}
        />
        <Text className="flex-1 text-[14px] text-[#8FA892]" numberOfLines={1}>
          {currentAddress || 'Đang hiển thị vị trí mặc định'}
        </Text>
        <View className="rounded-[10px] bg-[#4CAF50] px-2 py-[2px]">
          <Text className="text-[11px] font-bold text-white">{filtered.length}</Text>
        </View>
      </View>

      <View className="absolute right-4 top-[150px] items-center gap-[10px]">
        <TouchableOpacity
          className="h-[42px] w-[42px] items-center justify-center rounded-[12px] bg-white"
          style={styles.controlShadow}
          onPress={handleLocateMe}
        >
          <Ionicons name="locate" size={20} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          className="h-[42px] w-[42px] items-center justify-center rounded-[12px] bg-white"
          style={styles.controlShadow}
          onPress={() => navigation.navigate('MapAddressInput')}
        >
          <Ionicons name="create-outline" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-1 rounded-2xl"
          style={styles.fabShadow}
          onPress={() => navigation.navigate('QRScanner')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[Colors.primaryGradientStart, Colors.primaryLight]}
            className="h-[52px] w-[52px] items-center justify-center rounded-2xl"
          >
            <Ionicons name="qr-code" size={22} color={Colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <DraggableBottomSheet
        collapsedHeight={MAP_SHEET_COLLAPSED_HEIGHT + insets.bottom}
        expandedHeight={MAP_SHEET_EXPANDED_HEIGHT + insets.bottom}
        bottomInset={insets.bottom}
        initialSnap="collapsed"
      >
        <View className="w-full px-4 pb-2">
          <SelectableChipTabs
            items={filterChipItems}
            activeKey={filter}
            onChange={setFilter}
            showIcons={false}
          />

          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text className="mt-3 text-[14px] font-semibold text-[#5D7C61]">
                Đang tải điểm thu gom quanh bạn...
              </Text>
            </View>
          ) : (
            <>
              {selected && (
                <View
                  className="mb-[14px] rounded-[18px] bg-white p-4"
                  style={styles.selectedCardShadow}
                >
                  <View className="mb-[10px] flex-row items-start">
                    <LinearGradient
                      colors={[Colors.primaryGradientStart, Colors.primaryLight]}
                      className="h-10 w-10 items-center justify-center rounded-xl"
                    >
                      <Ionicons name="location" size={20} color={Colors.white} />
                    </LinearGradient>

                    <View className="ml-[10px] flex-1">
                      <Text className="mb-0.5 text-[15px] font-bold text-[#1B3A1E]">
                        {selected.name}
                      </Text>
                      <Text className="text-[12px] text-[#8FA892]">{selected.address}</Text>
                    </View>

                    <View
                      className="flex-row items-center rounded-[8px] px-2 py-1"
                      style={{
                        backgroundColor: selected.open ? Colors.successLight : Colors.errorLight,
                      }}
                    >
                      <View
                        className="mr-1 h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor: selected.open ? Colors.success : Colors.error,
                        }}
                      />
                      <Text
                        className="text-[10px] font-bold"
                        style={{ color: selected.open ? Colors.success : Colors.error }}
                      >
                        {selected.open ? 'Mo cua' : 'Tam dung'}
                      </Text>
                    </View>
                  </View>

                  <View className="mb-2 flex-row">
                    <View className="mr-4 flex-row items-center">
                      <Ionicons name="navigate-outline" size={14} color={Colors.textMuted} />
                      <Text className="ml-1 text-[12px] font-medium text-[#8FA892]">
                        {selected.distanceLabel}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                      <Text className="ml-1 text-[12px] font-medium text-[#8FA892]">
                        {selected.hours}
                      </Text>
                    </View>
                  </View>

                  <View className="mb-3 flex-row flex-wrap">
                    <View
                      className="rounded-md px-2 py-[3px]"
                      style={{
                        backgroundColor: `${typeColors[selected.types] || Colors.primary}18`,
                      }}
                    >
                      <Text
                        className="text-[11px] font-bold"
                        style={{ color: typeColors[selected.types] || Colors.primary }}
                      >
                        {selected.types}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row">
                    <TouchableOpacity
                      className="mr-[10px] flex-1 overflow-hidden rounded-xl"
                      onPress={() => handleNavigate(selected)}
                    >
                      <LinearGradient
                        colors={[Colors.primaryGradientStart, Colors.primaryLight]}
                        className="flex-row items-center justify-center py-[10px]"
                      >
                        <Ionicons name="navigate" size={16} color={Colors.white} />
                        <Text className="ml-1.5 text-[13px] font-bold text-white">
                          Chi duong
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center rounded-xl border-[1.5px] border-[#C8E6C9] py-[10px]"
                      onPress={() => handleCall(selected.phone)}
                    >
                      <Ionicons name="call-outline" size={16} color={Colors.primary} />
                      <Text className="ml-1.5 text-[13px] font-semibold text-[#2E7D32]">
                        Goi dien
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <Text className="mb-[10px] text-[15px] font-bold text-[#1B3A1E]">
                Gan ban ({filtered.length} diem)
              </Text>

              <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {filtered.map(point => (
                  <TouchableOpacity
                    key={point.id}
                    className={`flex-row items-center rounded-[10px] border-b border-[#F0F0F0] px-1 py-[10px] ${selected?.id === point.id ? 'mx-[-4px] bg-[#F1F8E9] px-2' : ''
                      }`}
                    onPress={() => {
                      setSelected(point);
                      animateToRegion({
                        latitude: point.lat,
                        longitude: point.lng,
                        latitudeDelta: DEFAULT_REGION.latitudeDelta,
                        longitudeDelta: DEFAULT_REGION.longitudeDelta,
                      });
                    }}
                    activeOpacity={0.82}
                  >
                    <View
                      className="mr-[10px] h-[42px] w-[42px] items-center justify-center rounded-xl"
                      style={{ backgroundColor: point.open ? Colors.surfaceLight : '#F5F5F5' }}
                    >
                      <Ionicons
                        name="location"
                        size={20}
                        color={point.open ? Colors.primary : '#9E9E9E'}
                      />
                    </View>

                    <View className="flex-1">
                      <Text className="text-[14px] font-semibold text-[#1B3A1E]">
                        {point.name}
                      </Text>
                      <Text className="mt-0.5 text-[11px] text-[#8FA892]">{point.address}</Text>
                      <Text className="mt-0.5 text-[11px] font-semibold text-[#4CAF50]">
                        {point.types}
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text className="text-[12px] font-bold text-[#2E7D32]">
                        {point.distanceLabel}
                      </Text>
                      <View
                        className="mt-[3px] h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: point.open ? Colors.primaryLight : '#9E9E9E' }}
                      />
                      <Text
                        className="mt-[3px] text-[10px] font-semibold"
                        style={{ color: point.open ? Colors.primary : '#9E9E9E' }}
                      >
                        {point.open ? 'Mo cua' : 'Tam dung'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </DraggableBottomSheet>

      <ConfirmAlert
        visible={showAddressAlert}
        title="Khong lay duoc vi tri"
        message="Ung dung chua lay duoc vi tri hien tai cua ban. Ban co muon nhap dia chi de tim diem thu gom gan nhat khong?"
        cancelText="Thoat"
        confirmText="Oke"
        onCancel={handleCancelAddressAlert}
        onConfirm={handleConfirmAddressAlert}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  map: { flex: 1 },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 18, 12, 0.08)',
  },
  markerWrapSelected: {
    transform: [{ scale: 1.12 }],
  },
  markerGrad: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    elevation: 6,
  },
  titleShadow: {
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  searchShadow: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  controlShadow: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  fabShadow: {
    elevation: 8,
    shadowColor: Colors.primaryGradientStart,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  selectedCardShadow: {
    borderWidth: 1.5,
    borderColor: `${Colors.primaryLight}40`,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
});

export default MapScreen;
