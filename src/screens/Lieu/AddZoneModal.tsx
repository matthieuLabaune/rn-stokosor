import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import {
  Modal,
  Portal,
  TextInput,
  Button,
  Text,
  useTheme,
  IconButton,
  Chip,
} from 'react-native-paper';
import { Zone } from '../../types';
import { useZoneStore } from '../../store/zoneStore';
import i18n from '../../i18n';
import { spacing, borderRadius } from '../../theme';

// Icônes de zones courantes
const ZONE_ICONS = [
  { name: 'door', label: 'Porte' },
  { name: 'bed', label: 'Chambre' },
  { name: 'sofa', label: 'Salon' },
  { name: 'silverware-fork-knife', label: 'Cuisine' },
  { name: 'shower', label: 'Salle de bain' },
  { name: 'toilet', label: 'WC' },
  { name: 'garage', label: 'Garage' },
  { name: 'tree', label: 'Jardin' },
  { name: 'desk', label: 'Bureau' },
  { name: 'hanger', label: 'Dressing' },
  { name: 'stairs', label: 'Escalier' },
  { name: 'home-floor-0', label: 'Cave' },
];

interface AddZoneModalProps {
  visible: boolean;
  onDismiss: () => void;
  lieuId: string;
  zoneToEdit?: Zone;
}

const AddZoneModal: React.FC<AddZoneModalProps> = ({
  visible,
  onDismiss,
  lieuId,
  zoneToEdit,
}) => {
  const theme = useTheme();
  const { addZone, updateZone } = useZoneStore();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('door');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!zoneToEdit;

  useEffect(() => {
    if (zoneToEdit) {
      setName(zoneToEdit.name);
      setIcon(zoneToEdit.icon || 'door');
    } else {
      setName('');
      setIcon('door');
    }
    setError('');
  }, [zoneToEdit, visible]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError(i18n.t('common.required'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (isEditing && zoneToEdit) {
        await updateZone(zoneToEdit.id, {
          name: name.trim(),
          icon,
        });
      } else {
        await addZone(lieuId, name.trim(), icon);
      }
      onDismiss();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modal,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Handle indicator */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: theme.colors.outlineVariant }]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.title}>
              {isEditing ? i18n.t('common.edit') : i18n.t('lieu.addZone')}
            </Text>
            <IconButton
              icon="close"
              onPress={onDismiss}
              style={styles.closeButton}
              size={24}
            />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <TextInput
              label={i18n.t('zone.name')}
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              error={!!error && !name.trim()}
              autoFocus
            />

            <Text variant="bodyMedium" style={styles.iconLabel}>
              {i18n.t('zone.icon')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.iconScroll}
              contentContainerStyle={styles.iconContainer}
            >
              {ZONE_ICONS.map((item) => (
                <Chip
                  key={item.name}
                  icon={item.name}
                  selected={icon === item.name}
                  onPress={() => setIcon(item.name)}
                  style={styles.iconChip}
                  showSelectedCheck={false}
                  mode={icon === item.name ? 'flat' : 'outlined'}
                >
                  {item.label}
                </Chip>
              ))}
            </ScrollView>

            {error ? (
              <Text style={[styles.error, { color: theme.colors.error }]}>
                {error}
              </Text>
            ) : null}
          </View>

          {/* Actions */}
          <View style={styles.buttons}>
            <Button mode="outlined" onPress={onDismiss} style={styles.button}>
              {i18n.t('common.cancel')}
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
            >
              {i18n.t('common.save')}
            </Button>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
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
  title: {
    fontWeight: '600',
  },
  closeButton: {
    margin: 0,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
  },
  iconLabel: {
    marginBottom: spacing.sm,
  },
  iconScroll: {
    marginBottom: spacing.md,
  },
  iconContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconChip: {
    marginRight: spacing.xs,
  },
  error: {
    marginBottom: spacing.md,
    fontSize: 12,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  button: {
    minWidth: 100,
  },
});

export default AddZoneModal;
