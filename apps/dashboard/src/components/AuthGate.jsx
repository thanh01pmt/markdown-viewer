import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { LogIn, ShieldAlert, Loader2, Hexagon } from 'lucide-react';

export function AuthGate({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [error, setError] = useState(null);
  const [signingIn, setSigningIn] = useState(false);
  const { fetchAll } = useStore();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchAll();
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchAll();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchAll]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setSigningIn(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });

    if (error) {
      setError(error.message);
    } else {
      // Session will be updated by listener
    }
    setSigningIn(false);
  };

  if (loading) {
    return (
      <div className="token-gate">
        <div className="token-card flex flex-col items-center justify-center p-12">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-400">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="token-gate">
        <div className="token-card">
          <div className="token-header">
            <div className="token-logo">
              <Hexagon className="w-10 h-10 text-blue-500" />
            </div>
            <h1 className="token-title">Secure Login</h1>
            <p className="token-sub">
              Learning Material Dashboard cho lộ trình <strong>HP7 → HP12</strong>.
              Đăng nhập để tiếp tục.
            </p>
          </div>

          <div className="token-divider" />

          <form onSubmit={handleSignIn} className="token-form">
            <div className="token-field mb-4">
              <label className="token-label">Email Address</label>
              <input
                className="token-input"
                type="email"
                placeholder="admin@test.com"
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="token-field mb-6">
              <label className="token-label">Password</label>
              <input
                className="token-input"
                type="password"
                placeholder="••••••••"
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="token-error mb-6 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn-primary flex items-center justify-center gap-2 w-full" disabled={signingIn}>
              {signingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="token-footer mt-8 text-xs text-center text-gray-500">
            Powered by Supabase Auth · Restricted Access
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
