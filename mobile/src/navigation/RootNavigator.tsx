import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainNavigator from './MainNavigator';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import QuizScreen from '../screens/quiz/QuizScreen';
import QRScannerScreen from '../screens/scan/QRScannerScreen';
import ScanAnalysisScreen from '../screens/scan/ScanAnalysisScreen';
import RewardDetailScreen from '../screens/rewards/RewardDetailScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import CommunityPostDetailScreen from '../screens/community/CommunityPostDetailScreen';
import CommunityCreatePostScreen from '../screens/community/CommunityCreatePostScreen';
import MapAddressInputScreen from '../screens/map/MapAddressInputScreen';
import PersonalInfoScreen from '../screens/profile/PersonalInfoScreen';
import NotificationsSettingsScreen from '../screens/profile/NotificationsSettingsScreen';
import PrivacySecurityScreen from '../screens/profile/PrivacySecurityScreen';
import LanguageSettingsScreen from '../screens/profile/LanguageSettingsScreen';
import AppearanceSettingsScreen from '../screens/profile/AppearanceSettingsScreen';
import LocationSettingsScreen from '../screens/profile/LocationSettingsScreen';
import HelpFaqScreen from '../screens/profile/HelpFaqScreen';
import RateAppScreen from '../screens/profile/RateAppScreen';
import ShareEcoHabitScreen from '../screens/profile/ShareEcoHabitScreen';
import { useAuth } from '../context/AuthContext';

const Stack = createStackNavigator();

const screenTransition = {
  cardStyleInterpolator: ({ current, layouts }: any) => ({
    cardStyle: {
      transform: [{
        translateX: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.width, 0],
        }),
      }],
      opacity: current.progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0.85, 1],
      }),
    },
  }),
  transitionSpec: {
    open: { animation: 'spring' as const, config: { stiffness: 280, damping: 28, mass: 1, overshootClamping: false, restDisplacementThreshold: 0.01, restSpeedThreshold: 0.01 } },
    close: { animation: 'spring' as const, config: { stiffness: 280, damping: 28, mass: 1, overshootClamping: false, restDisplacementThreshold: 0.01, restSpeedThreshold: 0.01 } },
  },
};

/**
 * RootNavigator
 * Uses AuthContext for auth flow.
 * When logged in, shows MainTabs with stack screens for Quiz, QR, RewardDetail, Wallet.
 */
const RootNavigator: React.FC = () => {
  const { isLoggedIn, isHydrating, login } = useAuth();

  if (isHydrating) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            ...screenTransition,
          }}
        >
          <Stack.Screen name="MainTabs" component={MainNavigator} />
          <Stack.Screen name="Quiz" component={QuizScreen} />
          <Stack.Screen name="QRScanner" component={QRScannerScreen} />
          <Stack.Screen name="ScanAnalysis" component={ScanAnalysisScreen} />
          <Stack.Screen name="RewardDetail" component={RewardDetailScreen} />
          <Stack.Screen name="Wallet" component={WalletScreen} />
          <Stack.Screen name="Community" component={CommunityScreen} />
          <Stack.Screen name="CommunityPostDetail" component={CommunityPostDetailScreen} />
          <Stack.Screen name="CommunityCreatePost" component={CommunityCreatePostScreen} />
          <Stack.Screen name="MapAddressInput" component={MapAddressInputScreen} />
          <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
          <Stack.Screen name="NotificationsSettings" component={NotificationsSettingsScreen} />
          <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
          <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
          <Stack.Screen name="AppearanceSettings" component={AppearanceSettingsScreen} />
          <Stack.Screen name="LocationSettings" component={LocationSettingsScreen} />
          <Stack.Screen name="HelpFaq" component={HelpFaqScreen} />
          <Stack.Screen name="RateApp" component={RateAppScreen} />
          <Stack.Screen name="ShareEcoHabit" component={ShareEcoHabitScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            ...screenTransition,
          }}
        >
          <Stack.Screen name="Welcome">
            {({ navigation }) => (
              <WelcomeScreen
                onGoLogin={() => navigation.navigate('Login' as never)}
                onGoRegister={() => navigation.navigate('Register' as never)}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Login">
            {({ navigation }) => (
              <LoginScreen
                onLogin={() => login()}
                onGoRegister={() => navigation.navigate('Register' as never)}
                onGoBack={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {({ navigation }) => (
              <RegisterScreen onGoLogin={() => navigation.navigate('Login' as never)} />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;

