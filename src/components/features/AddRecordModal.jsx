import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Star,
  Tv,
  Film,
  BookOpen,
  Monitor,
  ChevronLeft,
  ChevronDown,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { searchAnime, fetchAnimeEpisodes, searchManga, fetchMangaChapters } from '../../services/jikanApi';
import { searchMovies } from '../../services/tmdbApi';
import { searchTvSeries, fetchTvEpisodesBySeason } from '../../services/tvmazeApi';
import useMediaStore from '../../store/useMediaStore';
import useAuthStore from '../../store/useAuthStore';
import useToastStore from '../../store/useToastStore';

const TYPES = [
  { id: 'anime', label: 'Anime', icon: Tv },
  { id: 'tv', label: 'TV Series', icon: Monitor },
  { id: 'movie', label: 'Movie', icon: Film },
  { id: 'comic', label: 'Comic', icon: BookOpen },
];

const COMIC_SUBTYPES = [
  { id: 'general', label: 'General' },
  { id: 'manga', label: 'Manga' },
  { id: 'manhwa', label: 'Manhwa' },
  { id: 'manhua', label: 'Manhua' },
];

const STATUSES = [
  { id: 'watching', label: 'Watching', color: 'bg-gamma-500' },
  { id: 'completed', label: 'Completed', color: 'bg-status-success' },
  { id: 'dropped', label: 'Dropped', color: 'bg-status-error' },
  { id: 'plan_to_watch', label: 'Plan to Watch', color: 'bg-accent-amber' },
];

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

