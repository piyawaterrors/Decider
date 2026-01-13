import { useState, useEffect } from "react";
import { authService } from "../services/authService";

/**
 * Custom hook for authentication state management
 * @returns {Object} - { user, session, loading, isAdmin, signIn, signUp, signOut }
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        console.log("🔐 Initializing auth...");

        const { session, error } = await authService.getSession();

        if (error) {
          console.error("❌ Session error:", error);
          setLoading(false);
          return;
        }

        console.log("📝 Session:", session ? "Found" : "Not found");
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          console.log("👤 User found, checking admin status...");

          try {
            const adminStatus = await authService.isAdmin();
            console.log("🔑 Admin status:", adminStatus);
            setIsAdmin(adminStatus);
          } catch (adminError) {
            console.error("❌ Admin check error:", adminError);
            setIsAdmin(false);
          }
        } else {
          console.log("👤 No user found");
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
      } finally {
        console.log("✅ Auth initialization complete");
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event);

      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        try {
          const adminStatus = await authService.isAdmin();
          console.log("🔑 Admin status (state change):", adminStatus);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error("❌ Admin check error (state change):", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await authService.signIn(email, password);
    return { data, error };
  };

  const signUp = async (email, password, metadata) => {
    const { data, error } = await authService.signUp(email, password, metadata);
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await authService.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    }
    return { error };
  };

  return {
    user,
    session,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
  };
};
