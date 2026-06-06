import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Linking,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Colors, Tokens } from '../../theme';
import { useToast } from '../../context/ToastContext';
import ConfirmAlert from '../../components/ConfirmAlert';
import DraggableBottomSheet from '../../components/DraggableBottomSheet';
import SelectableChipTabs from '../../components/SelectableChipTabs';
import MapSearchBar from './components/MapSearchBar';
import {
  CollectionPointItem,
  getNearbyCollectionPoints,
  NominatimSuggestion,
  searchPlaces,
} from '../../services/map';

const DEFAULT_REGION: Region = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

const filters = ['Tất cả', 'Tổng hợp', 'Trung tâm tái chế'];
const MAP_SHEET_COLLAPSED_HEIGHT = 348;
const MAP_SHEET_EXPANDED_HEIGHT = 620;
const filterChipItems = filters.map(item => ({
  key: item,
  label: item,
  activeColor: Colors.primaryLight,
}));

const typeColors: Record<string, string> = {
  'Tong hop': Colors.primary,
  'Trung tam tai che': '#1565C0',
  'Tổng hợp': Colors.primary,
  'Trung tâm tái chế': '#1565C0',
};

const markerWrapSelectedStyle = {
  transform: [{ scale: 1.12 }],
};

const titleShadowStyle = {
  textShadowColor: 'rgba(0,0,0,0.35)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 4,
};

const searchShadowStyle = {
  elevation: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.12,
  shadowRadius: 10,
};

const controlShadowStyle = {
  elevation: 4,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.12,
  shadowRadius: 6,
};

const fabShadowStyle = {
  elevation: 8,
  shadowColor: Colors.primaryGradientStart,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 10,
};

