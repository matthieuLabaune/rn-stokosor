import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { FAB, useTheme, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useLieuStore } from '../../store/lieuStore';
import { useZoneStore } from '../../store/zoneStore';
import { useContenantStore } from '../../store/contenantStore';
import { Contenant, RootStackParamList } from '../../types';
import ContenantCard from '../../components/ContenantCard';
import EmptyState from '../../components/EmptyState';
import Breadcrumb from '../../components/Breadcrumb';
import AddContenantModal from './AddContenantModal';
import i18n from '../../i18n';
import { spacing } from '../../theme';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Zone'>;
type ZoneRouteProp = RouteProp<RootStackParamList, 'Zone'>;

const ZoneScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ZoneRouteProp>();
  const { zoneId } = route.params;

  const { getLieuById } = useLieuStore();
  const { getZoneById } = useZoneStore();
  const {
    isLoading,
    fetchContenantsByZone,
    deleteContenant,
    getRootContenantsByZone,
    getChildContenants,
  } = useContenantStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [contenantToEdit, setContenantToEdit] = useState<Contenant | undefined>();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const zone = getZoneById(zoneId);
  const lieu = zone ? getLieuById(zone.lieu_id) : undefined;
  // Seulement les contenants racine (pas de parent)
  const zoneContenants = getRootContenantsByZone(zoneId);

  useEffect(() => {
    fetchContenantsByZone(zoneId);
  }, [zoneId]);

  useEffect(() => {
    if (zone) {
      navigation.setOptions({ title: zone.name });
    }
  }, [zone, navigation]);

  const onRefresh = useCallback(() => {
    fetchContenantsByZone(zoneId);
  }, [zoneId]);

  const handleAddContenant = () => {
    setContenantToEdit(undefined);
    setModalVisible(true);
  };

  const handleEditContenant = (contenant: Contenant) => {
    setContenantToEdit(contenant);
    setModalVisible(true);
  };

  const handleDeleteContenant = (contenant: Contenant) => {
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
              await deleteContenant(contenant.id);
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

  const handlePressContenant = (contenant: Contenant) => {
    navigation.navigate('Contenant', { contenantId: contenant.id });
  };

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
    },
  ];

  const renderItem = ({ item }: { item: Contenant }) => (
    <ContenantCard
      contenant={item}
      itemCount={0} // TODO: Compter les items (Phase 4)
      childCount={getChildContenants(item.id).length}
      onPress={() => handlePressContenant(item)}
      onEdit={() => handleEditContenant(item)}
      onDelete={() => handleDeleteContenant(item)}
    />
  );

  if (!zone) {
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

      {zoneContenants.length === 0 ? (
        <EmptyState
          icon="package-variant"
          title={i18n.t('zone.emptyContenants')}
          description=""
          actionLabel={i18n.t('zone.addContenant')}
          onAction={handleAddContenant}
        />
      ) : (
        <FlatList
          data={zoneContenants}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddContenant}
        color={theme.colors.onPrimary}
      />

      <AddContenantModal
        visible={modalVisible}
        onDismiss={() => {
          setModalVisible(false);
          setContenantToEdit(undefined);
        }}
        zoneId={zoneId}
        contenantToEdit={contenantToEdit}
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
  list: {
    paddingVertical: spacing.sm,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
  },
});

export default ZoneScreen;
