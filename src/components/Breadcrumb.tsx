import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { spacing } from '../theme';

interface BreadcrumbItem {
  label: string;
  onPress?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}
      contentContainerStyle={styles.content}
    >
      {items.map((item, index) => (
        <View key={index} style={styles.item}>
          {index > 0 && (
            <Icon
              name="chevron-right"
              size={16}
              color={theme.colors.onSurfaceVariant}
              style={styles.separator}
            />
          )}
          {item.onPress ? (
            <TouchableOpacity onPress={item.onPress}>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.primary }}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 36,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    marginHorizontal: spacing.xs,
  },
});

export default Breadcrumb;
