import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/components/AdminAuth';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  const { loading, configured, isLocked, lockoutRemaining, login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isLocked) {
      const interval = setInterval(() => {
        if (lockoutRemaining <= 0) {
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isLocked, lockoutRemaining]);

  if (loading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (isLocked) {
      setError(`Too many failed attempts. Try again in ${Math.ceil(lockoutRemaining / 60)} minutes.`);
      return;
    }
    
    if (login(username, password)) {
      navigate('/admin');
    } else {
      const remaining = Math.max(0, 5 - attemptsRemaining - 1);
      setAttemptsRemaining(5 - remaining - 1);
      
      if (remaining <= 2) {
        setError(`Invalid credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining before lockout.`);
      } else {
        setError('Invalid username or password');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-4 rounded-xl bg-card p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-foreground text-center">Sign In</h1>
        {!configured ? (
          <p className="text-sm text-muted-foreground text-center">
            No admin credentials configured.
          </p>
        ) : isLocked ? (
          <div className="text-center">
            <p className="text-sm text-destructive">
              Account temporarily locked due to multiple failed attempts.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Try again in {Math.ceil(lockoutRemaining / 60)} minutes
            </p>
          </div>
        ) : null}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Username</label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLocked}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLocked}
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={isLocked || !configured}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isLocked ? 'Locked' : 'Sign In'}
          </button>
        </form>
        <a href="/" className="block text-center text-sm text-primary hover:underline">
          ← Back to site
        </a>
      </div>
    </div>
  );
}
