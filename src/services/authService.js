import { supabase } from "./supabaseClient";

/**
 * Authentication Service
 * Handles all authentication-related operations with Supabase
 */

const ADMIN_TOKEN_KEY = "auth-token";

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

      // Store token for all successful logins
      if (data.session?.access_token) {
        this.setAdminToken(data.session.access_token);
      }

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

      // Clear admin token
      this.clearAdminToken();

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
   * Verify session exists and is valid
   * Supabase handles session persistence automatically
   */
  async verifyTokenWithAPI() {
    try {
      // Read session directly from localStorage (bypass Supabase client bug)
      const storageKey = "sb-auth-token";
      const storedData = localStorage.getItem(storageKey);

      if (!storedData) {
        return { session: null, user: null, error: null };
      }

      const parsed = JSON.parse(storedData);

      // Verify not expired
      if (parsed.expires_at) {
        const expiresAt = new Date(parsed.expires_at * 1000);
        if (expiresAt < new Date()) {
          localStorage.removeItem(storageKey);
          return {
            session: null,
            user: null,
            error: new Error("Session expired"),
          };
        }
      }

      return { session: parsed, user: parsed.user, error: null };
    } catch (error) {
      console.error("Verify session error:", error);
      return { session: null, user: null, error };
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
      // Read session from localStorage
      const storageKey = "sb-auth-token";
      const storedData = localStorage.getItem(storageKey);

      // ถ้ามี token ใน localStorage ให้ถือว่าเป็น Admin ทันทีตามความต้องการของ User
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          // ตรวจสอบว่า session ยังไม่หมดอายุ
          if (parsed.expires_at) {
            const expiresAt = new Date(parsed.expires_at * 1000);
            if (expiresAt > new Date()) {
              return true;
            }
          } else {
            return true; // ไม่จำกัดวันหมดอายุ
          }
        } catch (e) {
          console.error("Token parsing error:", e);
        }
      }

      return false;
    } catch (error) {
      console.error("Check admin error:", error);
      return false;
    }
  },

  /**
   * Check if user is admin from stored token
   * This is faster than querying the database
   */
  async isAdminFromToken() {
    try {
      const token = this.getAdminToken();
      if (!token) {
        return false;
      }

      // Verify the token is still valid by checking session
      const { session } = await this.getSession();
      if (!session || session.access_token !== token) {
        // Token is invalid, clear it
        this.clearAdminToken();
        return false;
      }

      // Token is valid, verify admin status
      const isAdminUser = await this.isAdmin();
      if (!isAdminUser) {
        // User is no longer admin, clear token
        this.clearAdminToken();
        return false;
      }

      return true;
    } catch (error) {
      console.error("❌ Check admin from token error:", error);
      this.clearAdminToken();
      return false;
    }
  },

  /**
   * Store admin token in localStorage
   */
  setAdminToken(token) {
    try {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } catch (error) {
      console.error("Error storing admin token:", error);
    }
  },

  /**
   * Get admin token from localStorage
   */
  getAdminToken() {
    try {
      return localStorage.getItem(ADMIN_TOKEN_KEY);
    } catch (error) {
      console.error("Error getting admin token:", error);
      return null;
    }
  },

  /**
   * Clear admin token from localStorage
   */
  clearAdminToken() {
    try {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    } catch (error) {
      console.error("Error clearing admin token:", error);
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
