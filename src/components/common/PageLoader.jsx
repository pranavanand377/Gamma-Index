import GammaLogo from './GammaLogo';

const PageLoader = ({ title = 'Loading...', subtitle = 'Preparing your content', fullScreen = false }) => {
  return (
    <div className={fullScreen ? 'min-h-screen flex items-center justify-center bg-surface-base p-6' : 'rounded-2xl border border-surface-border bg-surface-raised p-8'}>
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-surface-border bg-surface-overlay/40">
          <GammaLogo size={36} />
        </div>

        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>

        <div className="mt-5 flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-gamma-500 animate-bounce [animation-delay:-0.2s]" />
          <span className="h-2 w-2 rounded-full bg-gamma-400 animate-bounce [animation-delay:-0.1s]" />
          <span className="h-2 w-2 rounded-full bg-accent-cyan animate-bounce" />
        </div>

        {!fullScreen && (
          <div className="mt-6 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-surface-overlay/60" />
            <div className="h-3 w-10/12 animate-pulse rounded bg-surface-overlay/60" />
            <div className="h-3 w-8/12 animate-pulse rounded bg-surface-overlay/60" />
          </div>
        )}
      </div>
    </div>
  );
};

export default PageLoader;
