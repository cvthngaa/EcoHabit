import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';

type ConfirmAlertProps = {
  visible: boolean;
  title: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const ConfirmAlert: React.FC<ConfirmAlertProps> = ({
  visible,
  title,
  message,
  cancelText = 'Thoat',
  confirmText = 'Oke',
  onCancel,
  onConfirm,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onCancel}
  >
    <View className="flex-1 items-center justify-center bg-black/45 px-6">
      <View className="w-full max-w-[360px] rounded-[28px] bg-white px-6 py-6">
        <View className="mx-auto h-14 w-14 items-center justify-center rounded-[18px] bg-[#FFF8E1]">
          <Ionicons name="alert-circle" size={30} color={Colors.warning} />
        </View>

        <Text className="mt-4 text-center text-[20px] font-extrabold text-[#1B3A1E]">
          {title}
        </Text>
        <Text className="mt-2 text-center text-[14px] leading-6 text-[#5D7C61]">
          {message}
        </Text>

        <View className="mt-6 flex-row">
          <TouchableOpacity
            className="mr-3 flex-1 items-center justify-center rounded-full border border-[#C8E6C9] bg-white px-4 py-3"
            onPress={onCancel}
            activeOpacity={0.85}
          >
            <Text className="text-[15px] font-semibold text-[#5D7C61]">{cancelText}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 items-center justify-center rounded-full bg-[#4CAF50] px-4 py-3"
            onPress={onConfirm}
            activeOpacity={0.85}
          >
            <Text className="text-[15px] font-bold text-white">{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default ConfirmAlert;
