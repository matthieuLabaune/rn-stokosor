import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Modal,
  Portal,
  TextInput,
  Button,
  Text,
  useTheme,
  IconButton,
  Divider,
} from 'react-native-paper';
import { Lieu } from '../../types';
import { useLieuStore } from '../../store/lieuStore';
import i18n from '../../i18n';
import { spacing, borderRadius } from '../../theme';

interface AddLieuModalProps {
  visible: boolean;
  onDismiss: () => void;
  lieuToEdit?: Lieu;
}

const AddLieuModal: React.FC<AddLieuModalProps> = ({
  visible,
  onDismiss,
  lieuToEdit,
}) => {
  const theme = useTheme();
  const { addLieu, updateLieu } = useLieuStore();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!lieuToEdit;

  useEffect(() => {
    if (lieuToEdit) {
      setName(lieuToEdit.name);
      setAddress(lieuToEdit.address || '');
    } else {
      setName('');
      setAddress('');
    }
    setError('');
  }, [lieuToEdit, visible]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError(i18n.t('common.required'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (isEditing && lieuToEdit) {
        await updateLieu(lieuToEdit.id, {
          name: name.trim(),
          address: address.trim() || undefined,
        });
      } else {
        await addLieu(name.trim(), address.trim() || undefined);
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
              {isEditing ? i18n.t('common.edit') : i18n.t('home.addLieu')}
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
              label={i18n.t('lieu.name')}
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              error={!!error && !name.trim()}
              autoFocus
            />

            <TextInput
              label={i18n.t('lieu.address')}
              value={address}
              onChangeText={setAddress}
              mode="outlined"
              style={styles.input}
            />

            {error ? (
              <Text style={[styles.error, { color: theme.colors.error }]}>
                {error}
              </Text>
            ) : null}
          </View>

          {/* Actions */}
          <View style={styles.buttons}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={styles.button}
            >
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

export default AddLieuModal;
