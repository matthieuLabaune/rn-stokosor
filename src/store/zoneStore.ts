import { create } from 'zustand';
import { Zone } from '../types';
import { getDatabase, generateUUID, nowISO } from '../database/db';

interface ZoneState {
  zones: Zone[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchZonesByLieu: (lieuId: string) => Promise<void>;
  fetchAllZones: () => Promise<void>;
  addZone: (lieuId: string, name: string, icon?: string) => Promise<Zone>;
  updateZone: (id: string, data: Partial<Omit<Zone, 'id' | 'lieu_id' | 'created_at'>>) => Promise<void>;
  deleteZone: (id: string) => Promise<void>;
  getZoneById: (id: string) => Zone | undefined;
  getZonesByLieu: (lieuId: string) => Zone[];
}

export const useZoneStore = create<ZoneState>((set, get) => ({
  zones: [],
  isLoading: false,
  error: null,

  fetchZonesByLieu: async (lieuId: string) => {
    set({ isLoading: true, error: null });
    try {
      const db = getDatabase();
      const result = await db.getAllAsync<Zone>(
        'SELECT * FROM zones WHERE lieu_id = ? ORDER BY updated_at DESC',
        [lieuId]
      );
      // Merge with existing zones from other lieux
      set((state) => {
        const otherZones = state.zones.filter((z) => z.lieu_id !== lieuId);
        return { zones: [...otherZones, ...result], isLoading: false };
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchAllZones: async () => {
    set({ isLoading: true, error: null });
    try {
      const db = getDatabase();
      const result = await db.getAllAsync<Zone>(
        'SELECT * FROM zones ORDER BY updated_at DESC'
      );
      set({ zones: result, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addZone: async (lieuId: string, name: string, icon?: string) => {
    const db = getDatabase();
    const now = nowISO();
    const zone: Zone = {
      id: generateUUID(),
      lieu_id: lieuId,
      name,
      icon,
      created_at: now,
      updated_at: now,
    };

    await db.runAsync(
      `INSERT INTO zones (id, lieu_id, name, icon, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [zone.id, zone.lieu_id, zone.name, zone.icon ?? null, zone.created_at, zone.updated_at]
    );

    set((state) => ({ zones: [zone, ...state.zones] }));
    return zone;
  },

  updateZone: async (id: string, data: Partial<Omit<Zone, 'id' | 'lieu_id' | 'created_at'>>) => {
    const db = getDatabase();
    const now = nowISO();

    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.icon !== undefined) {
      updates.push('icon = ?');
      values.push(data.icon ?? null);
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await db.runAsync(
      `UPDATE zones SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    set((state) => ({
      zones: state.zones.map((zone) =>
        zone.id === id ? { ...zone, ...data, updated_at: now } : zone
      ),
    }));
  },

  deleteZone: async (id: string) => {
    const db = getDatabase();
    await db.runAsync('DELETE FROM zones WHERE id = ?', [id]);
    set((state) => ({
      zones: state.zones.filter((zone) => zone.id !== id),
    }));
  },

  getZoneById: (id: string) => {
    return get().zones.find((zone) => zone.id === id);
  },

  getZonesByLieu: (lieuId: string) => {
    return get().zones.filter((zone) => zone.lieu_id === lieuId);
  },
}));
