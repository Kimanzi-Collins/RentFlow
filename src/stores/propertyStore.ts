import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Property {
  id: number;
  name: string;
  address: string;
  type: string;
  total_units: number;
  occupied: number;
  description?: string;
}

const SEED: Property[] = [
  { id: 1, name: 'Serra Apartments',  address: 'Westlands, Nairobi',       type: 'Residential', total_units: 45, occupied: 41 },
  { id: 2, name: 'SOJAG Head Office', address: 'Upper Hill, Nairobi',       type: 'Commercial',  total_units: 12, occupied: 10 },
  { id: 3, name: 'LSU Logistics',     address: 'Industrial Area, Nairobi',  type: 'Industrial',  total_units: 8,  occupied: 6  },
];

interface PropertyState {
  properties: Property[];
  addProperty:    (p: Omit<Property, 'id'>) => void;
  updateProperty: (id: number, updates: Partial<Property>) => void;
  removeProperty: (id: number) => void;
}

export const usePropertyStore = create<PropertyState>()(
  persist(
    (set, get) => ({
      properties: SEED,
      addProperty: (p) => {
        const newId = Math.max(0, ...get().properties.map(x => x.id)) + 1;
        set(s => ({ properties: [...s.properties, { ...p, id: newId }] }));
      },
      updateProperty: (id, updates) =>
        set(s => ({ properties: s.properties.map(p => p.id === id ? { ...p, ...updates } : p) })),
      removeProperty: (id) =>
        set(s => ({ properties: s.properties.filter(p => p.id !== id) })),
    }),
    { name: 'rentflow-properties-v1' }
  )
);