const AddRecordModal = ({ isOpen, onClose, editItem = null }) => {
  const addItem = useMediaStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const updateItem = useMediaStore((s) => s.updateItem);
  const addToast = useToastStore((s) => s.addToast);

  const [step, setStep] = useState(1);
  const [type, setType] = useState('anime');
  const [comicSubtype, setComicSubtype] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(null);

  // Step 2 fields
  const [status, setStatus] = useState('watching');
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [season, setSeason] = useState(1);
  const [rating, setRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [watchLink, setWatchLink] = useState('');
  const [notes, setNotes] = useState('');

  // Episode picker state
  const [seasonsData, setSeasonsData] = useState([]);
  const [episodesData, setEpisodesData] = useState([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [animeHasMore, setAnimeHasMore] = useState(false);
  const [animeCurrentPage, setAnimeCurrentPage] = useState(1);
  const [comicHasMore, setComicHasMore] = useState(false);
  const [comicOffset, setComicOffset] = useState(0);
  // TV: all episodes keyed by season number, fetched once per title
  const [tvAllEpisodes, setTvAllEpisodes] = useState({});

  // Reset form when opening/closing
  useEffect(() => {
    if (isOpen && !editItem) {
      setStep(1);
      setType('anime');
      setComicSubtype('general');
      setSearchQuery('');
      setSearchResults([]);
      setSearchError(null);
      setSelectedTitle(null);
      setStatus('watching');
      setCurrentEpisode(0);
      setSeason(1);
      setComicHasMore(false);
      setComicOffset(0);
      setTvAllEpisodes({});
      setRating(0);
      setIsFavorite(false);
      setWatchLink('');
      setNotes('');
    }
  }, [isOpen, editItem]);

  // Populate form when editing
  useEffect(() => {
    if (editItem) {
      setStep(2);
      setType(editItem.type);
      setComicSubtype(editItem.comicSubtype || 'general');
      setSelectedTitle({
        apiId: editItem.apiId,
        title: editItem.title,
        image: editItem.image,
        synopsis: editItem.synopsis || '',
        totalEpisodes: editItem.totalEpisodes,
        year: editItem.year,
        genres: editItem.genres || [],
        score: editItem.score,
      });
      setStatus(editItem.status);
      setCurrentEpisode(editItem.currentEpisode || 0);
      setSeason(editItem.season || 1);
      setRating(editItem.rating || 0);
      setIsFavorite(Boolean(editItem.isFavorite ?? editItem.is_favorite));
      setWatchLink(editItem.watchLink || '');
      setNotes(editItem.notes || '');
    }
  }, [editItem]);

  // Debounced search
  const performSearch = useCallback(async (query, mediaType, subtype) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    setSearchError(null);
    try {
      let results = [];
      switch (mediaType) {
        case 'anime':
          results = await searchAnime(query);
          break;
        case 'movie':
          results = await searchMovies(query);
          break;
        case 'tv':
          results = await searchTvSeries(query);
          break;
        case 'comic':
          results = await searchManga(query, subtype);
          break;
      }
      setSearchResults(results);
    } catch (err) {
      console.error('[AddRecordModal] search error:', err);
      setSearchError('Search failed. Check console for details.');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery, type, comicSubtype);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, type, comicSubtype, performSearch]);

  // clear stale results when switching type
  const handleTypeChange = (newType) => {
    setType(newType);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSelectTitle = (result) => {
    setSelectedTitle(result);
    setCurrentEpisode(0);
    setSeason(1);
    setSeasonsData([]);
    setEpisodesData([]);
    setComicHasMore(false);
    setComicOffset(0);
    setTvAllEpisodes({});
    setStep(2);
  };

  const handleSave = async () => {
    if (!selectedTitle || !user) return;

    const totalForSelectedSeason = type === 'tv'
      ? (tvEpisodesForSeason.length || null)
      : selectedTitle.totalEpisodes;

    const itemData = {
      type,
      comicSubtype: type === 'comic' ? comicSubtype : null,
      apiId: selectedTitle.apiId,
      title: selectedTitle.title,
      image: selectedTitle.image,
      synopsis: selectedTitle.synopsis,
      totalEpisodes: totalForSelectedSeason,
      year: selectedTitle.year,
      genres: selectedTitle.genres,
      score: selectedTitle.score,
      status,
      currentEpisode,
      season: type === 'tv' ? season : null,
      rating,
      isFavorite,
      watchLink,
      notes,
    };

    try {
      if (editItem) {
        await updateItem(user.id, editItem.id, itemData);
        addToast(`Updated "${selectedTitle.title}"`, 'success');
      } else {
        await addItem(user.id, itemData);
        addToast(`Added "${selectedTitle.title}" to your list`, 'success');
      }
      onClose();
    } catch (err) {
      console.error('[AddRecordModal] save error:', err);
      addToast('Failed to save. Check console for details.', 'error');
    }
    onClose();
  };

  // Fetch TV seasons when title changes
  useEffect(() => {
    if (!selectedTitle || step !== 2 || type !== 'tv') return;
    let cancelled = false;
    setTvAllEpisodes({});
    setLoadingEpisodes(true);
    fetchTvEpisodesBySeason(selectedTitle.apiId).then((grouped) => {
      if (!cancelled) { setTvAllEpisodes(grouped); setLoadingEpisodes(false); }
    }).catch(() => { if (!cancelled) setLoadingEpisodes(false); });
    return () => { cancelled = true; };
  }, [selectedTitle?.apiId, type, step]); // eslint-disable-line

  // Fetch anime episodes when title changes
  useEffect(() => {
    if (!selectedTitle || step !== 2 || type !== 'anime') return;
    let cancelled = false;
    setEpisodesData([]);
    setAnimeHasMore(false);
    setAnimeCurrentPage(1);
    setLoadingEpisodes(true);
    fetchAnimeEpisodes(selectedTitle.apiId, 1).then(({ episodes, hasNext }) => {
      if (!cancelled) {
        const hasMore = selectedTitle.totalEpisodes
          ? episodes.length < selectedTitle.totalEpisodes
          : hasNext;
        setEpisodesData(episodes);
        setAnimeHasMore(hasMore);
        setLoadingEpisodes(false);
      }
    }).catch(() => { if (!cancelled) setLoadingEpisodes(false); });
    return () => { cancelled = true; };
  }, [selectedTitle?.apiId, type, step]); // eslint-disable-line

  // Fetch comic chapters when title changes
  useEffect(() => {
    if (!selectedTitle || step !== 2 || type !== 'comic') return;
    let cancelled = false;
    setEpisodesData([]);
    setComicHasMore(false);
    setComicOffset(0);
    setLoadingEpisodes(true);
    fetchMangaChapters(selectedTitle.apiId, 0).then(({ chapters, hasMore, nextOffset }) => {
      if (!cancelled) {
        setEpisodesData(chapters);
        setComicHasMore(hasMore);
        setComicOffset(nextOffset);
        setLoadingEpisodes(false);
      }
    }).catch(() => { if (!cancelled) setLoadingEpisodes(false); });
    return () => { cancelled = true; };
  }, [selectedTitle?.apiId, type, step]); // eslint-disable-line

  const handleSeasonChange = (newSeason) => {
    setSeason(newSeason);
    setCurrentEpisode(0);
    // TV episodes already cached in tvAllEpisodes — no extra API call needed
  };

  const handleLoadMoreEpisodes = useCallback(async () => {
    if (loadingEpisodes || !selectedTitle) return;

    if (type === 'anime') {
      if (!animeHasMore) return;
      const nextPage = animeCurrentPage + 1;
      setLoadingEpisodes(true);
      try {
        const { episodes, hasNext } = await fetchAnimeEpisodes(selectedTitle.apiId, nextPage);
        setEpisodesData((prev) => {
          const merged = [...prev, ...episodes];
          const hasMore = selectedTitle.totalEpisodes
            ? merged.length < selectedTitle.totalEpisodes
            : hasNext;
          setAnimeHasMore(hasMore);
          return merged;
        });
        setAnimeCurrentPage(nextPage);
      } catch {}
      setLoadingEpisodes(false);
      return;
    }

    if (type === 'comic') {
      if (!comicHasMore) return;
      setLoadingEpisodes(true);
      try {
        const { chapters, hasMore, nextOffset } = await fetchMangaChapters(selectedTitle.apiId, comicOffset);
        setEpisodesData((prev) => {
          const seen = new Set(prev.map((c) => c.number));
          const uniqueNew = chapters.filter((c) => !seen.has(c.number));
          return [...prev, ...uniqueNew];
        });
        setComicHasMore(hasMore);
        setComicOffset(nextOffset);
      } catch {}
      setLoadingEpisodes(false);
    }
  }, [animeHasMore, animeCurrentPage, comicHasMore, comicOffset, loadingEpisodes, selectedTitle, type]);

  const hasEpisodes = type !== 'movie';
  const episodeLabel = type === 'comic' ? 'Chapter' : 'Episode';

  // Derived: seasons list and current-season episodes for TV
  const tvSeasonsData = Object.keys(tvAllEpisodes)
    .map(Number)
    .sort((a, b) => a - b)
    .map((n) => ({ number: n, name: `Season ${n}`, episodeCount: tvAllEpisodes[n]?.length || 0 }));
  const tvEpisodesForSeason = tvAllEpisodes[season] || [];
  const canLoadMore = type === 'comic' ? comicHasMore : animeHasMore;
  const loadMoreLabel = type === 'comic' ? 'Load more chapters' : 'Load more episodes';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-3 sm:p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Backdrop */}
          <motion.div
            className="fixed top-0 left-0 right-0 bottom-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative flex w-full max-w-2xl max-h-[92vh] flex-col overflow-hidden rounded-xl border border-surface-border bg-surface-raised shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-surface-border px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center gap-3">
                {step === 2 && !editItem && (
                  <button
                    onClick={() => setStep(1)}
                    className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-overlay transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
                <h2 className="text-lg font-semibold text-text-primary">
                  {editItem ? 'Edit Record' : step === 1 ? 'Add to List' : 'Track Details'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-overlay transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {step === 1 ? (
                <StepOne
                  type={type}
                  setType={handleTypeChange}
                  comicSubtype={comicSubtype}
                  setComicSubtype={setComicSubtype}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  searchResults={searchResults}
                  searchError={searchError}
                  searching={searching}
                  onSelect={handleSelectTitle}
                />
              ) : (
                <StepTwo
                  selectedTitle={selectedTitle}
                  type={type}
                  hasEpisodes={hasEpisodes}
                  episodeLabel={episodeLabel}
                  status={status}
                  setStatus={setStatus}
                  currentEpisode={currentEpisode}
                  setCurrentEpisode={setCurrentEpisode}
                  season={season}
                  onSeasonChange={handleSeasonChange}
                  seasonsData={type === 'tv' ? tvSeasonsData : seasonsData}
                  episodesData={type === 'tv' ? tvEpisodesForSeason : episodesData}
                  loadingEpisodes={loadingEpisodes}
                  canLoadMore={canLoadMore}
                  loadMoreLabel={loadMoreLabel}
                  onLoadMore={handleLoadMoreEpisodes}
                  rating={rating}
                  setRating={setRating}
                  isFavorite={isFavorite}
                  setIsFavorite={setIsFavorite}
                  watchLink={watchLink}
                  setWatchLink={setWatchLink}
                  notes={notes}
                  setNotes={setNotes}
                />
              )}
            </div>

            {/* Footer */}
            {step === 2 && (
              <div className="flex flex-col-reverse gap-3 border-t border-surface-border px-4 py-3 sm:flex-row sm:justify-end sm:px-6 sm:py-4">
                <button
                  onClick={onClose}
                  className="w-full rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-overlay hover:text-text-primary sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="w-full rounded-lg bg-gamma-500 px-5 py-2 text-sm font-semibold text-surface-base transition-colors hover:bg-gamma-400 sm:w-auto"
                >
                  {editItem ? 'Save Changes' : 'Add to List'}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ── Step 1: Type + Search ── */
const StepOne = ({
  type, setType, comicSubtype, setComicSubtype,
  searchQuery, setSearchQuery, searchResults, searchError, searching, onSelect,
}) => (
  <div className="space-y-5">
    {/* Type selector */}
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 block">
        Type
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TYPES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setType(id)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
              type === id
                ? 'border-gamma-500 bg-gamma-500/10 text-gamma-400'
                : 'border-surface-border bg-surface-overlay/30 text-text-secondary hover:border-surface-border hover:bg-surface-overlay/60'
            }`}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </div>
    </div>

    {/* Comic subtype */}
    {type === 'comic' && (
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 block">
          Subtype
        </label>
        <div className="flex flex-wrap gap-2">
          {COMIC_SUBTYPES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setComicSubtype(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                comicSubtype === id
                  ? 'bg-gamma-500/10 text-gamma-400 border border-gamma-500'
                  : 'bg-surface-overlay/30 text-text-secondary border border-surface-border hover:bg-surface-overlay/60'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    )}

    {/* Movie: optional TMDB enhancement note */}
    {type === 'movie' && !import.meta.env.VITE_TMDB_API_KEY && (
      <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/5 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-cyan shrink-0" />
          <p className="text-sm font-semibold text-accent-cyan">Movie Search Ready</p>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          Movies now search through a no-key public catalog by default. If you later add <code className="text-gamma-400 bg-surface-base px-1 py-0.5 rounded">VITE_TMDB_API_KEY</code>, the app will use TMDB for richer metadata.
        </p>
      </div>
    )}

    {/* Search */}
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 block">
        Search Title
      </label>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder={`Search for ${type === 'comic' ? (comicSubtype === 'general' ? 'comics' : comicSubtype) : type}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface-overlay/50 border border-surface-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-gamma-500/50 focus:ring-1 focus:ring-gamma-500/30 transition-all"
        />
        {searching && (
          <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gamma-400 animate-spin" />
        )}
      </div>
    </div>

    {/* Results */}
    {searchResults.length > 0 && (
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {searchResults.map((result) => (
          <button
            key={result.apiId}
            onClick={() => onSelect(result)}
            className="w-full flex items-start gap-3 p-3 rounded-xl border border-surface-border bg-surface-overlay/20 hover:bg-surface-overlay/50 hover:border-gamma-500/30 transition-all cursor-pointer text-left"
          >
            {result.image ? (
              <img
                src={result.image}
                alt={result.title}
                className="w-12 h-16 rounded-lg object-cover shrink-0 bg-surface-overlay"
              />
            ) : (
              <div className="w-12 h-16 rounded-lg bg-surface-overlay shrink-0 flex items-center justify-center text-text-muted">
                <Film size={16} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {result.title}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                {result.year && `${result.year}`}
                {result.totalEpisodes && ` · ${result.totalEpisodes} ${type === 'comic' ? 'chapters' : 'episodes'}`}
                {result.score && ` · ★ ${result.score}`}
              </p>
              {result.synopsis && (
                <p className="text-xs text-text-muted mt-1 line-clamp-2">
                  {result.synopsis}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    )}

    {searchQuery.length >= 2 && !searching && searchResults.length === 0 && !searchError && (
      <p className="text-sm text-text-muted text-center py-4">
        No results found. Try a different search term.
      </p>
    )}
    {searchError && (
      <p className="text-sm text-status-error text-center py-4">{searchError}</p>
    )}
  </div>
);

/* ── Episode Picker ── */
const EpisodePicker = ({
  type, season, onSeasonChange, seasonsData, episodesData,
  loadingEpisodes, currentEpisode, setCurrentEpisode,
  canLoadMore, loadMoreLabel, onLoadMore, episodeLabel,
}) => {
  const [seasonMenuOpen, setSeasonMenuOpen] = useState(false);

  return (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        Current {episodeLabel}
      </label>
      {currentEpisode > 0 && (
        <span className="text-xs font-semibold text-gamma-400">
          {episodeLabel} {currentEpisode} selected
        </span>
      )}
    </div>

    {/* Season dropdown — TV only */}
    {type === 'tv' && seasonsData.length > 0 && (
      <div className="relative">
        <button
          type="button"
          onClick={() => setSeasonMenuOpen((v) => !v)}
          className="w-full rounded-lg border border-surface-border bg-surface-overlay/40 px-4 py-2.5 text-sm text-text-primary flex items-center justify-between hover:border-gamma-500/40 transition-colors"
        >
          <span>
            {(seasonsData.find((s) => s.number === season)?.name) || `Season ${season}`} · {seasonsData.find((s) => s.number === season)?.episodeCount || 0} eps
          </span>
          <ChevronDown size={16} className={`text-text-muted transition-transform ${seasonMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {seasonMenuOpen && (
          <div className="absolute z-30 mt-2 w-full rounded-xl border border-surface-border bg-surface-raised shadow-2xl overflow-hidden">
            <div className="max-h-56 overflow-y-auto p-1.5">
              {seasonsData.map((s) => (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => {
                    onSeasonChange(s.number);
                    setSeasonMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    season === s.number
                      ? 'bg-gamma-500/15 text-gamma-400'
                      : 'text-text-secondary hover:bg-surface-overlay/60 hover:text-text-primary'
                  }`}
                >
                  {s.name || `Season ${s.number}`} · {s.episodeCount} eps
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )}

    {/* Episode cards — numbers only, compact */}
    {loadingEpisodes && episodesData.length === 0 ? (
      <div className="flex items-center justify-center h-24 gap-2 text-text-muted text-sm rounded-xl border border-surface-border">
        <Loader2 size={16} className="animate-spin text-gamma-400" />
        Loading episodes…
      </div>
    ) : episodesData.length > 0 ? (
      <div className="space-y-2">
        <div className="grid grid-cols-6 gap-1 sm:grid-cols-8 lg:grid-cols-10 max-h-52 overflow-y-auto pr-1">
          {episodesData.map((ep) => (
            <button
              key={ep.number}
              onClick={() => setCurrentEpisode(ep.number === currentEpisode ? 0 : ep.number)}
              title={ep.name || `${episodeLabel} ${ep.number}`}
              className={`aspect-square rounded-lg border text-center flex items-center justify-center transition-all cursor-pointer text-sm font-semibold ${
                ep.number === currentEpisode
                  ? 'border-gamma-500 bg-gamma-500/20 text-gamma-400'
                  : 'border-surface-border bg-surface-overlay/30 hover:border-gamma-500/40 hover:bg-surface-overlay/60 text-text-secondary hover:text-text-primary'
              }`}
            >
              {ep.number}
            </button>
          ))}
        </div>
        {canLoadMore && (
          <button
            onClick={onLoadMore}
            disabled={loadingEpisodes}
            className="w-full py-2 text-xs font-medium text-text-secondary hover:text-text-primary border border-surface-border rounded-lg hover:bg-surface-overlay/50 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loadingEpisodes
              ? <><Loader2 size={14} className="animate-spin" /> Loading…</>
              : loadMoreLabel}
          </button>
        )}
      </div>
    ) : !loadingEpisodes && (
      <div className="flex items-center justify-center h-16 text-xs text-text-muted rounded-xl border border-surface-border">
        No episode data available
      </div>
    )}
  </div>
  );
};

/* ── Step 2: Details ── */
const StepTwo = ({
  selectedTitle, type, hasEpisodes, episodeLabel,
  status, setStatus, currentEpisode, setCurrentEpisode,
  season, onSeasonChange, seasonsData, episodesData,
  loadingEpisodes, canLoadMore, loadMoreLabel, onLoadMore,
  rating, setRating,
  isFavorite, setIsFavorite,
  watchLink, setWatchLink, notes, setNotes,
}) => (
  <div className="space-y-5">
    {/* Selected title preview */}
    {selectedTitle && (
      <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-overlay/30 border border-surface-border">
        {selectedTitle.image ? (
          <img
            src={selectedTitle.image}
            alt={selectedTitle.title}
            className="w-16 h-22 rounded-lg object-cover shrink-0"
          />
        ) : (
          <div className="w-16 h-22 rounded-lg bg-surface-overlay shrink-0 flex items-center justify-center text-text-muted">
            <Film size={20} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-text-primary">{selectedTitle.title}</h3>
          <p className="text-xs text-text-muted mt-0.5">
            {selectedTitle.year && `${selectedTitle.year}`}
            {selectedTitle.totalEpisodes && ` · ${selectedTitle.totalEpisodes} ${type === 'comic' ? 'chapters' : 'episodes'}`}
          </p>
          {selectedTitle.genres?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedTitle.genres.slice(0, 4).map((genre) => (
                <span key={genre} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gamma-500/10 text-gamma-400">
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    )}

    {/* Status */}
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 block">
        Status
      </label>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map(({ id, label, color }) => (
          <button
            key={id}
            onClick={() => setStatus(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              status === id
                ? 'bg-gamma-500/10 text-gamma-400 border border-gamma-500'
                : 'bg-surface-overlay/30 text-text-secondary border border-surface-border hover:bg-surface-overlay/60'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${color}`} />
            {label}
          </button>
        ))}
      </div>
    </div>

    {/* Episode/Chapter Picker */}
    {hasEpisodes && (
      <EpisodePicker
        type={type}
        season={season}
        onSeasonChange={onSeasonChange}
        seasonsData={seasonsData}
        episodesData={episodesData}
        loadingEpisodes={loadingEpisodes}
        currentEpisode={currentEpisode}
        setCurrentEpisode={setCurrentEpisode}
        canLoadMore={canLoadMore}
        loadMoreLabel={loadMoreLabel}
        onLoadMore={onLoadMore}
        episodeLabel={episodeLabel}
      />
    )}

    {/* Rating */}
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 block">
        Rating
      </label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star === rating ? 0 : star)}
            className="p-0.5 cursor-pointer transition-transform hover:scale-110"
          >
            <Star
              size={22}
              className={star <= rating ? 'text-accent-amber fill-accent-amber' : 'text-surface-border'}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm font-medium text-accent-amber">{rating}/10</span>
        )}
      </div>
    </div>

    {/* Favorite toggle */}
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 block">
        Favorite
      </label>
      <button
        type="button"
        onClick={() => setIsFavorite((v) => !v)}
        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
          isFavorite
            ? 'border-accent-pink/60 bg-accent-pink/10 text-accent-pink'
            : 'border-surface-border bg-surface-overlay/30 text-text-secondary hover:bg-surface-overlay/60'
        }`}
      >
        <Star size={16} className={isFavorite ? 'fill-accent-pink' : ''} />
        {isFavorite ? 'Marked as Favorite' : 'Mark as Favorite'}
      </button>
    </div>

    {/* Watch Link */}
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 block">
        Watch / Read Link
      </label>
      <div className="relative">
        <ExternalLink size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="url"
          placeholder="https://crunchyroll.com/..."
          value={watchLink}
          onChange={(e) => setWatchLink(e.target.value)}
          className="w-full bg-surface-overlay/50 border border-surface-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-gamma-500/50 focus:ring-1 focus:ring-gamma-500/30 transition-all"
        />
      </div>
    </div>

    {/* Notes */}
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 block">
        Notes
      </label>
      <textarea
        placeholder="Any personal notes..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        className="w-full bg-surface-overlay/50 border border-surface-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-gamma-500/50 focus:ring-1 focus:ring-gamma-500/30 transition-all resize-none"
      />
    </div>
  </div>
);

export default AddRecordModal;
