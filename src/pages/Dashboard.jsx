import useMediaStore from '../store/useMediaStore';
import { Tv, Film, BookOpen, Monitor, Clock, CheckCircle, Heart, TrendingUp } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="rounded-xl bg-surface-raised border border-surface-border p-4 flex items-center gap-4">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={20} />
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </div>
  </div>
);

const RecentCard = ({ item }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-overlay/30 border border-surface-border hover:border-gamma-500/20 transition-colors">
    {item.image ? (
      <img src={item.image} alt={item.title} className="w-10 h-14 rounded-lg object-cover shrink-0" />
    ) : (
      <div className="w-10 h-14 rounded-lg bg-surface-overlay shrink-0" />
    )}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-text-primary truncate">{item.title}</p>
      <p className="text-[11px] text-text-muted mt-0.5">
        {item.type === 'tv'
          ? `S${item.season || 1} · Ep. ${item.currentEpisode || 0}${item.totalEpisodes ? ` / ${item.totalEpisodes}` : ''}`
          : item.type === 'movie'
            ? ''
            : `${item.type === 'comic' ? 'Ch.' : 'Ep.'} ${item.currentEpisode || 0}${item.totalEpisodes ? ` / ${item.totalEpisodes}` : ''}`}
        {item.type !== 'movie' && ' · '}{item.status.replace('_', ' ')}
      </p>
    </div>
  </div>
);

const Dashboard = () => {
  const items = useMediaStore((s) => s.items);

  const animeCount = items.filter((i) => i.type === 'anime').length;
  const movieCount = items.filter((i) => i.type === 'movie').length;
  const tvCount = items.filter((i) => i.type === 'tv').length;
  const comicCount = items.filter((i) => i.type === 'comic').length;
  const watchingCount = items.filter((i) => i.status === 'watching').length;
  const completedCount = items.filter((i) => i.status === 'completed').length;
  const favCount = items.filter((i) => i.rating >= 8).length;

  const recentItems = [...items]
    .sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">Your tracking overview</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Total Titles" value={items.length} color="bg-gamma-500/10 text-gamma-400" />
        <StatCard icon={Clock} label="Watching" value={watchingCount} color="bg-gamma-500/10 text-gamma-400" />
        <StatCard icon={CheckCircle} label="Completed" value={completedCount} color="bg-status-success/10 text-status-success" />
        <StatCard icon={Heart} label="Highly Rated" value={favCount} color="bg-accent-pink/10 text-accent-pink" />
      </div>

      {/* By type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Tv} label="Anime" value={animeCount} color="bg-accent-cyan/10 text-accent-cyan" />
        <StatCard icon={Monitor} label="TV Series" value={tvCount} color="bg-gamma-500/10 text-gamma-400" />
        <StatCard icon={Film} label="Movies" value={movieCount} color="bg-accent-amber/10 text-accent-amber" />
        <StatCard icon={BookOpen} label="Comics" value={comicCount} color="bg-accent-pink/10 text-accent-pink" />
      </div>

      {/* Recent activity */}
      {recentItems.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-3">Recently Updated</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {recentItems.map((item) => (
              <RecentCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-gamma-500/10 flex items-center justify-center mb-4">
            <span className="text-4xl">🎬</span>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">Welcome to Gamma Index</h3>
          <p className="text-sm text-text-secondary max-w-md text-center">
            Head to <span className="text-gamma-400 font-medium">My List</span> and add your first anime, movie, or comic to start tracking!
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