const selectedCardShadowStyle = {
  borderWidth: 1.5,
  borderColor: `${Colors.primaryLight}40`,
  elevation: 4,
  shadowColor: Colors.primary,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
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
  const [currentAddress, setCurrentAddress] = useState('');
  const [resolvedCoordinate, setResolvedCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showAddressAlert, setShowAddressAlert] = useState(false);
  const [addressQuery, setAddressQuery] = useState('');
  const [isAddressSearching, setIsAddressSearching] = useState(false);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<NominatimSuggestion[]>([]);
  const [addressError, setAddressError] = useState('');
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);

  const filtered = useMemo(() => {
    if (filter === 'Tất cả') {
      return points;
    }

    return points.filter(item => item.types === filter);
  }, [filter, points]);

  const canSubmitAddress = useMemo(() => addressQuery.trim().length >= 6, [addressQuery]);

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

      const tasks: Promise<unknown>[] = [loadCollectionPoints(coordinate)];

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
        showToast('Không thể mở chỉ đường trên thiết bị này.', 'error');
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
        showToast('Không thể gọi điện trên thiết bị này.', 'error');
        return;
      }

      await Linking.openURL(url);
    },
    [showToast],
  );

  const requestGpsLocation = useCallback(async () => {
    setIsLoading(true);

    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      const providerStatus = await Location.getProviderStatusAsync();

      if (!servicesEnabled) {
        showToast('Hãy bật dịch vụ vị trí trên thiết bị rồi thử lại.', 'error');
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
          accuracy:
            Platform.OS === 'android' ? Location.Accuracy.High : Location.Accuracy.Balanced,
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
      showToast('Không thể lấy vị trí hiện tại. Hãy kiểm tra GPS hoặc nhập địa chỉ thủ công.', 'error');
      if (!route.params?.manualLocation) {
        setShowAddressAlert(true);
      }
      animateToRegion(DEFAULT_REGION);
    } finally {
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
          if (manualAddress) {
            setAddressQuery(manualAddress);
          }
        } catch (error) {
          showToast('Không thể tải điểm thu gom từ vị trí này.', 'error');
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

  useEffect(() => {
    const trimmed = addressQuery.trim();

    if (trimmed.length < 3) {
      setAddressSuggestions([]);
      setIsAddressSearching(false);
      return;
    }

    let active = true;
    setIsAddressSearching(true);

    const timeout = setTimeout(async () => {
      try {
        const results = await searchPlaces(trimmed);

        if (active) {
          setAddressSuggestions(results);
          setShowAddressSuggestions(true);
        }
      } catch (error) {
        if (active) {
          setAddressSuggestions([]);
          showToast('Không tải được gợi ý địa điểm lúc này.', 'error');
        }
      } finally {
        if (active) {
          setIsAddressSearching(false);
        }
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [addressQuery, showToast]);

  const handleLocateMe = useCallback(async () => {
    setShowAddressSuggestions(false);
    await requestGpsLocation();
  }, [requestGpsLocation]);

  const handleAddressFocus = useCallback(() => {
    if (addressSuggestions.length > 0) {
      setShowAddressSuggestions(true);
    }
  }, [addressSuggestions.length]);

  const handleSelectSuggestion = useCallback(
    async (suggestion: NominatimSuggestion) => {
      const resolvedAddress = suggestion.subtitle || suggestion.title;

      Keyboard.dismiss();
      setAddressQuery(resolvedAddress);
      setCurrentAddress(resolvedAddress);
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      setAddressError('');
      setShowAddressAlert(false);
      setIsLoading(true);

      try {
        await applyCoordinate(
          {
            latitude: suggestion.latitude,
            longitude: suggestion.longitude,
          },
          resolvedAddress,
        );
      } catch (error) {
        showToast('Không thể tải điểm thu gom từ địa chỉ này.', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [applyCoordinate, showToast],
  );

  const handleSubmitAddress = useCallback(async () => {
    const trimmed = addressQuery.trim();

    if (trimmed.length < 6) {
      setAddressError('Vui lòng nhập địa chỉ cụ thể hơn.');
      return;
    }

    Keyboard.dismiss();
    setShowAddressSuggestions(false);
    setAddressError('');
    setIsSubmittingAddress(true);
    setIsLoading(true);

    try {
      const geocoded = await Location.geocodeAsync(trimmed);

      if (!geocoded.length) {
        setAddressError('Không tìm thấy địa chỉ này. Thử nhập chi tiết hơn.');
        return;
      }

      const first = geocoded[0];
      setCurrentAddress(trimmed);
      setShowAddressAlert(false);

      await applyCoordinate(
        {
          latitude: first.latitude,
          longitude: first.longitude,
        },
        trimmed,
      );
    } catch (error) {
      showToast('Không thể xử lý địa chỉ. Vui lòng thử lại.', 'error');
    } finally {
      setIsSubmittingAddress(false);
      setIsLoading(false);
    }
  }, [addressQuery, applyCoordinate, showToast]);

  const handleCancelAddressAlert = useCallback(() => {
    setShowAddressAlert(false);
    animateToRegion(DEFAULT_REGION);
    setCurrentAddress('');
    setAddressQuery('');
    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
    setAddressError('');
  }, [animateToRegion]);

  const handleConfirmAddressAlert = useCallback(() => {
    setShowAddressAlert(false);
    setShowAddressSuggestions(true);
  }, []);

  return (
    <View className="flex-1 bg-canvas">
      <MapView
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
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
              style={selected?.id === point.id ? markerWrapSelectedStyle : undefined}
            >
              <LinearGradient
                colors={
                  point.open
                    ? [Colors.primaryGradientStart, Colors.primaryLight]
                    : ['#9E9E9E', '#757575']
                }
                className="h-[38px] w-[38px] items-center justify-center rounded-[14px] border-[3px] border-white"
                style={{ elevation: 6 }}
              >
                <Ionicons name="location" size={18} color={Colors.white} />
              </LinearGradient>
            </View>
          </Marker>
        ))}
      </MapView>

      <View className="absolute inset-0 bg-[#07120C]/10" pointerEvents="none" />

      <View
        className="absolute left-0 right-0 flex-row items-center justify-between px-5 pb-2.5"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Text className="text-[20px] font-extrabold text-white" style={titleShadowStyle}>
          Điểm thu gom gần bạn
        </Text>
      </View>

      <MapSearchBar
        addressQuery={addressQuery}
        setAddressQuery={setAddressQuery}
        addressError={addressError}
        setAddressError={setAddressError}
        isAddressSearching={isAddressSearching}
        isSubmittingAddress={isSubmittingAddress}
        currentAddress={currentAddress}
        showAddressSuggestions={showAddressSuggestions}
        setShowAddressSuggestions={setShowAddressSuggestions}
        addressSuggestions={addressSuggestions}
        handleAddressFocus={handleAddressFocus}
        handleSubmitAddress={handleSubmitAddress}
        handleSelectSuggestion={handleSelectSuggestion}
      />

      <View className="absolute right-4 top-[150px] items-center gap-[10px]">
        <TouchableOpacity
          className="h-[42px] w-[42px] items-center justify-center rounded-[12px] bg-surface"
          style={controlShadowStyle}
          onPress={handleLocateMe}
        >
          <Ionicons name="locate" size={20} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          className="h-[42px] w-[42px] items-center justify-center rounded-[12px] bg-surface"
          style={controlShadowStyle}
          onPress={() => setShowAddressSuggestions(current => !current)}
        >
          <Ionicons name="create-outline" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-1 h-[52px] w-[52px] items-center justify-center rounded-2xl bg-green-300"
          style={fabShadowStyle}
          onPress={() => navigation.navigate('QRScanner')}
          activeOpacity={0.85}
        >
          <Ionicons name="qr-code" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <DraggableBottomSheet
        collapsedHeight={MAP_SHEET_COLLAPSED_HEIGHT + insets.bottom}
        expandedHeight={MAP_SHEET_EXPANDED_HEIGHT + insets.bottom}
        bottomInset={insets.bottom}
        initialSnap="collapsed"
      >
        <View className="flex-1 w-full px-4 pb-2">
          <SelectableChipTabs
            items={filterChipItems}
            activeKey={filter}
            onChange={setFilter}
            showIcons={false}
          />

          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text className="mt-3 text-[14px] font-semibold text-text-muted">
                Đang tải điểm thu gom quanh bạn...
              </Text>
            </View>
          ) : (
            <>
              {selected && (
                <View
                  className="mb-[14px] rounded-[18px] bg-surface p-4"
                  style={selectedCardShadowStyle}
                >
                  <View className="mb-[10px] flex-row items-start">
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-green-300">
                      <Ionicons name="location" size={20} color={Colors.white} />
                    </View>

                    <View className="ml-[10px] flex-1">
                      <Text className="mb-0.5 text-[15px] font-bold text-text">
                        {selected.name}
                      </Text>
                      <Text className="text-[12px] text-text-muted">{selected.address}</Text>
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
                        {selected.open ? 'Mở cửa' : 'Tạm dừng'}
                      </Text>
                    </View>
                  </View>

                  <View className="mb-2 flex-row">
                    <View className="mr-4 flex-row items-center">
                      <Ionicons name="navigate-outline" size={14} color={Colors.textMuted} />
                      <Text className="ml-1 text-[12px] font-medium text-text-muted">
                        {selected.distanceLabel}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                      <Text className="ml-1 text-[12px] font-medium text-text-muted">
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
                      className="mr-[10px] flex-1 flex-row items-center justify-center overflow-hidden rounded-xl bg-green-300 py-[10px]"
                      onPress={() => handleNavigate(selected)}
                    >
                      <Ionicons name="navigate" size={16} color={Colors.white} />
                      <Text className="ml-1.5 text-[13px] font-bold text-white">
                        Chỉ đường
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center rounded-xl border-[1.5px] border-green-200 py-[10px]"
                      onPress={() => handleCall(selected.phone)}
                    >
                      <Ionicons name="call-outline" size={16} color={Colors.primary} />
                      <Text className="ml-1.5 text-[13px] font-semibold text-primary">
                        Gọi điện
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <Text className="mb-[10px] text-[15px] font-bold text-text">
                Gần bạn ({filtered.length} điểm)
              </Text>

              <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {filtered.map(point => (
                  <TouchableOpacity
                    key={point.id}
                    className={`mb-3 flex-row items-center rounded-[16px] bg-green-300 p-3 shadow-sm ${selected?.id === point.id ? 'border-2 border-white' : ''}`}
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
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                      <Ionicons
                        name="leaf"
                        size={20}
                        color="#FFF"
                      />
                    </View>

                    <View className="flex-1 justify-center">
                      <Text className="text-[15px] font-bold text-white">
                        {point.name}
                      </Text>
                      <Text className="mt-1 text-[11px] text-white/80" numberOfLines={1}>
                        {point.address}
                      </Text>
                      <View className="mt-1.5 flex-row items-center">
                        <Ionicons name="star" size={10} color="#FFF" />
                        <Ionicons name="star" size={10} color="#FFF" />
                        <Ionicons name="star" size={10} color="#FFF" />
                        <Ionicons name="star" size={10} color="#FFF" />
                        <Ionicons name="star-outline" size={10} color="#FFF" />
                        <Text className="ml-1.5 text-[10px] text-white/90">
                          {point.distanceLabel} • {point.types}
                        </Text>
                      </View>
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
        title="Không lấy được vị trí"
        message="Ứng dụng chưa lấy được vị trí hiện tại của bạn. Bạn có muốn nhập địa chỉ để tìm điểm thu gom gần nhất không?"
        cancelText="Thoát"
        confirmText="OK"
        onCancel={handleCancelAddressAlert}
        onConfirm={handleConfirmAddressAlert}
      />
    </View>
  );
};

export default MapScreen;
