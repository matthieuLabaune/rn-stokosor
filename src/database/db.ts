import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

const CURRENT_DB_VERSION = 3; // Incrémenter à chaque changement de schéma

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('stokosor.db');

  // Activer les foreign keys
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Vérifier la version de la base
  const versionResult = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const currentVersion = versionResult?.user_version ?? 0;

  if (currentVersion === 0) {
    // Vérifier si les tables existent déjà (base créée avant le système de migration)
    const existingTables = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='contenants'"
    );

    if (existingTables.length > 0) {
      // Tables existent déjà - appliquer les migrations depuis la version 1
      console.log('Base existante détectée, application des migrations...');
      await applyMigrations(db, 1);
    } else {
      // Nouvelle base - créer les tables
      console.log('Nouvelle base, création des tables...');
      await db.execAsync(CREATE_TABLES_SQL);
      await db.execAsync(`PRAGMA user_version = ${CURRENT_DB_VERSION}`);
    }
  } else if (currentVersion < CURRENT_DB_VERSION) {
    // Appliquer les migrations
    console.log(`Migration de v${currentVersion} vers v${CURRENT_DB_VERSION}...`);
    await applyMigrations(db, currentVersion);
  }

  return db;
};

const applyMigrations = async (
  database: SQLite.SQLiteDatabase,
  fromVersion: number
): Promise<void> => {
  // Migration 1 -> 2 : Ajout parent_contenant_id et type aux contenants
  if (fromVersion < 2) {
    console.log('Application de la migration 1 -> 2...');

    // Vérifier si les colonnes existent déjà
    const tableInfo = await database.getAllAsync<{ name: string }>(
      "PRAGMA table_info(contenants)"
    );
    const columns = tableInfo.map((col) => col.name);
    console.log('Colonnes existantes:', columns);

    if (!columns.includes('parent_contenant_id')) {
      console.log('Ajout de la colonne parent_contenant_id...');
      await database.execAsync(
        'ALTER TABLE contenants ADD COLUMN parent_contenant_id TEXT'
      );
    }

    if (!columns.includes('type')) {
      console.log('Ajout de la colonne type...');
      await database.execAsync(
        "ALTER TABLE contenants ADD COLUMN type TEXT DEFAULT 'box'"
      );
      // Mettre à jour les lignes existantes avec la valeur par défaut
      await database.execAsync(
        "UPDATE contenants SET type = 'box' WHERE type IS NULL"
      );
    }

    // Créer l'index si nécessaire
    console.log('Création de l\'index...');
    await database.execAsync(
      'CREATE INDEX IF NOT EXISTS idx_contenants_parent ON contenants(parent_contenant_id)'
    );

    console.log('Migration 1 -> 2 terminée');
  }

  // Migration 2 -> 3 : Ajout des champs brand, model, serial_number, warranty_date aux items
  if (fromVersion < 3) {
    console.log('Application de la migration 2 -> 3...');

    const tableInfo = await database.getAllAsync<{ name: string }>(
      "PRAGMA table_info(items)"
    );
    const columns = tableInfo.map((col) => col.name);
    console.log('Colonnes items existantes:', columns);

    if (!columns.includes('brand')) {
      console.log('Ajout de la colonne brand...');
      await database.execAsync('ALTER TABLE items ADD COLUMN brand TEXT');
    }

    if (!columns.includes('model')) {
      console.log('Ajout de la colonne model...');
      await database.execAsync('ALTER TABLE items ADD COLUMN model TEXT');
    }

    if (!columns.includes('serial_number')) {
      console.log('Ajout de la colonne serial_number...');
      await database.execAsync('ALTER TABLE items ADD COLUMN serial_number TEXT');
    }

    if (!columns.includes('warranty_date')) {
      console.log('Ajout de la colonne warranty_date...');
      await database.execAsync('ALTER TABLE items ADD COLUMN warranty_date TEXT');
    }

    console.log('Migration 2 -> 3 terminée');
  }

  // Mettre à jour la version
  await database.execAsync(`PRAGMA user_version = ${CURRENT_DB_VERSION}`);
  console.log(`Version de la base mise à jour: ${CURRENT_DB_VERSION}`);
};

export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

// Helper pour générer un UUID
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Helper pour obtenir la date/heure actuelle en ISO
export const nowISO = (): string => {
  return new Date().toISOString();
};
