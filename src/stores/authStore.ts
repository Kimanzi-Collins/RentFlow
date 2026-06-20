import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile, UserRole } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════════════════
// AUTH STORE
// Manages authentication state with Supabase Auth + profile data
// Falls back to demo mode when Supabase isn't configured
// ═══════════════════════════════════════════════════════════════════════════

interface AuthState {
  /** Supabase auth user */
  user: User | null;
  /** Supabase session */
  session: Session | null;
  /** User's profile from the profiles table */
  profile: Profile | null;
  /** Whether auth state has been initialized */
  initialized: boolean;
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Whether running in demo mode (no Supabase) */
  isDemoMode: boolean;

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

/** Demo profile for development without Supabase */
const DEMO_PROFILE: Profile = {
  id: 'demo-user-id',
  auth_id: 'demo-auth-id',
  email: 'bruce@rentflow.co.ke',
  full_name: 'Bruce Mwikya',
  phone: '+254 712 345 678',
  role: 'landlord',
  avatar_url: undefined,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      initialized: false,
      loading: false,
      error: null,
      isDemoMode: !isSupabaseConfigured(),

      initialize: async () => {
        const { isDemoMode } = get();

        if (isDemoMode) {
          // In demo mode, check if user has previously "signed in"
          const demoAuth = localStorage.getItem('rentflow-auth');
          if (demoAuth === 'true') {
            set({
              profile: DEMO_PROFILE,
              initialized: true,
              loading: false,
            });
          } else {
            set({ initialized: true, loading: false });
          }
          return;
        }

        set({ loading: true });

        try {
          // Get current session
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) throw error;

          if (session?.user) {
            set({ user: session.user, session });
            // Fetch profile
            await get().fetchProfile();
          }

          // Listen for auth state changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            set({ user: session?.user ?? null, session });

            if (event === 'SIGNED_IN' && session?.user) {
              await get().fetchProfile();
            }

            if (event === 'SIGNED_OUT') {
              set({ profile: null });
            }
          });
        } catch (err) {
          console.error('Auth initialization error:', err);
          set({ error: (err as Error).message });
        } finally {
          set({ initialized: true, loading: false });
        }
      },

      signIn: async (email: string, password: string) => {
        const { isDemoMode } = get();

        if (isDemoMode) {
          // Demo mode sign in — accept any credentials
          localStorage.setItem('rentflow-auth', 'true');
          set({ profile: DEMO_PROFILE, error: null });
          return {};
        }

        set({ loading: true, error: null });

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          set({ user: data.user, session: data.session });
          await get().fetchProfile();
          return {};
        } catch (err) {
          const message = (err as Error).message;
          set({ error: message, loading: false });
          return { error: message };
        } finally {
          set({ loading: false });
        }
      },

      signUp: async (email: string, password: string, fullName: string, role: UserRole) => {
        const { isDemoMode } = get();

        if (isDemoMode) {
          localStorage.setItem('rentflow-auth', 'true');
          set({
            profile: { ...DEMO_PROFILE, email, full_name: fullName, role },
            error: null,
          });
          return {};
        }

        set({ loading: true, error: null });

        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                role,
              },
            },
          });

          if (error) throw error;

          // Profile is auto-created by the database trigger (handle_new_user)
          if (data.user) {
            set({ user: data.user, session: data.session });

            // Wait briefly for the trigger to create the profile
            await new Promise(resolve => setTimeout(resolve, 1000));
            await get().fetchProfile();
          }

          return {};
        } catch (err) {
          const message = (err as Error).message;
          set({ error: message, loading: false });
          return { error: message };
        } finally {
          set({ loading: false });
        }
      },

      signOut: async () => {
        const { isDemoMode } = get();

        if (isDemoMode) {
          localStorage.removeItem('rentflow-auth');
          set({ profile: null, user: null, session: null, error: null });
          return;
        }

        try {
          await supabase.auth.signOut();
          set({ user: null, session: null, profile: null, error: null });
        } catch (err) {
          console.error('Sign out error:', err);
        }
      },

      fetchProfile: async () => {
        const { user, isDemoMode } = get();

        if (isDemoMode) return;
        if (!user) return;

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('auth_id', user.id)
            .single();

          if (error) throw error;

          set({ profile: data as Profile });
        } catch (err) {
          console.error('Failed to fetch profile:', err);
        }
      },

      updateProfile: async (updates: Partial<Profile>) => {
        const { profile, isDemoMode } = get();

        if (isDemoMode) {
          set({ profile: profile ? { ...profile, ...updates } : null });
          return {};
        }

        if (!profile) return { error: 'No profile found' };

        try {
          const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', profile.id);

          if (error) throw error;

          set({ profile: { ...profile, ...updates } });
          return {};
        } catch (err) {
          const message = (err as Error).message;
          return { error: message };
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'rentflow-auth',
      partialize: (state) => ({
        // Only persist minimal data
        isDemoMode: state.isDemoMode,
      }),
    }
  )
);

// ── Selectors ───────────────────────────────────────────────────────────────

/** Check if user is authenticated */
export const useIsAuthenticated = () =>
  useAuthStore((state) => !!(state.profile || state.user));

/** Get user's role */
export const useUserRole = () =>
  useAuthStore((state) => state.profile?.role ?? null);

/** Check if user is a landlord */
export const useIsLandlord = () =>
  useAuthStore((state) => state.profile?.role === 'landlord');

/** Check if user is a caretaker */
export const useIsCaretaker = () =>
  useAuthStore((state) => state.profile?.role === 'caretaker');
