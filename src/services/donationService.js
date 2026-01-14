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
   */
  async verifySlip(file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data, error } = await supabase.functions.invoke("verify-slip", {
        body: formData,
      });

      if (error) {
        // If error has a message from our Edge Function
        let msg = error.message;
        try {
          const body = await error.context?.json();
          if (body?.message) msg = body.message;
        } catch (e) {
          /* ignore */
        }
        throw new Error(msg || "การตรวจสอบผิดพลาด");
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
