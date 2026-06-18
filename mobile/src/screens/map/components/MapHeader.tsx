import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CollectionPointItem } from '../../../services/map/types'; // adjust path as needed

interface MapHeaderProps {
  topInset: number;
  selected: CollectionPointItem | null;
  currentAddress: string;
  onSearchPress: () => void;
}

const MapHeader: React.FC<MapHeaderProps> = ({ topInset, selected, currentAddress, onSearchPress }) => {
  return (
    <View
      style={{ paddingTop: topInset + 16, paddingHorizontal: 24, paddingBottom: 24 }}
      className="flex-row items-center justify-between"
    >
      <View className="flex-row items-center flex-1">
        <View className="mr-3 justify-center items-center">
          <Ionicons name="map-outline" size={32} color="#FF7A45" />
        </View>
        <View className="flex-1 pr-4">
          <Text className="text-[12px] text-gray-500 font-medium">My Route</Text>
          <Text className="text-[18px] font-bold text-[#3A3A3A] leading-tight" numberOfLines={1}>
            {selected ? selected.name : 'Gần bạn'}
          </Text>
          <View className="flex-row items-center mt-0.5">
            <Ionicons name="location-outline" size={12} color="#FF7A45" />
            <Text className="text-[12px] text-gray-500 ml-1" numberOfLines={1}>
              {selected ? selected.address : currentAddress || 'Đang tải...'}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        className="w-[42px] h-[42px] rounded-[14px] bg-white items-center justify-center"
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}
        onPress={onSearchPress}
      >
        <Ionicons name="search" size={20} color="#1F2937" />
      </TouchableOpacity>
    </View>
  );
};

export default MapHeader;
