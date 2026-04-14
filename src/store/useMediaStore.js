import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { logError, extractError } from '../services/errorLogger';

const DB_TIMEOUT_MS = 15000;

const withDbTimeout = async (queryPromise, timeoutMs = DB_TIMEOUT_MS) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Database request timed out. Please try again.')), timeoutMs)
  );
  return Promise.race([queryPromise, timeoutPromise]);
};

const mapDbToApp = (row) => ({
  ...row,
  comicSubtype: row.comic_subtype,
  apiId: row.api_id,
  totalEpisodes: row.total_episodes,
  currentEpisode: row.current_episode,
  watchLink: row.watch_link,
  lastWatched: row.last_watched,
  isFavorite: row.is_favorite ?? false,
});

const mapAppToDb = (item) => ({
  type: item.type,
  comic_subtype: item.comicSubtype ?? item.comic_subtype ?? null,
  api_id: item.apiId ?? item.api_id ?? null,
  title: item.title,
  image: item.image ?? null,
  synopsis: item.synopsis ?? null,
  total_episodes: item.totalEpisodes ?? item.total_episodes ?? null,
  year: item.year ?? null,
  genres: item.genres ?? null,
  score: item.score ?? null,
  status: item.status ?? null,
  current_episode: item.currentEpisode ?? item.current_episode ?? 0,
  season: item.season ?? null,
  rating: item.rating ?? null,
  watch_link: (() => {
    const url = item.watchLink ?? item.watch_link ?? null;
    if (!url) return null;
    const trimmed = String(url).trim();
    return trimmed.length > 0 ? trimmed : null;
  })(),
  notes: item.notes ?? null,
  is_favorite: item.isFavorite ?? item.is_favorite ?? false,
});

const mapUpdateToDb = (updates) => {
  const db = {};
  if ('type' in updates) db.type = updates.type;
  if ('comicSubtype' in updates || 'comic_subtype' in updates) db.comic_subtype = updates.comicSubtype ?? updates.comic_subtype ?? null;
  if ('apiId' in updates || 'api_id' in updates) db.api_id = updates.apiId ?? updates.api_id ?? null;
  if ('title' in updates) db.title = updates.title;
  if ('image' in updates) db.image = updates.image ?? null;
  if ('synopsis' in updates) db.synopsis = updates.synopsis ?? null;
  if ('totalEpisodes' in updates || 'total_episodes' in updates) db.total_episodes = updates.totalEpisodes ?? updates.total_episodes ?? null;
  if ('year' in updates) db.year = updates.year ?? null;
  if ('genres' in updates) db.genres = updates.genres ?? null;
  if ('score' in updates) db.score = updates.score ?? null;
  if ('status' in updates) db.status = updates.status ?? null;
  if ('currentEpisode' in updates || 'current_episode' in updates) db.current_episode = updates.currentEpisode ?? updates.current_episode ?? 0;
  if ('season' in updates) db.season = updates.season ?? null;
  if ('rating' in updates) db.rating = updates.rating ?? null;
  if ('watchLink' in updates || 'watch_link' in updates) db.watch_link = updates.watchLink ?? updates.watch_link ?? null;
  if ('notes' in updates) db.notes = updates.notes ?? null;
  if ('isFavorite' in updates || 'is_favorite' in updates) db.is_favorite = updates.isFavorite ?? updates.is_favorite ?? false;
  return db;
};

// Legacy localStorage migration helper
const STORAGE_KEY = 'gamma-index-items';
export const getLegacyItems = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};
export const clearLegacyItems = () => localStorage.removeItem(STORAGE_KEY);

const useMediaStore = create((set, get) => ({
  items: [],
  loading: true,
  user: null,

  setUser: (user) => set({ user }),

  fetchItems: async (userId) => {
    set({ loading: true });
    try {
      const { data, error } = await withDbTimeout(
        supabase
          .from('items')
          .select('*')
          .eq('user_id', userId)
          .order('added_at', { ascending: false })
      );

      if (error) throw error;
      set({ items: (data || []).map(mapDbToApp), loading: false });
    } catch (err) {
      console.error('[useMediaStore] fetchItems error:', err);
      logError({ errorType: 'api', ...extractError(err), source: 'useMediaStore.fetchItems' });
      set({ loading: false });
    }
  },

  addItem: async (userId, item) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newItem = {
      id,
      user_id: userId,
      ...mapAppToDb(item),
      added_at: now,
      last_watched: now,
      updated_at: now,
    };

    try {
      const { data, error } = await withDbTimeout(
        supabase
          .from('items')
          .insert([newItem])
          .select()
          .single()
      );

      if (error) {
        const errMsg = `Supabase insert failed: ${error.message || error.code || 'unknown error'}`;
        console.error('[useMediaStore] addItem supabase error:', errMsg, { error, newItem });
        throw new Error(errMsg);
      }
      const inserted = mapDbToApp(data || newItem);
      set({ items: [inserted, ...get().items] });
      return inserted;
    } catch (err) {
      console.error('[useMediaStore] addItem error:', err, { item: newItem });
      logError({ errorType: 'api', ...extractError(err), source: 'useMediaStore.addItem', metadata: { watchLink: newItem.watch_link } });
      throw err;
    }
  },

  updateItem: async (userId, id, updates) => {
    const dbUpdates = {
      ...mapUpdateToDb(updates),
      last_watched: new Date().toISOString(),
    };

    try {
      const { data, error } = await withDbTimeout(
        supabase
          .from('items')
          .update(dbUpdates)
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single()
      );

      if (error) {
        const errMsg = `Supabase update failed: ${error.message || error.code || 'unknown error'}`;
        console.error('[useMediaStore] updateItem supabase error:', errMsg, { error, id, dbUpdates });
        throw new Error(errMsg);
      }

      const updatedItem = mapDbToApp(data);

      set({
        items: get().items.map((item) =>
          item.id === id ? updatedItem : item
        ),
      });
    } catch (err) {
      console.error('[useMediaStore] updateItem error:', err, { id, updates });
      logError({ errorType: 'api', ...extractError(err), source: 'useMediaStore.updateItem', metadata: { watchLink: dbUpdates.watch_link } });
      throw err;
    }
  },

  deleteItem: async (userId, id) => {
    try {
      const { error } = await withDbTimeout(
        supabase
          .from('items')
          .delete()
          .eq('id', id)
          .eq('user_id', userId)
      );

      if (error) throw error;
      set({ items: get().items.filter((item) => item.id !== id) });
    } catch (err) {
      console.error('[useMediaStore] deleteItem error:', err);
      logError({ errorType: 'api', ...extractError(err), source: 'useMediaStore.deleteItem' });
      throw err;
    }
  },

  getItemsByType: (type) => get().items.filter((item) => item.type === type),
  getItemsByStatus: (status) => get().items.filter((item) => item.status === status),
}));

export default useMediaStore;
