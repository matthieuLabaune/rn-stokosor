import React, { useCallback } from 'react';
import { FlatList, FlatListProps, RefreshControl, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { spacing } from '../theme';

interface AnimatedListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  onRefresh?: () => void;
  emptyComponent?: React.ReactElement;
  staggerDelay?: number;
  animationDirection?: 'up' | 'down';
}

function AnimatedList<T>({
  data,
  renderItem,
  keyExtractor,
  isLoading = false,
  onRefresh,
  emptyComponent,
  staggerDelay = 50,
  animationDirection = 'down',
  contentContainerStyle,
  ...flatListProps
}: AnimatedListProps<T>) {
  const theme = useTheme();

  const renderAnimatedItem = useCallback(
    ({ item, index }: { item: T; index: number }) => {
      const EnterAnimation = animationDirection === 'down' ? FadeInDown : FadeInUp;

      return (
        <Animated.View
          entering={EnterAnimation.delay(index * staggerDelay).duration(300).springify()}
          layout={Layout.springify()}
        >
          {renderItem(item, index)}
        </Animated.View>
      );
    },
    [renderItem, staggerDelay, animationDirection]
  );

  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={isLoading}
      onRefresh={onRefresh}
      colors={[theme.colors.primary]}
      tintColor={theme.colors.primary}
      progressBackgroundColor={theme.colors.surface}
    />
  ) : undefined;

  const containerStyle = [
    styles.contentContainer,
    contentContainerStyle,
    data.length === 0 && emptyComponent && styles.emptyContainer,
  ];

  return (
    <FlatList
      data={data}
      renderItem={renderAnimatedItem}
      keyExtractor={keyExtractor}
      refreshControl={refreshControl}
      contentContainerStyle={containerStyle}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={!isLoading ? emptyComponent : null}
      {...flatListProps}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flexGrow: 1,
  },
});

export default AnimatedList;
