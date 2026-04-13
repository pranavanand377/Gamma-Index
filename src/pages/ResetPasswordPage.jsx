import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Lock, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GammaLogo from '../components/common/GammaLogo';
import useAuthStore from '../store/useAuthStore';
import { supabase } from '../services/supabase';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [checkingToken, setCheckingToken] = useState(true);

  const resetPassword = useAuthStore((s) => s.resetPassword);
  const error = useAuthStore((s) => s.error);
  const navigate = useNavigate();

  // Check if reset token is valid on mount
  useEffect(() => {
    const checkToken = async () => {
      const hash = window.location.hash;
      if (!hash.includes('type=recovery')) {
        setTokenValid(false);
      } else {
        setTokenValid(true);
      }
      setCheckingToken(false);
    };
    checkToken();
  }, []);

  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isFormValid = password && confirmPassword && passwordsMatch;

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!passwordsMatch) return;

    setLoading(true);
    try {
      await resetPassword(password);
      setSubmitted(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      console.error('Reset password error:', err);
    }
    setLoading(false);
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface-raised p-8 shadow-2xl text-center"
        >
          <Loader2 size={32} className="animate-spin mx-auto text-gamma-500 mb-4" />
          <p className="text-sm text-text-muted">Verifying reset link...</p>
        </motion.div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface-raised p-8 shadow-2xl text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 rounded-full bg-status-error/20 border border-status-error/50 flex items-center justify-center mx-auto mb-6"
          >
            <AlertCircle size={32} className="text-status-error" />
          </motion.div>

          <h2 className="text-2xl font-bold text-text-primary mb-2">Link Expired</h2>
          <p className="text-sm text-text-secondary mb-6">
            This password reset link has expired or is invalid. Please try again.
          </p>

          <button
            onClick={() => navigate('/auth/forgot-password')}
            className="w-full py-2.5 rounded-xl bg-gamma-500 text-surface-base text-sm font-semibold hover:bg-gamma-400 transition-colors"
          >
            Request New Link
          </button>
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface-raised p-8 shadow-2xl text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 rounded-full bg-gamma-500/20 border border-gamma-500/50 flex items-center justify-center mx-auto mb-6"
          >
            <Check size={32} className="text-gamma-400" />
          </motion.div>

          <h2 className="text-2xl font-bold text-text-primary mb-2">Password Reset Successful!</h2>
          <p className="text-sm text-text-secondary mb-6">
            Your password has been changed. You'll be redirected to sign in shortly...
          </p>

          <div className="rounded-lg bg-gamma-500/10 border border-gamma-500/30 p-4 mb-6 text-sm text-gamma-200">
            If you're not redirected automatically, click the button below to sign in with your new password.
          </div>

          <button
            onClick={() => navigate('/auth/login')}
            className="w-full py-2.5 rounded-xl bg-gamma-500 text-surface-base text-sm font-semibold hover:bg-gamma-400 transition-colors"
          >
            Go to Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface-raised p-8 shadow-2xl"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <GammaLogo size={48} />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Create New Password</h1>
          <p className="text-sm text-text-muted">Enter a strong password for your account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-lg bg-status-error/10 border border-status-error/30 p-3 mb-6 text-sm text-status-error">
            {error}
          </div>
        )}

        {/* Reset Form */}
        <form onSubmit={handleResetPassword} className="space-y-4">
          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2">New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-overlay border border-surface-border rounded-lg pl-10 pr-10 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-gamma-500/50 focus:ring-1 focus:ring-gamma-500/20 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-text-muted mt-1">At least 8 characters recommended</p>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
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
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="text-xs text-text-muted mt-8 pt-6 border-t border-surface-border text-center">
          Your password must be secure to protect your account
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
