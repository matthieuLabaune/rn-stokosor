// Types pour Stokosor

export type Category =
  | 'electronics'
  | 'appliances'
  | 'furniture'
  | 'clothing'
  | 'books'
  | 'documents'
  | 'food'
  | 'household'
  | 'tools'
  | 'leisure'
  | 'decoration'
  | 'other';

// Types de contenants
export type ContenantType =
  | 'furniture'    // Meuble (armoire, commode, buffet...)
  | 'drawer'       // Tiroir
  | 'shelf'        // Étagère
  | 'cabinet'      // Placard/porte
  | 'box'          // Boîte/carton
  | 'bag'          // Sac/pochette
  | 'basket'       // Panier/corbeille
  | 'bin'          // Bac/caisse
  | 'folder'       // Classeur/dossier
  | 'other';       // Autre

export interface Lieu {
  id: string;
  name: string;
  address?: string;
  photo?: string;
  created_at: string;
  updated_at: string;
}

export interface Zone {
  id: string;
  lieu_id: string;
  name: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface Contenant {
  id: string;
  zone_id: string;
  parent_contenant_id?: string;  // null = contenant racine dans la zone
  name: string;
  type: ContenantType;
  qr_code: string;
  photo?: string;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  contenant_id: string;
  name: string;
  photos?: string[];
  category: Category;
  barcode?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  purchase_price?: number;
  estimated_value?: number;
  purchase_date?: string;
  expiration_date?: string;
  warranty_date?: string;  // Date de fin de garantie
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

// Types pour la navigation
export type RootStackParamList = {
  MainTabs: undefined;
  Lieu: { lieuId: string };
  Zone: { zoneId: string };
  Contenant: { contenantId: string };
  Item: { itemId: string };
  AddLieu: { lieuId?: string };
  AddZone: { lieuId: string; zoneId?: string };
  AddContenant: { zoneId: string; parentContenantId?: string; contenantId?: string };
  AddItem: { contenantId: string; itemId?: string; prefill?: Partial<Item> };
  Stats: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Scanner: undefined;
  Search: undefined;
  Settings: undefined;
};
