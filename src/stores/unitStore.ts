import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Unit {
  id: number;
  unit_number: string;
  property: string;
  type: string;
  rent_amount: number;
  status: 'occupied' | 'vacant' | 'maintenance';
  tenant?: string;
}

const SEED: Unit[] = [
  { id:  1, unit_number: 'A-101', property: 'Serra Apartments',  type: 'Residential', rent_amount: 35000, status: 'occupied',    tenant: 'Grace Wanjiku'  },
  { id:  2, unit_number: 'A-102', property: 'Serra Apartments',  type: 'Residential', rent_amount: 32000, status: 'occupied',    tenant: 'John Kamau'    },
  { id:  3, unit_number: 'A-103', property: 'Serra Apartments',  type: 'Residential', rent_amount: 32000, status: 'vacant'                               },
  { id:  4, unit_number: 'A-104', property: 'Serra Apartments',  type: 'Residential', rent_amount: 18000, status: 'occupied',    tenant: 'James Mwangi'  },
  { id:  5, unit_number: 'B-102', property: 'Serra Apartments',  type: 'Residential', rent_amount: 30000, status: 'occupied',    tenant: 'Samuel Njoroge'},
  { id:  6, unit_number: 'B-203', property: 'Serra Apartments',  type: 'Residential', rent_amount: 38000, status: 'vacant'                               },
  { id:  7, unit_number: 'B-204', property: 'Serra Apartments',  type: 'Residential', rent_amount: 45000, status: 'occupied',    tenant: 'Peter Ochieng' },
  { id:  8, unit_number: 'C-301', property: 'SOJAG Head Office', type: 'Commercial',  rent_amount: 25000, status: 'occupied',    tenant: 'Fatuma Hassan' },
  { id:  9, unit_number: 'C-302', property: 'SOJAG Head Office', type: 'Commercial',  rent_amount: 25000, status: 'vacant'                               },
  { id: 10, unit_number: 'D-401', property: 'LSU Logistics',     type: 'Industrial',  rent_amount: 85000, status: 'maintenance'                          },
];

interface UnitState {
  units: Unit[];
  addUnit:    (u: Omit<Unit, 'id'>) => void;
  updateUnit: (id: number, updates: Partial<Unit>) => void;
  removeUnit: (id: number) => void;
}

export const useUnitStore = create<UnitState>()(
  persist(
    (set, get) => ({
      units: SEED,
      addUnit: (u) => {
        const newId = Math.max(0, ...get().units.map(x => x.id)) + 1;
        set(s => ({ units: [...s.units, { ...u, id: newId }] }));
      },
      updateUnit: (id, updates) =>
        set(s => ({ units: s.units.map(u => u.id === id ? { ...u, ...updates } : u) })),
      removeUnit: (id) =>
        set(s => ({ units: s.units.filter(u => u.id !== id) })),
    }),
    { name: 'rentflow-units-v1' }
  )
);
