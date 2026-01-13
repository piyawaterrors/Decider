import { supabase } from "./supabaseClient";

/**
 * Settings Service
 * Handles system settings operations
 */

export const settingsService = {
  /**
   * Get a setting by key
   */
  async getSetting(key) {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("key", key)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error(`Get setting ${key} error:`, error);
      return { data: null, error };
    }
  },

  /**
   * Get all settings
   */
  async getAllSettings() {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .order("key", { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Get all settings error:", error);
      return { data: null, error };
    }
  },

  /**
   * Update a setting
   */
  async updateSetting(key, value, userId = null) {
    try {
      const { data, error } = await supabase
        .from("settings")
        .update({
          value,
          updated_at: new Date().toISOString(),
          updated_by: userId,
        })
        .eq("key", key)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error(`Update setting ${key} error:`, error);
      return { data: null, error };
    }
  },

  /**
   * Check if donations are enabled
   */
  async isDonationEnabled() {
    try {
      const { data, error } = await this.getSetting("donation_enabled");
      if (error || !data) return true; // Default to enabled if error
      return data.value === true || data.value === "true";
    } catch (error) {
      console.error("Check donation enabled error:", error);
      return true; // Default to enabled
    }
  },
};
