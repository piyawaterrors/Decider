import { supabase } from "./supabaseClient";

/**
 * Authentication Service
 * Handles all authentication-related operations with Supabase
 */

export const authService = {
  /**
   * Sign in with email and password
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      return { data: null, error };
    }
  },

  /**
   * Sign up with email and password
   */
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Sign up error:", error);
      return { data: null, error };
    }
  },

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Sign out error:", error);
      return { error };
    }
  },

  /**
   * Get current session
   */
  async getSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      return { session, error: null };
    } catch (error) {
      console.error("Get session error:", error);
      return { session: null, error };
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      console.error("Get user error:", error);
      return { user: null, error };
    }
  },

  /**
   * Check if user is admin
   * This checks the user's role from the profiles table
   */
  async isAdmin() {
    try {
      // Get session reliably - reading from local cache is instant
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        console.log("👤 isAdmin check: No active session found");
        return false;
      }

      console.log("🔍 isAdmin check: Verifying role for", user.email);

      // Use maybeSingle to prevent PGRST116 (no rows) from throwing an error
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("❌ Profile query error:", profileError);
        return false;
      }

      const isAdminStatus = data?.role === "admin";
      console.log(`🔑 isAdmin result: ${isAdminStatus}`);
      return isAdminStatus;
    } catch (error) {
      console.error("❌ Check admin error:", error);
      return false;
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
