import { Loader2, ShieldAlert, LogOut } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const PendingApprovalPage = () => {
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const profileLoading = useAuthStore((s) => s.profileLoading);

  const disabled = profile?.disabled;

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-surface-border bg-surface-raised p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent-amber/20 text-accent-amber">
          <ShieldAlert size={28} />
        </div>

        <h1 className="text-2xl font-bold text-text-primary">
          {disabled ? 'Account Disabled' : 'Approval Pending'}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {disabled
            ? 'Your account is currently disabled by admin. Contact support/admin for access.'
            : 'Your account is created successfully. You can access the app once an admin approves your account.'}
        </p>

        <div className="mt-6 rounded-xl border border-surface-border bg-surface-overlay/30 p-4 text-left text-xs text-text-secondary">
          <p className="font-semibold text-text-primary">What happens next?</p>
          <p className="mt-1">1. Admin reviews your account in Settings → Approvals.</p>
          <p>2. Once approved, refresh this page or sign in again.</p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={refreshProfile}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gamma-500 px-4 py-2.5 text-sm font-semibold text-surface-base hover:bg-gamma-400"
          >
            {profileLoading ? <Loader2 size={16} className="animate-spin" /> : null}
            Check Approval Status
          </button>
          <button
            onClick={signOut}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-surface-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-overlay"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
