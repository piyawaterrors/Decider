import { useState, useEffect } from "react";
import { dbService } from "../services/dbService";
import { settingsService } from "../services/settingsService";

/**
 * Custom hook for fetching data from Supabase with timeout
 * @param {Function} fetchFunction - The database service function to call
 * @param {Array} dependencies - Dependencies array for useEffect
 * @param {number} timeout - Timeout in milliseconds (default: 10000)
 * @returns {Object} - { data, loading, error, refetch }
 */
export const useSupabaseData = (
  fetchFunction,
  dependencies = [],
  timeout = 10000
) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      console.log("🔄 Fetching data...");
      setLoading(true);
      setError(null);

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), timeout)
      );

      // Race between fetch and timeout
      const result = await Promise.race([fetchFunction(), timeoutPromise]);

      console.log("📊 Fetch result:", result);

      if (result.error) {
        console.error("❌ Fetch error:", result.error);
        setError(result.error);
        setData(null);
      } else {
        console.log("✅ Data fetched:", result.data?.length || 0, "items");
        setData(result.data);
        setError(null);
      }
    } catch (err) {
      console.error("❌ Fetch exception:", err);
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

/**
 * Custom hook for fetching categories with 10s timeout
 */
export const useCategories = () => {
  return useSupabaseData(() => dbService.getCategories(), [], 10000);
};

/**
 * Custom hook for fetching decisions by category
 */
export const useDecisions = (categoryId) => {
  return useSupabaseData(
    () => dbService.getDecisionsByCategory(categoryId),
    [categoryId],
    10000
  );
};

/**
 * Custom hook for fetching settings
 */
export const useSettings = () => {
  return useSupabaseData(() => settingsService.getAllSettings(), []);
};

/**
 * Custom hook for real-time subscriptions
 */
export const useRealtimeSubscription = (table, callback) => {
  useEffect(() => {
    const subscription = dbService.subscribeToChanges(table, callback);

    return () => {
      subscription.unsubscribe();
    };
  }, [table, callback]);
};
