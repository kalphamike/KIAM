import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { supabase } from '@/lib/supabase';

interface AdminAuthContextType {
  user: unknown;
  loading: boolean;
  configured: boolean;
  isDemo: boolean;
  /** Returns true if credentials match */
  login: (username: string, password: string) => boolean;
}

// default (no‑auth) values
const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  loading: false,
  configured: false,
  isDemo: true,
  login: () => false,
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  // store the logged‑in user (null = not logged in)
  const [user, setUser] = useState<unknown>(null);

  // credentials come from env vars (add them to .env / Netlify env)
  const ADMIN_USER = import.meta.env.VITE_ADMIN_USER || "";
  const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || "";

  /** Simple check against the env variables */
  const login = (username: string, password: string): boolean => {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setUser({ name: username });
      return true;
    }
    return false;
  };

  const value = useMemo(() => {
    const isSupabase = supabase !== null;
    return {
      user: isSupabase ? null : user,
      loading: false,
      configured: isSupabase,
      isDemo: !isSupabase,
      login,
    };
  }, [user]);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    return {
      user: null,
      loading: false,
      configured: false,
      isDemo: true,
      login: () => false,
    };
  }
  return context;
}
