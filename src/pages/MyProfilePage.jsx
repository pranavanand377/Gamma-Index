import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Shield, Library, Tv, Film, BookOpen, Monitor, Settings } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useMediaStore from '../store/useMediaStore';
import PageLoader from '../components/common/PageLoader';

const statCardBase = 'rounded-xl border border-surface-border bg-surface-overlay/30 p-4';

const MyProfilePage = () => {
  const user = useAuthStore((s) => s.user);
  const items = useMediaStore((s) => s.items);
  const loading = useMediaStore((s) => s.loading);

  const stats = useMemo(() => {
    const byType = {
      anime: 0,
      tv: 0,
      movie: 0,
      comic: 0,
    };
    const byStatus = {
      watching: 0,
      completed: 0,
      dropped: 0,
      plan_to_watch: 0,
    };

    items.forEach((item) => {
      if (byType[item.type] !== undefined) byType[item.type] += 1;
      if (byStatus[item.status] !== undefined) byStatus[item.status] += 1;
    });

    return {
      total: items.length,
      byType,
      byStatus,
    };
  }, [items]);

  if (loading) {
    return <PageLoader title="Loading Profile" subtitle="Calculating account and library insights" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">My Profile</h1>
          <p className="mt-1 text-sm text-text-secondary">Your account details and tracking overview</p>
        </div>
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 rounded-lg border border-surface-border bg-surface-overlay/40 px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-overlay"
        >
          <Settings size={16} />
          Account Settings
        </Link>
      </div>

      <section className="rounded-2xl border border-surface-border bg-surface-raised p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Account</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className={statCardBase}>
            <div className="mb-2 flex items-center gap-2 text-text-secondary">
              <User size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Display Name</span>
            </div>
            <p className="text-base font-medium text-text-primary">{user?.user_metadata?.full_name || 'User'}</p>
          </div>

          <div className={statCardBase}>
            <div className="mb-2 flex items-center gap-2 text-text-secondary">
              <Mail size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Email</span>
            </div>
            <p className="text-base font-medium text-text-primary break-all">{user?.email}</p>
          </div>

          <div className={statCardBase}>
            <div className="mb-2 flex items-center gap-2 text-text-secondary">
              <Shield size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Auth Provider</span>
            </div>
            <p className="text-base font-medium text-text-primary capitalize">
              {user?.app_metadata?.provider || 'email'}
            </p>
          </div>

          <div className={statCardBase}>
            <div className="mb-2 flex items-center gap-2 text-text-secondary">
              <Library size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Total Records</span>
            </div>
            <p className="text-base font-medium text-text-primary">{stats.total}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-surface-border bg-surface-raised p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Library Breakdown</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className={statCardBase}>
            <div className="mb-1 flex items-center gap-2 text-text-secondary"><Tv size={14} /> Anime</div>
            <p className="text-2xl font-bold text-text-primary">{stats.byType.anime}</p>
          </div>
          <div className={statCardBase}>
            <div className="mb-1 flex items-center gap-2 text-text-secondary"><Monitor size={14} /> TV</div>
            <p className="text-2xl font-bold text-text-primary">{stats.byType.tv}</p>
          </div>
          <div className={statCardBase}>
            <div className="mb-1 flex items-center gap-2 text-text-secondary"><Film size={14} /> Movies</div>
            <p className="text-2xl font-bold text-text-primary">{stats.byType.movie}</p>
          </div>
          <div className={statCardBase}>
            <div className="mb-1 flex items-center gap-2 text-text-secondary"><BookOpen size={14} /> Comics</div>
            <p className="text-2xl font-bold text-text-primary">{stats.byType.comic}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MyProfilePage;
