import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Searchbar, Text, useTheme, Chip, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

import { useItemStore } from '../../store/itemStore';
import { useContenantStore } from '../../store/contenantStore';
import { useZoneStore } from '../../store/zoneStore';
import { useLieuStore } from '../../store/lieuStore';
import { Item, Category, RootStackParamList } from '../../types';
import { CATEGORIES, getCategoryByKey } from '../../constants/categories';
import i18n from '../../i18n';
import { spacing, borderRadius } from '../../theme';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface SearchResult extends Item {
  path: string;
}

const SearchScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const { items, fetchAllItems } = useItemStore();
  const { contenants, getContenantById, getContenantPath } = useContenantStore();
  const { getZoneById } = useZoneStore();
  const { getLieuById } = useLieuStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger tous les items au montage
  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true);
      await fetchAllItems();
      setIsLoading(false);
    };
    loadItems();
  }, []);

  // Construire le chemin complet pour un item
  const getItemPath = useCallback((item: Item): string => {
    const contenant = getContenantById(item.contenant_id);
    if (!contenant) return '';

    const zone = getZoneById(contenant.zone_id);
    if (!zone) return contenant.name;

    const lieu = getLieuById(zone.lieu_id);
    if (!lieu) return `${zone.name} › ${contenant.name}`;

    // Chemin des contenants imbriqués
    const contenantPath = getContenantPath(contenant.id);
    const contenantNames = contenantPath.map((c) => c.name).join(' › ');

    return `${lieu.name} › ${zone.name} › ${contenantNames}`;
  }, [getContenantById, getZoneById, getLieuById, getContenantPath]);

  // Filtrer les résultats
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() && !selectedCategory) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();

    return items
      .filter((item) => {
        // Filtre par catégorie
        if (selectedCategory && item.category !== selectedCategory) {
          return false;
        }

        // Si pas de recherche texte mais catégorie sélectionnée, afficher tous
        if (!query) {
          return true;
        }

        // Recherche dans nom, notes, tags, code-barres, marque, modèle
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesNotes = item.notes?.toLowerCase().includes(query);
        const matchesTags = item.tags?.some((tag) => tag.toLowerCase().includes(query));
        const matchesBarcode = item.barcode?.toLowerCase().includes(query);
        const matchesBrand = item.brand?.toLowerCase().includes(query);
        const matchesModel = item.model?.toLowerCase().includes(query);

        return matchesName || matchesNotes || matchesTags || matchesBarcode || matchesBrand || matchesModel;
      })
      .map((item) => ({
        ...item,
        path: getItemPath(item),
      }))
      .slice(0, 50); // Limiter à 50 résultats
  }, [items, searchQuery, selectedCategory, getItemPath]);

  const handleItemPress = (item: Item) => {
    navigation.navigate('Item', { itemId: item.id });
  };

  const handleCategoryToggle = (category: Category) => {
    setSelectedCategory((current) => (current === category ? null : category));
  };

  const renderItem = ({ item }: { item: SearchResult }) => {
    const category = getCategoryByKey(item.category);

    return (
      <Card
        style={styles.resultCard}
        onPress={() => handleItemPress(item)}
        mode="elevated"
      >
        <Card.Content style={styles.resultContent}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Icon
              name={category?.icon || 'cube-outline' as any}
              size={24}
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.resultInfo}>
            <Text variant="titleMedium" numberOfLines={1}>
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
            <View style={styles.pathContainer}>
              <Icon
                name="folder-outline"
                size={14}
                color={theme.colors.onSurfaceVariant}
              />
              <Text
                variant="bodySmall"
                style={[styles.pathText, { color: theme.colors.onSurfaceVariant }]}
                numberOfLines={1}
              >
                {item.path}
              </Text>
            </View>
          </View>
          <Icon
            name="chevron-right"
            size={24}
            color={theme.colors.onSurfaceVariant}
          />
        </Card.Content>
      </Card>
    );
  };

  const renderCategoryChip = (cat: typeof CATEGORIES[0]) => (
    <Chip
      key={cat.key}
      mode={selectedCategory === cat.key ? 'flat' : 'outlined'}
      selected={selectedCategory === cat.key}
      onPress={() => handleCategoryToggle(cat.key)}
      style={styles.categoryChip}
      icon={cat.icon}
      compact
    >
      {i18n.t(cat.labelKey)}
    </Chip>
  );

  const showEmptyState = !isLoading && searchResults.length === 0;
  const showInitialState = !searchQuery.trim() && !selectedCategory;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['bottom']}
    >
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={i18n.t('search.placeholder')}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchbar, { backgroundColor: theme.colors.surfaceVariant }]}
          inputStyle={styles.searchInput}
        />
      </View>

      {/* Filtres par catégorie */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => renderCategoryChip(item)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* Compteur de résultats */}
      {!showInitialState && !showEmptyState && (
        <View style={styles.resultCount}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {i18n.t('search.resultCount', { count: searchResults.length })}
          </Text>
        </View>
      )}

      {/* Liste des résultats */}
      {showInitialState ? (
        <View style={styles.emptyState}>
          <Icon name={"magnify" as any} size={80} color={theme.colors.onSurfaceVariant} />
          <Text
            variant="bodyLarge"
            style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
          >
            {i18n.t('search.startTyping')}
          </Text>
        </View>
      ) : showEmptyState ? (
        <View style={styles.emptyState}>
          <Icon name={"magnify-close" as any} size={80} color={theme.colors.onSurfaceVariant} />
          <Text
            variant="bodyLarge"
            style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
          >
            {i18n.t('common.noResults')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchbar: {
    elevation: 0,
    borderRadius: borderRadius.lg,
  },
  searchInput: {
    minHeight: 0,
  },
  filtersContainer: {
    paddingBottom: spacing.sm,
  },
  filtersList: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  categoryChip: {
    marginRight: spacing.xs,
  },
  resultCount: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  resultsList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  resultCard: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  pathContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  pathText: {
    marginLeft: 4,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

export default SearchScreen;
