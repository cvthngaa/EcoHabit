import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocateMe: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({ onZoomIn, onZoomOut, onLocateMe }) => {
  return (
    <>
      <View className="absolute right-4 bottom-[180px] items-center bg-white rounded-[20px] py-2" style={{ elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 }}>
        <TouchableOpacity className="w-[42px] h-[40px] items-center justify-center border-b border-gray-100" onPress={onZoomIn}>
          <Ionicons name="add" size={24} color="#1F2937" />
        </TouchableOpacity>
        <TouchableOpacity className="w-[42px] h-[40px] items-center justify-center" onPress={onZoomOut}>
          <Ionicons name="remove" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <View className="absolute right-4 bottom-[280px] items-center gap-[10px]">
        <TouchableOpacity
          className="h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white"
          style={{ elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 }}
          onPress={onLocateMe}
        >
          <Ionicons name="locate" size={20} color="#FF7A45" />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default MapControls;
