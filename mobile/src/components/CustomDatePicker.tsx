import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';

interface CustomDatePickerProps {
  visible: boolean;
  onClose: () => void;
  date: Date | null;
  onConfirm: (date: Date) => void;
  maximumDate?: Date;
}

const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ visible, onClose, date, onConfirm, maximumDate }) => {
  const [currentDate, setCurrentDate] = useState(date || new Date());
  const [selectedDate, setSelectedDate] = useState(date || new Date());
  const [pickerMode, setPickerMode] = useState<'date' | 'month' | 'year'>('date');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateGrid = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay();
    const daysInPrevMonth = getDaysInMonth(year, month - 1);

    const grid = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      grid.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, daysInPrevMonth - i),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      grid.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // Next month days to fill grid (6 rows = 42 days)
    const remainingDays = 42 - grid.length;
    for (let i = 1; i <= remainingDays; i++) {
      grid.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return grid;
  };

  const grid = useMemo(() => generateGrid(), [year, month]);

  const isSelected = (d: Date) => {
    return selectedDate.getDate() === d.getDate() &&
      selectedDate.getMonth() === d.getMonth() &&
      selectedDate.getFullYear() === d.getFullYear();
  };

  const handleConfirm = () => {
    onConfirm(selectedDate);
    onClose();
  };

  const maxYear = maximumDate ? maximumDate.getFullYear() : new Date().getFullYear();
  const years = useMemo(() => Array.from({ length: 100 }, (_, i) => maxYear - i), [maxYear]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <TouchableOpacity className="absolute inset-0" onPress={onClose} activeOpacity={1} />

        <View className="w-[85%] bg-white rounded-[24px] p-6 shadow-xl">
          <View className="flex-row justify-between items-start mb-5">
            <View>
              <Text className="text-2xl font-black text-[#3A3A3A] mb-3">Chọn ngày</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-row items-center bg-[#F5F6F8] px-3.5 py-2 rounded-md"
                  onPress={() => setPickerMode(pickerMode === 'month' ? 'date' : 'month')}
                >
                  <Text className="text-sm font-bold text-[#3A3A3A]">{MONTHS[month]}</Text>
                  <Ionicons name={pickerMode === 'month' ? "caret-up" : "caret-down"} size={14} color="#3A3A3A" className="ml-1.5" />
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center bg-[#F5F6F8] px-3.5 py-2 rounded-md"
                  onPress={() => setPickerMode(pickerMode === 'year' ? 'date' : 'year')}
                >
                  <Text className="text-sm font-bold text-[#3A3A3A]">{year}</Text>
                  <Ionicons name={pickerMode === 'year' ? "caret-up" : "caret-down"} size={14} color="#3A3A3A" className="ml-1.5" />
                </TouchableOpacity>
              </View>
            </View>

            {pickerMode === 'date' && (
              <View className="w-[60px] h-[60px] relative mt-1">
                <View className="bg-[#E68A2E] h-3.5 rounded-t-[10px]" />
                <View style={{ backgroundColor: Colors.primary }} className="flex-1 rounded-b-[10px] justify-center items-center">
                  <Text className="text-white text-[26px] font-black">
                    {selectedDate.getDate().toString().padStart(2, '0')}
                  </Text>
                </View>
                <View className="absolute -top-1 left-3 w-1.5 h-3 bg-[#A36221] rounded-sm" />
                <View className="absolute -top-1 right-3 w-1.5 h-3 bg-[#A36221] rounded-sm" />
              </View>
            )}
          </View>

          {pickerMode === 'date' && (
            <>
              <View className="flex-row justify-between mb-4">
                {DAYS_OF_WEEK.map((day, idx) => (
                  <Text
                    key={day}
                    className="w-[14.28%] text-center text-[11px] font-bold text-[#3A3A3A]"
                    style={idx === 0 ? { color: Colors.primary } : undefined}
                  >
                    {day}
                  </Text>
                ))}
              </View>

              <View className="flex-row flex-wrap">
                {grid.map((item, index) => {
                  const selected = isSelected(item.date);
                  const disabled = maximumDate ? item.date > maximumDate : false;
                  return (
                    <TouchableOpacity
                      key={index}
                      disabled={disabled}
                      className="w-[14.28%] h-10 justify-center items-center mb-2"
                      onPress={() => {
                        setSelectedDate(item.date);
                        if (!item.isCurrentMonth) {
                          setCurrentDate(item.date);
                        }
                      }}
                    >
                      <Text
                        className={`text-sm font-bold ${disabled ? 'text-gray-200' : (!item.isCurrentMonth ? 'text-gray-400' : '')}`}
                        style={selected && item.isCurrentMonth && !disabled ? { color: Colors.primary } : (!item.isCurrentMonth || disabled ? {} : { color: '#3A3A3A' })}
                      >
                        {item.day.toString().padStart(2, '0')}
                      </Text>
                      {selected && !disabled && <View style={{ backgroundColor: Colors.primary }} className="absolute bottom-1.5 w-4 h-[2px] rounded-sm" />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View className="items-center mt-4">
                <TouchableOpacity
                  style={{ backgroundColor: Colors.primary }}
                  className="px-10 py-3.5 rounded-[20px] shadow-lg"
                  onPress={handleConfirm}
                >
                  <Text className="text-white text-base font-extrabold">Xác nhận</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {pickerMode === 'month' && (
            <View className="flex-row flex-wrap justify-between mt-2">
              {MONTHS.map((m, i) => (
                <TouchableOpacity
                  key={i}
                  className={`w-[31%] py-3 mb-3 rounded-md items-center ${month === i ? '' : 'bg-[#F5F6F8]'}`}
                  style={month === i ? { backgroundColor: Colors.primary } : undefined}
                  onPress={() => {
                    setCurrentDate(new Date(year, i, 1));
                    setPickerMode('date');
                  }}
                >
                  <Text className={`font-bold ${month === i ? 'text-white' : 'text-[#3A3A3A]'}`}>{m.replace('Tháng ', 'T')}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {pickerMode === 'year' && (
            <ScrollView className="max-h-[260px] mt-2" showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap justify-between">
                {years.map(y => (
                  <TouchableOpacity
                    key={y}
                    className={`w-[31%] py-3 mb-3 rounded-md items-center ${year === y ? '' : 'bg-[#F5F6F8]'}`}
                    style={year === y ? { backgroundColor: Colors.primary } : undefined}
                    onPress={() => {
                      setCurrentDate(new Date(y, month, 1));
                      setPickerMode('date');
                    }}
                  >
                    <Text className={`font-bold ${year === y ? 'text-white' : 'text-[#3A3A3A]'}`}>{y}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

        </View>
      </View>
    </Modal>
  );
};

export default CustomDatePicker;
