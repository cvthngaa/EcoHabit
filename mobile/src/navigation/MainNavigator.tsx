import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import HomeScreen from '../screens/home/HomeScreen';
import ScanScreen from '../screens/scan/ScanScreen';
import MapScreen from '../screens/map/MapScreen';
import RewardsScreen from '../screens/rewards/RewardsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import Colors from '../theme/colors';

export type MainTabParamList = {
  Home: undefined;
  Scan: undefined;
  Map: undefined;
  Rewards: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_CONFIG = [
  { name: 'Home' as const, label: 'Trang chủ', icon: 'home', iconO: 'home-outline' },
  { name: 'Map' as const, label: 'Bản đồ', icon: 'map', iconO: 'map-outline' },
  { name: 'Scan' as const, label: 'Quét', icon: 'scan', iconO: 'scan-outline' },
  { name: 'Rewards' as const, label: 'Đổi quà', icon: 'gift', iconO: 'gift-outline' },
  { name: 'Profile' as const, label: 'Cá nhân', icon: 'person', iconO: 'person-outline' },
];

// ── Custom tab bar ────────────────────────────────────────────────────────────

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const focusedRoute = state.routes[state.index];
  const focusedOptions = descriptors[focusedRoute.key]?.options;
  const tabBarStyle = focusedOptions?.tabBarStyle;

  if (tabBarStyle?.display === 'none') {
    return null;
  }

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom + 6 }]}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const cfg = TAB_CONFIG.find(t => t.name === route.name)!;
        const isScan = route.name === 'Scan';

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Central Scan button elevated
        if (isScan) {
          return (
            <View key={route.key} style={styles.scanBtnOuter}>
              <View onTouchEnd={onPress}>
                <LinearGradient
                  colors={[Colors.primaryGradientStart, Colors.primaryLight]}
                  style={styles.scanBtnInner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="scan" size={26} color={Colors.white} />
                </LinearGradient>
              </View>
            </View>
          );
        }

        return (
          <View key={route.key} style={styles.tabItem} onTouchEnd={onPress}>
            <View style={[styles.tabIconWrap, isFocused && styles.tabIconWrapActive]}>
              <Ionicons
                name={(isFocused ? cfg.icon : cfg.iconO) as any}
                size={22}
                color={isFocused ? Colors.primary : Colors.textMuted}
              />
            </View>
            <View
              style={[styles.tabDot, isFocused ? styles.tabDotActive : styles.tabDotInactive]}
            />
          </View>
        );
      })}
    </View>
  );
}

// ── MainNavigator ─────────────────────────────────────────────────────────────

const MainNavigator: React.FC = () => (
  <Tab.Navigator
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Map" component={MapScreen} />
    <Tab.Screen name="Scan" component={ScanScreen} />
    <Tab.Screen name="Rewards" component={RewardsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    position: 'relative',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabIconWrap: {
    width: 42,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: Colors.surfaceLight,
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
  tabDotActive: { backgroundColor: Colors.primaryLight },
  tabDotInactive: { backgroundColor: 'transparent' },

  // Scan (center)
  scanBtnOuter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -20,
  },
  scanBtnInner: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: Colors.primaryGradientStart,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    borderWidth: 4,
    borderColor: Colors.white,
  },
});

export default MainNavigator;

