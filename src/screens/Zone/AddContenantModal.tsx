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
import { Contenant, ContenantType } from '../../types';
import { useContenantStore } from '../../store/contenantStore';
import { CONTENANT_TYPES } from '../../constants/contenantTypes';
import i18n from '../../i18n';
import { spacing, borderRadius } from '../../theme';

interface AddContenantModalProps {
  visible: boolean;
  onDismiss: () => void;
  zoneId: string;
  parentContenantId?: string;  // Si défini, on crée un sous-contenant
  contenantToEdit?: Contenant;
}

const AddContenantModal: React.FC<AddContenantModalProps> = ({
  visible,
  onDismiss,
  zoneId,
  parentContenantId,
  contenantToEdit,
}) => {
  const theme = useTheme();
  const { addContenant, updateContenant, getContenantById } = useContenantStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<ContenantType>('box');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!contenantToEdit;
  const parentContenant = parentContenantId ? getContenantById(parentContenantId) : undefined;

  useEffect(() => {
    if (contenantToEdit) {
      setName(contenantToEdit.name);
      setType(contenantToEdit.type);
    } else {
      setName('');
      // Suggérer un type par défaut selon le contexte
      if (parentContenantId) {
        // Sous-contenant : suggérer tiroir ou boîte
        setType('drawer');
      } else {
        // Contenant racine : suggérer meuble ou étagère
        setType('furniture');
      }
    }
    setError('');
  }, [contenantToEdit, parentContenantId, visible]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError(i18n.t('common.required'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (isEditing && contenantToEdit) {
        await updateContenant(contenantToEdit.id, {
          name: name.trim(),
          type,
        });
      } else {
        await addContenant(zoneId, name.trim(), type, parentContenantId);
      }
      onDismiss();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (isEditing) {
      return i18n.t('common.edit');
    }
    if (parentContenantId) {
      return i18n.t('contenant.addSubContenant');
    }
    return i18n.t('zone.addContenant');
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
            <Text variant="titleLarge" style={styles.title}>{getTitle()}</Text>
            <IconButton
              icon="close"
              onPress={onDismiss}
              style={styles.closeButton}
              size={24}
            />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {parentContenant && (
              <Text
                variant="bodySmall"
                style={[styles.parentInfo, { color: theme.colors.onSurfaceVariant }]}
              >
                Dans : {parentContenant.name}
              </Text>
            )}

            <TextInput
              label={i18n.t('contenant.name')}
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              error={!!error && !name.trim()}
              placeholder="Ex: Armoire, Tiroir 1, Boîte rangement..."
              autoFocus
            />

            <Text variant="bodyMedium" style={styles.typeLabel}>
              {i18n.t('contenant.type')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.typeScroll}
              contentContainerStyle={styles.typeContainer}
            >
              {CONTENANT_TYPES.map((item) => (
                <Chip
                  key={item.key}
                  icon={item.icon}
                  selected={type === item.key}
                  onPress={() => setType(item.key)}
                  style={styles.typeChip}
                  showSelectedCheck={false}
                  mode={type === item.key ? 'flat' : 'outlined'}
                >
                  {i18n.t(item.labelKey)}
                </Chip>
              ))}
            </ScrollView>

            {!isEditing && (
              <Text
                variant="bodySmall"
                style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}
              >
                Un QR code unique sera généré automatiquement.
              </Text>
            )}

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
  parentInfo: {
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  input: {
    marginBottom: spacing.md,
  },
  typeLabel: {
    marginBottom: spacing.sm,
  },
  typeScroll: {
    marginBottom: spacing.md,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  typeChip: {
    marginRight: spacing.xs,
  },
  hint: {
    marginBottom: spacing.md,
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

export default AddContenantModal;
