import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import i18n from '../i18n';
import { MainTabParamList } from '../types';

// Import des écrans
import HomeScreen from '../screens/Home/HomeScreen';
import ScannerScreen from '../screens/Scanner/ScannerScreen';
import SearchScreen from '../screens/Search/SearchScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs: React.FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.surfaceVariant,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: i18n.t('tabs.home'),
          tabBarIcon: ({ color, size }) => (
            <Icon name={"home" as any} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          title: i18n.t('tabs.scanner'),
          tabBarIcon: ({ color, size }) => (
            <Icon name={"qrcode-scan" as any} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: i18n.t('tabs.search'),
          tabBarIcon: ({ color, size }) => (
            <Icon name={"magnify" as any} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: i18n.t('tabs.settings'),
          tabBarIcon: ({ color, size }) => (
            <Icon name={"cog" as any} color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
