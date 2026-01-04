import React from 'react';
import { StyleSheet, Image, View, Pressable } from 'react-native';
import { Card, Text, IconButton, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Lieu } from '../types';
import { spacing, borderRadius } from '../theme';
import { lightHaptic } from '../utils/haptics';

interface LieuCardProps {
  lieu: Lieu;
  zoneCount: number;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const LieuCard: React.FC<LieuCardProps> = ({
  lieu,
  zoneCount,
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
          <View style={[styles.photoContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
            {lieu.photo ? (
              <Image source={{ uri: lieu.photo }} style={styles.photo} />
            ) : (
              <Icon
                name="home-city"
                size={32}
                color={theme.colors.primary}
              />
            )}
          </View>

          <View style={styles.info}>
            <Text variant="titleMedium" numberOfLines={1} style={styles.title}>
              {lieu.name}
            </Text>
            {lieu.address && (
              <View style={styles.addressRow}>
                <Icon name={"map-marker-outline" as any} size={14} color={theme.colors.onSurfaceVariant} />
                <Text
                  variant="bodySmall"
                  style={[styles.address, { color: theme.colors.onSurfaceVariant }]}
                  numberOfLines={1}
                >
                  {lieu.address}
                </Text>
              </View>
            )}
            <View style={styles.statsRow}>
              <View style={[styles.badge, { backgroundColor: theme.colors.primaryContainer }]}>
                <Icon name={"layers" as any} size={12} color={theme.colors.primary} />
                <Text
                  variant="labelSmall"
                  style={{ color: theme.colors.primary, marginLeft: 4 }}
                >
                  {zoneCount} zone{zoneCount !== 1 ? 's' : ''}
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
  photoContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: 56,
    height: 56,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  address: {
    marginLeft: 4,
    flex: 1,
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

export default LieuCard;
