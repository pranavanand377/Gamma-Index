import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabase';
import GammaLogo from '../components/common/GammaLogo';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Verifying your session...');
  const [status, setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    const handleCallback = async () => {
      // Check for error params from Supabase (e.g. otp_expired, access_denied)
      const errorCode = searchParams.get('error_code');
      const errorDescription = searchParams.get('error_description');

      if (errorCode) {
        const readableError = errorDescription
          ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
          : 'Authentication failed';

        if (errorCode === 'otp_expired') {
          setMessage('This link has expired or was already used. Please request a new sign-up or try signing in.');
        } else {
          setMessage(readableError);
        }
        setStatus('error');
        return;
      }

      // Try to exchange PKCE code for session
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

        if (error) {
          // If code exchange fails, the session may have already been set by detectSessionInUrl
          // Check if we already have a valid session
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData.session) {
            throw error;
          }
        }

        setMessage('Verified! Redirecting...');
        setStatus('success');
        setTimeout(() => navigate('/', { replace: true }), 800);
      } catch (err) {
        console.error('[AuthCallback] session exchange error:', err);

        // Last resort: check if session was set by onAuthStateChange
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          setMessage('Verified! Redirecting...');
          setStatus('success');
          setTimeout(() => navigate('/', { replace: true }), 800);
        } else {
          setMessage(
            err?.message?.includes('expired')
              ? 'This link has expired. Please request a new one.'
              : 'Verification failed. Please try signing in again.'
          );
          setStatus('error');
        }
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface-raised p-8 shadow-2xl text-center">
        <div className="flex justify-center mb-6">
          <GammaLogo size={48} />
        </div>

        {status === 'loading' && (
          <Loader2 size={32} className="animate-spin mx-auto text-gamma-500 mb-4" />
        )}
        {status === 'success' && (
          <CheckCircle size={32} className="mx-auto text-status-success mb-4" />
        )}
        {status === 'error' && (
          <AlertCircle size={32} className="mx-auto text-status-error mb-4" />
        )}

        <p className={`text-sm ${status === 'error' ? 'text-status-error' : 'text-text-muted'}`}>
          {message}
        </p>

        {status === 'error' && (
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => navigate('/auth/login', { replace: true })}
              className="w-full rounded-lg bg-gamma-500 px-4 py-2.5 text-sm font-semibold text-surface-base transition-colors hover:bg-gamma-400"
            >
              Go to Sign In
            </button>
            <button
              onClick={() => navigate('/auth/signup', { replace: true })}
              className="w-full rounded-lg border border-surface-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-overlay hover:text-text-primary"
            >
              Create New Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;
