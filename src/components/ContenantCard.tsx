import React from 'react';
import { StyleSheet, Image, View, Pressable } from 'react-native';
import { Card, Text, IconButton, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Contenant } from '../types';
import { getContenantTypeIcon } from '../constants/contenantTypes';
import { spacing, borderRadius } from '../theme';
import { lightHaptic } from '../utils/haptics';

interface ContenantCardProps {
  contenant: Contenant;
  itemCount: number;
  childCount: number;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ContenantCard: React.FC<ContenantCardProps> = ({
  contenant,
  itemCount,
  childCount,
  onPress,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const typeIcon = getContenantTypeIcon(contenant.type);
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
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.tertiaryContainer }]}>
            {contenant.photo ? (
              <Image source={{ uri: contenant.photo }} style={styles.photo} />
            ) : (
              <Icon
                name={typeIcon as any}
                size={28}
                color={theme.colors.tertiary}
              />
            )}
          </View>

          <View style={styles.info}>
            <Text variant="titleMedium" numberOfLines={1} style={styles.title}>
              {contenant.name}
            </Text>
            <View style={styles.statsRow}>
              {childCount > 0 && (
                <View style={[styles.badge, { backgroundColor: theme.colors.primaryContainer }]}>
                  <Icon name={"package-variant" as any} size={12} color={theme.colors.primary} />
                  <Text
                    variant="labelSmall"
                    style={{ color: theme.colors.primary, marginLeft: 4 }}
                  >
                    {childCount}
                  </Text>
                </View>
              )}
              <View style={[styles.badge, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon name={"cube-outline" as any} size={12} color={theme.colors.onSurfaceVariant} />
                <Text
                  variant="labelSmall"
                  style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}
                >
                  {itemCount} objet{itemCount !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.qrBadge}>
            <Icon
              name="qrcode"
              size={20}
              color={theme.colors.primary}
            />
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
    overflow: 'hidden',
  },
  photo: {
    width: 48,
    height: 48,
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
    gap: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  qrBadge: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  actions: {
    flexDirection: 'column',
  },
});

export default ContenantCard;
