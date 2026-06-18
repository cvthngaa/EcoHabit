import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CollectionPointItem } from '../../../services/map/types';

interface MapLocationCardProps {
  item: CollectionPointItem;
  cardWidth: number;
  spacing: number;
  onNavigate: (item: CollectionPointItem) => void;
}

const MapLocationCard: React.FC<MapLocationCardProps> = ({ item, cardWidth, spacing, onNavigate }) => {
  return (
    <View style={{ width: cardWidth, marginHorizontal: spacing / 2 }}>
      <View
        className="flex-row rounded-[24px] bg-white p-[10px]"
        style={{ elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 16, borderWidth: 1, borderColor: '#F3F4F6' }}
      >
        <View className="w-[110px] h-[110px] rounded-[18px] bg-[#EAF7F2] overflow-hidden relative">
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Ionicons name={item.types === 'Trung tâm tái chế' ? "business" : "image"} size={40} color="#A7F3D0" />
            </View>
          )}
          <View className="absolute bottom-2 left-2 right-2 bg-white/95 rounded-[12px] py-[5px] px-[6px] flex-row items-center justify-center shadow-sm">
            <Ionicons name="location" size={10} color="#FF7A45" />
            <Text className="text-[10px] font-bold text-gray-800 ml-1" numberOfLines={1}>{item.distanceLabel}</Text>
          </View>
        </View>

        <View className="flex-1 ml-[14px] py-1">
          <View>
            <Text className="text-[16px] font-bold text-[#1F2937] leading-tight" numberOfLines={1}>{item.name}</Text>
            <Text className="text-[12px] text-gray-500 mt-1" numberOfLines={2}>{item.address}</Text>
          </View>

          <View className="flex-1 justify-end flex-row items-center mt-2">
            <TouchableOpacity
              className="bg-[#FFF2ED] flex-row items-center px-4 py-2 rounded-[14px]"
              onPress={() => onNavigate(item)}
            >
              <Ionicons name="navigate" size={14} color="#FF7A45" />
              <Text className="ml-1.5 text-[12px] font-bold text-[#FF7A45]">Set Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MapLocationCard;
