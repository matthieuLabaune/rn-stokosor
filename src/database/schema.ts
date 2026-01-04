// Schéma SQLite pour Stokosor

export const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS lieux (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    photo TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS zones (
    id TEXT PRIMARY KEY NOT NULL,
    lieu_id TEXT NOT NULL,
    name TEXT NOT NULL,
    icon TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (lieu_id) REFERENCES lieux(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS contenants (
    id TEXT PRIMARY KEY NOT NULL,
    zone_id TEXT NOT NULL,
    parent_contenant_id TEXT,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'box',
    qr_code TEXT UNIQUE NOT NULL,
    photo TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_contenant_id) REFERENCES contenants(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY NOT NULL,
    contenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    photos TEXT,
    category TEXT NOT NULL,
    barcode TEXT,
    brand TEXT,
    model TEXT,
    serial_number TEXT,
    purchase_price REAL,
    estimated_value REAL,
    purchase_date TEXT,
    expiration_date TEXT,
    warranty_date TEXT,
    notes TEXT,
    tags TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (contenant_id) REFERENCES contenants(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_zones_lieu ON zones(lieu_id);
  CREATE INDEX IF NOT EXISTS idx_contenants_zone ON contenants(zone_id);
  CREATE INDEX IF NOT EXISTS idx_contenants_parent ON contenants(parent_contenant_id);
  CREATE INDEX IF NOT EXISTS idx_items_contenant ON items(contenant_id);
  CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
  CREATE INDEX IF NOT EXISTS idx_items_expiration ON items(expiration_date);
  CREATE INDEX IF NOT EXISTS idx_contenants_qr ON contenants(qr_code);
`;

// Migration pour ajouter les nouvelles colonnes aux bases existantes
export const MIGRATION_ADD_CONTENANT_HIERARCHY = `
  ALTER TABLE contenants ADD COLUMN parent_contenant_id TEXT REFERENCES contenants(id) ON DELETE CASCADE;
  ALTER TABLE contenants ADD COLUMN type TEXT NOT NULL DEFAULT 'box';
  CREATE INDEX IF NOT EXISTS idx_contenants_parent ON contenants(parent_contenant_id);
`;
