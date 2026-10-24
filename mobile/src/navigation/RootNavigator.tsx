import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainNavigator from './MainNavigator';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import QuizIntroScreen from '../screens/quiz/QuizIntroScreen';
import QuizPlayScreen from '../screens/quiz/QuizPlayScreen';
import QuizResultScreen from '../screens/quiz/QuizResultScreen';
import AppScreenBackground from '../components/AppScreenBackground';

import ScanAnalysisScreen from '../screens/scan/ScanAnalysisScreen';
import RewardDetailScreen from '../screens/rewards/RewardDetailScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import MapAddressInputScreen from '../screens/map/MapAddressInputScreen';
import PersonalInfoScreen from '../screens/profile/PersonalInfoScreen';
import PrivacySecurityScreen from '../screens/profile/PrivacySecurityScreen';
import LanguageSettingsScreen from '../screens/profile/LanguageSettingsScreen';
import AppearanceSettingsScreen from '../screens/profile/AppearanceSettingsScreen';
import LocationSettingsScreen from '../screens/profile/LocationSettingsScreen';
import HelpFaqScreen from '../screens/profile/HelpFaqScreen';
import RateAppScreen from '../screens/profile/RateAppScreen';
import ShareEcoHabitScreen from '../screens/profile/ShareEcoHabitScreen';
import BadgesScreen from '../screens/profile/BadgesScreen';
import LeaderboardScreen from '../screens/profile/LeaderboardScreen';
import { useAuth } from '../context/AuthContext';

const Stack = createStackNavigator();

const screenTransition = {
    cardStyleInterpolator: ({ current, next, layouts }: any) => {
        const screenWidth = layouts.screen.width;
        const pushTranslateX = current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [screenWidth, 0],
        });
        const backRevealTranslateX = next
            ? next.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -screenWidth * 0.28],
            })
            : 0;

        return {
            cardStyle: {
                transform: [{
                    translateX: next ? backRevealTranslateX : pushTranslateX,
                }],
                opacity: current.progress.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.85, 1],
                }),
            },
        };
    },
    transitionSpec: {
        open: { animation: 'spring' as const, config: { stiffness: 280, damping: 28, mass: 1, overshootClamping: false, restDisplacementThreshold: 0.01, restSpeedThreshold: 0.01 } },
        close: { animation: 'spring' as const, config: { stiffness: 280, damping: 28, mass: 1, overshootClamping: false, restDisplacementThreshold: 0.01, restSpeedThreshold: 0.01 } },
    },
};

const RootNavigator: React.FC = () => {
    const { isLoggedIn, isHydrating } = useAuth();

    if (isHydrating) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2E7D32" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {isLoggedIn ? (
                <AppScreenBackground>
                    <Stack.Navigator
                        screenOptions={{
                            headerShown: false,
                            cardStyle: { backgroundColor: 'transparent' },
                            ...screenTransition,
                        }}
                    >
                        <Stack.Screen name="MainTabs" component={MainNavigator} />
                        <Stack.Screen name="QuizIntro" component={QuizIntroScreen} />
                        <Stack.Screen name="QuizPlay" component={QuizPlayScreen} />
                        <Stack.Screen name="QuizResult" component={QuizResultScreen} />

                        <Stack.Screen name="ScanAnalysis" component={ScanAnalysisScreen} />
                        <Stack.Screen name="RewardDetail" component={RewardDetailScreen} />
                        <Stack.Screen name="Wallet" component={WalletScreen} />
                        <Stack.Screen name="MapAddressInput" component={MapAddressInputScreen} />
                        <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
                        <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
                        <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
                        <Stack.Screen name="AppearanceSettings" component={AppearanceSettingsScreen} />
                        <Stack.Screen name="LocationSettings" component={LocationSettingsScreen} />
                        <Stack.Screen name="HelpFaq" component={HelpFaqScreen} />
                        <Stack.Screen name="RateApp" component={RateAppScreen} />
                        <Stack.Screen name="ShareEcoHabit" component={ShareEcoHabitScreen} />
                        <Stack.Screen name="Badges" component={BadgesScreen} />
                        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
                    </Stack.Navigator>
                </AppScreenBackground>
            ) : (
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                        ...screenTransition,
                    }}
                >
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );
};

export default RootNavigator;

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
});
