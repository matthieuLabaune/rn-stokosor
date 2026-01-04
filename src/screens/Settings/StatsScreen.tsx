import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Card, Divider, List, MD3Theme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

import { useItemStore } from '../../store/itemStore';
import { useContenantStore } from '../../store/contenantStore';
import { useZoneStore } from '../../store/zoneStore';
import { useLieuStore } from '../../store/lieuStore';
import { Category } from '../../types';
import { CATEGORIES, getCategoryByKey } from '../../constants/categories';
import i18n from '../../i18n';
import { spacing, borderRadius } from '../../theme';

interface CategoryStat {
  key: Category;
  count: number;
  value: number;
  icon: string;
  label: string;
}

interface ExpirationItem {
  id: string;
  name: string;
  expirationDate: string;
  daysUntil: number;
}

const StatsScreen: React.FC = () => {
  const theme = useTheme();

  const { items, fetchAllItems } = useItemStore();
  const { contenants } = useContenantStore();
  const { zones } = useZoneStore();
  const { lieux } = useLieuStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchAllItems();
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Statistiques générales
  const stats = useMemo(() => {
    const totalValue = items.reduce((sum, item) => sum + (item.estimated_value || 0), 0);
    const itemsWithValue = items.filter((item) => item.estimated_value).length;

    return {
      totalLieux: lieux.length,
      totalZones: zones.length,
      totalContenants: contenants.length,
      totalItems: items.length,
      totalValue,
      itemsWithValue,
    };
  }, [items, contenants, zones, lieux]);

  // Stats par catégorie
  const categoryStats = useMemo(() => {
    const statsByCategory: Record<Category, { count: number; value: number }> = {} as any;

    // Initialiser toutes les catégories
    CATEGORIES.forEach((cat) => {
      statsByCategory[cat.key] = { count: 0, value: 0 };
    });

    // Compter les items par catégorie
    items.forEach((item) => {
      if (statsByCategory[item.category]) {
        statsByCategory[item.category].count++;
        statsByCategory[item.category].value += item.estimated_value || 0;
      }
    });

    // Convertir en tableau et trier par count
    return CATEGORIES
      .map((cat) => ({
        key: cat.key,
        count: statsByCategory[cat.key].count,
        value: statsByCategory[cat.key].value,
        icon: cat.icon,
        label: i18n.t(cat.labelKey),
      }))
      .filter((stat) => stat.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [items]);

  // Items qui expirent bientôt (30 jours)
  const expiringItems = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    return items
      .filter((item) => {
        if (!item.expiration_date) return false;
        const expDate = new Date(item.expiration_date);
        return expDate <= thirtyDaysFromNow;
      })
      .map((item) => {
        const expDate = new Date(item.expiration_date!);
        const daysUntil = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: item.id,
          name: item.name,
          expirationDate: item.expiration_date!,
          daysUntil,
        };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [items]);

  const formatPrice = (value: number) => {
    return `${value.toFixed(2)} €`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['bottom']}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Statistiques générales */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="home"
            value={stats.totalLieux}
            label={i18n.t('stats.totalLieux')}
            theme={theme}
          />
          <StatCard
            icon="layers"
            value={stats.totalZones}
            label={i18n.t('stats.totalZones')}
            theme={theme}
          />
          <StatCard
            icon="package-variant"
            value={stats.totalContenants}
            label={i18n.t('stats.totalContenants')}
            theme={theme}
          />
          <StatCard
            icon="cube-outline"
            value={stats.totalItems}
            label={i18n.t('stats.totalItems')}
            theme={theme}
          />
        </View>

        {/* Valeur totale */}
        <Card style={styles.valueCard} mode="elevated">
          <Card.Content style={styles.valueContent}>
            <Icon name={"currency-eur" as any} size={32} color={theme.colors.primary} />
            <View style={styles.valueInfo}>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                {formatPrice(stats.totalValue)}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {i18n.t('stats.totalValue')} ({stats.itemsWithValue} {i18n.t('stats.totalItems').toLowerCase()})
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Divider style={styles.divider} />

        {/* Par catégorie */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {i18n.t('stats.byCategory')}
        </Text>

        {categoryStats.length === 0 ? (
          <Text
            variant="bodyMedium"
            style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
          >
            {i18n.t('common.noResults')}
          </Text>
        ) : (
          categoryStats.map((stat) => (
            <Card key={stat.key} style={styles.categoryCard} mode="outlined">
              <Card.Content style={styles.categoryContent}>
                <View style={[styles.categoryIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Icon name={stat.icon as any} size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.categoryInfo}>
                  <Text variant="titleSmall">{stat.label}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {stat.count} objet{stat.count !== 1 ? 's' : ''}
                  </Text>
                </View>
                {stat.value > 0 && (
                  <Text variant="titleSmall" style={{ color: theme.colors.primary }}>
                    {formatPrice(stat.value)}
                  </Text>
                )}
              </Card.Content>
            </Card>
          ))
        )}

        <Divider style={styles.divider} />

        {/* Péremption proche */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {i18n.t('stats.expirationSoon')}
        </Text>

        {expiringItems.length === 0 ? (
          <Text
            variant="bodyMedium"
            style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
          >
            {i18n.t('common.noResults')}
          </Text>
        ) : (
          expiringItems.slice(0, 10).map((item) => (
            <Card
              key={item.id}
              style={[
                styles.expirationCard,
                item.daysUntil < 0 && { borderLeftColor: theme.colors.error, borderLeftWidth: 4 },
                item.daysUntil >= 0 && item.daysUntil <= 7 && { borderLeftColor: theme.colors.tertiary, borderLeftWidth: 4 },
              ]}
              mode="outlined"
            >
              <Card.Content style={styles.expirationContent}>
                <View style={styles.expirationInfo}>
                  <Text variant="titleSmall">{item.name}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {formatDate(item.expirationDate)}
                  </Text>
                </View>
                <Text
                  variant="labelLarge"
                  style={{
                    color: item.daysUntil < 0
                      ? theme.colors.error
                      : item.daysUntil <= 7
                        ? theme.colors.tertiary
                        : theme.colors.onSurfaceVariant,
                  }}
                >
                  {item.daysUntil < 0
                    ? i18n.t('item.expired')
                    : item.daysUntil === 0
                      ? "Aujourd'hui"
                      : `${item.daysUntil}j`}
                </Text>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Composant StatCard
interface StatCardProps {
  icon: string;
  value: number;
  label: string;
  theme: MD3Theme;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, theme }) => (
  <Card style={styles.statCard} mode="elevated">
    <Card.Content style={styles.statContent}>
      <Icon name={icon as any} size={28} color={theme.colors.primary} />
      <Text variant="headlineSmall" style={styles.statValue}>
        {value}
      </Text>
      <Text
        variant="labelSmall"
        style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
      >
        {label}
      </Text>
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statCard: {
    width: '48%',
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statValue: {
    marginTop: spacing.xs,
  },
  statLabel: {
    textAlign: 'center',
  },
  valueCard: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  valueContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueInfo: {
    marginLeft: spacing.md,
  },
  divider: {
    marginVertical: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  categoryCard: {
    marginBottom: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  expirationCard: {
    marginBottom: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  expirationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expirationInfo: {
    flex: 1,
  },
});

export default StatsScreen;
