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
  Bug,
  Trash2,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useToastStore from '../store/useToastStore';
import { fetchErrorLogs, clearAllErrorLogs, clearOldErrorLogs } from '../services/errorLogger';

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

  // Debug logs state
  const [errorLogs, setErrorLogs] = useState([]);
  const [errorLogsLoading, setErrorLogsLoading] = useState(false);
  const [errorLogsCount, setErrorLogsCount] = useState(0);
  const [errorTypeFilter, setErrorTypeFilter] = useState('');
  const [errorPage, setErrorPage] = useState(0);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [clearingLogs, setClearingLogs] = useState(false);
  const ERROR_LOGS_PER_PAGE = 20;

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
    if (activeTab === 'debug' && isAdmin) {
      loadErrorLogs();
    }
  }, [activeTab, isAdmin]); // eslint-disable-line

  const loadErrorLogs = async (page = errorPage, typeFilter = errorTypeFilter) => {
    setErrorLogsLoading(true);
    try {
      const { data, count } = await fetchErrorLogs({
        limit: ERROR_LOGS_PER_PAGE,
        offset: page * ERROR_LOGS_PER_PAGE,
        errorType: typeFilter || undefined,
      });
      setErrorLogs(data);
      setErrorLogsCount(count);
    } catch {
      addToast('Failed to load error logs', 'error');
    }
    setErrorLogsLoading(false);
  };

  const handleErrorTypeFilter = (type) => {
    setErrorTypeFilter(type);
    setErrorPage(0);
    loadErrorLogs(0, type);
  };

  const handleErrorPageChange = (newPage) => {
    setErrorPage(newPage);
    loadErrorLogs(newPage, errorTypeFilter);
  };

  const handleClearAllLogs = async () => {
    if (!window.confirm('Delete ALL error logs? This cannot be undone.')) return;
    setClearingLogs(true);
    try {
      await clearAllErrorLogs();
      setErrorLogs([]);
      setErrorLogsCount(0);
      setErrorPage(0);
      addToast('All error logs cleared', 'success');
    } catch {
      addToast('Failed to clear logs', 'error');
    }
    setClearingLogs(false);
  };

  const handleClearOldLogs = async (days) => {
    setClearingLogs(true);
    try {
      await clearOldErrorLogs(days);
      addToast(`Cleared logs older than ${days} days`, 'success');
      loadErrorLogs(0, errorTypeFilter);
      setErrorPage(0);
    } catch {
      addToast('Failed to clear old logs', 'error');
    }
    setClearingLogs(false);
  };

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
    <div className="min-h-screen bg-surface-base p-3 sm:p-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6 pt-4 sm:mb-8 sm:pt-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors mb-4 sm:mb-6"
        >
          <ArrowLeft size={16} />
          Back to app
        </button>
        <h1 className="text-2xl font-bold text-text-primary mb-2 sm:text-3xl">Account Settings</h1>
        <p className="text-sm text-text-secondary">Manage account preferences and admin controls</p>
      </div>

      {/* Settings Card */}
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-surface-border bg-surface-raised p-4 shadow-lg sm:p-8"
        >
          <div className="mb-6 flex gap-2 overflow-x-auto rounded-xl border border-surface-border bg-surface-overlay/20 p-1">
            <button
              onClick={() => setActiveTab('account')}
              className={`shrink-0 flex-1 rounded-lg px-3 py-2 text-xs font-semibold sm:text-sm ${
                activeTab === 'account' ? 'bg-gamma-500 text-surface-base' : 'text-text-secondary hover:bg-surface-overlay/50'
              }`}
            >
              Account
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('approvals')}
                className={`shrink-0 flex-1 rounded-lg px-3 py-2 text-xs font-semibold sm:text-sm ${
                  activeTab === 'approvals' ? 'bg-gamma-500 text-surface-base' : 'text-text-secondary hover:bg-surface-overlay/50'
                }`}
              >
                Approvals
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('debug')}
                className={`shrink-0 flex-1 rounded-lg px-3 py-2 text-xs font-semibold sm:text-sm ${
                  activeTab === 'debug' ? 'bg-gamma-500 text-surface-base' : 'text-text-secondary hover:bg-surface-overlay/50'
                }`}
              >
                Debug Logs
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
          {activeTab === 'debug' && isAdmin && (
            <div>
              {/* Header */}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Bug size={18} className="text-gamma-400" />
                  <h2 className="text-lg font-semibold text-text-primary">Debug Logs</h2>
                  <span className="rounded-full bg-surface-overlay px-2 py-0.5 text-xs font-semibold text-text-secondary">
                    {errorLogsCount}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => loadErrorLogs(errorPage, errorTypeFilter)}
                    disabled={errorLogsLoading}
                    className="inline-flex items-center gap-1 rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-overlay disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={errorLogsLoading ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                  <button
                    onClick={() => handleClearOldLogs(7)}
                    disabled={clearingLogs}
                    className="inline-flex items-center gap-1 rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-accent-amber hover:bg-accent-amber/10 disabled:opacity-50"
                  >
                    <Trash2 size={12} />
                    Clear 7d+
                  </button>
                  <button
                    onClick={handleClearAllLogs}
                    disabled={clearingLogs}
                    className="inline-flex items-center gap-1 rounded-lg border border-status-error/40 px-3 py-1.5 text-xs font-semibold text-status-error hover:bg-status-error/10 disabled:opacity-50"
                  >
                    <Trash2 size={12} />
                    Clear All
                  </button>
                </div>
              </div>

              {/* Type filter */}
              <div className="mb-4 flex flex-wrap gap-1.5">
                {['', 'runtime', 'api', 'promise-rejection', 'render', 'validation'].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleErrorTypeFilter(t)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      errorTypeFilter === t
                        ? 'bg-gamma-500/15 text-gamma-400 border border-gamma-500/50'
                        : 'bg-surface-overlay/30 text-text-muted border border-transparent hover:text-text-secondary'
                    }`}
                  >
                    {t || 'All'}
                  </button>
                ))}
              </div>

              {/* Logs list */}
              {errorLogsLoading && errorLogs.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-text-secondary">
                  <Loader2 size={16} className="animate-spin" /> Loading logs…
                </div>
              ) : errorLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gamma-500/10">
                    <Bug size={24} className="text-gamma-400" />
                  </div>
                  <p className="text-sm text-text-secondary">No error logs found</p>
                  <p className="mt-1 text-xs text-text-muted">Errors from all users will appear here automatically</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {errorLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-xl border border-surface-border bg-surface-overlay/20 transition-colors hover:border-surface-border/80"
                    >
                      {/* Log summary row */}
                      <button
                        onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                        className="flex w-full items-start gap-3 p-3 text-left"
                      >
                        <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                          log.error_type === 'render' ? 'bg-status-error' :
                          log.error_type === 'api' ? 'bg-accent-amber' :
                          log.error_type === 'promise-rejection' ? 'bg-accent-pink' :
                          log.error_type === 'validation' ? 'bg-accent-cyan' :
                          'bg-text-muted'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-text-primary line-clamp-1">{log.error_message}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
                            <span className="rounded bg-surface-overlay px-1.5 py-0.5 font-semibold uppercase tracking-wider">
                              {log.error_type}
                            </span>
                            {log.error_source && (
                              <span>from <span className="text-gamma-400">{log.error_source}</span></span>
                            )}
                            <span>·</span>
                            <span>{log.user_email || 'unknown'}</span>
                            <span>·</span>
                            <span>{new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        <ChevronDown size={14} className={`mt-1 shrink-0 text-text-muted transition-transform ${expandedLogId === log.id ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Expanded details */}
                      {expandedLogId === log.id && (
                        <div className="border-t border-surface-border px-3 pb-3 pt-2 space-y-2">
                          {log.error_stack && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">Stack Trace</p>
                              <pre className="max-h-40 overflow-auto rounded-lg bg-surface-base p-2 text-[11px] text-text-secondary font-mono whitespace-pre-wrap break-words">
                                {log.error_stack}
                              </pre>
                            </div>
                          )}
                          {log.page_url && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">Page URL</p>
                              <p className="text-xs text-text-secondary break-all">{log.page_url}</p>
                            </div>
                          )}
                          {log.user_agent && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">User Agent</p>
                              <p className="text-xs text-text-secondary break-all">{log.user_agent}</p>
                            </div>
                          )}
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">Metadata</p>
                              <pre className="max-h-32 overflow-auto rounded-lg bg-surface-base p-2 text-[11px] text-text-secondary font-mono whitespace-pre-wrap break-words">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                          <p className="text-[10px] text-text-muted">
                            Full timestamp: {new Date(log.created_at).toISOString()} · User ID: {log.user_id || 'N/A'}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Pagination */}
                  {errorLogsCount > ERROR_LOGS_PER_PAGE && (
                    <div className="flex items-center justify-between pt-3">
                      <p className="text-xs text-text-muted">
                        Showing {errorPage * ERROR_LOGS_PER_PAGE + 1}–{Math.min((errorPage + 1) * ERROR_LOGS_PER_PAGE, errorLogsCount)} of {errorLogsCount}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleErrorPageChange(errorPage - 1)}
                          disabled={errorPage === 0}
                          className="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-overlay disabled:opacity-40"
                        >
                          Prev
                        </button>
                        <button
                          onClick={() => handleErrorPageChange(errorPage + 1)}
                          disabled={(errorPage + 1) * ERROR_LOGS_PER_PAGE >= errorLogsCount}
                          className="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-overlay disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
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
