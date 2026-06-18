import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';
import { useGetMyQr } from '../services/auth/use-get-my-qr';

interface MyQrModalProps {
 visible: boolean;
 onClose: () => void;
}

const MyQrModal: React.FC<MyQrModalProps> = ({ visible, onClose }) => {
 const { data, isLoading, error, refetch } = useGetMyQr({ enabled: visible });
 const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

 useEffect(() => {
 let timer: NodeJS.Timeout;
 if (visible) {
 refetch();
 setTimeLeft(300);
 timer = setInterval(() => {
 setTimeLeft((prev) => {
 if (prev <= 1) {
 refetch(); // Refresh QR when expired
 return 300;
 }
 return prev - 1;
 });
 }, 1000);
 }
 return () => clearInterval(timer);
 }, [visible, refetch]);

 const formatTime = (seconds: number) => {
 const m = Math.floor(seconds / 60);
 const s = seconds % 60;
 return `${m}:${s < 10 ? '0' : ''}${s}`;
 };

 return (
 <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
 <View className="flex-1 bg-black/50 justify-center items-center p-5">
 <View 
 className="bg-white rounded-[24px] p-6 w-full max-w-[340px] items-center relative" 
 style={{
 }}
 >
 <TouchableOpacity className="absolute top-4 right-4 p-1" onPress={onClose}>
 <Ionicons name="close" size={24} color={Colors.textSecondary} />
 </TouchableOpacity>
 <Text className="text-xl font-extrabold mt-2 mb-2" style={{ color: Colors.textPrimary }}>Mã QR của tôi</Text>
 <Text className="text-sm text-center mb-6 leading-5" style={{ color: Colors.textSecondary }}>Đưa mã này cho nhân viên trạm thu gom để được cộng điểm</Text>
 
 <View className="w-[250px] h-[250px] justify-center items-center rounded-[20px] mb-5" style={{ backgroundColor: Colors.surfaceLight }}>
 {isLoading ? (
 <ActivityIndicator size="large" color={Colors.primary} />
 ) : error || !data?.qrToken ? (
 <Text className="text-sm font-medium" style={{ color: Colors.error }}>Không thể tải mã QR</Text>
 ) : (
 <View className="p-[15px] bg-white rounded-2xl">
 <QRCode value={data.qrToken} size={220} />
 </View>
 )}
 </View>

 {!isLoading && data?.qrToken && (
 <Text className="text-[13px]" style={{ color: Colors.textSecondary }}>
 Mã tự động làm mới sau <Text className="font-bold" style={{ color: Colors.primary }}>{formatTime(timeLeft)}</Text>
 </Text>
 )}
 </View>
 </View>
 </Modal>
 );
};

export default MyQrModal;
