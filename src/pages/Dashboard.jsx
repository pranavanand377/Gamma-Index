import { useEffect, useState } from 'react';
import useMediaStore from '../store/useMediaStore';
import { Tv, Film, BookOpen, Monitor, Clock, CheckCircle, Heart, TrendingUp } from 'lucide-react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import PageLoader from '../components/common/PageLoader';
import { getGenreDistribution, getStatusDistribution, getTypeDistribution } from '../utils/filtering';

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
  <Link
    to={`/my-list?focus=${encodeURIComponent(item.id)}`}
    className="flex items-center gap-3 p-3 rounded-xl bg-surface-overlay/30 border border-surface-border hover:border-gamma-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gamma-500/60 transition-colors"
    title={`Open ${item.title} in My List`}
  >
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
        {item.type !== 'movie' && ' · '}{(item.status || '').replaceAll('_', ' ')}
      </p>
    </div>
  </Link>
);

const Dashboard = () => {
  const items = useMediaStore((s) => s.items);
  const loading = useMediaStore((s) => s.loading);
  const [isNarrow, setIsNarrow] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));

  useEffect(() => {
    const onResize = () => {
      setIsNarrow(window.innerWidth < 768);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (loading) {
    return <PageLoader title="Loading Dashboard" subtitle="Preparing your tracking overview" />;
  }

  const animeCount = items.filter((i) => i.type === 'anime').length;
  const movieCount = items.filter((i) => i.type === 'movie').length;
  const tvCount = items.filter((i) => i.type === 'tv').length;
  const comicCount = items.filter((i) => i.type === 'comic').length;
  const watchingCount = items.filter((i) => i.status === 'watching').length;
  const completedCount = items.filter((i) => i.status === 'completed').length;
  const favCount = items.filter((i) => i.isFavorite).length;

  const recentItems = [...items]
    .sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched))
    .slice(0, 6);

  const genreData = getGenreDistribution(items);
  const statusData = getStatusDistribution(items);
  const typeData = getTypeDistribution(items);

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

      {/* By type - Cards view */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Tv} label="Anime" value={animeCount} color="bg-accent-cyan/10 text-accent-cyan" />
        <StatCard icon={Monitor} label="TV Series" value={tvCount} color="bg-gamma-500/10 text-gamma-400" />
        <StatCard icon={Film} label="Movies" value={movieCount} color="bg-accent-amber/10 text-accent-amber" />
        <StatCard icon={BookOpen} label="Comics" value={comicCount} color="bg-accent-pink/10 text-accent-pink" />
      </div>

      {/* Charts section */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          {statusData.length > 0 && (
            <div className="rounded-xl bg-surface-raised border border-surface-border p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Status Distribution</h3>
              <ResponsiveContainer width="100%" height={isNarrow ? 240 : 280}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={!isNarrow}
                    label={isNarrow ? false : ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={isNarrow ? 70 : 80}
                    fill="#10B981"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Type Distribution */}
          {typeData.length > 0 && (
            <div className="rounded-xl bg-surface-raised border border-surface-border p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Media Type Distribution</h3>
              <ResponsiveContainer width="100%" height={isNarrow ? 240 : 280}>
                <BarChart data={typeData} margin={{ top: 20, right: 12, left: 0, bottom: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#10B981" radius={[8, 8, 0, 0]}>
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Genres */}
          {genreData.length > 0 && (
            <div className="rounded-xl bg-surface-raised border border-surface-border p-4 sm:p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Top Genres</h3>
              <ResponsiveContainer width="100%" height={isNarrow ? 240 : 280}>
                <BarChart
                  data={genreData}
                  layout={isNarrow ? 'horizontal' : 'vertical'}
                  margin={isNarrow ? { top: 10, right: 12, left: 0, bottom: 18 } : { top: 5, right: 20, left: 140, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  {isNarrow ? (
                    <>
                      <XAxis dataKey="name" stroke="#9CA3AF" interval={0} angle={-20} textAnchor="end" height={54} />
                      <YAxis stroke="#9CA3AF" allowDecimals={false} />
                    </>
                  ) : (
                    <>
                      <XAxis type="number" stroke="#9CA3AF" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={130} />
                    </>
                  )}
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#10B981" radius={isNarrow ? [8, 8, 0, 0] : [0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

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
