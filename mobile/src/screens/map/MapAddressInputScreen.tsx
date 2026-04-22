import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import InputField from '../../components/InputField';
import Colors from '../../theme/colors';
import { useToast } from '../../context/ToastContext';
import { NominatimSuggestion, searchPlaces } from '../../services/nominatimService';

const MapAddressInputScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { showToast } = useToast();

  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimSuggestion[]>([]);
  const [searchTouched, setSearchTouched] = useState(false);

  const canSubmit = useMemo(() => address.trim().length >= 6, [address]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const navigateToMap = useCallback(
    (payload: { latitude: number; longitude: number; address: string }) => {
      navigation.navigate('MainTabs', {
        screen: 'Map',
        params: {
          manualLocation: {
            latitude: payload.latitude,
            longitude: payload.longitude,
          },
          manualAddress: payload.address,
          manualLocationVersion: Date.now(),
        },
      });
    },
    [navigation],
  );

  useEffect(() => {
    const trimmed = address.trim();

    if (trimmed.length < 3) {
      setSuggestions([]);
      setIsSearching(false);
      setSearchTouched(false);
      return;
    }

    let active = true;
    setIsSearching(true);
    setSearchTouched(true);

    const timeout = setTimeout(async () => {
      try {
        const results = await searchPlaces(trimmed);

        if (active) {
          setSuggestions(results);
        }
      } catch (searchError) {
        if (active) {
          setSuggestions([]);
          showToast('Khong tai duoc goi y dia diem luc nay.', 'error');
        }
      } finally {
        if (active) {
          setIsSearching(false);
        }
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [address]);

  const handleSelectSuggestion = useCallback(
    (suggestion: NominatimSuggestion) => {
      setAddress(suggestion.subtitle || suggestion.title);
      setSuggestions([]);
      setError('');
      navigateToMap({
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
        address: suggestion.subtitle || suggestion.title,
      });
    },
    [navigateToMap],
  );

  const handleSubmit = useCallback(async () => {
    const trimmed = address.trim();

    if (trimmed.length < 6) {
      setError('Vui long nhap dia chi cu the hon.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const geocoded = await Location.geocodeAsync(trimmed);

      if (!geocoded.length) {
        setError('Khong tim thay dia chi nay. Thu nhap chi tiet hon.');
        return;
      }

      const first = geocoded[0];

      navigateToMap({
        latitude: first.latitude,
        longitude: first.longitude,
        address: trimmed,
      });
    } catch (submitError) {
      showToast('Khong the xu ly dia chi. Vui long thu lai.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [address, navigateToMap, showToast]);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F5F9F5]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        className="flex-row items-center px-5 pb-4"
        style={{ paddingTop: insets.top + 14 }}
      >
        <TouchableOpacity
          className="h-11 w-11 items-center justify-center rounded-2xl bg-white"
          onPress={handleBack}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text className="ml-3 text-[20px] font-extrabold text-[#1B3A1E]">
          Nhap dia chi
        </Text>
      </View>

      <View className="flex-1 px-5 pt-2">
        <View className="rounded-[28px] bg-white p-5">
          <View className="mb-5 rounded-[22px] bg-[#F1F8E9] px-4 py-4">
            <Text className="text-[16px] font-bold text-[#1B3A1E]">
              Tim diem thu gom quanh khu vuc cua ban
            </Text>
            <Text className="mt-2 text-[13px] leading-6 text-[#5D7C61]">
              Nhap dia chi hien tai de he thong tim va sap xep cac diem thu gom rac gan nhat.
            </Text>
          </View>

          <InputField
            label="Dia chi hien tai"
            iconName="location-outline"
            placeholder="Vi du: 12 Nguyen Hue, Quan 1, TP.HCM"
            value={address}
            onChangeText={text => {
              setAddress(text);
              if (error) {
                setError('');
              }
            }}
            error={error}
          />

          {isSearching ? (
            <View className="mb-3 flex-row items-center rounded-2xl bg-[#F6FBF6] px-4 py-3">
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text className="ml-3 text-[13px] text-[#5D7C61]">Dang tim goi y dia diem...</Text>
            </View>
          ) : null}

          {suggestions.length ? (
            <View className="mb-3 overflow-hidden rounded-[20px] border border-[#E3EFE4] bg-[#FCFEFC]">
              <FlatList
                data={suggestions}
                keyExtractor={item => item.id}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="flex-row items-start border-b border-[#EEF5EE] px-4 py-3"
                    onPress={() => handleSelectSuggestion(item)}
                    activeOpacity={0.8}
                  >
                    <View className="mt-0.5 h-9 w-9 items-center justify-center rounded-xl bg-[#E8F5E9]">
                      <Ionicons name="location-outline" size={18} color={Colors.primary} />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-[14px] font-semibold text-[#1B3A1E]">
                        {item.title}
                      </Text>
                      <Text className="mt-1 text-[12px] leading-5 text-[#6D8B71]">
                        {item.subtitle}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          ) : null}

          {!isSearching && searchTouched && address.trim().length >= 3 && !suggestions.length ? (
            <View className="mb-3 rounded-2xl bg-[#F6FBF6] px-4 py-3">
              <Text className="text-[13px] text-[#5D7C61]">
                Chua tim thay goi y phu hop. Ban co the nhap day du roi bam xac nhan.
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            className={`mt-2 items-center justify-center rounded-full px-4 py-4 ${canSubmit && !isSubmitting ? 'bg-[#4CAF50]' : 'bg-[#A5D6A7]'}`}
            onPress={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text className="text-[15px] font-bold text-white">Xac nhan dia chi</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default MapAddressInputScreen;
