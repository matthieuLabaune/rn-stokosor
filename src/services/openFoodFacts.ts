// Service pour l'API Open Food Facts
// Documentation: https://world.openfoodfacts.org/data

import { Item, Category } from '../types';

const API_BASE_URL = 'https://world.openfoodfacts.org/api/v2';

interface OpenFoodFactsProduct {
  code: string;
  product_name?: string;
  product_name_fr?: string;
  brands?: string;
  image_url?: string;
  image_front_url?: string;
  categories_tags?: string[];
  expiration_date?: string;
}

interface OpenFoodFactsResponse {
  status: number;
  product?: OpenFoodFactsProduct;
}

export interface ProductInfo {
  name: string;
  brand?: string;
  barcode: string;
  imageUrl?: string;
  category: Category;
  expirationDate?: string;
}

// Mapper les catégories Open Food Facts vers nos catégories
const mapCategory = (categories?: string[]): Category => {
  if (!categories || categories.length === 0) return 'food';

  const categoryStr = categories.join(' ').toLowerCase();

  // Produits ménagers
  if (
    categoryStr.includes('cleaning') ||
    categoryStr.includes('household') ||
    categoryStr.includes('nettoyage') ||
    categoryStr.includes('entretien')
  ) {
    return 'household';
  }

  // Par défaut, c'est de l'alimentation
  return 'food';
};

export const lookupBarcode = async (barcode: string): Promise<ProductInfo | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/product/${barcode}.json`, {
      headers: {
        'User-Agent': 'Stokosor - React Native App - https://github.com/stokosor',
      },
    });

    if (!response.ok) {
      console.warn('Open Food Facts API error:', response.status);
      return null;
    }

    const data: OpenFoodFactsResponse = await response.json();

    if (data.status !== 1 || !data.product) {
      console.log('Product not found in Open Food Facts');
      return null;
    }

    const product = data.product;

    // Récupérer le nom (préférer le nom français)
    const name = product.product_name_fr || product.product_name || 'Produit inconnu';

    return {
      name,
      brand: product.brands?.split(',')[0]?.trim(),
      barcode: product.code,
      imageUrl: product.image_front_url || product.image_url,
      category: mapCategory(product.categories_tags),
      expirationDate: product.expiration_date,
    };
  } catch (error) {
    console.error('Error fetching from Open Food Facts:', error);
    return null;
  }
};

// Convertir ProductInfo en Partial<Item> pour pré-remplir le formulaire
export const productInfoToItemPrefill = (info: ProductInfo): Partial<Item> => {
  return {
    name: info.name,
    brand: info.brand,
    barcode: info.barcode,
    category: info.category,
    // Note: l'image externe n'est pas stockée localement, seulement affichée
  };
};
