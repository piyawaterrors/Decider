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
        console.log("🔐 Checking Initial Auth...");

        // 1. Get session immediately from storage
        const { session: currentSession } = await authService.getSession();

        if (isMounted) {
          setSession(currentSession);
          setUser(currentSession?.user || null);

          if (currentSession?.user) {
            console.log("👤 User found, verifying admin role...");
            const adminStatus = await authService.isAdmin();
            if (isMounted) setIsAdmin(adminStatus);
          }
        }
      } catch (error) {
        console.error("❌ Auth Init Error:", error);
      } finally {
        if (isMounted) {
          console.log("✅ Auth Loading Finished");
          setLoading(false);
          if (initializationTimeout.current)
            clearTimeout(initializationTimeout.current);
        }
      }
    };

    // Safety fallback: If it takes more than 7 seconds, stop loading anyway
    initializationTimeout.current = setTimeout(() => {
      if (loading && isMounted) {
        console.warn(
          "⚠️ Auth initialization taking too long, forcing load complete"
        );
        setLoading(false);
      }
    }, 7000);

    checkInitialAuth();

    // Listen for future changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (event, currentSession) => {
      console.log(`🔄 Auth Event: ${event}`);

      if (isMounted) {
        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          const adminStatus = await authService.isAdmin();
          if (isMounted) setIsAdmin(adminStatus);
        } else {
          if (isMounted) setIsAdmin(false);
        }

        // Only set loading false if it was true (prevent unnecessary re-renders)
        setLoading(false);
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
