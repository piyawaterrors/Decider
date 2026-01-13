import { supabase } from "./supabaseClient";

/**
 * Database Service
 * Handles all database operations with Supabase
 * Schema: title, icon_name, content, insult_text (ตาม SUPABASE_SETUP.md)
 */

export const dbService = {
  /**
   * Get all categories
   */
  async getCategories() {
    try {
      // 🚨 ตรวจสอบการตั้งค่าก่อน
      if (!supabase?.auth) {
        throw new Error(
          "Supabase client is not initialized. Please check your .env variables."
        );
      }

      console.log("🔍 Fetching categories from Supabase...");

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true });

      console.log("📊 Supabase Response:", { data, error });

      if (error) {
        console.error("❌ Supabase Error:", error);
        throw error;
      }

      console.log("✅ Categories fetched:", data?.length || 0, "items");
      return { data, error: null };
    } catch (error) {
      console.error("❌ Get categories error:", error);
      return { data: null, error: error.message || error };
    }
  },

  /**
   * Get decisions by category
   */
  async getDecisionsByCategory(categoryId) {
    try {
      const { data, error } = await supabase
        .from("decisions_pool")
        .select("*")
        .eq("category_id", categoryId)
        .eq("is_active", true);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Get decisions error:", error);
      return { data: null, error };
    }
  },

  /**
   * Get all decisions
   */
  async getAllDecisions() {
    try {
      const { data, error } = await supabase
        .from("decisions_pool")
        .select("*, categories(*)");

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Get all decisions error:", error);
      return { data: null, error };
    }
  },

  /**
   * Log usage (for analytics)
   */
  async logUsage(categoryId, resultContent, context = {}) {
    try {
      const { data, error } = await supabase.from("usage_logs").insert([
        {
          category_id: categoryId,
          result_content: resultContent,
          user_context: context,
        },
      ]);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Log usage error:", error);
      return { data: null, error };
    }
  },

  /**
   * Create category (Admin only)
   */
  async createCategory(categoryData) {
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert([categoryData])
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Create category error:", error);
      return { data: null, error };
    }
  },

  /**
   * Update category (Admin only)
   */
  async updateCategory(id, categoryData) {
    try {
      const { data, error } = await supabase
        .from("categories")
        .update(categoryData)
        .eq("id", id)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Update category error:", error);
      return { data: null, error };
    }
  },

  /**
   * Delete category (Admin only)
   */
  async deleteCategory(id) {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Delete category error:", error);
      return { error };
    }
  },

  /**
   * Create decision (Admin only)
   */
  async createDecision(decisionData) {
    try {
      const { data, error } = await supabase
        .from("decisions_pool")
        .insert([decisionData])
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Create decision error:", error);
      return { data: null, error };
    }
  },

  /**
   * Update decision (Admin only)
   */
  async updateDecision(id, decisionData) {
    try {
      const { data, error } = await supabase
        .from("decisions_pool")
        .update(decisionData)
        .eq("id", id)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Update decision error:", error);
      return { data: null, error };
    }
  },

  /**
   * Delete decision (Admin only)
   */
  async deleteDecision(id) {
    try {
      const { error } = await supabase
        .from("decisions_pool")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Delete decision error:", error);
      return { error };
    }
  },

  /**
   * Subscribe to real-time changes
   */
  subscribeToChanges(table, callback) {
    return supabase
      .channel(`public:${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, callback)
      .subscribe();
  },
};
