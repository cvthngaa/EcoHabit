import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../theme/colors';

const Divider: React.FC<{ label?: string }> = ({ label = 'hoặc' }) => (
  <View style={styles.wrap}>
    <View style={styles.line} />
    <Text style={styles.label}>{label}</Text>
    <View style={styles.line} />
  </View>
);

const styles = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line:  { flex: 1, height: 1, backgroundColor: Colors.border },
  label: { marginHorizontal: 14, fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
});

export default Divider;
