import { useState, useEffect, useRef } from "react";
import { authService } from "../services/authService";

/**
 * Custom hook for authentication state management
 * Robust version that handles F5 refreshes and prevents infinite loading
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const initializationTimeout = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const checkInitialAuth = async () => {
      try {
        // Get session from Supabase (it handles persistence automatically)
        const { session, user } = await authService.verifyTokenWithAPI();

        if (!isMounted) return;

        setSession(session);
        setUser(user);

        if (session && user) {
          // Check admin status
          const adminStatus = await authService.isAdmin();

          if (isMounted) {
            setIsAdmin(adminStatus);
          }
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        if (isMounted) {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          if (initializationTimeout.current) {
            clearTimeout(initializationTimeout.current);
          }
        }
      }
    };

    // Safety fallback: If it takes more than 5 seconds, stop loading anyway
    initializationTimeout.current = setTimeout(() => {
      if (isMounted) {
        console.warn("Auth initialization timeout");
        setLoading(false);
      }
    }, 5000);

    checkInitialAuth();

    // Listen for future changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (event, currentSession) => {
      if (isMounted) {
        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          const adminStatus = await authService.isAdmin();
          if (isMounted) setIsAdmin(adminStatus);

          // Store token for all logged-in users
          if (currentSession.access_token) {
            authService.setAdminToken(currentSession.access_token);
          }
        } else {
          if (isMounted) setIsAdmin(false);
          authService.clearAdminToken();
        }

        // Only set loading false if it was true (prevent unnecessary re-renders)
        if (loading) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
      if (initializationTimeout.current)
        clearTimeout(initializationTimeout.current);
    };
  }, []);

  const signIn = async (email, password) =>
    await authService.signIn(email, password);
  const signOut = async () => {
    const res = await authService.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    return res;
  };

  return { user, session, loading, isAdmin, signIn, signOut };
};
