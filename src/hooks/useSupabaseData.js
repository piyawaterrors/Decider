import { useState, useEffect } from "react";
import { dbService } from "../services/dbService";

/**
 * Custom hook for fetching data from Supabase
 * @param {Function} fetchFunction - The database service function to call
 * @param {Array} dependencies - Dependencies array for useEffect
 * @returns {Object} - { data, loading, error, refetch }
 */
export const useSupabaseData = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();

      if (result.error) {
        setError(result.error);
        setData(null);
      } else {
        setData(result.data);
        setError(null);
      }
    } catch (err) {
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
 * Custom hook for fetching categories
 */
export const useCategories = () => {
  return useSupabaseData(() => dbService.getCategories(), []);
};

/**
 * Custom hook for fetching decisions by category
 */
export const useDecisions = (categoryId) => {
  return useSupabaseData(
    () => dbService.getDecisionsByCategory(categoryId),
    [categoryId]
  );
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
