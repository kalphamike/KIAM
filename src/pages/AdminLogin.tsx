import { useState } from 'react';
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
  const { loading, configured, isDemo } = useAdminAuth();
  const navigate = useNavigate();

  if (loading) {
    return <LoadingScreen />;
  }

  const handleContinue = () => {
    navigate('/admin');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-foreground text-center">Admin Login</h1>
        
        {!configured ? (
          <>
            <p className="text-sm text-muted-foreground text-center">
              Demo Mode Active
            </p>
            <div className="rounded-lg bg-blue-500/10 p-3 text-sm text-blue-600 dark:text-blue-400 text-center">
              Supabase not configured - running in demo mode
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Sign in with your credentials
          </p>
        )}

        <button
          onClick={handleContinue}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Continue to Admin
        </button>
        
        <a href="/" className="block text-center text-sm text-primary hover:underline">
          ← Back to site
        </a>
      </div>
    </div>
  );
}