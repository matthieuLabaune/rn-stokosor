import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { spacing, borderRadius } from '../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius: radius = borderRadius.sm,
  style,
}) => {
  const theme = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 800 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: radius,
          backgroundColor: theme.colors.surfaceVariant,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

// Skeleton pour une carte de lieu
export const LieuCardSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.cardContent}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <View style={styles.cardInfo}>
          <Skeleton width="70%" height={20} />
          <Skeleton width="40%" height={14} style={{ marginTop: spacing.xs }} />
        </View>
        <Skeleton width={24} height={24} borderRadius={12} />
      </View>
    </View>
  );
};

// Skeleton pour une carte de zone/contenant
export const ZoneCardSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.cardContent}>
        <Skeleton width={40} height={40} borderRadius={borderRadius.sm} />
        <View style={styles.cardInfo}>
          <Skeleton width="60%" height={18} />
          <Skeleton width="30%" height={12} style={{ marginTop: spacing.xs }} />
        </View>
      </View>
    </View>
  );
};

// Skeleton pour une carte d'item
export const ItemCardSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.cardContent}>
        <Skeleton width={56} height={56} borderRadius={borderRadius.md} />
        <View style={styles.cardInfo}>
          <Skeleton width="75%" height={18} />
          <Skeleton width="50%" height={14} style={{ marginTop: spacing.xs }} />
          <Skeleton width="35%" height={12} style={{ marginTop: spacing.xs }} />
        </View>
      </View>
    </View>
  );
};

// Liste de skeletons
interface SkeletonListProps {
  count?: number;
  type?: 'lieu' | 'zone' | 'item';
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 5,
  type = 'zone',
}) => {
  const SkeletonComponent = {
    lieu: LieuCardSkeleton,
    zone: ZoneCardSkeleton,
    item: ItemCardSkeleton,
  }[type];

  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  list: {
    padding: spacing.md,
  },
});

export default Skeleton;
