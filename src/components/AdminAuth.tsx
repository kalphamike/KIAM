import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useMemo } from "react";
import { supabase } from '@/lib/supabase';

const SESSION_KEY = '__auth_session';
const FAILURES_KEY = '__auth_failures';
const LOCKOUT_KEY = '__auth_lockout';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;
const SESSION_DURATION = 2 * 60 * 60 * 1000;

interface AdminAuthContextType {
  user: unknown;
  loading: boolean;
  configured: boolean;
  isDemo: boolean;
  isLocked: boolean;
  lockoutRemaining: number;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  loading: false,
  configured: false,
  isDemo: true,
  isLocked: false,
  lockoutRemaining: 0,
  login: () => false,
  logout: () => {},
  isAuthenticated: false,
});

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const createObfuscatedKey = (input: string): string => {
  const base = btoa(input.split('').reverse().join(''));
  const hashed = hashString(base + 'kiam_salt_v2').toString(36);
  return hashed;
};

const verifyCredentials = (username: string, password: string): boolean => {
  const adminUser = import.meta.env.VITE_ADMIN_USER || '';
  const adminPass = import.meta.env.VITE_ADMIN_PASS || '';
  
  if (!adminUser || !adminPass) return false;
  
  const timeBasedOffset = Math.floor(Date.now() / (5 * 60 * 1000)) % 100;
  const obfuscatedUser = createObfuscatedKey(adminUser + timeBasedOffset);
  const obfuscatedPass = createObfuscatedKey(adminPass + timeBasedOffset);
  
  const inputHashUser = createObfuscatedKey(username + timeBasedOffset);
  const inputHashPass = createObfuscatedKey(password + timeBasedOffset);
  
  return inputHashUser === obfuscatedUser && inputHashPass === obfuscatedPass;
};

const isSessionValid = (): { valid: boolean; user: unknown } => {
  try {
    const sessionData = sessionStorage.getItem(SESSION_KEY);
    if (!sessionData) return { valid: false, user: null };
    
    const session = JSON.parse(sessionData);
    const now = Date.now();
    
    if (now - session.timestamp > SESSION_DURATION) {
      sessionStorage.removeItem(SESSION_KEY);
      return { valid: false, user: null };
    }
    
    return { valid: true, user: session.user };
  } catch {
    return { valid: false, user: null };
  }
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  useEffect(() => {
    const { valid, user: storedUser } = isSessionValid();
    if (valid && storedUser) {
      setUser(storedUser);
    }
    
    const storedLockout = sessionStorage.getItem(LOCKOUT_KEY);
    if (storedLockout) {
      const lockoutTime = parseInt(storedLockout, 10);
      if (Date.now() < lockoutTime) {
        setLockoutUntil(lockoutTime);
      } else {
        sessionStorage.removeItem(LOCKOUT_KEY);
        sessionStorage.removeItem(FAILURES_KEY);
      }
    }
    
    setLoading(false);
  }, []);

  const getFailures = useCallback((): number => {
    try {
      const failures = sessionStorage.getItem(FAILURES_KEY);
      return failures ? parseInt(failures, 10) : 0;
    } catch {
      return 0;
    }
  }, []);

  const incrementFailures = useCallback(() => {
    const failures = getFailures() + 1;
    sessionStorage.setItem(FAILURES_KEY, failures.toString());
    
    if (failures >= MAX_ATTEMPTS) {
      const lockoutTime = Date.now() + LOCKOUT_DURATION;
      sessionStorage.setItem(LOCKOUT_KEY, lockoutTime.toString());
      setLockoutUntil(lockoutTime);
    }
  }, [getFailures]);

  const clearFailures = useCallback(() => {
    sessionStorage.removeItem(FAILURES_KEY);
    sessionStorage.removeItem(LOCKOUT_KEY);
    setLockoutUntil(null);
  }, []);

  const login = useCallback((username: string, password: string): boolean => {
    if (lockoutUntil && Date.now() < lockoutUntil) {
      return false;
    }

    const isValid = verifyCredentials(username, password);
    
    if (isValid) {
      const userData = { name: username, loginTime: Date.now() };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        user: userData,
        timestamp: Date.now()
      }));
      setUser(userData);
      clearFailures();
      return true;
    }

    incrementFailures();
    return false;
  }, [lockoutUntil, clearFailures, incrementFailures]);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const isAuthenticated = useMemo(() => user !== null, [user]);
  const isSupabase = supabase !== null;
  const isLocked = lockoutUntil !== null && Date.now() < lockoutUntil;
  const lockoutRemaining = isLocked ? Math.ceil((lockoutUntil - Date.now()) / 1000) : 0;

  const value = useMemo(() => ({
    user: isSupabase ? null : user,
    loading,
    configured: isSupabase || Boolean(import.meta.env.VITE_ADMIN_USER),
    isDemo: !isSupabase,
    isLocked,
    lockoutRemaining,
    login,
    logout,
    isAuthenticated,
  }), [user, loading, isSupabase, isLocked, lockoutRemaining, login, logout, isAuthenticated]);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    return {
      user: null,
      loading: false,
      configured: false,
      isDemo: true,
      isLocked: false,
      lockoutRemaining: 0,
      login: () => false,
      logout: () => {},
      isAuthenticated: false,
    };
  }
  return context;
}
