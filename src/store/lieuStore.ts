import { create } from 'zustand';
import { Lieu } from '../types';
import { getDatabase, generateUUID, nowISO } from '../database/db';

interface LieuState {
  lieux: Lieu[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchLieux: () => Promise<void>;
  addLieu: (name: string, address?: string, photo?: string) => Promise<Lieu>;
  updateLieu: (id: string, data: Partial<Omit<Lieu, 'id' | 'created_at'>>) => Promise<void>;
  deleteLieu: (id: string) => Promise<void>;
  getLieuById: (id: string) => Lieu | undefined;
}

export const useLieuStore = create<LieuState>((set, get) => ({
  lieux: [],
  isLoading: false,
  error: null,

  fetchLieux: async () => {
    set({ isLoading: true, error: null });
    try {
      const db = getDatabase();
      const result = await db.getAllAsync<Lieu>(
        'SELECT * FROM lieux ORDER BY updated_at DESC'
      );
      set({ lieux: result, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addLieu: async (name: string, address?: string, photo?: string) => {
    const db = getDatabase();
    const now = nowISO();
    const lieu: Lieu = {
      id: generateUUID(),
      name,
      address,
      photo,
      created_at: now,
      updated_at: now,
    };

    await db.runAsync(
      `INSERT INTO lieux (id, name, address, photo, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [lieu.id, lieu.name, lieu.address ?? null, lieu.photo ?? null, lieu.created_at, lieu.updated_at]
    );

    set((state) => ({ lieux: [lieu, ...state.lieux] }));
    return lieu;
  },

  updateLieu: async (id: string, data: Partial<Omit<Lieu, 'id' | 'created_at'>>) => {
    const db = getDatabase();
    const now = nowISO();

    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.address !== undefined) {
      updates.push('address = ?');
      values.push(data.address ?? null);
    }
    if (data.photo !== undefined) {
      updates.push('photo = ?');
      values.push(data.photo ?? null);
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await db.runAsync(
      `UPDATE lieux SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    set((state) => ({
      lieux: state.lieux.map((lieu) =>
        lieu.id === id ? { ...lieu, ...data, updated_at: now } : lieu
      ),
    }));
  },

  deleteLieu: async (id: string) => {
    const db = getDatabase();
    await db.runAsync('DELETE FROM lieux WHERE id = ?', [id]);
    set((state) => ({
      lieux: state.lieux.filter((lieu) => lieu.id !== id),
    }));
  },

  getLieuById: (id: string) => {
    return get().lieux.find((lieu) => lieu.id === id);
  },
}));
