import React from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Tokens } from '../../../theme';
import { NominatimSuggestion } from '../../../services/map';

interface MapSearchBarProps {
  addressQuery: string;
  setAddressQuery: (text: string) => void;
  addressError: string;
  setAddressError: (text: string) => void;
  isAddressSearching: boolean;
  isSubmittingAddress: boolean;
  currentAddress: string;
  showAddressSuggestions: boolean;
  setShowAddressSuggestions: (show: boolean) => void;
  addressSuggestions: NominatimSuggestion[];
  handleAddressFocus: () => void;
  handleSubmitAddress: () => void;
  handleSelectSuggestion: (item: NominatimSuggestion) => void;
}

const MapSearchBar: React.FC<MapSearchBarProps> = ({
  addressQuery,
  setAddressQuery,
  addressError,
  setAddressError,
  isAddressSearching,
  isSubmittingAddress,
  currentAddress,
  showAddressSuggestions,
  setShowAddressSuggestions,
  addressSuggestions,
  handleAddressFocus,
  handleSubmitAddress,
  handleSelectSuggestion,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute left-6 right-6 z-50"
      style={{ top: 24 }}
    >
      <View 
        className="flex-row items-center rounded-2xl bg-white px-4 border border-gray-100"
        style={{ height: 48, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 }}
      >
        <Ionicons
          name="search"
          size={20}
          color="#9CA3AF"
          style={{ marginRight: 10 }}
        />
        <TextInput
          className="flex-1 text-[15px] text-[#1F2937] font-medium"
          placeholder="Nhập địa chỉ..."
          placeholderTextColor="#9CA3AF"
          value={addressQuery}
          onChangeText={text => {
            setAddressQuery(text);
            if (addressError) {
              setAddressError('');
            }
          }}
          onFocus={handleAddressFocus}
          onSubmitEditing={handleSubmitAddress}
          returnKeyType="search"
          style={{ height: '100%', paddingVertical: 0 }}
        />
        {isAddressSearching || isSubmittingAddress ? (
          <ActivityIndicator size="small" color="#FF7A45" />
        ) : (
          <TouchableOpacity onPress={() => setShowAddressSuggestions(false)} className="ml-2">
            <Ionicons name="close-circle" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        )}
      </View>

      {!addressQuery && currentAddress && !showAddressSuggestions ? (
        <Text className="mt-2 ml-2 text-[12px] text-gray-500 font-medium" numberOfLines={1}>
          {currentAddress}
        </Text>
      ) : null}

      {addressError ? (
        <Text className="mt-2 ml-2 text-[12px] text-red-500">{addressError}</Text>
      ) : null}

      {showAddressSuggestions && addressSuggestions.length ? (
        <View 
          className="mt-3 overflow-hidden rounded-[20px] bg-white p-3 border border-gray-100" 
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 8 }}
        >
          <FlatList
            data={addressSuggestions}
            keyExtractor={item => item.id}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="mb-2 flex-row items-center rounded-[16px] p-3 bg-gray-50 border border-gray-100"
                onPress={() => handleSelectSuggestion(item)}
                activeOpacity={0.8}
              >
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-[12px] bg-white shadow-sm" style={{ elevation: 1 }}>
                  <Ionicons name="location" size={18} color="#FF7A45" />
                </View>
                <View className="flex-1 justify-center">
                  <Text className="text-[14px] font-bold text-[#1F2937]">
                    {item.title}
                  </Text>
                  <Text className="mt-0.5 text-[11px] text-gray-500" numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : null}
    </View>
  );
};

export default MapSearchBar;
