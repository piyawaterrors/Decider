import generatePayload from "promptpay-qr";
import { supabase } from "./supabaseClient";

/**
 * Donation Service
 * Handles PromptPay payload generation and Slip verification via Edge Functions
 */

export const donationService = {
  /**
   * Generate PromptPay Payload
   * @param {string} promptpayId - Phone number or ID Card
   * @param {number} amount - Amount in THB
   */
  generatePayload(promptpayId, amount) {
    if (!promptpayId) return null;
    const cleanId = promptpayId.replace(/-/g, "");
    return generatePayload(cleanId, { amount });
  },

  /**
   * Verify slip using Supabase Edge Function
   * @param {File} file - The slip image file
   * @param {number} amount - The expected donation amount
   * @param {Object} extraInfo - Additional info (display_name, message)
   */
  async verifySlip(file, amount, extraInfo = {}) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("amount", amount);
    if (extraInfo.display_name)
      formData.append("display_name", extraInfo.display_name);
    if (extraInfo.message) formData.append("message", extraInfo.message);

    try {
      const { data, error } = await supabase.functions.invoke("verify-slip", {
        body: formData,
      });

      if (error) {
        // Try to get a more specific message if possible
        let errorMsg = "การตรวจสอบผิดพลาด";

        // Check if the error is from the function return
        if (error instanceof Error) {
          errorMsg = error.message;
        }

        // Supabase invoke errors sometimes hide the real response in context
        try {
          const body = await error.context?.json();
          if (body?.message) errorMsg = body.message;
        } catch (e) {
          console.warn("Could not parse error context JSON", e);
        }

        throw new Error(errorMsg);
      }

      return {
        isValid: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Slip verification error:", error);
      throw error;
    }
  },
};
