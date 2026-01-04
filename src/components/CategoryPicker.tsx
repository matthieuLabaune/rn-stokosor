import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { Text, useTheme, Portal, Modal, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Category } from '../types';
import { CATEGORIES, getCategoryByKey } from '../constants/categories';
import i18n from '../i18n';
import { spacing, borderRadius } from '../theme';

interface CategoryPickerProps {
  value: Category;
  onChange: (category: Category) => void;
  label?: string;
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({
  value,
  onChange,
  label,
}) => {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const selectedCategory = getCategoryByKey(value);

  const handleSelect = (category: Category) => {
    onChange(category);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
          {label}
        </Text>
      )}

      <Pressable
        style={[
          styles.selector,
          {
            backgroundColor: theme.colors.surfaceVariant,
            borderColor: theme.colors.outline,
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Icon
          name={(selectedCategory?.icon || 'cube-outline') as any}
          size={24}
          color={theme.colors.primary}
          style={styles.selectorIcon}
        />
        <Text variant="bodyLarge" style={styles.selectorText}>
          {i18n.t(selectedCategory?.labelKey || 'categories.other')}
        </Text>
        <Icon
          name="chevron-down"
          size={24}
          color={theme.colors.onSurfaceVariant}
        />
      </Pressable>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          {/* Handle indicator */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: theme.colors.outlineVariant }]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              {i18n.t('item.selectCategory')}
            </Text>
            <IconButton
              icon="close"
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
              size={24}
            />
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.key}
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor:
                        value === cat.key
                          ? theme.colors.primaryContainer
                          : theme.colors.surfaceVariant,
                      borderColor:
                        value === cat.key
                          ? theme.colors.primary
                          : 'transparent',
                    },
                  ]}
                  onPress={() => handleSelect(cat.key)}
                >
                  <Icon
                    name={cat.icon as any}
                    size={32}
                    color={
                      value === cat.key
                        ? theme.colors.primary
                        : theme.colors.onSurfaceVariant
                    }
                  />
                  <Text
                    variant="labelMedium"
                    style={[
                      styles.categoryLabel,
                      {
                        color:
                          value === cat.key
                            ? theme.colors.primary
                            : theme.colors.onSurface,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {i18n.t(cat.labelKey)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  selectorIcon: {
    marginRight: spacing.sm,
  },
  selectorText: {
    flex: 1,
  },
  modal: {
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  modalTitle: {
    fontWeight: '600',
  },
  closeButton: {
    margin: 0,
  },
  scrollView: {
    maxHeight: 400,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '30%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    padding: spacing.xs,
  },
  categoryLabel: {
    marginTop: spacing.xs,
    textAlign: 'center',
    fontSize: 11,
  },
});

export default CategoryPicker;
