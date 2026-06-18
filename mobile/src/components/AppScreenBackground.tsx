import React from 'react';
import { StyleSheet, View } from 'react-native';
import NatureBackground from './NatureBackground';
import { useSettings } from '../context/SettingsContext';

/**
 * AppScreenBackground
 *
 * Wrapper dùng chung cho các màn chính (tab navigator).
 * - appearance === 'nature' → NatureBackground (SVG thiên nhiên) + nền trong suốt
 * - appearance === 'light' → nền trắng thuần, không có nền thiên nhiên
 *
 * Hiệu ứng lá rơi được xử lý ở GlobalLeavesOverlay trong App.tsx
 * để đảm bảo render đúng trên cả iOS lẫn Android (tránh bị navigator che).
 */
const AppScreenBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const { appearance } = useSettings();
 const isNature = appearance === 'nature';

 return (
 <View style={[styles.root, isNature ? styles.rootNature : styles.rootLight]}>
 {/* Nature background layer – absoluteFill behind content */}
 {isNature && <NatureBackground />}

 {/* Main content – transparent so nature bg shows through */}
 <View style={styles.content}>{children}</View>
 </View>
 );
};

const styles = StyleSheet.create({
 root: {
 flex: 1,
 },
 rootLight: {
 backgroundColor: '#FFFFFF',
 },
 rootNature: {
 // Transparent so NatureBackground (absoluteFill SVG) is visible
 backgroundColor: 'transparent',
 },
 content: {
 flex: 1,
 backgroundColor: 'transparent',
 },
});

export default AppScreenBackground;
