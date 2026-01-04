import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Alert, Vibration } from 'react-native';
import { Text, Button, useTheme, ActivityIndicator, Snackbar, Portal, Modal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

import { useContenantStore } from '../../store/contenantStore';
import { RootStackParamList, Item } from '../../types';
import { lookupBarcode, productInfoToItemPrefill } from '../../services/openFoodFacts';
import { lookupISBN, bookInfoToItemPrefill } from '../../services/googleBooks';
import i18n from '../../i18n';
import { spacing, borderRadius } from '../../theme';

type NavigationProp = StackNavigationProp<RootStackParamList>;

type ScanMode = 'qr' | 'barcode';

const ScannerScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { contenants } = useContenantStore();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanMode, setScanMode] = useState<ScanMode | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [productResult, setProductResult] = useState<Partial<Item> | null>(null);
  const [resultModalVisible, setResultModalVisible] = useState(false);

  const lastScannedRef = useRef<string>('');
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  const handleBarCodeScanned = async (result: BarcodeScanningResult) => {
    // Éviter les scans multiples du même code
    if (!isScanning || result.data === lastScannedRef.current) {
      return;
    }

    lastScannedRef.current = result.data;
    setIsScanning(false);
    Vibration.vibrate(100);

    const { data, type } = result;
    console.log(`Scanned: ${type} - ${data}`);

    if (scanMode === 'qr') {
      // Rechercher le contenant par QR code
      const contenant = contenants.find((c) => c.qr_code === data);

      if (contenant) {
        setSnackbarMessage(i18n.t('scanner.containerFound'));
        setSnackbarVisible(true);

        // Naviguer vers le contenant après un court délai
        setTimeout(() => {
          setScanMode(null);
          navigation.navigate('Contenant', { contenantId: contenant.id });
        }, 500);
      } else {
        setSnackbarMessage(i18n.t('scanner.containerNotFound'));
        setSnackbarVisible(true);

        // Réactiver le scan après un délai
        scanTimeoutRef.current = setTimeout(() => {
          lastScannedRef.current = '';
          setIsScanning(true);
        }, 2000);
      }
    } else if (scanMode === 'barcode') {
      setIsLoading(true);

      try {
        // Essayer d'abord Open Food Facts
        let productPrefill: Partial<Item> | null = null;

        // Vérifier si c'est un ISBN (commence par 978 ou 979)
        if (data.startsWith('978') || data.startsWith('979')) {
          const bookInfo = await lookupISBN(data);
          if (bookInfo) {
            productPrefill = bookInfoToItemPrefill(bookInfo);
          }
        }

        // Si pas un livre ou livre non trouvé, essayer Open Food Facts
        if (!productPrefill) {
          const productInfo = await lookupBarcode(data);
          if (productInfo) {
            productPrefill = productInfoToItemPrefill(productInfo);
          }
        }

        if (productPrefill) {
          setProductResult(productPrefill);
          setResultModalVisible(true);
        } else {
          // Produit non trouvé - proposer d'ajouter manuellement
          setProductResult({ barcode: data });
          setResultModalVisible(true);
        }
      } catch (error) {
        console.error('Error looking up barcode:', error);
        setSnackbarMessage(i18n.t('errors.network'));
        setSnackbarVisible(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddProduct = () => {
    setResultModalVisible(false);
    setScanMode(null);

    // TODO: Naviguer vers l'ajout d'item avec les données pré-remplies
    // Pour l'instant, on affiche juste un message
    Alert.alert(
      i18n.t('item.addItem'),
      i18n.t('scanner.selectContainerFirst'),
      [
        {
          text: i18n.t('common.cancel'),
          style: 'cancel',
        },
        {
          text: i18n.t('tabs.home'),
          onPress: () => navigation.navigate('MainTabs'),
        },
      ]
    );
  };

  const handleCloseCamera = () => {
    setScanMode(null);
    lastScannedRef.current = '';
    setIsScanning(true);
  };

  // Demander la permission
  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
        <View style={styles.content}>
          <Icon name={"camera-off" as any} size={80} color={theme.colors.error} />
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
            {i18n.t('scanner.permissionDenied')}
          </Text>
          <Button mode="contained" onPress={requestPermission} style={styles.permissionButton}>
            {i18n.t('scanner.grantPermission')}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Mode caméra active
  if (scanMode) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: scanMode === 'qr'
              ? ['qr']
              : ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
          }}
          onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
        />

        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Zone de scan */}
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft, { borderColor: theme.colors.primary }]} />
            <View style={[styles.corner, styles.topRight, { borderColor: theme.colors.primary }]} />
            <View style={[styles.corner, styles.bottomLeft, { borderColor: theme.colors.primary }]} />
            <View style={[styles.corner, styles.bottomRight, { borderColor: theme.colors.primary }]} />
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              {scanMode === 'qr' ? i18n.t('scanner.scanQR') : i18n.t('scanner.scanBarcode')}
            </Text>
          </View>

          {/* Loader */}
          {isLoading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="white" />
              <Text style={styles.loaderText}>{i18n.t('common.loading')}</Text>
            </View>
          )}
        </View>

        {/* Bouton fermer */}
        <Button
          mode="contained"
          icon="close"
          onPress={handleCloseCamera}
          style={[styles.closeButton, { backgroundColor: theme.colors.error }]}
        >
          {i18n.t('common.cancel')}
        </Button>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={2000}
          style={styles.snackbar}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    );
  }

  // Écran de sélection du mode
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <View style={styles.content}>
        <Icon name={"qrcode-scan" as any} size={100} color={theme.colors.primary} />
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          {i18n.t('scanner.title')}
        </Text>
        <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          {i18n.t('scanner.chooseMode')}
        </Text>

        <View style={styles.buttons}>
          <Button
            mode="contained"
            icon="qrcode"
            onPress={() => setScanMode('qr')}
            style={styles.button}
          >
            {i18n.t('scanner.scanQR')}
          </Button>

          <Button
            mode="outlined"
            icon="barcode-scan"
            onPress={() => setScanMode('barcode')}
            style={styles.button}
          >
            {i18n.t('scanner.scanBarcode')}
          </Button>
        </View>
      </View>

      {/* Modal résultat produit */}
      <Portal>
        <Modal
          visible={resultModalVisible}
          onDismiss={() => {
            setResultModalVisible(false);
            lastScannedRef.current = '';
            setIsScanning(true);
          }}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          {/* Handle indicator */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: theme.colors.outlineVariant }]} />
          </View>

          <View style={styles.modalContent}>
            <Icon
              name={productResult?.name ? 'check-circle' : 'help-circle' as any}
              size={48}
              color={productResult?.name ? theme.colors.primary : theme.colors.tertiary}
              style={styles.modalIcon}
            />

            <Text variant="titleLarge" style={styles.modalTitle}>
              {productResult?.name
                ? i18n.t('scanner.productFound')
                : i18n.t('scanner.productNotFound')
              }
            </Text>

            {productResult?.name && (
              <Text variant="bodyLarge" style={styles.modalProductName}>
                {productResult.name}
              </Text>
            )}

            {productResult?.brand && (
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {productResult.brand}
              </Text>
            )}

            <Text variant="bodySmall" style={[styles.barcodeText, { color: theme.colors.onSurfaceVariant }]}>
              Code: {productResult?.barcode}
            </Text>

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => {
                  setResultModalVisible(false);
                  lastScannedRef.current = '';
                  setIsScanning(true);
                }}
              >
                {i18n.t('scanner.scanAgain')}
              </Button>
              <Button
                mode="contained"
                onPress={handleAddProduct}
              >
                {i18n.t('item.addItem')}
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  description: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  buttons: {
    marginTop: spacing.xl,
    width: '100%',
  },
  button: {
    marginVertical: spacing.sm,
  },
  permissionButton: {
    marginTop: spacing.lg,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructions: {
    marginTop: spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
  },
  loaderContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  loaderText: {
    color: 'white',
    marginTop: spacing.sm,
  },
  closeButton: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
  },
  snackbar: {
    bottom: 80,
  },
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
  modalContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  modalIcon: {
    marginBottom: spacing.md,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  modalProductName: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  barcodeText: {
    marginTop: spacing.md,
    fontFamily: 'monospace',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});

export default ScannerScreen;
