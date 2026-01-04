import { Category } from '../types';

// Champs optionnels disponibles pour les items
export type ItemField =
  | 'barcode'
  | 'purchasePrice'
  | 'estimatedValue'
  | 'purchaseDate'
  | 'expirationDate'
  | 'brand'
  | 'model'
  | 'serialNumber'
  | 'warranty';

interface CategoryInfo {
  key: Category;
  icon: string;
  labelKey: string;
  // Champs pertinents pour cette catégorie
  fields: ItemField[];
  // Catégorie par défaut pour les scans (Open Food Facts, Google Books, etc.)
  scanSource?: 'openfoodfacts' | 'googlebooks' | 'generic';
}

export const CATEGORIES: CategoryInfo[] = [
  {
    key: 'electronics',
    icon: 'laptop',
    labelKey: 'categories.electronics',
    fields: ['barcode', 'purchasePrice', 'estimatedValue', 'purchaseDate', 'brand', 'model', 'serialNumber', 'warranty'],
    scanSource: 'generic',
  },
  {
    key: 'appliances',
    icon: 'fridge-outline',
    labelKey: 'categories.appliances',
    fields: ['barcode', 'purchasePrice', 'estimatedValue', 'purchaseDate', 'brand', 'model', 'serialNumber', 'warranty'],
    scanSource: 'generic',
  },
  {
    key: 'furniture',
    icon: 'sofa-outline',
    labelKey: 'categories.furniture',
    fields: ['purchasePrice', 'estimatedValue', 'purchaseDate', 'brand'],
  },
  {
    key: 'clothing',
    icon: 'tshirt-crew-outline',
    labelKey: 'categories.clothing',
    fields: ['barcode', 'purchasePrice', 'purchaseDate', 'brand'],
  },
  {
    key: 'books',
    icon: 'book-open-variant',
    labelKey: 'categories.books',
    fields: ['barcode', 'purchasePrice', 'estimatedValue', 'purchaseDate'],
    scanSource: 'googlebooks',
  },
  {
    key: 'documents',
    icon: 'file-document-outline',
    labelKey: 'categories.documents',
    fields: ['purchaseDate'],  // Pas de prix pour les documents
  },
  {
    key: 'food',
    icon: 'food-apple-outline',
    labelKey: 'categories.food',
    fields: ['barcode', 'purchasePrice', 'purchaseDate', 'expirationDate', 'brand'],
    scanSource: 'openfoodfacts',
  },
  {
    key: 'household',
    icon: 'spray-bottle',
    labelKey: 'categories.household',
    fields: ['barcode', 'purchasePrice', 'purchaseDate', 'expirationDate', 'brand'],
    scanSource: 'openfoodfacts',
  },
  {
    key: 'tools',
    icon: 'wrench-outline',
    labelKey: 'categories.tools',
    fields: ['barcode', 'purchasePrice', 'estimatedValue', 'purchaseDate', 'brand', 'model', 'warranty'],
  },
  {
    key: 'leisure',
    icon: 'gamepad-variant-outline',
    labelKey: 'categories.leisure',
    fields: ['barcode', 'purchasePrice', 'estimatedValue', 'purchaseDate', 'brand', 'model'],
  },
  {
    key: 'decoration',
    icon: 'lamp',
    labelKey: 'categories.decoration',
    fields: ['purchasePrice', 'estimatedValue', 'purchaseDate', 'brand'],
  },
  {
    key: 'other',
    icon: 'dots-horizontal',
    labelKey: 'categories.other',
    fields: ['barcode', 'purchasePrice', 'estimatedValue', 'purchaseDate', 'expirationDate', 'brand', 'model', 'serialNumber', 'warranty'],
  },
];

export const getCategoryByKey = (key: Category): CategoryInfo | undefined => {
  return CATEGORIES.find((cat) => cat.key === key);
};

// Helper pour vérifier si un champ est disponible pour une catégorie
export const isFieldAvailable = (category: Category, field: ItemField): boolean => {
  const cat = getCategoryByKey(category);
  return cat?.fields.includes(field) ?? false;
};
