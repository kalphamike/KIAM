import { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface AdminAuthContextType {
  user: unknown;
  loading: boolean;
  configured: boolean;
  isDemo: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  loading: false,
  configured: false,
  isDemo: true,
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => {
    const isSupabase = supabase !== null;
    return {
      user: isSupabase ? null : 'demo-user',
      loading: false,
      configured: isSupabase,
      isDemo: !isSupabase,
    };
  }, []);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    return { user: null, loading: false, configured: false, isDemo: true };
  }
  return context;
}