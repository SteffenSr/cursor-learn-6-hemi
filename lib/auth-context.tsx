"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface AuthState {
  token: string | null;
  user: { id: string; email: string } | null;
}

interface AuthContextValue extends AuthState {
  setAuth: (token: string, user: { id: string; email: string }) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loaded: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "hemi_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ token: null, user: null });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthState;
        if (parsed.token) setState(parsed);
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  const setAuth = useCallback(
    (token: string, user: { id: string; email: string }) => {
      const next: AuthState = { token, user };
      setState(next);
      setLoaded(true);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    },
    []
  );

  const logout = useCallback(() => {
    setState({ token: null, user: null });
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        setAuth,
        logout,
        isAuthenticated: !!state.token,
        loaded,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
