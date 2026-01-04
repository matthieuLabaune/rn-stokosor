import React, { useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, useTheme, Card } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system/next';
import i18n from '../i18n';
import { spacing, borderRadius } from '../theme';

interface QRCodeDisplayProps {
  value: string;
  label: string;
  size?: number;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  label,
  size = 200,
}) => {
  const theme = useTheme();
  const qrRef = useRef<any>(null);

  const handleShare = async () => {
    try {
      if (!qrRef.current) return;

      // Obtenir le SVG en base64
      qrRef.current.toDataURL(async (dataURL: string) => {
        try {
          const filename = `qrcode-${Date.now()}.png`;
          const file = new File(Paths.cache, filename);

          // Décoder le base64 et écrire le fichier
          const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
          await file.write(base64Data, { encoding: 'base64' });

          // Vérifier si le partage est disponible
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(file.uri, {
              mimeType: 'image/png',
              dialogTitle: i18n.t('contenant.shareQR'),
            });
          } else {
            Alert.alert(i18n.t('common.error'), 'Partage non disponible');
          }
        } catch (err) {
          console.error('Error writing/sharing QR code:', err);
          Alert.alert(i18n.t('common.error'), i18n.t('errors.generic'));
        }
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
      Alert.alert(i18n.t('common.error'), i18n.t('errors.generic'));
    }
  };

  return (
    <Card style={styles.card} mode="outlined">
      <Card.Content style={styles.content}>
        <Text variant="titleMedium" style={styles.label}>
          {i18n.t('contenant.qrCode')}
        </Text>
        <View style={[styles.qrContainer, { backgroundColor: '#FFFFFF' }]}>
          <QRCode
            value={value}
            size={size}
            backgroundColor="#FFFFFF"
            color="#000000"
            getRef={(ref) => (qrRef.current = ref)}
          />
        </View>
        <Text
          variant="bodySmall"
          style={[styles.sublabel, { color: theme.colors.onSurfaceVariant }]}
        >
          {label}
        </Text>
        <Button
          mode="outlined"
          icon="share-variant"
          onPress={handleShare}
          style={styles.button}
        >
          {i18n.t('contenant.shareQR')}
        </Button>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  content: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  label: {
    marginBottom: spacing.md,
  },
  qrContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  sublabel: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.md,
  },
});

export default QRCodeDisplay;
