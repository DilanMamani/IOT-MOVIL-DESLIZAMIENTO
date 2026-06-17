import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { storageGet, storageSet, storageDelete } from "../api/storage";
import * as authApi from "../api/auth";
import { SESSION_KEY } from "../api/http";
import type { AuthSession, User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    full_name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function persistSession(session: AuthSession | null) {
  if (session) {
    await storageSet(SESSION_KEY, JSON.stringify(session));
  } else {
    await storageDelete(SESSION_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await storageGet(SESSION_KEY);
        if (raw) {
          const stored = JSON.parse(raw) as AuthSession;
          setSession(stored);
          try {
            const freshUser = await authApi.me();
            setSession({ token: stored.token, user: freshUser });
          } catch {
            setSession(null);
            await persistSession(null);
          }
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    setSession(result);
    await persistSession(result);
  }, []);

  const register = useCallback(
    async (payload: { full_name: string; email: string; password: string }) => {
      const result = await authApi.register({ ...payload, role: "ciudadano" });
      setSession(result);
      await persistSession(result);
    },
    []
  );

  const logout = useCallback(async () => {
    setSession(null);
    await persistSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isLoading,
      login,
      register,
      logout,
    }),
    [session, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
