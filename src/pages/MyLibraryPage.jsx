import { useMemo } from 'react';
import { Clock3, CalendarClock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import useMediaStore from '../store/useMediaStore';
import PageLoader from '../components/common/PageLoader';

const MyLibraryPage = () => {
  const items = useMediaStore((s) => s.items);
  const loading = useMediaStore((s) => s.loading);

  const history = useMemo(() => {
    return [...items]
      .sort((a, b) => new Date(b.updated_at || b.added_at || 0) - new Date(a.updated_at || a.added_at || 0))
      .slice(0, 30);
  }, [items]);

  if (loading) {
    return <PageLoader title="Loading My Library" subtitle="Building your recent activity timeline" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">My Library</h1>
        <p className="mt-1 text-sm text-text-secondary">Recent activity and update history for your tracked records.</p>
      </div>

      <div className="rounded-2xl border border-surface-border bg-surface-raised p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2 text-text-secondary">
          <Clock3 size={16} />
          <h2 className="text-sm font-semibold uppercase tracking-wider">Recent History</h2>
        </div>

        {history.length === 0 ? (
          <p className="rounded-lg border border-surface-border bg-surface-overlay/30 px-4 py-6 text-sm text-text-secondary">
            No history yet. Add your first title in My List to start tracking activity.
          </p>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-overlay/20 px-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">{item.title}</p>
                  <p className="mt-1 text-xs text-text-secondary capitalize">
                    {item.type} · {item.status?.replaceAll('_', ' ') || 'unknown status'}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-text-muted">
                    <CalendarClock size={12} />
                    Updated {formatDate(item.updated_at || item.added_at)}
                  </div>
                </div>

                <Link
                  to={`/my-list?focus=${encodeURIComponent(item.id)}`}
                  className="ml-3 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gamma-400 hover:bg-gamma-500/10"
                >
                  Open
                  <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default MyLibraryPage;
