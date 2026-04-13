import { create } from 'zustand';
import { supabase } from '../services/supabase';

const DEFAULT_ADMIN_EMAIL = 'pranavanandv5@gmail.com';
const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).toLowerCase();

const isAdminEmail = (email) => {
  if (!email || !ADMIN_EMAIL) return false;
  return email.toLowerCase() === ADMIN_EMAIL;
};

const ensureOwnProfile = async (user) => {
  if (!user) return null;

  const role = isAdminEmail(user.email) ? 'admin' : 'user';
  const isAdmin = role === 'admin';

  const { data: existing, error: existingError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (existingError) throw existingError;

  if (!existing) {
    const insertPayload = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || null,
      role,
      approved: isAdmin,
      disabled: false,
    };

    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert(insertPayload);

    if (insertError) throw insertError;
  } else if (isAdmin && (existing.role !== 'admin' || !existing.approved || existing.disabled)) {
    const { error: promoteError } = await supabase
      .from('user_profiles')
      .update({
        role: 'admin',
        approved: true,
        approved_at: existing.approved_at || new Date().toISOString(),
        disabled: false,
      })
      .eq('id', user.id);

    if (promoteError) throw promoteError;
  }

  const { data, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) throw profileError;
  return data;
};

const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  profileLoading: true,
  error: null,

  init: async () => {
    set({ loading: true, profileLoading: true });

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      const sessionUser = data.session?.user || null;

      if (!sessionUser) {
        set({ user: null, profile: null, isAdmin: false, loading: false, profileLoading: false });
      } else {
        const profile = await ensureOwnProfile(sessionUser);
        set({
          user: sessionUser,
          profile,
          isAdmin: profile?.role === 'admin' || isAdminEmail(sessionUser.email),
          loading: false,
          profileLoading: false,
        });
      }
    } catch (err) {
      set({ error: err.message, loading: false, profileLoading: false });
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user || null;

      if (!nextUser) {
        set({ user: null, profile: null, isAdmin: false, loading: false, profileLoading: false });
        return;
      }

      try {
        const profile = await ensureOwnProfile(nextUser);
        set({
          user: nextUser,
          profile,
          isAdmin: profile?.role === 'admin' || isAdminEmail(nextUser.email),
          loading: false,
          profileLoading: false,
        });
      } catch (err) {
        set({ error: err.message, loading: false, profileLoading: false });
      }
    });
  },

  refreshProfile: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ profileLoading: true, error: null });
    try {
      const profile = await ensureOwnProfile(user);
      set({ profile, isAdmin: profile?.role === 'admin' || isAdminEmail(user.email), profileLoading: false });
    } catch (err) {
      set({ error: err.message, profileLoading: false });
    }
  },

  signInWithGoogle: async () => {
    set({ error: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  signUpWithEmail: async (email, password) => {
    set({ error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  signInWithEmail: async (email, password) => {
    set({ error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      const profile = await ensureOwnProfile(data.user);
      set({ user: data.user, profile, isAdmin: profile?.role === 'admin' || isAdminEmail(data.user.email) });
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  resetPasswordRequest: async (email) => {
    set({ error: null });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  resetPassword: async (password) => {
    set({ error: null });
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  changePassword: async (newPassword) => {
    set({ error: null });
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  fetchAllUsersForApproval: async () => {
    set({ error: null });
    try {
      const { isAdmin } = useAuthStore.getState();
      if (!isAdmin) return [];

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  updateUserApproval: async (userId, approved) => {
    set({ error: null });
    try {
      const { isAdmin } = useAuthStore.getState();
      if (!isAdmin) throw new Error('Admin access required.');

      const { error } = await supabase
        .from('user_profiles')
        .update({ approved, approved_at: approved ? new Date().toISOString() : null })
        .eq('id', userId);

      if (error) throw error;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  updateUserDisabled: async (userId, disabled) => {
    set({ error: null });
    try {
      const { isAdmin } = useAuthStore.getState();
      if (!isAdmin) throw new Error('Admin access required.');

      const { error } = await supabase
        .from('user_profiles')
        .update({ disabled })
        .eq('id', userId);

      if (error) throw error;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),

  signOut: async () => {
    set({ error: null });
    try {
      await supabase.auth.signOut();
      set({ user: null, profile: null, isAdmin: false });
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },
}));

export default useAuthStore;
