import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Layers } from 'lucide-react';
import GammaLogo from '../components/common/GammaLogo';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-surface-base text-text-primary">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GammaLogo size={38} />
            <h1 className="text-2xl font-bold">
              <span className="gradient-text">Gamma</span> Index
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/auth/login"
              className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-overlay hover:text-text-primary"
            >
              Sign In
            </Link>
            <Link
              to="/auth/signup"
              className="rounded-lg bg-gamma-500 px-4 py-2 text-sm font-semibold text-surface-base hover:bg-gamma-400"
            >
              Get Started
            </Link>
          </div>
        </header>

        <main className="grid flex-1 items-center gap-10 py-12 md:grid-cols-2">
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gamma-400">Media Tracker Platform</p>
            <h2 className="text-4xl font-bold leading-tight md:text-5xl">Track Anime, TV, Movies, and Comics in one place.</h2>
            <p className="mt-4 max-w-xl text-text-secondary">
              Gamma Index helps you track what you watch and read, keep notes, and monitor progress with a clean, fast interface.
              New accounts require admin approval before they can access the app.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/auth/signup"
                className="rounded-xl bg-gamma-500 px-5 py-3 text-sm font-semibold text-surface-base hover:bg-gamma-400"
              >
                Create Account
              </Link>
              <Link
                to="/auth/login"
                className="rounded-xl border border-surface-border bg-surface-overlay/30 px-5 py-3 text-sm font-semibold text-text-primary hover:bg-surface-overlay"
              >
                Sign In
              </Link>
            </div>
          </section>

          <section className="space-y-4">
            <FeatureCard icon={Sparkles} title="Smart Tracking" description="Episode/chapter progress, status tags, ratings, and notes for each title." />
            <FeatureCard icon={Layers} title="Multi-Type Library" description="Handle anime, series, movies, and comics under one unified collection." />
            <FeatureCard icon={ShieldCheck} title="Admin Approval" description="New users are queued for approval before access is granted to the app." />
          </section>
        </main>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="rounded-2xl border border-surface-border bg-surface-raised p-5">
    <div className="mb-3 inline-flex rounded-lg bg-gamma-500/10 p-2 text-gamma-400">
      <Icon size={18} />
    </div>
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="mt-1 text-sm text-text-secondary">{description}</p>
  </div>
);

export default LandingPage;
