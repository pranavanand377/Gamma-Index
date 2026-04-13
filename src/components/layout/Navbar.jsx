import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  BookOpen,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import GammaLogo from '../common/GammaLogo';
import useAuthStore from '../../store/useAuthStore';
import useMediaStore from '../../store/useMediaStore';

const Navbar = ({ onOpenMobileMenu }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const items = useMediaStore((s) => s.items);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return items
      .filter((item) => item.title?.toLowerCase().includes(query))
      .slice(0, 6);
  }, [items, searchQuery]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, text: 'New episode of Attack on Titan released', time: '2h ago', unread: true },
    { id: 2, text: 'Your watchlist was updated', time: '5h ago', unread: true },
    { id: 3, text: 'Jujutsu Kaisen S3 is now airing', time: '1d ago', unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <nav className="relative z-50 flex flex-wrap items-center gap-y-3 border-b border-surface-border bg-surface-raised/80 px-4 py-3 backdrop-blur-xl md:h-16 md:flex-nowrap md:justify-between md:px-6 md:py-0">
      {/* ── Left: Logo ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-xl p-2 text-text-secondary transition-colors hover:bg-surface-overlay hover:text-text-primary md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2.5">
          <GammaLogo size={32} />
          <span className="text-lg font-bold tracking-tight hidden sm:block">
            <span className="gradient-text">Gamma</span>
            <span className="text-text-primary"> Index</span>
          </span>
        </div>
      </div>

      {/* ── Center: Search Bar ── */}
      <div className="order-3 w-full md:order-none md:flex-1 md:px-6">
        <motion.div
          ref={searchRef}
          className={`relative flex items-center rounded-xl transition-all duration-300 ${
            searchFocused
              ? 'bg-surface-overlay ring-1 ring-gamma-500/50 glow-green'
              : 'bg-surface-overlay/60'
          }`}
          style={{ maxWidth: '44rem', margin: '0 auto' }}
          animate={{ scale: searchFocused ? 1.02 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <Search
            size={18}
            className={`absolute left-3.5 transition-colors duration-200 ${
              searchFocused ? 'text-gamma-400' : 'text-text-muted'
            }`}
          />
          <input
            type="text"
            placeholder="Search anime, comics, movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              setSearchFocused(true);
              setSearchOpen(true);
            }}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-transparent pl-11 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchOpen(false);
              }}
              className="absolute right-3 p-0.5 rounded-md text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          )}

          {/* Search shortcut hint */}
          {!searchFocused && !searchQuery && (
            <div className="absolute right-3 hidden lg:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-medium text-text-muted bg-surface-base/60 border border-surface-border">
                ⌘K
              </kbd>
            </div>
          )}

          <AnimatePresence>
            {searchOpen && searchQuery.trim().length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.12 }}
                className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-surface-border bg-surface-raised shadow-2xl overflow-hidden"
              >
                {searchResults.length > 0 ? (
                  <div className="max-h-72 overflow-y-auto py-1">
                    {searchResults.map((item) => (
                      <Link
                        key={item.id}
                        to={`/my-list?focus=${encodeURIComponent(item.id)}`}
                        onClick={() => {
                          setSearchQuery(item.title);
                          setSearchOpen(false);
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-overlay/70 transition-colors"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-10 w-8 rounded object-cover bg-surface-overlay"
                          />
                        ) : (
                          <div className="h-10 w-8 rounded bg-surface-overlay" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{item.title}</p>
                          <p className="text-xs text-text-muted capitalize">{item.type}{item.status ? ` · ${item.status.replaceAll('_', ' ')}` : ''}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="px-4 py-3 text-sm text-text-muted">No matching records in your list.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Right: Notifications + Profile ── */}
  <div className="ml-auto flex items-center gap-1">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            className="relative p-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-overlay transition-all duration-200 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-gamma-500 text-[10px] font-bold flex items-center justify-center text-surface-base"
              >
                {unreadCount}
              </motion.span>
            )}
          </button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl bg-surface-raised border border-surface-border shadow-2xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
                  <span className="text-xs text-gamma-400 cursor-pointer hover:text-gamma-300">
                    Mark all read
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 border-b border-surface-border/50 hover:bg-surface-overlay/50 transition-colors cursor-pointer ${
                        notif.unread ? 'bg-gamma-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {notif.unread && (
                          <div className="w-2 h-2 rounded-full bg-gamma-400 mt-1.5 shrink-0" />
                        )}
                        <div className={!notif.unread ? 'ml-5' : ''}>
                          <p className="text-sm text-text-primary leading-snug">{notif.text}</p>
                          <p className="text-xs text-text-muted mt-1">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 text-center">
                  <span className="text-xs text-gamma-400 cursor-pointer hover:text-gamma-300">
                    View all notifications
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-surface-overlay transition-all duration-200 cursor-pointer"
            aria-label="Profile menu"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gamma-500 to-accent-cyan flex items-center justify-center">
              <User size={16} className="text-surface-base" />
            </div>
            <span className="text-sm font-medium text-text-primary hidden md:block">
              Profile
            </span>
          </button>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-xl bg-surface-raised border border-surface-border shadow-2xl overflow-hidden"
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-surface-border">
                  <p className="text-sm font-semibold text-text-primary">{user?.user_metadata?.full_name || 'User'}</p>
                  <p className="text-xs text-text-muted mt-0.5">{user?.email}</p>
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                  {[
                    { icon: User, label: 'My Profile', to: '/profile' },
                    { icon: BookOpen, label: 'My Library', to: '/my-library' },
                    { icon: Settings, label: 'Settings', to: '/settings' },
                  ].map(({ icon: Icon, label, to }) => (
                    <Link
                      key={label}
                      to={to}
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-overlay transition-colors cursor-pointer"
                    >
                      <Icon size={16} />
                      {label}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-surface-border py-1.5">
                  <button
                    onClick={() => {
                      signOut();
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-status-error hover:bg-status-error/10 transition-colors cursor-pointer"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
