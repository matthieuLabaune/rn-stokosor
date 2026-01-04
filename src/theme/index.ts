import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

// Couleurs Stokosor - thème dinosaure friendly
const stokosorColors = {
  primary: '#4CAF50', // Vert dino
  primaryContainer: '#C8E6C9',
  secondary: '#FF9800', // Orange carton
  secondaryContainer: '#FFE0B2',
  tertiary: '#795548', // Marron terre
  tertiaryContainer: '#D7CCC8',
  error: '#F44336',
  errorContainer: '#FFCDD2',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceVariant: '#E8E8E8',
  onPrimary: '#FFFFFF',
  onSecondary: '#000000',
  onBackground: '#212121',
  onSurface: '#212121',
  onSurfaceVariant: '#757575',
};

const stokosorDarkColors = {
  primary: '#81C784',
  primaryContainer: '#388E3C',
  secondary: '#FFB74D',
  secondaryContainer: '#F57C00',
  tertiary: '#A1887F',
  tertiaryContainer: '#5D4037',
  error: '#EF5350',
  errorContainer: '#C62828',
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2C2C2C',
  onPrimary: '#000000',
  onSecondary: '#000000',
  onBackground: '#FFFFFF',
  onSurface: '#FFFFFF',
  onSurfaceVariant: '#BDBDBD',
};

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...stokosorColors,
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...stokosorDarkColors,
  },
};

// Constantes de style
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
};
