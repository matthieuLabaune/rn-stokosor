import { create } from 'zustand';
import { Item, Category } from '../types';
import { getDatabase, generateUUID, nowISO } from '../database/db';

interface ItemState {
  items: Item[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchItemsByContenant: (contenantId: string) => Promise<void>;
  fetchAllItems: () => Promise<void>;
  addItem: (data: Omit<Item, 'id' | 'created_at' | 'updated_at'>) => Promise<Item>;
  updateItem: (id: string, data: Partial<Omit<Item, 'id' | 'contenant_id' | 'created_at'>>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getItemById: (id: string) => Item | undefined;
  getItemsByContenant: (contenantId: string) => Item[];
  searchItems: (query: string, category?: Category) => Item[];
}

export const useItemStore = create<ItemState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchItemsByContenant: async (contenantId: string) => {
    set({ isLoading: true, error: null });
    try {
      const db = getDatabase();
      const result = await db.getAllAsync<Item & { photos: string; tags: string }>(
        'SELECT * FROM items WHERE contenant_id = ? ORDER BY updated_at DESC',
        [contenantId]
      );
      // Parser les champs JSON
      const parsedItems = result.map((item) => ({
        ...item,
        photos: item.photos ? JSON.parse(item.photos) : undefined,
        tags: item.tags ? JSON.parse(item.tags) : undefined,
      }));
      set((state) => {
        const otherItems = state.items.filter((i) => i.contenant_id !== contenantId);
        return { items: [...otherItems, ...parsedItems], isLoading: false };
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchAllItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const db = getDatabase();
      const result = await db.getAllAsync<Item & { photos: string; tags: string }>(
        'SELECT * FROM items ORDER BY updated_at DESC'
      );
      const parsedItems = result.map((item) => ({
        ...item,
        photos: item.photos ? JSON.parse(item.photos) : undefined,
        tags: item.tags ? JSON.parse(item.tags) : undefined,
      }));
      set({ items: parsedItems, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addItem: async (data: Omit<Item, 'id' | 'created_at' | 'updated_at'>) => {
    const db = getDatabase();
    const now = nowISO();
    const id = generateUUID();

    const item: Item = {
      ...data,
      id,
      created_at: now,
      updated_at: now,
    };

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

    set((state) => ({ items: [item, ...state.items] }));
    return item;
  },

  updateItem: async (id: string, data: Partial<Omit<Item, 'id' | 'contenant_id' | 'created_at'>>) => {
    const db = getDatabase();
    const now = nowISO();

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.photos !== undefined) {
      updates.push('photos = ?');
      values.push(data.photos ? JSON.stringify(data.photos) : null);
    }
    if (data.category !== undefined) {
      updates.push('category = ?');
      values.push(data.category);
    }
    if (data.barcode !== undefined) {
      updates.push('barcode = ?');
      values.push(data.barcode ?? null);
    }
    if (data.brand !== undefined) {
      updates.push('brand = ?');
      values.push(data.brand ?? null);
    }
    if (data.model !== undefined) {
      updates.push('model = ?');
      values.push(data.model ?? null);
    }
    if (data.serial_number !== undefined) {
      updates.push('serial_number = ?');
      values.push(data.serial_number ?? null);
    }
    if (data.purchase_price !== undefined) {
      updates.push('purchase_price = ?');
      values.push(data.purchase_price ?? null);
    }
    if (data.estimated_value !== undefined) {
      updates.push('estimated_value = ?');
      values.push(data.estimated_value ?? null);
    }
    if (data.purchase_date !== undefined) {
      updates.push('purchase_date = ?');
      values.push(data.purchase_date ?? null);
    }
    if (data.expiration_date !== undefined) {
      updates.push('expiration_date = ?');
      values.push(data.expiration_date ?? null);
    }
    if (data.warranty_date !== undefined) {
      updates.push('warranty_date = ?');
      values.push(data.warranty_date ?? null);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      values.push(data.notes ?? null);
    }
    if (data.tags !== undefined) {
      updates.push('tags = ?');
      values.push(data.tags ? JSON.stringify(data.tags) : null);
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await db.runAsync(
      `UPDATE items SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...data, updated_at: now } : item
      ),
    }));
  },

  deleteItem: async (id: string) => {
    const db = getDatabase();
    await db.runAsync('DELETE FROM items WHERE id = ?', [id]);
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  getItemById: (id: string) => {
    return get().items.find((item) => item.id === id);
  },

  getItemsByContenant: (contenantId: string) => {
    return get().items.filter((item) => item.contenant_id === contenantId);
  },

  searchItems: (query: string, category?: Category) => {
    const lowerQuery = query.toLowerCase();
    return get().items.filter((item) => {
      const matchesQuery =
        item.name.toLowerCase().includes(lowerQuery) ||
        item.notes?.toLowerCase().includes(lowerQuery) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery));

      const matchesCategory = !category || item.category === category;

      return matchesQuery && matchesCategory;
    });
  },
}));
