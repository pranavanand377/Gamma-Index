import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  Pencil,
  Trash2,
  Star,
  Heart,
  Tv,
  Film,
  BookOpen,
  Monitor,
  Minus,
  Plus,
} from 'lucide-react';
import useMediaStore from '../../store/useMediaStore';
import useAuthStore from '../../store/useAuthStore';
import useToastStore from '../../store/useToastStore';
import ConfirmDeleteModal from '../common/ConfirmDeleteModal';

const typeIcons = {
  anime: Tv,
  tv: Monitor,
  movie: Film,
  comic: BookOpen,
};

const statusColors = {
  watching: 'bg-gamma-500 text-surface-base',
  completed: 'bg-status-success text-surface-base',
  dropped: 'bg-status-error text-white',
  plan_to_watch: 'bg-accent-amber text-surface-base',
};

const statusLabels = {
  watching: 'Watching',
  completed: 'Completed',
  dropped: 'Dropped',
  plan_to_watch: 'Plan to Watch',
};

const MediaCard = ({ item, onEdit, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const updateItem = useMediaStore((s) => s.updateItem);
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);

  const handleConfirmDelete = async () => {
    try {
      await onDelete(item.id);
      addToast(`Deleted "${item.title}"`, 'success');
    } catch {
      addToast(`Failed to delete "${item.title}"`, 'error');
    }
    setDeleteConfirmOpen(false);
  };

  const TypeIcon = typeIcons[item.type] || Film;
  const hasEpisodes = item.type !== 'movie';
  const episodeLabel = item.type === 'comic' ? 'Ch.' : 'Ep.';
  const trackingLabel = item.type === 'tv'
    ? `S${item.season || 1} · ${episodeLabel} ${item.currentEpisode || 0}${item.totalEpisodes ? ` / ${item.totalEpisodes}` : ''}`
    : `${episodeLabel} ${item.currentEpisode || 0}${item.totalEpisodes ? ` / ${item.totalEpisodes}` : ''}`;

  const handleEpisodeChange = async (delta) => {
    if (!user) return;
    const newEp = Math.max(0, (item.currentEpisode || 0) + delta);
    if (item.totalEpisodes && newEp > item.totalEpisodes) return;
    try {
      await updateItem(user.id, item.id, { currentEpisode: newEp });
    } catch {
      addToast('Failed to update episode', 'error');
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) return;
    try {
      await updateItem(user.id, item.id, { isFavorite: !item.isFavorite });
      addToast(item.isFavorite ? `Removed "${item.title}" from favorites` : `Added "${item.title}" to favorites`, 'success');
    } catch {
      addToast('Failed to update favorite status', 'error');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative rounded-xl bg-surface-raised border border-surface-border overflow-hidden transition-all duration-300 hover:border-gamma-500/30 hover:shadow-lg hover:shadow-gamma-500/5"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-surface-overlay flex items-center justify-center">
            <TypeIcon size={40} className="text-text-muted" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-base/90 via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusColors[item.status]}`}>
            {statusLabels[item.status]}
          </span>
        </div>

        {/* Top-right badges */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          <button
            onClick={handleToggleFavorite}
            className={`p-1.5 rounded-lg backdrop-blur-sm transition-colors ${
              item.isFavorite
                ? 'bg-accent-pink/20 text-accent-pink'
                : 'bg-surface-base/60 text-text-secondary hover:text-accent-pink'
            }`}
            title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={14} className={item.isFavorite ? 'fill-accent-pink' : ''} />
          </button>
          <div className="p-1.5 rounded-lg bg-surface-base/60 backdrop-blur-sm">
            <TypeIcon size={14} className="text-text-secondary" />
          </div>
        </div>

        {/* Action buttons — always visible on mobile, hover-reveal on desktop */}
        <motion.div
          initial={false}
          animate={{ opacity: hovered ? 1 : 0 }}
          className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-100 pointer-events-auto md:opacity-0 md:pointer-events-none md:group-hover:opacity-100 md:group-hover:pointer-events-auto transition-opacity"
          style={{ top: '2.5rem' }}
        >
          {item.watchLink && (
            <a
              href={item.watchLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-surface-base/80 backdrop-blur-sm text-gamma-400 hover:bg-gamma-500 hover:text-surface-base transition-all cursor-pointer"
              title="Watch / Read"
            >
              <ExternalLink size={14} />
            </a>
          )}
          <button
            onClick={() => onEdit(item)}
            className="p-2 rounded-lg bg-surface-base/80 backdrop-blur-sm text-text-secondary hover:bg-accent-cyan hover:text-surface-base transition-all cursor-pointer"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setDeleteConfirmOpen(true)}
            className="p-2 rounded-lg bg-surface-base/80 backdrop-blur-sm text-text-secondary hover:bg-status-error hover:text-white transition-all cursor-pointer"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </motion.div>

        {/* Bottom info on image */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-semibold text-text-primary truncate">{item.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            {item.year && <span className="text-[11px] text-text-secondary">{item.year}</span>}
            {item.rating > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-accent-amber">
                <Star size={10} className="fill-accent-amber" />
                {item.rating}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Episode tracker bar */}
      {hasEpisodes && (
        <div className="px-3 py-2.5 border-t border-surface-border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-muted">{trackingLabel}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleEpisodeChange(-1)}
                className="w-6 h-6 rounded-md bg-surface-overlay flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-border transition-colors cursor-pointer"
              >
                <Minus size={12} />
              </button>
              <button
                onClick={() => handleEpisodeChange(1)}
                className="w-6 h-6 rounded-md bg-surface-overlay flex items-center justify-center text-text-muted hover:text-gamma-400 hover:bg-gamma-500/10 transition-colors cursor-pointer"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
          {/* Progress bar */}
          {item.totalEpisodes > 0 && (
            <div className="mt-1.5 h-1 rounded-full bg-surface-overlay overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gamma-500"
                initial={false}
                animate={{
                  width: `${Math.min(100, ((item.currentEpisode || 0) / item.totalEpisodes) * 100)}%`,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>
          )}
        </div>
      )}

      {/* Footer with last updated timestamp */}
      <div className="px-3 py-2 border-t border-surface-border/50 bg-surface-overlay/30">
        <p className="text-[10px] text-text-muted">
          Last updated: {item.updated_at ? new Date(item.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
        </p>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
        itemTitle={item.title}
      />
    </motion.div>
  );
};

export default MediaCard;
