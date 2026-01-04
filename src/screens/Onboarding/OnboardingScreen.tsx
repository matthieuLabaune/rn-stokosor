import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, FlatList, ViewToken } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing, borderRadius } from '../../theme';
import i18n from '../../i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'home-city',
    title: 'Organisez vos espaces',
    description: 'Créez des lieux (maison, garage, bureau) et des zones (cuisine, chambre) pour structurer votre inventaire.',
    color: '#4CAF50',
  },
  {
    id: '2',
    icon: 'package-variant-closed',
    title: 'Rangez vos objets',
    description: 'Ajoutez des contenants (boîtes, tiroirs, étagères) et classez vos objets avec des catégories.',
    color: '#FF9800',
  },
  {
    id: '3',
    icon: 'qrcode-scan',
    title: 'Scannez et retrouvez',
    description: 'Chaque contenant a un QR code unique. Scannez pour accéder directement à son contenu.',
    color: '#2196F3',
  },
  {
    id: '4',
    icon: 'magnify',
    title: 'Recherche instantanée',
    description: 'Retrouvez n\'importe quel objet en quelques secondes grâce à la recherche globale.',
    color: '#9C27B0',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const handleComplete = async () => {
    await AsyncStorage.setItem('onboarding_completed', 'true');
    onComplete();
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => (
    <View style={styles.slide}>
      <Animated.View
        entering={FadeIn.delay(200).duration(400)}
        style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}
      >
        <Icon name={item.icon as any} size={80} color={item.color} />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300).duration(400)}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          {item.title}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400).duration(400)}>
        <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          {item.description}
        </Text>
      </Animated.View>
    </View>
  );

  const Pagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => {
        const isActive = index === currentIndex;
        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: isActive ? theme.colors.primary : theme.colors.surfaceVariant,
                width: isActive ? 24 : 8,
              },
            ]}
          />
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        {currentIndex < slides.length - 1 && (
          <Button mode="text" onPress={handleSkip}>
            {i18n.t('common.cancel')}
          </Button>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      <View style={styles.footer}>
        <Pagination />

        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            {currentIndex === slides.length - 1 ? 'Commencer' : 'Suivant'}
          </Button>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    borderRadius: borderRadius.lg,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
