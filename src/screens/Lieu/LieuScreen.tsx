import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { FAB, useTheme, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useLieuStore } from '../../store/lieuStore';
import { useZoneStore } from '../../store/zoneStore';
import { useContenantStore } from '../../store/contenantStore';
import { Zone, RootStackParamList } from '../../types';
import ZoneCard from '../../components/ZoneCard';
import EmptyState from '../../components/EmptyState';
import Breadcrumb from '../../components/Breadcrumb';
import AddZoneModal from './AddZoneModal';
import i18n from '../../i18n';
import { spacing } from '../../theme';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Lieu'>;
type LieuRouteProp = RouteProp<RootStackParamList, 'Lieu'>;

const LieuScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<LieuRouteProp>();
  const { lieuId } = route.params;

  const { getLieuById } = useLieuStore();
  const { zones, isLoading, fetchZonesByLieu, deleteZone, getZonesByLieu } = useZoneStore();
  const { contenants, fetchAllContenants, getContenantsByZone } = useContenantStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [zoneToEdit, setZoneToEdit] = useState<Zone | undefined>();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const lieu = getLieuById(lieuId);
  const lieuZones = getZonesByLieu(lieuId);

  useEffect(() => {
    fetchZonesByLieu(lieuId);
    fetchAllContenants();
  }, [lieuId]);

  useEffect(() => {
    if (lieu) {
      navigation.setOptions({ title: lieu.name });
    }
  }, [lieu, navigation]);

  const onRefresh = useCallback(() => {
    fetchZonesByLieu(lieuId);
    fetchAllContenants();
  }, [lieuId]);

  const handleAddZone = () => {
    setZoneToEdit(undefined);
    setModalVisible(true);
  };

  const handleEditZone = (zone: Zone) => {
    setZoneToEdit(zone);
    setModalVisible(true);
  };

  const handleDeleteZone = (zone: Zone) => {
    Alert.alert(
      i18n.t('common.confirm'),
      i18n.t('zone.deleteConfirm'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteZone(zone.id);
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

  const handlePressZone = (zone: Zone) => {
    navigation.navigate('Zone', { zoneId: zone.id });
  };

  const breadcrumbItems = [
    {
      label: i18n.t('tabs.home'),
      onPress: () => navigation.navigate('MainTabs'),
    },
    {
      label: lieu?.name || '',
    },
  ];

  const renderItem = ({ item }: { item: Zone }) => (
    <ZoneCard
      zone={item}
      contenantCount={getContenantsByZone(item.id).length}
      onPress={() => handlePressZone(item)}
      onEdit={() => handleEditZone(item)}
      onDelete={() => handleDeleteZone(item)}
    />
  );

  if (!lieu) {
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

      {lieuZones.length === 0 ? (
        <EmptyState
          icon="door"
          title={i18n.t('lieu.emptyZones')}
          description=""
          actionLabel={i18n.t('lieu.addZone')}
          onAction={handleAddZone}
        />
      ) : (
        <FlatList
          data={lieuZones}
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
        onPress={handleAddZone}
        color={theme.colors.onPrimary}
      />

      <AddZoneModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        lieuId={lieuId}
        zoneToEdit={zoneToEdit}
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

export default LieuScreen;
