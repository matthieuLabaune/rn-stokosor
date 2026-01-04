import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Portal,
  Modal,
  Text,
  TextInput,
  Button,
  useTheme,
  HelperText,
  IconButton,
} from 'react-native-paper';
import { useItemStore } from '../../store/itemStore';
import { Item, Category } from '../../types';
import { isFieldAvailable, ItemField } from '../../constants/categories';
import CategoryPicker from '../../components/CategoryPicker';
import PhotoPicker from '../../components/PhotoPicker';
import i18n from '../../i18n';
import { spacing, borderRadius } from '../../theme';

interface AddItemModalProps {
  visible: boolean;
  onDismiss: () => void;
  contenantId: string;
  itemToEdit?: Item;
  prefill?: Partial<Item>;
}

const AddItemModal: React.FC<AddItemModalProps> = ({
  visible,
  onDismiss,
  contenantId,
  itemToEdit,
  prefill,
}) => {
  const theme = useTheme();
  const { addItem, updateItem } = useItemStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [photos, setPhotos] = useState<string[]>([]);
  const [barcode, setBarcode] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [warrantyDate, setWarrantyDate] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!itemToEdit;

  // Helper pour vérifier si un champ est disponible
  const showField = (field: ItemField): boolean => {
    return isFieldAvailable(category, field);
  };

  useEffect(() => {
    if (visible) {
      if (itemToEdit) {
        // Mode édition
        setName(itemToEdit.name);
        setCategory(itemToEdit.category);
        setPhotos(itemToEdit.photos || []);
        setBarcode(itemToEdit.barcode || '');
        setBrand(itemToEdit.brand || '');
        setModel(itemToEdit.model || '');
        setSerialNumber(itemToEdit.serial_number || '');
        setPurchasePrice(itemToEdit.purchase_price?.toString() || '');
        setEstimatedValue(itemToEdit.estimated_value?.toString() || '');
        setPurchaseDate(itemToEdit.purchase_date || '');
        setExpirationDate(itemToEdit.expiration_date || '');
        setWarrantyDate(itemToEdit.warranty_date || '');
        setNotes(itemToEdit.notes || '');
        setTags(itemToEdit.tags?.join(', ') || '');
      } else if (prefill) {
        // Mode pré-remplissage (scan code-barres)
        setName(prefill.name || '');
        setCategory(prefill.category || 'other');
        setPhotos(prefill.photos || []);
        setBarcode(prefill.barcode || '');
        setBrand(prefill.brand || '');
        setModel(prefill.model || '');
        setSerialNumber(prefill.serial_number || '');
        setPurchasePrice(prefill.purchase_price?.toString() || '');
        setEstimatedValue(prefill.estimated_value?.toString() || '');
        setExpirationDate(prefill.expiration_date || '');
        setWarrantyDate(prefill.warranty_date || '');
        setNotes(prefill.notes || '');
        setTags(prefill.tags?.join(', ') || '');
      } else {
        // Mode création - reset
        resetForm();
      }
      setError(null);
    }
  }, [visible, itemToEdit, prefill]);

  const resetForm = () => {
    setName('');
    setCategory('other');
    setPhotos([]);
    setBarcode('');
    setBrand('');
    setModel('');
    setSerialNumber('');
    setPurchasePrice('');
    setEstimatedValue('');
    setPurchaseDate('');
    setExpirationDate('');
    setWarrantyDate('');
    setNotes('');
    setTags('');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError(i18n.t('common.required'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const tagsArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const itemData = {
        name: name.trim(),
        category,
        photos: photos.length > 0 ? photos : undefined,
        // Inclure les champs seulement s'ils sont disponibles pour cette catégorie
        barcode: showField('barcode') && barcode.trim() ? barcode.trim() : undefined,
        brand: showField('brand') && brand.trim() ? brand.trim() : undefined,
        model: showField('model') && model.trim() ? model.trim() : undefined,
        serial_number: showField('serialNumber') && serialNumber.trim() ? serialNumber.trim() : undefined,
        purchase_price: showField('purchasePrice') && purchasePrice ? parseFloat(purchasePrice) : undefined,
        estimated_value: showField('estimatedValue') && estimatedValue ? parseFloat(estimatedValue) : undefined,
        purchase_date: showField('purchaseDate') && purchaseDate ? purchaseDate : undefined,
        expiration_date: showField('expirationDate') && expirationDate ? expirationDate : undefined,
        warranty_date: showField('warranty') && warrantyDate ? warrantyDate : undefined,
        notes: notes.trim() || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      };

      if (isEditing) {
        await updateItem(itemToEdit.id, itemData);
      } else {
        await addItem({
          ...itemData,
          contenant_id: contenantId,
        });
      }

      onDismiss();
    } catch (err) {
      setError(i18n.t('errors.generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatage de la date (YYYY-MM-DD)
  const formatDateInput = (text: string, setter: (value: string) => void) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    }
    if (cleaned.length > 6) {
      formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
    }
    setter(formatted);
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
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Handle indicator */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: theme.colors.outlineVariant }]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.title}>
              {isEditing ? i18n.t('item.editItem') : i18n.t('item.addItem')}
            </Text>
            <IconButton
              icon="close"
              onPress={onDismiss}
              style={styles.closeButton}
              size={24}
            />
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Nom - toujours visible */}
            <TextInput
              label={i18n.t('item.name') + ' *'}
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              error={!!error && !name.trim()}
            />
            {error && !name.trim() && (
              <HelperText type="error">{error}</HelperText>
            )}

            {/* Catégorie - toujours visible */}
            <CategoryPicker
              value={category}
              onChange={setCategory}
              label={i18n.t('item.category')}
            />

            {/* Photos - toujours visible */}
            <PhotoPicker
              photos={photos}
              onChange={setPhotos}
              maxPhotos={5}
              label={i18n.t('item.photos')}
            />

            {/* Code-barres */}
            {showField('barcode') && (
              <TextInput
                label={i18n.t('item.barcode')}
                value={barcode}
                onChangeText={setBarcode}
                mode="outlined"
                style={styles.input}
                right={<TextInput.Icon icon="barcode" />}
              />
            )}

            {/* Marque */}
            {showField('brand') && (
              <TextInput
                label={i18n.t('item.brand')}
                value={brand}
                onChangeText={setBrand}
                mode="outlined"
                style={styles.input}
              />
            )}

            {/* Modèle et Numéro de série */}
            {(showField('model') || showField('serialNumber')) && (
              <View style={styles.row}>
                {showField('model') && (
                  <TextInput
                    label={i18n.t('item.model')}
                    value={model}
                    onChangeText={setModel}
                    mode="outlined"
                    style={[styles.input, showField('serialNumber') ? styles.halfInput : styles.fullInput]}
                  />
                )}
                {showField('serialNumber') && (
                  <TextInput
                    label={i18n.t('item.serialNumber')}
                    value={serialNumber}
                    onChangeText={setSerialNumber}
                    mode="outlined"
                    style={[styles.input, showField('model') ? styles.halfInput : styles.fullInput]}
                  />
                )}
              </View>
            )}

            {/* Prix et valeur */}
            {(showField('purchasePrice') || showField('estimatedValue')) && (
              <View style={styles.row}>
                {showField('purchasePrice') && (
                  <TextInput
                    label={i18n.t('item.purchasePrice')}
                    value={purchasePrice}
                    onChangeText={setPurchasePrice}
                    mode="outlined"
                    style={[styles.input, showField('estimatedValue') ? styles.halfInput : styles.fullInput]}
                    keyboardType="decimal-pad"
                    right={<TextInput.Affix text="€" />}
                  />
                )}
                {showField('estimatedValue') && (
                  <TextInput
                    label={i18n.t('item.estimatedValue')}
                    value={estimatedValue}
                    onChangeText={setEstimatedValue}
                    mode="outlined"
                    style={[styles.input, showField('purchasePrice') ? styles.halfInput : styles.fullInput]}
                    keyboardType="decimal-pad"
                    right={<TextInput.Affix text="€" />}
                  />
                )}
              </View>
            )}

            {/* Date d'achat */}
            {showField('purchaseDate') && (
              <TextInput
                label={i18n.t('item.purchaseDate')}
                value={purchaseDate}
                onChangeText={(text) => formatDateInput(text, setPurchaseDate)}
                mode="outlined"
                style={styles.input}
                placeholder="YYYY-MM-DD"
                keyboardType="number-pad"
                maxLength={10}
              />
            )}

            {/* Date de péremption - seulement pour food/household */}
            {showField('expirationDate') && (
              <TextInput
                label={i18n.t('item.expirationDate')}
                value={expirationDate}
                onChangeText={(text) => formatDateInput(text, setExpirationDate)}
                mode="outlined"
                style={styles.input}
                placeholder="YYYY-MM-DD"
                keyboardType="number-pad"
                maxLength={10}
              />
            )}

            {/* Date de garantie - seulement pour electronics/appliances/tools */}
            {showField('warranty') && (
              <TextInput
                label={i18n.t('item.warrantyDate')}
                value={warrantyDate}
                onChangeText={(text) => formatDateInput(text, setWarrantyDate)}
                mode="outlined"
                style={styles.input}
                placeholder="YYYY-MM-DD"
                keyboardType="number-pad"
                maxLength={10}
              />
            )}

            {/* Notes - toujours visible */}
            <TextInput
              label={i18n.t('item.notes')}
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={3}
            />

            {/* Tags - toujours visible */}
            <TextInput
              label={i18n.t('item.tags')}
              value={tags}
              onChangeText={setTags}
              mode="outlined"
              style={styles.input}
              placeholder={i18n.t('item.tagsHint')}
            />
          </ScrollView>

          {/* Boutons */}
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={styles.button}
              disabled={isSubmitting}
            >
              {i18n.t('common.cancel')}
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              loading={isSubmitting}
              disabled={isSubmitting}
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
    maxHeight: '90%',
  },
  keyboardView: {
    maxHeight: '100%',
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
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  input: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  fullInput: {
    width: '100%',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  button: {
    minWidth: 100,
  },
});

export default AddItemModal;
