import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Check,
  AlertCircle,
  UserCheck,
  Shield,
  Ban,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useToastStore from '../store/useToastStore';

const AccountSettingsPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('account');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const changePassword = useAuthStore((s) => s.changePassword);
  const fetchAllUsersForApproval = useAuthStore((s) => s.fetchAllUsersForApproval);
  const updateUserApproval = useAuthStore((s) => s.updateUserApproval);
  const updateUserDisabled = useAuthStore((s) => s.updateUserDisabled);
  const error = useAuthStore((s) => s.error);
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();

  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;
  const isFormValid = currentPassword && newPassword && confirmPassword && passwordsMatch;

  const loadUsers = async () => {
    if (!isAdmin) return;
    setUsersLoading(true);
    try {
      const data = await fetchAllUsersForApproval();
      setUsers(data);
    } catch (err) {
      addToast('Failed to load users for approval', 'error');
    }
    setUsersLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'approvals' && isAdmin) {
      loadUsers();
    }
  }, [activeTab, isAdmin]); // eslint-disable-line

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordsMatch) return;

    setLoading(true);
    setSuccessMessage('');
    try {
      await changePassword(newPassword);
      setSuccessMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast('Password updated successfully', 'success');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Change password error:', err);
      addToast('Failed to change password', 'error');
    }
    setLoading(false);
  };

  const handleToggleApproval = async (targetUser, approved) => {
    try {
      await updateUserApproval(targetUser.id, approved);
      addToast(approved ? 'User approved' : 'Approval revoked', 'success');
      await loadUsers();
    } catch {
      addToast('Failed to update approval', 'error');
    }
  };

  const handleToggleDisabled = async (targetUser, disabled) => {
    try {
      await updateUserDisabled(targetUser.id, disabled);
      addToast(disabled ? 'User disabled' : 'User enabled', 'success');
      await loadUsers();
    } catch {
      addToast('Failed to update account status', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-surface-base p-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8 pt-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to app
        </button>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Account Settings</h1>
        <p className="text-sm text-text-secondary">Manage account preferences and admin controls</p>
      </div>

      {/* Settings Card */}
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-surface-border bg-surface-raised p-8 shadow-lg"
        >
          <div className="mb-6 flex gap-2 rounded-xl border border-surface-border bg-surface-overlay/20 p-1">
            <button
              onClick={() => setActiveTab('account')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${
                activeTab === 'account' ? 'bg-gamma-500 text-surface-base' : 'text-text-secondary hover:bg-surface-overlay/50'
              }`}
            >
              Account
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('approvals')}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${
                  activeTab === 'approvals' ? 'bg-gamma-500 text-surface-base' : 'text-text-secondary hover:bg-surface-overlay/50'
                }`}
              >
                Approvals
              </button>
            )}
          </div>

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-lg bg-gamma-500/10 border border-gamma-500/30 p-4 mb-6 flex items-start gap-3"
            >
              <Check size={20} className="text-gamma-400 shrink-0 mt-0.5" />
              <p className="text-sm text-gamma-200">{successMessage}</p>
            </motion.div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="rounded-lg bg-status-error/10 border border-status-error/30 p-4 mb-6 flex items-start gap-3">
              <AlertCircle size={20} className="text-status-error shrink-0 mt-0.5" />
              <p className="text-sm text-status-error">{error}</p>
            </div>
          )}

          {activeTab === 'account' && (
            <>
              <div className="mb-8 pb-8 border-b border-surface-border">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Account Information</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary">Email</label>
                    <p className="text-sm text-text-primary mt-1">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-secondary">Account Type</label>
                    <p className="text-sm text-text-primary mt-1">
                      {user?.app_metadata?.provider === 'google' ? 'Google Account' : 'Email Account'}
                    </p>
                  </div>
                  {user?.user_metadata?.full_name && (
                    <div>
                      <label className="text-xs font-semibold text-text-secondary">Name</label>
                      <p className="text-sm text-text-primary mt-1">{user.user_metadata.full_name}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-4">Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-overlay border border-surface-border rounded-lg pl-10 pr-10 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-gamma-500/50 focus:ring-1 focus:ring-gamma-500/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-overlay border border-surface-border rounded-lg pl-10 pr-10 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-gamma-500/50 focus:ring-1 focus:ring-gamma-500/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-text-muted mt-1">At least 8 characters recommended</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full bg-surface-overlay border rounded-lg pl-10 pr-10 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all ${
                      confirmPassword && !passwordsMatch
                        ? 'border-status-error/50 focus:border-status-error/80 focus:ring-1 focus:ring-status-error/20'
                        : 'border-surface-border focus:border-gamma-500/50 focus:ring-1 focus:ring-gamma-500/20'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-status-error mt-1">Passwords don't match</p>
                )}
                {passwordsMatch && confirmPassword && (
                  <p className="text-xs text-gamma-400 mt-1">Passwords match ✓</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full py-2.5 rounded-xl bg-gamma-500 text-surface-base text-sm font-semibold hover:bg-gamma-400 transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2 mt-6"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Updating...' : 'Update Password'}
              </button>
                </form>
              </div>
            </>
          )}

          {activeTab === 'approvals' && isAdmin && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-primary">User Approvals</h2>
                <button
                  onClick={loadUsers}
                  className="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-overlay"
                >
                  Refresh
                </button>
              </div>

              {usersLoading ? (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Loader2 size={16} className="animate-spin" /> Loading users...
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((u) => (
                    <div key={u.id} className="rounded-xl border border-surface-border bg-surface-overlay/20 p-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{u.full_name || u.email}</p>
                          <p className="text-xs text-text-secondary">{u.email}</p>
                          <p className="mt-1 text-[11px] uppercase tracking-wider text-text-muted">
                            Role: {u.role || 'user'} · {u.approved ? 'Approved' : 'Pending'} · {u.disabled ? 'Disabled' : 'Enabled'}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleToggleApproval(u, !u.approved)}
                            disabled={u.role === 'admin'}
                            className="inline-flex items-center gap-1 rounded-lg border border-surface-border px-2.5 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-overlay disabled:opacity-40"
                          >
                            <UserCheck size={14} />
                            {u.approved ? 'Revoke' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleToggleDisabled(u, !u.disabled)}
                            disabled={u.role === 'admin'}
                            className="inline-flex items-center gap-1 rounded-lg border border-surface-border px-2.5 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-overlay disabled:opacity-40"
                          >
                            {u.disabled ? <Shield size={14} /> : <Ban size={14} />}
                            {u.disabled ? 'Enable' : 'Disable'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
