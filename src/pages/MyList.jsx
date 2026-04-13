import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Download, Heart, ChevronDown, Check } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import useMediaStore from '../store/useMediaStore';
import useAuthStore from '../store/useAuthStore';
import useToastStore from '../store/useToastStore';
import MediaCard from '../components/features/MediaCard';
import AddRecordModal from '../components/features/AddRecordModal';
import PageLoader from '../components/common/PageLoader';
import { sortItems, sortOptions } from '../utils/sorting';
import { filterItems } from '../utils/filtering';
import { exportToCSV } from '../utils/export';

const MyList = () => {
  const items = useMediaStore((s) => s.items);
  const loading = useMediaStore((s) => s.loading);
  const deleteItem = useMediaStore((s) => s.deleteItem);
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFavoritesOnly, setIsFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-added-newest');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [focusedItemId, setFocusedItemId] = useState(null);
  const sortMenuRef = useRef(null);

  const focusId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('focus');
  }, [location.search]);

  const filteredItems = useMemo(() => {
    const filtered = filterItems(items, {
      type: filterType,
      status: filterStatus,
      isFavoritesOnly: isFavoritesOnly,
      searchQuery: searchQuery,
    });
    return sortItems(filtered, sortBy);
  }, [items, filterType, filterStatus, isFavoritesOnly, searchQuery, sortBy]);

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (user) {
      await deleteItem(user.id, id);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  useEffect(() => {
    if (!focusId) return;

    setFilterType('all');
    setFilterStatus('all');
    setSearchQuery('');
    setFocusedItemId(focusId);

    const scrollTimer = setTimeout(() => {
      const target = document.getElementById(`media-card-${focusId}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);

    const clearTimer = setTimeout(() => {
      setFocusedItemId(null);
    }, 2200);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(clearTimer);
    };
  }, [focusId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setSortMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (loading) {
    return <PageLoader title="Loading My List" subtitle="Syncing your tracked records" />;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My List</h1>
          <p className="text-sm text-text-secondary mt-1">
            {items.length} {items.length === 1 ? 'title' : 'titles'} tracked
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gamma-500 px-4 py-2.5 text-sm font-semibold text-surface-base transition-colors hover:bg-gamma-400 sm:w-auto"
        >
          <Plus size={18} />
          Add Record
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative w-full lg:max-w-sm lg:flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Filter by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-overlay/50 border border-surface-border rounded-lg pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-gamma-500/50 transition-all"
          />
        </div>

        {/* Sort dropdown */}
        <div className="relative" ref={sortMenuRef}>
          <button
            type="button"
            onClick={() => setSortMenuOpen((prev) => !prev)}
            className="inline-flex min-w-44 items-center justify-between gap-2 rounded-lg border border-surface-border bg-surface-overlay/30 px-3 py-2 text-xs font-medium text-text-secondary transition-all hover:text-text-primary hover:border-gamma-500/30"
            aria-haspopup="listbox"
            aria-expanded={sortMenuOpen}
          >
            <span className="truncate">Sort: {sortOptions.find((opt) => opt.value === sortBy)?.label}</span>
            <ChevronDown size={14} className={`transition-transform ${sortMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {sortMenuOpen && (
            <div className="absolute left-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-xl border border-surface-border bg-surface-raised shadow-2xl">
              <div className="max-h-64 overflow-y-auto p-1.5">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.value);
                      setSortMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                      sortBy === opt.value
                        ? 'bg-gamma-500/10 text-gamma-300'
                        : 'text-text-secondary hover:bg-surface-overlay/70 hover:text-text-primary'
                    }`}
                    role="option"
                    aria-selected={sortBy === opt.value}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.value ? <Check size={14} /> : null}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Export button */}
        <button
          onClick={() => {
            exportToCSV(filteredItems);
            addToast('Library exported successfully', 'success');
          }}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-surface-overlay/30 border border-surface-border text-text-secondary hover:text-gamma-400 hover:border-gamma-500/30 transition-all"
          title="Export library as CSV"
        >
          <Download size={14} />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      {/* Type & Status Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Type filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <Filter size={14} className="text-text-muted shrink-0" />
          {['all', 'anime', 'tv', 'movie', 'comic'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterType === t
                  ? 'bg-gamma-500/10 text-gamma-400 border border-gamma-500/50'
                  : 'bg-surface-overlay/30 text-text-muted border border-transparent hover:text-text-secondary'
              }`}
            >
              {t === 'all' ? 'All' : t === 'tv' ? 'TV' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {['all', 'watching', 'completed', 'dropped', 'plan_to_watch'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterStatus === s
                  ? 'bg-gamma-500/10 text-gamma-400 border border-gamma-500/50'
                  : 'bg-surface-overlay/30 text-text-muted border border-transparent hover:text-text-secondary'
              }`}
            >
              {s === 'all' ? 'All' : s === 'plan_to_watch' ? 'Planned' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Favorites filter */}
        <button
          onClick={() => setIsFavoritesOnly(!isFavoritesOnly)}
          className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            isFavoritesOnly
              ? 'bg-accent-pink/10 text-accent-pink border border-accent-pink/50'
              : 'bg-surface-overlay/30 text-text-muted border border-transparent hover:text-text-secondary'
          }`}
        >
          <Heart size={12} className={isFavoritesOnly ? 'fill-accent-pink' : ''} />
          Favorites
        </button>
      </div>

      {/* Cards grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                id={`media-card-${item.id}`}
                className={`rounded-xl transition-all duration-500 ${
                  focusedItemId === item.id ? 'ring-2 ring-gamma-500/80 ring-offset-2 ring-offset-surface-base' : ''
                }`}
              >
                <MediaCard
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-gamma-500/10 flex items-center justify-center mb-4">
            <span className="text-4xl">📋</span>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            {items.length === 0 ? 'Your list is empty' : 'No matches found'}
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            {items.length === 0
              ? 'Add your first anime, movie, or comic to start tracking!'
              : 'Try adjusting your filters or search term.'}
          </p>
          {items.length === 0 && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gamma-500 text-surface-base font-semibold text-sm hover:bg-gamma-400 transition-colors cursor-pointer"
            >
              <Plus size={18} />
              Add Your First Record
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      <AddRecordModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        editItem={editingItem}
      />
    </div>
  );
};

export default MyList;
