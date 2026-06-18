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
  Image,
  Dimensions,
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
import MapLocationCard from './components/MapLocationCard';
import CollectionPointMarker from './components/CollectionPointMarker';
import MapControls from './components/MapControls';
import MapHeader from './components/MapHeader';
import {
  CollectionPointItem,
  getNearbyCollectionPoints,
  NominatimSuggestion,
  searchPlaces,
} from '../../services/map';
import { customMapStyle } from './mapStyle';

const DEFAULT_REGION: Region = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

const { width: windowWidth } = Dimensions.get('window');
const CARD_WIDTH = windowWidth * 0.85;
const SPACING = 16;

const filters = ['Tất cả', 'Tổng hợp', 'Trung tâm tái chế'];
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

  const flatListRef = useRef<FlatList>(null);
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const item = viewableItems[0].item;
      setSelected(item);
      mapRef.current?.animateToRegion({
        latitude: item.lat,
        longitude: item.lng,
        latitudeDelta: DEFAULT_REGION.latitudeDelta,
        longitudeDelta: DEFAULT_REGION.longitudeDelta,
      }, 450);
    }
  }).current;
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

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
    <View className="flex-1 bg-[#EAF7F2]">
      {/* Header Container */}
      <MapHeader
        topInset={insets.top}
        selected={selected}
        currentAddress={currentAddress}
        onSearchPress={() => setShowAddressSuggestions(true)}
      />

      {/* Map Container */}
      <View className="flex-1 overflow-hidden bg-white" style={{ borderTopLeftRadius: 36, borderTopRightRadius: 36, elevation: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: -4 } }}>
        <MapView
          ref={mapRef}
          style={{ width: '100%', height: '100%' }}
          initialRegion={DEFAULT_REGION}
          region={region}
          onRegionChangeComplete={setRegion}
          showsCompass={false}
          showsUserLocation
          userLocationAnnotationTitle=""
          customMapStyle={customMapStyle}
        >
          {resolvedCoordinate && selected && (
            <Polyline
              coordinates={[
                resolvedCoordinate,
                { latitude: selected.lat, longitude: selected.lng },
              ]}
              strokeColor="#FF7A45"
              strokeWidth={3}
              lineDashPattern={[5, 5]}
            />
          )}



          {filtered.map((point, index) => (
            <CollectionPointMarker
              key={point.id}
              point={point}
              isSelected={selected?.id === point.id}
              onPress={() => {
                setSelected(point);
                mapRef.current?.animateToRegion({
                  latitude: point.lat,
                  longitude: point.lng,
                  latitudeDelta: DEFAULT_REGION.latitudeDelta,
                  longitudeDelta: DEFAULT_REGION.longitudeDelta,
                }, 450);
                flatListRef.current?.scrollToIndex({ index, animated: true });
              }}
            />
          ))}
        </MapView>

        {showAddressSuggestions && (
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
        )}

        <MapControls
          onZoomIn={() => animateToRegion({ ...region, latitudeDelta: region.latitudeDelta / 2, longitudeDelta: region.longitudeDelta / 2 })}
          onZoomOut={() => animateToRegion({ ...region, latitudeDelta: region.latitudeDelta * 2, longitudeDelta: region.longitudeDelta * 2 })}
          onLocateMe={handleLocateMe}
        />

        <View className="absolute bottom-8 left-0 right-0">
          {isLoading ? (
            <View className="w-full items-center justify-center h-[130px] bg-white/80 mx-4 rounded-[24px]">
              <ActivityIndicator size="large" color="#10B981" />
              <Text className="mt-2 text-[13px] font-semibold text-gray-500">
                Đang tải điểm thu gom...
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={filtered}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + SPACING}
              snapToAlignment="center"
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: (windowWidth - CARD_WIDTH) / 2 }}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              renderItem={({ item }) => (
                <MapLocationCard
                  item={item}
                  cardWidth={CARD_WIDTH}
                  spacing={SPACING}
                  onNavigate={handleNavigate}
                />
              )}
            />
          )}
        </View>
      </View>

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
