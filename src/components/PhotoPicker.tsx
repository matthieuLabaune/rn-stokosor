import React, { useState } from 'react';
import { StyleSheet, View, Image, Pressable, ScrollView, Alert } from 'react-native';
import { Text, useTheme, Portal, Modal, Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system/next';
import { generateUUID } from '../database/db';
import i18n from '../i18n';
import { spacing, borderRadius } from '../theme';

interface PhotoPickerProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
  label?: string;
}

const PhotoPicker: React.FC<PhotoPickerProps> = ({
  photos,
  onChange,
  maxPhotos = 5,
  label,
}) => {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const saveImageToAppStorage = async (uri: string): Promise<string> => {
    const filename = `item_${generateUUID()}.jpg`;
    const destinationPath = `${Paths.document.uri}/photos`;

    // Créer le dossier photos s'il n'existe pas
    try {
      const photosDir = new File(Paths.document, 'photos');
      if (!photosDir.exists) {
        await photosDir.create();
      }
    } catch (e) {
      // Le dossier existe déjà ou erreur
    }

    const sourceFile = new File(uri);
    const destFile = new File(destinationPath, filename);

    await sourceFile.copy(destFile);
    return destFile.uri;
  };

  const handleTakePhoto = async () => {
    setModalVisible(false);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        i18n.t('common.error'),
        i18n.t('scanner.permissionDenied')
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      const savedUri = await saveImageToAppStorage(result.assets[0].uri);
      onChange([...photos, savedUri]);
    }
  };

  const handleChooseFromGallery = async () => {
    setModalVisible(false);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        i18n.t('common.error'),
        i18n.t('scanner.permissionDenied')
      );
      return;
    }

    const remainingSlots = maxPhotos - photos.length;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newPhotos: string[] = [];
      for (const asset of result.assets) {
        const savedUri = await saveImageToAppStorage(asset.uri);
        newPhotos.push(savedUri);
      }
      onChange([...photos, ...newPhotos]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    onChange(newPhotos);
    setSelectedPhotoIndex(null);
  };

  const handlePhotoPress = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const canAddMore = photos.length < maxPhotos;

  return (
    <View style={styles.container}>
      {label && (
        <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
          {label}
        </Text>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Photos existantes */}
        {photos.map((photo, index) => (
          <Pressable
            key={index}
            style={styles.photoWrapper}
            onPress={() => handlePhotoPress(index)}
          >
            <Image source={{ uri: photo }} style={styles.photo} />
            <IconButton
              icon="close-circle"
              size={20}
              iconColor={theme.colors.error}
              style={styles.removeButton}
              onPress={() => handleRemovePhoto(index)}
            />
          </Pressable>
        ))}

        {/* Bouton ajouter */}
        {canAddMore && (
          <Pressable
            style={[
              styles.addButton,
              {
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: theme.colors.outline,
              },
            ]}
            onPress={() => setModalVisible(true)}
          >
            <Icon
              name="camera-plus"
              size={32}
              color={theme.colors.primary}
            />
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
            >
              {photos.length}/{maxPhotos}
            </Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Modal choix source */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            {i18n.t('item.addPhotos')}
          </Text>

          <Button
            mode="outlined"
            icon="camera"
            onPress={handleTakePhoto}
            style={styles.modalButton}
          >
            {i18n.t('item.takePhoto')}
          </Button>

          <Button
            mode="outlined"
            icon="image-multiple"
            onPress={handleChooseFromGallery}
            style={styles.modalButton}
          >
            {i18n.t('item.chooseFromGallery')}
          </Button>

          <Button
            mode="text"
            onPress={() => setModalVisible(false)}
            style={styles.cancelButton}
          >
            {i18n.t('common.cancel')}
          </Button>
        </Modal>
      </Portal>

      {/* Modal photo en grand */}
      <Portal>
        <Modal
          visible={selectedPhotoIndex !== null}
          onDismiss={() => setSelectedPhotoIndex(null)}
          contentContainerStyle={[
            styles.previewModal,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          {selectedPhotoIndex !== null && (
            <>
              <Image
                source={{ uri: photos[selectedPhotoIndex] }}
                style={styles.previewImage}
                resizeMode="contain"
              />
              <View style={styles.previewActions}>
                <Button
                  mode="contained"
                  buttonColor={theme.colors.error}
                  onPress={() => handleRemovePhoto(selectedPhotoIndex)}
                >
                  {i18n.t('common.delete')}
                </Button>
                <Button
                  mode="text"
                  onPress={() => setSelectedPhotoIndex(null)}
                >
                  {i18n.t('common.cancel')}
                </Button>
              </View>
            </>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  scrollContent: {
    paddingVertical: spacing.xs,
  },
  photoWrapper: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    margin: 0,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  modalTitle: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalButton: {
    marginBottom: spacing.sm,
  },
  cancelButton: {
    marginTop: spacing.sm,
  },
  previewModal: {
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    maxHeight: '80%',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.md,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
});

export default PhotoPicker;
