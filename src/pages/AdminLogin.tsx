import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { loading, configured, isDemo, login } = useAdminAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (loading) return <LoadingScreen />;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (login(username, password)) {
      navigate('/admin');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-4 rounded-xl bg-card p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-foreground text-center">Admin Login</h1>
        {!configured && (
          <p className="text-sm text-muted-foreground text-center">
            Demo Mode Active – use the credentials set in your .env file.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Username</label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Sign In
          </button>
        </form>
        <a href="/" className="block text-center text-sm text-primary hover:underline">
          ← Back to site
        </a>
      </div>
    </div>
  );
}
