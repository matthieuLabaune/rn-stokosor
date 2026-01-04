import React, { useEffect, useState, useCallback } from 'react';
import { useColorScheme, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider, Text } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

import AppNavigator from './src/navigation/AppNavigator';
import OnboardingScreen from './src/screens/Onboarding/OnboardingScreen';
import { lightTheme, darkTheme } from './src/theme';
import { initDatabase } from './src/database/db';

const ONBOARDING_KEY = 'onboarding_completed';

export default function App() {
  const colorScheme = useColorScheme();
  const [isDbReady, setIsDbReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialiser la base de données
        await initDatabase();
        setIsDbReady(true);

        // Vérifier si l'onboarding a été complété
        const onboardingCompleted = await AsyncStorage.getItem(ONBOARDING_KEY);
        setShowOnboarding(onboardingCompleted !== 'true');

        // Masquer le splash après un délai
        setTimeout(() => {
          setShowSplash(false);
        }, 1500);
      } catch (error) {
        console.error('Failed to initialize:', error);
        setIsDbReady(true);
        setShowOnboarding(false);
        setShowSplash(false);
      }
    };

    initialize();
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  // Afficher le splash screen
  if (showSplash || !isDbReady || showOnboarding === null) {
    return (
      <View style={[styles.splash, { backgroundColor: theme.colors.primary }]}>
        <Animated.View entering={ZoomIn.duration(600).springify()}>
          <View style={styles.splashIconContainer}>
            <Icon name={"cube-outline" as any} size={80} color="white" />
          </View>
        </Animated.View>
        <Animated.View entering={FadeIn.delay(300).duration(400)}>
          <Text variant="headlineLarge" style={styles.splashTitle}>
            Stokosor
          </Text>
        </Animated.View>
        <Animated.View entering={FadeIn.delay(500).duration(400)}>
          <Text variant="bodyLarge" style={styles.splashSubtitle}>
            Organisez votre vie
          </Text>
        </Animated.View>
      </View>
    );
  }

  // Afficher l'onboarding pour les nouveaux utilisateurs
  if (showOnboarding) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <PaperProvider theme={theme}>
            <OnboardingScreen onComplete={handleOnboardingComplete} />
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          </PaperProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  splashTitle: {
    color: 'white',
    fontWeight: '700',
    marginBottom: 8,
  },
  splashSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
