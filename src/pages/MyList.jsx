import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
import useMediaStore from '../store/useMediaStore';
import MediaCard from '../components/features/MediaCard';
import AddRecordModal from '../components/features/AddRecordModal';

const MyList = () => {
  const items = useMediaStore((s) => s.items);
  const deleteItem = useMediaStore((s) => s.deleteItem);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    deleteItem(id);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

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

        {/* Type filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <Filter size={14} className="text-text-muted" />
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
      </div>

      {/* Cards grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
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
