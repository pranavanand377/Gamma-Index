import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Mail, ArrowLeft, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import GammaLogo from '../components/common/GammaLogo';
import useAuthStore from '../store/useAuthStore';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const resetPasswordRequest = useAuthStore((s) => s.resetPasswordRequest);
  const error = useAuthStore((s) => s.error);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPasswordRequest(email);
      setSubmitted(true);
    } catch (err) {
      console.error('Reset password error:', err);
    }
    setLoading(false);
  };

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

          <h2 className="text-2xl font-bold text-text-primary mb-2">Check your email</h2>
          <p className="text-sm text-text-secondary mb-6">
            We've sent a password reset link to<br />
            <span className="text-text-primary font-semibold">{email}</span>
          </p>

          <div className="rounded-lg bg-gamma-500/10 border border-gamma-500/30 p-4 mb-6 text-sm text-gamma-200">
            Click the link in the email to reset your password. The link expires in 24 hours.
          </div>

          <p className="text-xs text-text-muted">
            Remember your password?{' '}
            <Link to="/auth/login" className="text-gamma-400 hover:text-gamma-300 font-medium">
              Sign in
            </Link>
          </p>
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
        {/* Back Button */}
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <GammaLogo size={48} />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Reset Password</h1>
          <p className="text-sm text-text-muted">We'll send you a link to reset your password</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-lg bg-status-error/10 border border-status-error/30 p-3 mb-6 text-sm text-status-error">
            {error}
          </div>
        )}

        {/* Reset Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-surface-overlay border border-surface-border rounded-lg pl-10 pr-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-gamma-500/50 focus:ring-1 focus:ring-gamma-500/20 transition-all"
                required
              />
            </div>
            <p className="text-xs text-text-muted mt-2">
              Enter the email address associated with your account
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-2.5 rounded-xl bg-gamma-500 text-surface-base text-sm font-semibold hover:bg-gamma-400 transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2 mt-6"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-xs text-text-muted mt-8 pt-6 border-t border-surface-border text-center">
          Check your spam folder if you don't see the email
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
