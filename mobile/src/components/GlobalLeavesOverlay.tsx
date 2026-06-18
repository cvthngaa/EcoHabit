import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import FallingLeaves from './FallingLeaves';

const GlobalLeavesOverlay: React.FC = () => {
 const { showLeaves } = useSettings();

 if (!showLeaves) return null;

 return (
 <View pointerEvents="none" style={StyleSheet.absoluteFill}>
 <FallingLeaves count={14} speed="slow" />
 </View>
 );
};

export default GlobalLeavesOverlay;
