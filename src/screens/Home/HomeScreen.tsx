import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { FAB, useTheme, Snackbar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, { FadeInDown, FadeIn, Layout } from 'react-native-reanimated';

import { useLieuStore } from '../../store/lieuStore';
import { useZoneStore } from '../../store/zoneStore';
import { Lieu, RootStackParamList } from '../../types';
import LieuCard from '../../components/LieuCard';
import EmptyState from '../../components/EmptyState';
import { SkeletonList } from '../../components/SkeletonLoader';
import AddLieuModal from './AddLieuModal';
import i18n from '../../i18n';
import { spacing } from '../../theme';
import { successHaptic, errorHaptic } from '../../utils/haptics';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const { lieux, isLoading, fetchLieux, deleteLieu } = useLieuStore();
  const { zones, fetchAllZones } = useZoneStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [lieuToEdit, setLieuToEdit] = useState<Lieu | undefined>();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchLieux(), fetchAllZones()]);
      setIsFirstLoad(false);
    };
    loadData();
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([fetchLieux(), fetchAllZones()]);
    setIsRefreshing(false);
  }, []);

  const getZoneCount = (lieuId: string): number => {
    return zones.filter((z) => z.lieu_id === lieuId).length;
  };

  const handleAddLieu = () => {
    setLieuToEdit(undefined);
    setModalVisible(true);
  };

  const handleEditLieu = (lieu: Lieu) => {
    setLieuToEdit(lieu);
    setModalVisible(true);
  };

  const handleDeleteLieu = (lieu: Lieu) => {
    Alert.alert(
      i18n.t('common.confirm'),
      i18n.t('lieu.deleteConfirm'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLieu(lieu.id);
              successHaptic();
              setSnackbarMessage(i18n.t('common.success'));
              setSnackbarVisible(true);
            } catch (error) {
              errorHaptic();
              setSnackbarMessage(i18n.t('errors.generic'));
              setSnackbarVisible(true);
            }
          },
        },
      ]
    );
  };

  const handlePressLieu = (lieu: Lieu) => {
    navigation.navigate('Lieu', { lieuId: lieu.id });
  };

  const renderItem = ({ item, index }: { item: Lieu; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(300).springify()}
      layout={Layout.springify()}
    >
      <LieuCard
        lieu={item}
        zoneCount={getZoneCount(item.id)}
        onPress={() => handlePressLieu(item)}
        onEdit={() => handleEditLieu(item)}
        onDelete={() => handleDeleteLieu(item)}
      />
    </Animated.View>
  );

  // Afficher le skeleton lors du premier chargement
  if (isFirstLoad && isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={['bottom']}
      >
        <SkeletonList count={4} type="lieu" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['bottom']}
    >
      {lieux.length === 0 ? (
        <EmptyState
          icon="home-city"
          title={i18n.t('home.emptyTitle')}
          description={i18n.t('home.emptyDescription')}
          actionLabel={i18n.t('home.addLieu')}
          onAction={handleAddLieu}
        />
      ) : (
        <FlatList
          data={lieux}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
              progressBackgroundColor={theme.colors.surface}
            />
          }
        />
      )}

      <Animated.View
        entering={FadeIn.delay(300).duration(400)}
        style={styles.fabContainer}
      >
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddLieu}
          color={theme.colors.onPrimary}
        />
      </Animated.View>

      <AddLieuModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        lieuToEdit={lieuToEdit}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={{ backgroundColor: theme.colors.inverseSurface }}
      >
        <Text style={{ color: theme.colors.inverseOnSurface }}>{snackbarMessage}</Text>
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
    paddingBottom: spacing.xl * 2,
  },
  fabContainer: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
  },
  fab: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default HomeScreen;
