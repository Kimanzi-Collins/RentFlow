import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationSettings {
  overdueRent: boolean;
  maintenanceUpdates: boolean;
  newTenant: boolean;
  lowOccupancy: boolean;
}

interface SettingsState {
  notifications: NotificationSettings;
  updateNotifications: (updates: Partial<NotificationSettings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notifications: {
        overdueRent: true,
        maintenanceUpdates: true,
        newTenant: true,
        lowOccupancy: false,
      },
      updateNotifications: (updates) =>
        set((state) => ({
          notifications: { ...state.notifications, ...updates },
        })),
    }),
    {
      name: 'rentflow-settings',
    }
  )
);
