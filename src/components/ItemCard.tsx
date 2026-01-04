import React from 'react';
import { StyleSheet, Image, View, Pressable } from 'react-native';
import { Card, Text, IconButton, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Item } from '../types';
import { getCategoryByKey } from '../constants/categories';
import i18n from '../i18n';
import { spacing, borderRadius } from '../theme';
import { lightHaptic } from '../utils/haptics';

interface ItemCardProps {
  item: Item;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onPress,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const category = getCategoryByKey(item.category);
  const hasPhoto = item.photos && item.photos.length > 0;
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

  // Vérifier si l'item est proche de la péremption ou périmé
  const getExpirationStatus = () => {
    if (!item.expiration_date) return null;

    const expDate = new Date(item.expiration_date);
    const today = new Date();
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired', color: theme.colors.error, label: i18n.t('item.expired') };
    } else if (diffDays <= 7) {
      return { status: 'soon', color: theme.colors.tertiary, label: `${diffDays}j` };
    }
    return null;
  };

  const expirationStatus = getExpirationStatus();

  // Formater le prix
  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return null;
    return `${price.toFixed(0)} €`;
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
          {/* Photo ou icône catégorie */}
          <View style={[styles.photoContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
            {hasPhoto ? (
              <Image source={{ uri: item.photos![0] }} style={styles.photo} />
            ) : (
              <Icon
                name={category?.icon || 'cube-outline' as any}
                size={28}
                color={theme.colors.primary}
              />
            )}
          </View>

          {/* Informations */}
          <View style={styles.info}>
            <Text variant="titleMedium" numberOfLines={1} style={styles.title}>
              {item.name}
            </Text>

            {item.brand && (
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.primary }}
                numberOfLines={1}
              >
                {item.brand}
              </Text>
            )}

            <View style={styles.metaRow}>
              <View style={[styles.categoryBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon name={category?.icon || 'cube-outline' as any} size={12} color={theme.colors.onSurfaceVariant} />
                <Text
                  variant="labelSmall"
                  style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}
                >
                  {i18n.t(category?.labelKey || 'categories.other')}
                </Text>
              </View>

              {item.estimated_value !== undefined && item.estimated_value > 0 && (
                <View style={[styles.priceBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                  <Text
                    variant="labelSmall"
                    style={{ color: theme.colors.primary }}
                  >
                    {formatPrice(item.estimated_value)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Indicateur péremption */}
          {expirationStatus && (
            <View style={[styles.expirationBadge, { backgroundColor: `${expirationStatus.color}20` }]}>
              <Icon
                name={expirationStatus.status === 'expired' ? 'alert-circle' : 'clock-alert-outline' as any}
                size={16}
                color={expirationStatus.color}
              />
              <Text
                variant="labelSmall"
                style={{ color: expirationStatus.color, marginLeft: 4 }}
              >
                {expirationStatus.label}
              </Text>
            </View>
          )}

          {/* Actions */}
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  priceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  expirationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
  },
  actions: {
    flexDirection: 'column',
  },
});

export default ItemCard;
