import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';

export type SelectableChipItem<T extends string | number> = {
  key: T;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  activeColor?: string;
};

type SelectableChipTabsProps<T extends string | number> = {
  items: SelectableChipItem<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  showIcons?: boolean;
};

function SelectableChipTabs<T extends string | number>({
  items,
  activeKey,
  onChange,
  showIcons = true,
}: SelectableChipTabsProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
    >
      {items.map(item => {
        const isActive = activeKey === item.key;
        const activeColor = item.activeColor || Colors.primaryLight;

        return (
          <TouchableOpacity
            key={String(item.key)}
            className="mr-2 flex-row items-center rounded-full border px-[13px] py-[7px]"
            style={{
              backgroundColor: isActive ? activeColor : Colors.white,
              borderColor: isActive ? activeColor : Colors.border,
            }}
            onPress={() => onChange(item.key)}
            activeOpacity={0.85}
          >
            {showIcons && item.icon ? (
              <View className="mr-[5px]">
                <Ionicons
                  name={item.icon}
                  size={15}
                  color={isActive ? Colors.white : Colors.textSecondary}
                />
              </View>
            ) : null}
            <Text
              className="text-[12px] font-semibold"
              style={{ color: isActive ? Colors.white : Colors.textSecondary }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default SelectableChipTabs;
