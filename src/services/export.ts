import { documentDirectory, writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import { isAvailableAsync, shareAsync } from 'expo-sharing';
import { getDatabase } from '../database/db';
import { Lieu, Zone, Contenant, Item } from '../types';

export interface ExportData {
  version: number;
  exportDate: string;
  lieux: Lieu[];
  zones: Zone[];
  contenants: Contenant[];
  items: (Item & { photos?: string[]; tags?: string[] })[];
}

/**
 * Exporte toutes les données en JSON (backup complet)
 */
export const exportToJSON = async (): Promise<string> => {
  const db = getDatabase();

  // Récupérer toutes les données
  const lieux = await db.getAllAsync<Lieu>('SELECT * FROM lieux ORDER BY name');
  const zones = await db.getAllAsync<Zone>('SELECT * FROM zones ORDER BY name');
  const contenants = await db.getAllAsync<Contenant>('SELECT * FROM contenants ORDER BY name');
  const itemsRaw = await db.getAllAsync<Item & { photos: string; tags: string }>(
    'SELECT * FROM items ORDER BY name'
  );

  // Parser les champs JSON des items
  const items = itemsRaw.map((item) => ({
    ...item,
    photos: item.photos ? JSON.parse(item.photos) : undefined,
    tags: item.tags ? JSON.parse(item.tags) : undefined,
  }));

  const exportData: ExportData = {
    version: 1,
    exportDate: new Date().toISOString(),
    lieux,
    zones,
    contenants,
    items,
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const fileName = `stokosor_backup_${formatDateForFile(new Date())}.json`;
  const filePath = `${documentDirectory}${fileName}`;

  await writeAsStringAsync(filePath, jsonString, {
    encoding: EncodingType.UTF8,
  });

  return filePath;
};

/**
 * Exporte les items en CSV
 */
export const exportToCSV = async (): Promise<string> => {
  const db = getDatabase();

  // Récupérer toutes les données nécessaires
  const lieux = await db.getAllAsync<Lieu>('SELECT * FROM lieux');
  const zones = await db.getAllAsync<Zone>('SELECT * FROM zones');
  const contenants = await db.getAllAsync<Contenant>('SELECT * FROM contenants');
  const itemsRaw = await db.getAllAsync<Item & { photos: string; tags: string }>(
    'SELECT * FROM items ORDER BY name'
  );

  // Créer des maps pour la résolution des chemins
  const lieuxMap = new Map(lieux.map((l) => [l.id, l]));
  const zonesMap = new Map(zones.map((z) => [z.id, z]));
  const contenantsMap = new Map(contenants.map((c) => [c.id, c]));

  // Fonction pour obtenir le chemin complet d'un item
  const getItemPath = (item: Item): string => {
    const contenant = contenantsMap.get(item.contenant_id);
    if (!contenant) return '';

    const zone = zonesMap.get(contenant.zone_id);
    if (!zone) return contenant.name;

    const lieu = lieuxMap.get(zone.lieu_id);
    if (!lieu) return `${zone.name} > ${contenant.name}`;

    // Construire le chemin des contenants imbriqués
    const contenantPath: string[] = [];
    let currentContenant: Contenant | undefined = contenant;
    while (currentContenant) {
      contenantPath.unshift(currentContenant.name);
      currentContenant = currentContenant.parent_contenant_id
        ? contenantsMap.get(currentContenant.parent_contenant_id)
        : undefined;
    }

    return `${lieu.name} > ${zone.name} > ${contenantPath.join(' > ')}`;
  };

  // En-têtes CSV
  const headers = [
    'Nom',
    'Catégorie',
    'Emplacement',
    'Marque',
    'Modèle',
    'N° Série',
    'Code-barres',
    'Prix achat',
    'Valeur estimée',
    'Date achat',
    'Date péremption',
    'Fin garantie',
    'Tags',
    'Notes',
  ];

  // Construire les lignes CSV
  const rows = itemsRaw.map((item) => {
    const tags = item.tags ? JSON.parse(item.tags).join(', ') : '';
    return [
      escapeCSV(item.name),
      escapeCSV(item.category),
      escapeCSV(getItemPath(item)),
      escapeCSV(item.brand || ''),
      escapeCSV(item.model || ''),
      escapeCSV(item.serial_number || ''),
      escapeCSV(item.barcode || ''),
      item.purchase_price?.toString() || '',
      item.estimated_value?.toString() || '',
      item.purchase_date || '',
      item.expiration_date || '',
      item.warranty_date || '',
      escapeCSV(tags),
      escapeCSV(item.notes || ''),
    ];
  });

  // Assembler le CSV avec BOM UTF-8 pour Excel
  const BOM = '\uFEFF';
  const csvContent = BOM + [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\n');

  const fileName = `stokosor_items_${formatDateForFile(new Date())}.csv`;
  const filePath = `${documentDirectory}${fileName}`;

  await writeAsStringAsync(filePath, csvContent, {
    encoding: EncodingType.UTF8,
  });

  return filePath;
};

/**
 * Partage un fichier exporté
 */
export const shareFile = async (filePath: string): Promise<void> => {
  const canShare = await isAvailableAsync();
  if (canShare) {
    await shareAsync(filePath, {
      mimeType: filePath.endsWith('.json') ? 'application/json' : 'text/csv',
      dialogTitle: filePath.endsWith('.json') ? 'Export Stokosor (JSON)' : 'Export Stokosor (CSV)',
    });
  } else {
    throw new Error('Le partage n\'est pas disponible sur cet appareil');
  }
};

/**
 * Importe des données depuis un fichier JSON
 */
export const importFromJSON = async (jsonString: string): Promise<{
  lieux: number;
  zones: number;
  contenants: number;
  items: number;
}> => {
  const data: ExportData = JSON.parse(jsonString);

  // Valider la structure
  if (!data.version || !data.lieux || !data.zones || !data.contenants || !data.items) {
    throw new Error('Format de fichier invalide');
  }

  const db = getDatabase();

  // Supprimer les données existantes (dans l'ordre des dépendances)
  await db.execAsync('DELETE FROM items');
  await db.execAsync('DELETE FROM contenants');
  await db.execAsync('DELETE FROM zones');
  await db.execAsync('DELETE FROM lieux');

  // Insérer les lieux
  for (const lieu of data.lieux) {
    await db.runAsync(
      `INSERT INTO lieux (id, name, address, photo, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [lieu.id, lieu.name, lieu.address ?? null, lieu.photo ?? null, lieu.created_at, lieu.updated_at]
    );
  }

  // Insérer les zones
  for (const zone of data.zones) {
    await db.runAsync(
      `INSERT INTO zones (id, lieu_id, name, icon, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [zone.id, zone.lieu_id, zone.name, zone.icon ?? null, zone.created_at, zone.updated_at]
    );
  }

  // Insérer les contenants
  for (const contenant of data.contenants) {
    await db.runAsync(
      `INSERT INTO contenants (id, zone_id, parent_contenant_id, name, type, qr_code, photo, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        contenant.id,
        contenant.zone_id,
        contenant.parent_contenant_id ?? null,
        contenant.name,
        contenant.type ?? null,
        contenant.qr_code ?? null,
        contenant.photo ?? null,
        contenant.created_at,
        contenant.updated_at,
      ]
    );
  }

  // Insérer les items
  for (const item of data.items) {
    await db.runAsync(
      `INSERT INTO items (id, contenant_id, name, photos, category, barcode, brand, model, serial_number, purchase_price, estimated_value, purchase_date, expiration_date, warranty_date, notes, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.contenant_id,
        item.name,
        item.photos ? JSON.stringify(item.photos) : null,
        item.category,
        item.barcode ?? null,
        item.brand ?? null,
        item.model ?? null,
        item.serial_number ?? null,
        item.purchase_price ?? null,
        item.estimated_value ?? null,
        item.purchase_date ?? null,
        item.expiration_date ?? null,
        item.warranty_date ?? null,
        item.notes ?? null,
        item.tags ? JSON.stringify(item.tags) : null,
        item.created_at,
        item.updated_at,
      ]
    );
  }

  return {
    lieux: data.lieux.length,
    zones: data.zones.length,
    contenants: data.contenants.length,
    items: data.items.length,
  };
};

// Utilitaires

function formatDateForFile(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

function escapeCSV(value: string): string {
  if (value.includes(';') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
