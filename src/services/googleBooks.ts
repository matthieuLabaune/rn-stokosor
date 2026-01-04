// Service pour l'API Google Books
// Documentation: https://developers.google.com/books/docs/v1/using

import { Item, Category } from '../types';

const API_BASE_URL = 'https://www.googleapis.com/books/v1';

interface GoogleBooksVolumeInfo {
  title?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
  industryIdentifiers?: Array<{
    type: string;
    identifier: string;
  }>;
}

interface GoogleBooksItem {
  volumeInfo?: GoogleBooksVolumeInfo;
}

interface GoogleBooksResponse {
  totalItems: number;
  items?: GoogleBooksItem[];
}

export interface BookInfo {
  name: string;
  authors?: string;
  publisher?: string;
  barcode: string;
  imageUrl?: string;
  description?: string;
  publishedDate?: string;
}

export const lookupISBN = async (isbn: string): Promise<BookInfo | null> => {
  try {
    // Nettoyer l'ISBN (enlever les tirets)
    const cleanIsbn = isbn.replace(/[-\s]/g, '');

    const response = await fetch(
      `${API_BASE_URL}/volumes?q=isbn:${cleanIsbn}`
    );

    if (!response.ok) {
      console.warn('Google Books API error:', response.status);
      return null;
    }

    const data: GoogleBooksResponse = await response.json();

    if (data.totalItems === 0 || !data.items || data.items.length === 0) {
      console.log('Book not found in Google Books');
      return null;
    }

    const book = data.items[0];
    const info = book.volumeInfo;

    if (!info) {
      return null;
    }

    return {
      name: info.title || 'Livre inconnu',
      authors: info.authors?.join(', '),
      publisher: info.publisher,
      barcode: cleanIsbn,
      imageUrl: info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail,
      description: info.description,
      publishedDate: info.publishedDate,
    };
  } catch (error) {
    console.error('Error fetching from Google Books:', error);
    return null;
  }
};

// Convertir BookInfo en Partial<Item> pour pré-remplir le formulaire
export const bookInfoToItemPrefill = (info: BookInfo): Partial<Item> => {
  // Construire les notes avec les infos du livre
  const notes: string[] = [];
  if (info.authors) {
    notes.push(`Auteur(s): ${info.authors}`);
  }
  if (info.publisher) {
    notes.push(`Éditeur: ${info.publisher}`);
  }
  if (info.publishedDate) {
    notes.push(`Publié: ${info.publishedDate}`);
  }

  return {
    name: info.name,
    barcode: info.barcode,
    category: 'books' as Category,
    notes: notes.length > 0 ? notes.join('\n') : undefined,
  };
};
