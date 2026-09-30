import React, { createContext, useContext, useState, useCallback } from 'react';
import { getSession, logOut as authLogOut } from '../utils/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getSession());

  const refresh = useCallback(() => {
    setSession(getSession());
  }, []);

  const logOut = useCallback(() => {
    authLogOut();
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, refresh, logOut, isAuthenticated: !!session }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
