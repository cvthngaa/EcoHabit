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
      className="absolute left-4 right-4"
      style={{ top: insets.top + 56 }}
    >
      <View 
        className="flex-row items-center rounded-[10px] bg-surface px-3 border border-green-300"
        style={{ height: 42, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3 }}
      >
        <Ionicons
          name="search"
          size={18}
          color={Tokens.color.green[300]}
          style={{ marginRight: 8 }}
        />
        <TextInput
          className="flex-1 text-[14px] text-text font-medium"
          placeholder="Nhập địa chỉ để tìm điểm thu gom..."
          placeholderTextColor={Colors.textMuted}
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
          <ActivityIndicator size="small" color={Tokens.color.green[300]} />
        ) : null}
      </View>

      {!addressQuery && currentAddress && !showAddressSuggestions ? (
        <Text className="mt-1.5 ml-2 text-[12px] text-text-muted font-medium" numberOfLines={1}>
          {currentAddress}
        </Text>
      ) : null}

      {addressError ? (
        <Text className="mt-1.5 ml-2 text-[12px] text-status-error">{addressError}</Text>
      ) : null}

      {showAddressSuggestions && addressSuggestions.length ? (
        <View 
          className="mt-2 overflow-hidden rounded-[14px] bg-surface p-3" 
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 6 }}
        >
          <FlatList
            data={addressSuggestions}
            keyExtractor={item => item.id}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="mb-2.5 flex-row items-center rounded-[10px] p-2.5 bg-green-300"
                onPress={() => handleSelectSuggestion(item)}
                activeOpacity={0.8}
              >
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                  <Ionicons name="location" size={16} color={Colors.white} />
                </View>
                <View className="flex-1 justify-center">
                  <Text className="text-[14px] font-bold text-white">
                    {item.title}
                  </Text>
                  <Text className="mt-0.5 text-[11px] text-white/80" numberOfLines={1}>
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
