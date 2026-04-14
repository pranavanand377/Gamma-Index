import { useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Tv, Film, BookOpen, Monitor } from 'lucide-react';
import useMediaStore from '../store/useMediaStore';
import useAuthStore from '../store/useAuthStore';
import MediaCard from '../components/features/MediaCard';
import AddRecordModal from '../components/features/AddRecordModal';
import PageLoader from '../components/common/PageLoader';

const typeConfig = {
  anime: { label: 'Anime', icon: Tv, type: 'anime' },
  comics: { label: 'Comics', icon: BookOpen, type: 'comic' },
  movies: { label: 'Movies', icon: Film, type: 'movie' },
  tv: { label: 'TV Series', icon: Monitor, type: 'tv' },
};

const statusConfig = {
  watching: { label: 'Watching', emoji: '📺' },
  completed: { label: 'Completed', emoji: '✅' },
  favorites: { label: 'Highly Rated', emoji: '❤️' },
};

const FilteredPage = ({ mode }) => {
  const { filter } = useParams();
  const items = useMediaStore((s) => s.items);
  const loading = useMediaStore((s) => s.loading);
  const deleteItem = useMediaStore((s) => s.deleteItem);
  const user = useAuthStore((s) => s.user);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  let filteredItems = [];
  let title = '';
  let subtitle = '';

  if (mode === 'library') {
    const config = typeConfig[filter] || {};
    filteredItems = items.filter((i) => i.type === config.type);
    title = config.label || filter;
    subtitle = `${filteredItems.length} ${filteredItems.length === 1 ? 'title' : 'titles'}`;
  } else if (mode === 'status') {
    const config = statusConfig[filter] || {};
    if (filter === 'favorites') {
      filteredItems = items.filter((i) => i.isFavorite);
    } else {
      filteredItems = items.filter((i) => i.status === filter);
    }
    title = config.label || filter;
    subtitle = `${filteredItems.length} ${filteredItems.length === 1 ? 'title' : 'titles'}`;
  }

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

  if (loading) {
    return <PageLoader title="Loading Filtered View" subtitle="Applying filters to your library" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
        <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
      </div>

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
          <div className="w-16 h-16 rounded-2xl bg-gamma-500/10 flex items-center justify-center mb-3">
            <span className="text-3xl">
              {mode === 'status' ? statusConfig[filter]?.emoji || '📋' : '📁'}
            </span>
          </div>
          <p className="text-sm text-text-secondary">No titles here yet.</p>
        </div>
      )}

      <AddRecordModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        editItem={editingItem}
      />
    </div>
  );
};

export default FilteredPage;
