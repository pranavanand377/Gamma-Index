import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import GammaLogo from '../components/common/GammaLogo';
import useAuthStore from '../store/useAuthStore';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('google'); // 'google' or 'email'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail);
  const error = useAuthStore((s) => s.error);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign in error:', err);
    }
    setLoading(false);
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (err) {
      console.error('Sign in error:', err);
    }
    setLoading(false);
  };

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
          <h1 className="text-2xl font-bold text-text-primary mb-1">Gamma Index</h1>
          <p className="text-sm text-text-muted">Track anime, comics & movies</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-lg bg-status-error/10 border border-status-error/30 p-3 mb-6 text-sm text-status-error">
            {error}
          </div>
        )}

        {/* Tab Switch */}
        <div className="flex gap-2 mb-6 p-1 bg-surface-overlay rounded-lg">
          <button
            onClick={() => setActiveTab('google')}
            className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'google'
                ? 'bg-gamma-500 text-surface-base'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Google
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'email'
                ? 'bg-gamma-500 text-surface-base'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Email
          </button>
        </div>

        {/* Google Sign In */}
        {activeTab === 'google' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-surface-border bg-surface-overlay px-4 py-3 text-sm font-medium text-text-primary hover:bg-surface-overlay/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg>
              )}
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>
            <p className="text-xs text-text-muted mt-6 text-center">
              Don't have an account?{' '}
              <Link to="/auth/signup" className="text-gamma-400 hover:text-gamma-300 font-medium">
                Sign up
              </Link>
            </p>
          </motion.div>
        )}

        {/* Email Sign In */}
        {activeTab === 'email' && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleEmailSignIn}
            className="space-y-4"
          >
            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2">Email</label>
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
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2">Password</label>
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
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link to="/auth/forgot-password" className="text-xs text-gamma-400 hover:text-gamma-300 font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-2.5 rounded-xl bg-gamma-500 text-surface-base text-sm font-semibold hover:bg-gamma-400 transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Sign Up Link */}
            <p className="text-xs text-text-muted text-center">
              Don't have an account?{' '}
              <Link to="/auth/signup" className="text-gamma-400 hover:text-gamma-300 font-medium">
                Sign up
              </Link>
            </p>
          </motion.form>
        )}

        <p className="text-xs text-text-muted mt-8 pt-6 border-t border-surface-border text-center">
          Your data syncs across devices securely
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
