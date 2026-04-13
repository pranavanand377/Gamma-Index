import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import GammaLogo from '../components/common/GammaLogo';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    // Give Supabase a moment to process the confirmation
    const timer = setTimeout(() => {
      // Redirect to home after email is confirmed
      setMessage('Email verified! Redirecting...');
      setTimeout(() => navigate('/'), 1000);
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface-raised p-8 shadow-2xl text-center">
        <div className="flex justify-center mb-6">
          <GammaLogo size={48} />
        </div>
        <Loader2 size={32} className="animate-spin mx-auto text-gamma-500 mb-4" />
        <p className="text-sm text-text-muted">{message}</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
