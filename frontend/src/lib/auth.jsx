/** Session provider — token + user persisted to localStorage. */

import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContext";

const STORAGE_KEY = "vortex.session";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable (private mode) — the session stays in memory */
    }
  }, [session]);

  const value = useMemo(
    () => ({
      user: session?.user || null,
      token: session?.token || null,
      isAuthed: Boolean(session?.user),
      signIn: (user, token) => setSession({ user, token }),
      signOut: () => setSession(null),
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
