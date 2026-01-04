import { create } from 'zustand';
import { Contenant, ContenantType } from '../types';
import { getDatabase, generateUUID, nowISO } from '../database/db';

interface ContenantState {
  contenants: Contenant[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchContenantsByZone: (zoneId: string) => Promise<void>;
  fetchAllContenants: () => Promise<void>;
  addContenant: (
    zoneId: string,
    name: string,
    type: ContenantType,
    parentContenantId?: string,
    photo?: string
  ) => Promise<Contenant>;
  updateContenant: (
    id: string,
    data: Partial<Omit<Contenant, 'id' | 'zone_id' | 'parent_contenant_id' | 'qr_code' | 'created_at'>>
  ) => Promise<void>;
  deleteContenant: (id: string) => Promise<void>;
  getContenantById: (id: string) => Contenant | undefined;
  getContenantByQRCode: (qrCode: string) => Contenant | undefined;
  getContenantsByZone: (zoneId: string) => Contenant[];
  getRootContenantsByZone: (zoneId: string) => Contenant[];
  getChildContenants: (parentId: string) => Contenant[];
  getContenantPath: (contenantId: string) => Contenant[];
}

export const useContenantStore = create<ContenantState>((set, get) => ({
  contenants: [],
  isLoading: false,
  error: null,

  fetchContenantsByZone: async (zoneId: string) => {
    set({ isLoading: true, error: null });
    try {
      const db = getDatabase();
      const result = await db.getAllAsync<Contenant>(
        'SELECT * FROM contenants WHERE zone_id = ? ORDER BY updated_at DESC',
        [zoneId]
      );
      set((state) => {
        const otherContenants = state.contenants.filter((c) => c.zone_id !== zoneId);
        return { contenants: [...otherContenants, ...result], isLoading: false };
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchAllContenants: async () => {
    set({ isLoading: true, error: null });
    try {
      const db = getDatabase();
      const result = await db.getAllAsync<Contenant>(
        'SELECT * FROM contenants ORDER BY updated_at DESC'
      );
      set({ contenants: result, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addContenant: async (
    zoneId: string,
    name: string,
    type: ContenantType,
    parentContenantId?: string,
    photo?: string
  ) => {
    const db = getDatabase();
    const now = nowISO();
    const id = generateUUID();
    const qrCode = `STOKOSOR:${id}`;

    const contenant: Contenant = {
      id,
      zone_id: zoneId,
      parent_contenant_id: parentContenantId,
      name,
      type,
      qr_code: qrCode,
      photo,
      created_at: now,
      updated_at: now,
    };

    await db.runAsync(
      `INSERT INTO contenants (id, zone_id, parent_contenant_id, name, type, qr_code, photo, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        contenant.id,
        contenant.zone_id,
        contenant.parent_contenant_id ?? null,
        contenant.name,
        contenant.type,
        contenant.qr_code,
        contenant.photo ?? null,
        contenant.created_at,
        contenant.updated_at,
      ]
    );

    set((state) => ({ contenants: [contenant, ...state.contenants] }));
    return contenant;
  },

  updateContenant: async (
    id: string,
    data: Partial<Omit<Contenant, 'id' | 'zone_id' | 'parent_contenant_id' | 'qr_code' | 'created_at'>>
  ) => {
    const db = getDatabase();
    const now = nowISO();

    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.type !== undefined) {
      updates.push('type = ?');
      values.push(data.type);
    }
    if (data.photo !== undefined) {
      updates.push('photo = ?');
      values.push(data.photo ?? null);
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await db.runAsync(
      `UPDATE contenants SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    set((state) => ({
      contenants: state.contenants.map((contenant) =>
        contenant.id === id ? { ...contenant, ...data, updated_at: now } : contenant
      ),
    }));
  },

  deleteContenant: async (id: string) => {
    const db = getDatabase();
    await db.runAsync('DELETE FROM contenants WHERE id = ?', [id]);
    set((state) => ({
      contenants: state.contenants.filter((contenant) => contenant.id !== id),
    }));
  },

  getContenantById: (id: string) => {
    return get().contenants.find((contenant) => contenant.id === id);
  },

  getContenantByQRCode: (qrCode: string) => {
    return get().contenants.find((contenant) => contenant.qr_code === qrCode);
  },

  getContenantsByZone: (zoneId: string) => {
    return get().contenants.filter((contenant) => contenant.zone_id === zoneId);
  },

  // Contenants racine (sans parent) dans une zone
  getRootContenantsByZone: (zoneId: string) => {
    return get().contenants.filter(
      (contenant) => contenant.zone_id === zoneId && !contenant.parent_contenant_id
    );
  },

  // Sous-contenants d'un contenant parent
  getChildContenants: (parentId: string) => {
    return get().contenants.filter(
      (contenant) => contenant.parent_contenant_id === parentId
    );
  },

  // Chemin complet du contenant (du racine jusqu'au contenant actuel)
  getContenantPath: (contenantId: string) => {
    const path: Contenant[] = [];
    let current = get().getContenantById(contenantId);

    while (current) {
      path.unshift(current);
      if (current.parent_contenant_id) {
        current = get().getContenantById(current.parent_contenant_id);
      } else {
        break;
      }
    }

    return path;
  },
}));
