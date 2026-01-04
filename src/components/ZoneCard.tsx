import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Card, Text, IconButton, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Zone } from '../types';
import { spacing, borderRadius } from '../theme';
import { lightHaptic } from '../utils/haptics';

interface ZoneCardProps {
  zone: Zone;
  contenantCount: number;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ZoneCard: React.FC<ZoneCardProps> = ({
  zone,
  contenantCount,
  onPress,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    lightHaptic();
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
        <Card.Content style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.secondaryContainer }]}>
            <Icon
              name={zone.icon || 'door' as any}
              size={28}
              color={theme.colors.secondary}
            />
          </View>

          <View style={styles.info}>
            <Text variant="titleMedium" numberOfLines={1} style={styles.title}>
              {zone.name}
            </Text>
            <View style={styles.statsRow}>
              <View style={[styles.badge, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon name={"package-variant" as any} size={12} color={theme.colors.onSurfaceVariant} />
                <Text
                  variant="labelSmall"
                  style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}
                >
                  {contenantCount} contenant{contenantCount !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <IconButton
              icon="pencil-outline"
              size={20}
              onPress={() => {
                lightHaptic();
                onEdit();
              }}
              iconColor={theme.colors.onSurfaceVariant}
            />
            <IconButton
              icon="delete-outline"
              size={20}
              onPress={() => {
                lightHaptic();
                onDelete();
              }}
              iconColor={theme.colors.error}
            />
          </View>
        </Card.Content>
      </Card>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  actions: {
    flexDirection: 'column',
    marginLeft: spacing.xs,
  },
});

export default ZoneCard;
