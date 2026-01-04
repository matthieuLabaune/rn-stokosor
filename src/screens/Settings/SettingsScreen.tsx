import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { List, Divider, Text, useTheme, RadioButton, Snackbar, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import i18n, { setLanguage, getCurrentLanguage } from '../../i18n';
import { spacing } from '../../theme';
import { RootStackParamList } from '../../types';
import { exportToJSON, exportToCSV, shareFile } from '../../services/export';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [language, setLang] = useState(getCurrentLanguage());
  const [isExporting, setIsExporting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleLanguageChange = (lang: 'fr' | 'en') => {
    setLang(lang);
    setLanguage(lang);
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const filePath = await exportToJSON();
      await shareFile(filePath);
      setSnackbarMessage(i18n.t('common.success'));
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Export JSON error:', error);
      Alert.alert(i18n.t('common.error'), (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const filePath = await exportToCSV();
      await shareFile(filePath);
      setSnackbarMessage(i18n.t('common.success'));
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Export CSV error:', error);
      Alert.alert(i18n.t('common.error'), (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView>
        {/* Langue */}
        <List.Section>
          <List.Subheader>{i18n.t('settings.language')}</List.Subheader>
          <RadioButton.Group onValueChange={(value) => handleLanguageChange(value as 'fr' | 'en')} value={language}>
            <List.Item
              title={i18n.t('settings.french')}
              left={() => <List.Icon icon="flag" />}
              right={() => <RadioButton value="fr" />}
              onPress={() => handleLanguageChange('fr')}
            />
            <List.Item
              title={i18n.t('settings.english')}
              left={() => <List.Icon icon="flag" />}
              right={() => <RadioButton value="en" />}
              onPress={() => handleLanguageChange('en')}
            />
          </RadioButton.Group>
        </List.Section>

        <Divider />

        {/* Export */}
        <List.Section>
          <List.Subheader>{i18n.t('settings.export')}</List.Subheader>
          <List.Item
            title={i18n.t('settings.exportJSON')}
            description="Sauvegarde complète"
            left={() => <List.Icon icon="code-json" />}
            right={() => isExporting ? <ActivityIndicator size="small" /> : null}
            onPress={handleExportJSON}
            disabled={isExporting}
          />
          <List.Item
            title={i18n.t('settings.exportCSV')}
            description="Liste des objets"
            left={() => <List.Icon icon="file-delimited" />}
            right={() => isExporting ? <ActivityIndicator size="small" /> : null}
            onPress={handleExportCSV}
            disabled={isExporting}
          />
        </List.Section>

        <Divider />

        {/* Stats */}
        <List.Section>
          <List.Item
            title={i18n.t('settings.stats')}
            left={() => <List.Icon icon="chart-bar" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => navigation.navigate('Stats')}
          />
        </List.Section>

        <Divider />

        {/* À propos */}
        <List.Section>
          <List.Subheader>{i18n.t('settings.about')}</List.Subheader>
          <List.Item
            title={i18n.t('settings.version')}
            description="1.0.0"
            left={() => <List.Icon icon="information" />}
          />
        </List.Section>
      </ScrollView>

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
});

export default SettingsScreen;
