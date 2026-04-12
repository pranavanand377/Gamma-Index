import { create } from 'zustand';

const STORAGE_KEY = 'gamma-index-items';

const loadFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const useMediaStore = create((set, get) => ({
  items: loadFromStorage(),

  addItem: (item) => {
    const newItem = {
      ...item,
      id: crypto.randomUUID(),
      addedAt: new Date().toISOString(),
      lastWatched: new Date().toISOString(),
    };
    const updated = [newItem, ...get().items];
    saveToStorage(updated);
    set({ items: updated });
    return newItem;
  },

  updateItem: (id, updates) => {
    const updated = get().items.map((item) =>
      item.id === id ? { ...item, ...updates, lastWatched: new Date().toISOString() } : item
    );
    saveToStorage(updated);
    set({ items: updated });
  },

  deleteItem: (id) => {
    const updated = get().items.filter((item) => item.id !== id);
    saveToStorage(updated);
    set({ items: updated });
  },

  getItemsByType: (type) => get().items.filter((item) => item.type === type),

  getItemsByStatus: (status) => get().items.filter((item) => item.status === status),
}));

export default useMediaStore;
