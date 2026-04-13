import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Film,
  BookOpen,
  Tv,
  Heart,
  Clock,
  CheckCircle,
  List,
  Monitor,
  ChevronDown,
  X,
} from 'lucide-react';
import useMediaStore from '../../store/useMediaStore';

const sidebarSections = [
  {
    title: 'Menu',
    items: [
      { icon: Home, label: 'Dashboard', path: '/' },
      { icon: List, label: 'My List', path: '/my-list' },
      { icon: Clock, label: 'My Library', path: '/my-library' },
    ],
  },
  {
    title: 'Library',
    items: [
      { icon: Tv, label: 'Anime', path: '/library/anime', countKey: 'anime' },
      { icon: Monitor, label: 'TV Series', path: '/library/tv', countKey: 'tv' },
      { icon: BookOpen, label: 'Comics', path: '/library/comics', countKey: 'comic' },
      { icon: Film, label: 'Movies', path: '/library/movies', countKey: 'movie' },
    ],
  },
  {
    title: 'Status',
    items: [
      { icon: Clock, label: 'Watching', path: '/status/watching', statusKey: 'watching', dotColor: 'bg-gamma-400' },
      { icon: CheckCircle, label: 'Completed', path: '/status/completed', statusKey: 'completed', dotColor: 'bg-status-success' },
      { icon: Heart, label: 'Favorites', path: '/status/favorites', statusKey: 'favorites', dotColor: 'bg-accent-pink' },
    ],
  },
];

const SidebarSection = ({ section, collapsed, onSelect }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mb-2">
      {!collapsed && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
        >
          {section.title}
          <motion.div
            animate={{ rotate: expanded ? 0 : -90 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={12} />
          </motion.div>
        </button>
      )}

      <AnimatePresence initial={false}>
        {(expanded || collapsed) && (
          <motion.div
            initial={collapsed ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {section.items.map((item) => (
              <SidebarItem key={item.path} item={item} collapsed={collapsed} onSelect={onSelect} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SidebarItem = ({ item, collapsed, onSelect }) => {
  const { icon: Icon, label, path, countKey, statusKey, dotColor } = item;
  const navigate = useNavigate();
  const location = useLocation();
  const items = useMediaStore((s) => s.items);

  const active = location.pathname === path;

  // Compute dynamic count
  let count;
  if (countKey) {
    count = items.filter((i) => i.type === countKey).length;
  } else if (statusKey === 'favorites') {
    count = items.filter((i) => i.isFavorite).length;
  } else if (statusKey) {
    count = items.filter((i) => i.status === statusKey).length;
  }

  return (
    <button
      onClick={() => {
        navigate(path);
        onSelect?.();
      }}
      className={`w-full group flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all duration-200 relative cursor-pointer ${
        active
          ? 'text-gamma-400 bg-gamma-500/10'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-overlay/50'
      } ${collapsed ? 'justify-center mx-1 px-2' : ''}`}
      title={collapsed ? label : undefined}
    >
      <div className="relative">
        <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
        {dotColor && !collapsed && (
          <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${dotColor}`} />
        )}
      </div>

      {!collapsed && (
        <>
          <span className="flex-1 text-left">{label}</span>
          {count !== undefined && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                active
                  ? 'bg-gamma-500/20 text-gamma-300'
                  : 'bg-surface-overlay text-text-muted group-hover:text-text-secondary'
              }`}
            >
              {count}
            </span>
          )}
        </>
      )}


    </button>
  );
};

const QuickStats = () => {
  const items = useMediaStore((s) => s.items);
  const total = items.length;
  const watching = items.filter((i) => i.status === 'watching').length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 border-t border-surface-border"
    >
      <div className="rounded-xl bg-gradient-to-br from-gamma-500/10 to-accent-cyan/5 border border-surface-border p-4">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
          Quick Stats
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xl font-bold text-gamma-400">{total}</p>
            <p className="text-[11px] text-text-muted">Total Titles</p>
          </div>
          <div>
            <p className="text-xl font-bold text-accent-cyan">{watching}</p>
            <p className="text-[11px] text-text-muted">Watching</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SidebarContent = ({ collapsed, onSelect, showQuickStats = true }) => (
  <>
    <div className="flex-1 overflow-y-auto py-4 space-y-1">
      {sidebarSections.map((section) => (
        <SidebarSection key={section.title} section={section} collapsed={collapsed} onSelect={onSelect} />
      ))}
    </div>

    {showQuickStats && !collapsed && <QuickStats />}
  </>
);

const Sidebar = ({ mobileOpen, onClose }) => {
  const [hovered, setHovered] = useState(false);
  const collapsed = !hovered;

  return (
    <>
      <motion.aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        initial={false}
        animate={{
          width: hovered ? 256 : 68,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="hidden h-full shrink-0 overflow-hidden border-r border-surface-border bg-surface-raised/50 md:flex md:flex-col"
      >
        <SidebarContent collapsed={collapsed} onSelect={null} showQuickStats={hovered} />
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm md:hidden"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-label="Close navigation menu"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="fixed inset-y-0 left-0 z-[80] flex w-72 max-w-[85vw] flex-col border-r border-surface-border bg-surface-raised md:hidden"
            >
              <div className="flex items-center justify-between border-b border-surface-border px-4 py-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Navigation</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-2 text-text-secondary transition-colors hover:bg-surface-overlay hover:text-text-primary"
                  aria-label="Close navigation menu"
                >
                  <X size={18} />
                </button>
              </div>
              <SidebarContent collapsed={false} onSelect={onClose} showQuickStats />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
