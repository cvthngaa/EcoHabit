import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainNavigator from './MainNavigator';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import Colors from '../theme/colors';
import { logout } from '../store/auth.store';

const Stack = createStackNavigator();

/**
 * RootNavigator
 * Uses local state `isLoggedIn` for demo auth flow.
 * Replace with AuthContext when connecting to backend API.
 */
const RootNavigator: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <MainNavigator />
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyleInterpolator: ({ current, layouts }) => ({
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
              open: { animation: 'spring', config: { stiffness: 280, damping: 28, mass: 1, overshootClamping: false, restDisplacementThreshold: 0.01, restSpeedThreshold: 0.01 } },
              close: { animation: 'spring', config: { stiffness: 280, damping: 28, mass: 1, overshootClamping: false, restDisplacementThreshold: 0.01, restSpeedThreshold: 0.01 } },
            },
          }}
        >
          <Stack.Screen name="Login">
            {({ navigation }) => (
              <LoginScreen
                onLogin={() => setIsLoggedIn(true)}
                onGoRegister={() => navigation.navigate('Register' as never)}
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
