import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Image, Alert, Pressable, Dimensions } from 'react-native';
import {
  Text,
  useTheme,
  Chip,
  Divider,
  FAB,
  Snackbar,
  Portal,
  Modal,
  IconButton,
  MD3Theme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

import { useLieuStore } from '../../store/lieuStore';
import { useZoneStore } from '../../store/zoneStore';
import { useContenantStore } from '../../store/contenantStore';
import { useItemStore } from '../../store/itemStore';
import { RootStackParamList, Item } from '../../types';
import { getCategoryByKey } from '../../constants/categories';
import Breadcrumb from '../../components/Breadcrumb';
import EmptyState from '../../components/EmptyState';
import AddItemModal from './AddItemModal';
import i18n from '../../i18n';
import { spacing, borderRadius } from '../../theme';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Item'>;
type ItemRouteProp = RouteProp<RootStackParamList, 'Item'>;

const { width: screenWidth } = Dimensions.get('window');

const ItemScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ItemRouteProp>();
  const { itemId } = route.params;

  const { getLieuById } = useLieuStore();
  const { getZoneById } = useZoneStore();
  const { getContenantById, getContenantPath } = useContenantStore();
  const { getItemById, deleteItem, fetchItemsByContenant } = useItemStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const item = getItemById(itemId);
  const contenant = item ? getContenantById(item.contenant_id) : undefined;
  const zone = contenant ? getZoneById(contenant.zone_id) : undefined;
  const lieu = zone ? getLieuById(zone.lieu_id) : undefined;
  const contenantPath = contenant ? getContenantPath(contenant.id) : [];
  const category = item ? getCategoryByKey(item.category) : undefined;

  useEffect(() => {
    if (item) {
      navigation.setOptions({ title: item.name });
    }
  }, [item, navigation]);

  const handleDelete = () => {
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
              await deleteItem(itemId);
              navigation.goBack();
            } catch (error) {
              setSnackbarMessage(i18n.t('errors.generic'));
              setSnackbarVisible(true);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return null;
    return `${price.toFixed(2)} €`;
  };

  const getExpirationStatus = () => {
    if (!item?.expiration_date) return null;
    const expDate = new Date(item.expiration_date);
    const today = new Date();
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: i18n.t('item.expired'), color: theme.colors.error };
    } else if (diffDays <= 7) {
      return { label: i18n.t('item.expiresSoon'), color: theme.colors.tertiary };
    }
    return null;
  };

  const getWarrantyStatus = () => {
    if (!item?.warranty_date) return null;
    const warDate = new Date(item.warranty_date);
    const today = new Date();
    const diffDays = Math.ceil((warDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: i18n.t('item.warrantyExpired'), color: theme.colors.error };
    } else if (diffDays <= 30) {
      return { label: i18n.t('item.underWarranty'), color: theme.colors.primary };
    }
    return null;
  };

  const expirationStatus = getExpirationStatus();

  // Breadcrumb complet
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
    ...contenantPath.map((c) => ({
      label: c.name,
      onPress: () => navigation.push('Contenant', { contenantId: c.id }),
    })),
    {
      label: item?.name || '',
    },
  ];

  if (!item) {
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Galerie photos */}
        {item.photos && item.photos.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.photoGallery}
          >
            {item.photos.map((photo, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  setSelectedPhotoIndex(index);
                  setPhotoModalVisible(true);
                }}
              >
                <Image
                  source={{ uri: photo }}
                  style={styles.galleryPhoto}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.noPhoto, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Icon
              name={category?.icon || 'cube-outline' as any}
              size={64}
              color={theme.colors.primary}
            />
          </View>
        )}

        {/* Indicateur photos */}
        {item.photos && item.photos.length > 1 && (
          <View style={styles.photoIndicators}>
            {item.photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  { backgroundColor: theme.colors.primary },
                  index === selectedPhotoIndex && styles.indicatorActive,
                ]}
              />
            ))}
          </View>
        )}

        {/* Informations principales */}
        <View style={styles.infoSection}>
          <Text variant="headlineSmall">{item.name}</Text>

          <View style={styles.categoryRow}>
            <Chip
              mode="flat"
              icon={category?.icon}
              style={{ backgroundColor: theme.colors.surfaceVariant }}
            >
              {i18n.t(category?.labelKey || 'categories.other')}
            </Chip>

            {expirationStatus && (
              <Chip
                mode="flat"
                icon="clock-alert-outline"
                textStyle={{ color: expirationStatus.color }}
                style={{ marginLeft: spacing.sm }}
              >
                {expirationStatus.label}
              </Chip>
            )}
          </View>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {item.tags.map((tag, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  compact
                  style={styles.tag}
                >
                  {tag}
                </Chip>
              ))}
            </View>
          )}
        </View>

        <Divider />

        {/* Détails */}
        <View style={styles.detailsSection}>
          {item.barcode && (
            <DetailRow
              icon="barcode"
              label={i18n.t('item.barcode')}
              value={item.barcode}
              theme={theme}
            />
          )}

          {item.brand && (
            <DetailRow
              icon="factory"
              label={i18n.t('item.brand')}
              value={item.brand}
              theme={theme}
            />
          )}

          {item.model && (
            <DetailRow
              icon="tag-text"
              label={i18n.t('item.model')}
              value={item.model}
              theme={theme}
            />
          )}

          {item.serial_number && (
            <DetailRow
              icon="identifier"
              label={i18n.t('item.serialNumber')}
              value={item.serial_number}
              theme={theme}
            />
          )}

          {item.purchase_price !== undefined && (
            <DetailRow
              icon="tag"
              label={i18n.t('item.purchasePrice')}
              value={formatPrice(item.purchase_price)}
              theme={theme}
            />
          )}

          {item.estimated_value !== undefined && (
            <DetailRow
              icon="currency-eur"
              label={i18n.t('item.estimatedValue')}
              value={formatPrice(item.estimated_value)}
              theme={theme}
              highlight
            />
          )}

          {item.purchase_date && (
            <DetailRow
              icon="calendar"
              label={i18n.t('item.purchaseDate')}
              value={formatDate(item.purchase_date)}
              theme={theme}
            />
          )}

          {item.expiration_date && (
            <DetailRow
              icon="calendar-clock"
              label={i18n.t('item.expirationDate')}
              value={formatDate(item.expiration_date)}
              theme={theme}
              highlight={!!expirationStatus}
              highlightColor={expirationStatus?.color}
            />
          )}

          {item.warranty_date && (
            <DetailRow
              icon="shield-check"
              label={i18n.t('item.warrantyDate')}
              value={formatDate(item.warranty_date)}
              theme={theme}
              highlight={getWarrantyStatus() !== null}
              highlightColor={getWarrantyStatus()?.color}
            />
          )}
        </View>

        {/* Notes */}
        {item.notes && (
          <>
            <Divider />
            <View style={styles.notesSection}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {i18n.t('item.notes')}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {item.notes}
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* FAB Menu */}
      <View style={styles.fabContainer}>
        <FAB
          icon="pencil"
          style={[styles.fabSecondary, { backgroundColor: theme.colors.secondaryContainer }]}
          onPress={() => setModalVisible(true)}
          color={theme.colors.onSecondaryContainer}
          size="small"
        />
        <FAB
          icon="delete"
          style={[styles.fabSecondary, { backgroundColor: theme.colors.errorContainer }]}
          onPress={handleDelete}
          color={theme.colors.onErrorContainer}
          size="small"
        />
      </View>

      {/* Modal édition */}
      <AddItemModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contenantId={item.contenant_id}
        itemToEdit={item}
      />

      {/* Modal photo en grand */}
      <Portal>
        <Modal
          visible={photoModalVisible}
          onDismiss={() => setPhotoModalVisible(false)}
          contentContainerStyle={styles.photoModal}
        >
          {item.photos && (
            <>
              <Image
                source={{ uri: item.photos[selectedPhotoIndex] }}
                style={styles.fullPhoto}
                resizeMode="contain"
              />
              <View style={styles.photoModalNav}>
                <IconButton
                  icon="chevron-left"
                  size={32}
                  iconColor="white"
                  onPress={() =>
                    setSelectedPhotoIndex((prev) =>
                      prev > 0 ? prev - 1 : item.photos!.length - 1
                    )
                  }
                />
                <Text style={{ color: 'white' }}>
                  {selectedPhotoIndex + 1} / {item.photos.length}
                </Text>
                <IconButton
                  icon="chevron-right"
                  size={32}
                  iconColor="white"
                  onPress={() =>
                    setSelectedPhotoIndex((prev) =>
                      prev < item.photos!.length - 1 ? prev + 1 : 0
                    )
                  }
                />
              </View>
              <IconButton
                icon="close"
                size={24}
                iconColor="white"
                style={styles.closeButton}
                onPress={() => setPhotoModalVisible(false)}
              />
            </>
          )}
        </Modal>
      </Portal>

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

// Composant pour une ligne de détail
interface DetailRowProps {
  icon: string;
  label: string;
  value: string | null;
  theme: MD3Theme;
  highlight?: boolean;
  highlightColor?: string;
}

const DetailRow: React.FC<DetailRowProps> = ({
  icon,
  label,
  value,
  theme,
  highlight,
  highlightColor,
}) => {
  if (!value) return null;

  return (
    <View style={styles.detailRow}>
      <Icon
        name={icon as any}
        size={20}
        color={highlight ? highlightColor || theme.colors.primary : theme.colors.onSurfaceVariant}
      />
      <View style={styles.detailContent}>
        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {label}
        </Text>
        <Text
          variant="bodyLarge"
          style={highlight ? { color: highlightColor || theme.colors.primary } : undefined}
        >
          {value}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  photoGallery: {
    height: 250,
  },
  galleryPhoto: {
    width: screenWidth,
    height: 250,
  },
  noPhoto: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    opacity: 0.4,
  },
  indicatorActive: {
    opacity: 1,
  },
  infoSection: {
    padding: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  tag: {
    height: 28,
  },
  detailsSection: {
    padding: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  detailContent: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  notesSection: {
    padding: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  fabContainer: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  fabSecondary: {
    elevation: 2,
  },
  photoModal: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullPhoto: {
    width: '100%',
    height: '80%',
  },
  photoModalNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 10,
  },
});

export default ItemScreen;
