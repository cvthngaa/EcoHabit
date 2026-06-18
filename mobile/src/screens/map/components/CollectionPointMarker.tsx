import React from 'react';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { CollectionPointItem } from '../../../services/map/types'; // adjust path as needed

interface CollectionPointMarkerProps {
  point: CollectionPointItem;
  isSelected: boolean;
  onPress: () => void;
}

const markerWrapSelectedStyle = {
  transform: [{ scale: 1.12 }],
};

const CollectionPointMarker: React.FC<CollectionPointMarkerProps> = ({ point, isSelected, onPress }) => {
  return (
    <Marker
      key={point.id}
      coordinate={{ latitude: point.lat, longitude: point.lng }}
      onPress={onPress}
      style={{ zIndex: isSelected ? 10 : 1 }}
    >
      <View className="items-center justify-center">
        <View className="items-center z-10" style={isSelected ? markerWrapSelectedStyle : undefined}>
          <View className="w-10 h-10 bg-white rounded-full p-1" style={{ elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 }}>
            <View className={`w-full h-full rounded-full items-center justify-center overflow-hidden ${isSelected ? 'bg-[#10B981]' : 'bg-[#EAF7F2]'}`}>
              <Ionicons name={point.types === 'Trung tâm tái chế' ? "business" : "leaf"} size={16} color={isSelected ? "#FFFFFF" : "#10B981"} />
            </View>
          </View>
          <View className="w-2.5 h-2.5 bg-white rotate-45 -mt-1.5" />
        </View>
      </View>
    </Marker>
  );
};

export default CollectionPointMarker;
