import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { spacing } from '../theme';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <Animated.View entering={FadeIn.duration(400).delay(100)}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.surfaceVariant },
            compact && styles.iconContainerCompact,
          ]}
        >
          <Icon
            name={icon as any}
            size={compact ? 40 : 64}
            color={theme.colors.primary}
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(200)}>
        <Text
          variant={compact ? 'titleMedium' : 'headlineSmall'}
          style={[styles.title, { color: theme.colors.onBackground }]}
        >
          {title}
        </Text>
      </Animated.View>

      {description && (
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <Text
            variant="bodyMedium"
            style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
          >
            {description}
          </Text>
        </Animated.View>
      )}

      {actionLabel && onAction && (
        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <Button
            mode="contained"
            onPress={onAction}
            style={styles.button}
            icon="plus"
          >
            {actionLabel}
          </Button>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  compact: {
    flex: 0,
    paddingVertical: spacing.lg,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainerCompact: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  button: {
    marginTop: spacing.sm,
  },
});

export default EmptyState;
