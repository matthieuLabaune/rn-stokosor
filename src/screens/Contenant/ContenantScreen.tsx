import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View, FlatList, RefreshControl, Alert } from 'react-native';
import { FAB, useTheme, Text, Divider, Snackbar, Menu } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useLieuStore } from '../../store/lieuStore';
import { useZoneStore } from '../../store/zoneStore';
import { useContenantStore } from '../../store/contenantStore';
import { useItemStore } from '../../store/itemStore';
import { Contenant, Item, RootStackParamList } from '../../types';
import EmptyState from '../../components/EmptyState';
import Breadcrumb from '../../components/Breadcrumb';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import ContenantCard from '../../components/ContenantCard';
import ItemCard from '../../components/ItemCard';
import AddContenantModal from '../Zone/AddContenantModal';
import AddItemModal from '../Item/AddItemModal';
import i18n from '../../i18n';
import { spacing } from '../../theme';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Contenant'>;
type ContenantRouteProp = RouteProp<RootStackParamList, 'Contenant'>;

const ContenantScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ContenantRouteProp>();
  const { contenantId } = route.params;

  const { getLieuById } = useLieuStore();
  const { getZoneById } = useZoneStore();
  const {
    getContenantById,
    getContenantPath,
    getChildContenants,
    fetchContenantsByZone,
    deleteContenant,
    isLoading,
  } = useContenantStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [contenantToEdit, setContenantToEdit] = useState<Contenant | undefined>();
  const [itemToEdit, setItemToEdit] = useState<Item | undefined>();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [fabMenuOpen, setFabMenuOpen] = useState(false);

  const {
    fetchItemsByContenant,
    getItemsByContenant,
    deleteItem,
    isLoading: isLoadingItems,
  } = useItemStore();

  const contenant = getContenantById(contenantId);
  const zone = contenant ? getZoneById(contenant.zone_id) : undefined;
  const lieu = zone ? getLieuById(zone.lieu_id) : undefined;
  const childContenants = getChildContenants(contenantId);
  const contenantPath = getContenantPath(contenantId);
  const items = getItemsByContenant(contenantId);

  useEffect(() => {
    if (contenant) {
      navigation.setOptions({ title: contenant.name });
      fetchContenantsByZone(contenant.zone_id);
      fetchItemsByContenant(contenantId);
    }
  }, [contenant?.id, navigation, contenantId]);

  const onRefresh = useCallback(() => {
    if (contenant) {
      fetchContenantsByZone(contenant.zone_id);
      fetchItemsByContenant(contenantId);
    }
  }, [contenant?.zone_id, contenantId]);

  const handleAddSubContenant = () => {
    setContenantToEdit(undefined);
    setModalVisible(true);
  };

  const handleEditContenant = (c: Contenant) => {
    setContenantToEdit(c);
    setModalVisible(true);
  };

  const handleDeleteContenant = (c: Contenant) => {
    Alert.alert(
      i18n.t('common.confirm'),
      i18n.t('contenant.deleteConfirm'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteContenant(c.id);
              setSnackbarMessage(i18n.t('common.success'));
              setSnackbarVisible(true);
            } catch (error) {
              setSnackbarMessage(i18n.t('errors.generic'));
              setSnackbarVisible(true);
            }
          },
        },
      ]
    );
  };

  const handlePressContenant = (c: Contenant) => {
    navigation.push('Contenant', { contenantId: c.id });
  };

  // Fonctions pour les items
  const handleAddItem = () => {
    setItemToEdit(undefined);
    setItemModalVisible(true);
    setFabMenuOpen(false);
  };

  const handleEditItem = (item: Item) => {
    setItemToEdit(item);
    setItemModalVisible(true);
  };

  const handleDeleteItem = (item: Item) => {
    Alert.alert(
      i18n.t('common.confirm'),
      i18n.t('item.deleteConfirm'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(item.id);
              setSnackbarMessage(i18n.t('common.success'));
              setSnackbarVisible(true);
            } catch (error) {
              setSnackbarMessage(i18n.t('errors.generic'));
              setSnackbarVisible(true);
            }
          },
        },
      ]
    );
  };

  const handlePressItem = (item: Item) => {
    navigation.navigate('Item', { itemId: item.id });
  };

  // Construire le breadcrumb avec le chemin complet des contenants
  const breadcrumbItems = [
    {
      label: i18n.t('tabs.home'),
      onPress: () => navigation.navigate('MainTabs'),
    },
    {
      label: lieu?.name || '',
      onPress: () => zone && navigation.navigate('Lieu', { lieuId: zone.lieu_id }),
    },
    {
      label: zone?.name || '',
      onPress: () => zone && navigation.navigate('Zone', { zoneId: zone.id }),
    },
    // Ajouter tous les contenants parents
    ...contenantPath.slice(0, -1).map((c) => ({
      label: c.name,
      onPress: () => navigation.push('Contenant', { contenantId: c.id }),
    })),
    // Contenant actuel (pas cliquable)
    {
      label: contenant?.name || '',
    },
  ];

  const renderChildContenant = ({ item }: { item: Contenant }) => (
    <ContenantCard
      contenant={item}
      itemCount={0} // TODO: Compter les items (Phase 4)
      childCount={getChildContenants(item.id).length}
      onPress={() => handlePressContenant(item)}
      onEdit={() => handleEditContenant(item)}
      onDelete={() => handleDeleteContenant(item)}
    />
  );

  if (!contenant) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={['bottom']}
      >
        <EmptyState
          icon="alert-circle"
          title={i18n.t('errors.generic')}
          description=""
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['bottom']}
    >
      <Breadcrumb items={breadcrumbItems} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* QR Code */}
        <QRCodeDisplay
          value={contenant.qr_code}
          label={contenant.name}
          size={160}
        />

        {/* Sous-contenants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium">{i18n.t('contenant.subContenants')}</Text>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {childContenants.length}
            </Text>
          </View>

          {childContenants.length === 0 ? (
            <View style={styles.emptySection}>
              <EmptyState
                icon="package-variant-closed"
                title={i18n.t('contenant.emptySubContenants')}
                description=""
                actionLabel={i18n.t('contenant.addSubContenant')}
                onAction={handleAddSubContenant}
              />
            </View>
          ) : (
            <View>
              {childContenants.map((child) => (
                <ContenantCard
                  key={child.id}
                  contenant={child}
                  itemCount={0}
                  childCount={getChildContenants(child.id).length}
                  onPress={() => handlePressContenant(child)}
                  onEdit={() => handleEditContenant(child)}
                  onDelete={() => handleDeleteContenant(child)}
                />
              ))}
            </View>
          )}
        </View>

        <Divider style={styles.divider} />

        {/* Liste des items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium">{i18n.t('contenant.items')}</Text>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {items.length}
            </Text>
          </View>
          {items.length === 0 ? (
            <View style={styles.emptySection}>
              <EmptyState
                icon="cube-outline"
                title={i18n.t('contenant.emptyItems')}
                description=""
                actionLabel={i18n.t('contenant.addItem')}
                onAction={handleAddItem}
              />
            </View>
          ) : (
            <View>
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onPress={() => handlePressItem(item)}
                  onEdit={() => handleEditItem(item)}
                  onDelete={() => handleDeleteItem(item)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <FAB.Group
        open={fabMenuOpen}
        visible
        icon={fabMenuOpen ? 'close' : 'plus'}
        actions={[
          {
            icon: 'package-variant-closed',
            label: i18n.t('contenant.addSubContenant'),
            onPress: () => {
              setFabMenuOpen(false);
              handleAddSubContenant();
            },
          },
          {
            icon: 'cube-outline',
            label: i18n.t('contenant.addItem'),
            onPress: handleAddItem,
          },
        ]}
        onStateChange={({ open }) => setFabMenuOpen(open)}
        fabStyle={{ backgroundColor: theme.colors.primary }}
        color={theme.colors.onPrimary}
      />

      <AddContenantModal
        visible={modalVisible}
        onDismiss={() => {
          setModalVisible(false);
          setContenantToEdit(undefined);
        }}
        zoneId={contenant.zone_id}
        parentContenantId={contenantToEdit ? undefined : contenantId}
        contenantToEdit={contenantToEdit}
      />

      <AddItemModal
        visible={itemModalVisible}
        onDismiss={() => {
          setItemModalVisible(false);
          setItemToEdit(undefined);
        }}
        contenantId={contenantId}
        itemToEdit={itemToEdit}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  emptySection: {
    minHeight: 200,
  },
  divider: {
    marginVertical: spacing.md,
    marginHorizontal: spacing.md,
  },
});

export default ContenantScreen;
