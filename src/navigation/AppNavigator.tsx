import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import { RootStackParamList } from '../types';
import i18n from '../i18n';

// Import des navigateurs et écrans
import MainTabs from './MainTabs';
import LieuScreen from '../screens/Lieu/LieuScreen';
import ZoneScreen from '../screens/Zone/ZoneScreen';
import ContenantScreen from '../screens/Contenant/ContenantScreen';
import ItemScreen from '../screens/Item/ItemScreen';
import StatsScreen from '../screens/Settings/StatsScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        cardStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Lieu"
        component={LieuScreen}
        options={{ title: i18n.t('lieu.title') }}
      />
      <Stack.Screen
        name="Zone"
        component={ZoneScreen}
        options={{ title: i18n.t('zone.title') }}
      />
      <Stack.Screen
        name="Contenant"
        component={ContenantScreen}
        options={{ title: i18n.t('contenant.title') }}
      />
      <Stack.Screen
        name="Item"
        component={ItemScreen}
        options={{ title: i18n.t('item.title') }}
      />
      <Stack.Screen
        name="Stats"
        component={StatsScreen}
        options={{ title: i18n.t('stats.title') }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
