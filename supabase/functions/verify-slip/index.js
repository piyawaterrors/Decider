// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/introduction

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const SLIP2GO_API_KEY = Deno.env.get("SLIP2GO_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SLIP2GO_API_KEY) throw new Error("SLIP2GO_API_KEY is not set");

    const amount = parseFloat(formData.get("amount") || "0");
    const customDisplayName = formData.get("display_name");
    const customMessage = formData.get("message");

    // Get User ID from Auth Header (optional but recommended for security)
    let authUserId = null;
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const {
        data: { user },
      } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
      if (user) authUserId = user.id;
    }

    // 1. Convert File to Base64 and Send to Slip2Go
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64File = `data:${file.type};base64,${btoa(binary)}`;

    console.log("Sending request to Slip2Go (Base64)...");

    const s2gResponse = await fetch(
      "https://connect.slip2go.com/api/verify-slip/qr-base64/info",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SLIP2GO_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: {
            imageBase64: base64File,
            checkCondition: {
              checkReceiver: [
                {
                  accountNameTH: "ปิยวัฒน์ เขมะวิริยะอนันต์",
                  accountNameEN: "PIYAWAT KHEMAWIRIYAANAN",
                },
              ],
              checkDuplicate: false,
              checkAmount: {
                type: "gte", // eq, gte, lte
                amount: amount,
              },
            },
          },
        }),
      }
    );

    const s2gResult = await s2gResponse.json();
    console.log("Slip2Go Response:", s2gResult);

    // 200000: Success, 200200: Success with Condition Checked
    const s2gCode = s2gResult.code;
    const isSuccess = s2gCode === "200000" || s2gCode === "200200";

    if (!isSuccess) {
      // Map Slip2Go codes to user-friendly messages
      let errorMessage = s2gResult.message || "สลิปไม่ถูกต้อง";

      switch (s2gCode) {
        case "200401":
          errorMessage = "บัญชีผู้รับไม่ถูกต้อง (โอนผิดคนหรือเปล่านะ? 🤨)";
          break;
        case "200402":
          errorMessage = "ยอดโอนเงินไม่ตรงตามที่ระบุไว้ครับ";
          break;
        case "200403":
          errorMessage = "วันที่โอนไม่ตรงเงื่อนไข";
          break;
        case "200404":
          errorMessage =
            "ไม่พบข้อมูลสลิปนี้ในระบบธนาคาร (สลิปปลอมหรือเปล่า? 🧐)";
          break;
        case "200500":
          errorMessage = "สลิปเสียหรือเป็นสลิปปลอมครับ อย่าหาทำ! ❌";
          break;
        case "200501":
          errorMessage = "สลิปนี้เคยถูกใช้งานไปแล้วนะจ๊ะ ไม่เนียนๆ 🤫";
          break;
      }

      return new Response(
        JSON.stringify({
          error: "invalid_slip",
          message: errorMessage,
          code: s2gCode,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const slip = Array.isArray(s2gResult.data)
      ? s2gResult.data[0]
      : s2gResult.data;

    if (!slip) {
      throw new Error("No data found in Slip2Go response");
    }

    // 2. Fetch My Account Info from Settings (For safety and fallback)
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from("settings")
      .select("key, value")
      .in("key", ["promtpay", "min_donation"]);

    if (settingsError) throw settingsError;

    const myPromptPay = settings
      ?.find((s) => s.key === "promtpay")
      ?.value?.replace(/-/g, "");
    const minAmount = parseFloat(
      settings?.find((s) => s.key === "min_donation")?.value || "0"
    );

    // 3. Validation
    // If code is 200200, Slip2Go already verified our conditions (Receiver & Amount)
    // We only perform local checks as a fallback for 200000 or safety
    const slipAmount = parseFloat(slip.amount || "0");

    if (s2gResult.code === "200000") {
      const receiverAcc = (
        slip.receiver?.account?.proxyId ||
        slip.receiver?.account?.accountNo ||
        slip.receiver?.account?.proxy?.account
      )?.replace(/-/g, "");

      if (
        receiverAcc &&
        !receiverAcc.includes("x") &&
        receiverAcc !== myPromptPay
      ) {
        return new Response(
          JSON.stringify({
            error: "wrong_receiver",
            message: `โอนผิดบัญชี! ต้องเป็น ${myPromptPay} (สลิปนี้โอนไปที่ ${receiverAcc})`,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }
    }

    if (slipAmount < minAmount) {
      return new Response(
        JSON.stringify({
          error: "insufficient_amount",
          message: `ยอดเงินไม่ถูกต้อง ขั้นต่ำคือ ${minAmount} บาท (สลิปนี้มียอด ${slipAmount} บาท)`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // 4. Check for Duplicate Slip
    const transRef = slip.transRef || slip.trans_ref || slip.trans_id;
    const { data: duplicate } = await supabaseAdmin
      .from("donations")
      .select("id")
      .eq("trans_ref", transRef)
      .maybeSingle();

    if (duplicate) {
      return new Response(
        JSON.stringify({
          error: "duplicate_slip",
          message: "สลิปนี้เคยใช้ไปแล้วนะจ๊ะ อย่ามาเนียน! 🤨",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // 5. Record Donation (New Schema)
    const senderNameFromSlip =
      slip.sender?.account?.name?.th ||
      slip.sender?.account?.name ||
      slip.sender?.displayName ||
      slip.sender?.name ||
      "ผู้สนับสนุนนิรนาม";

    await supabaseAdmin.from("donations").insert({
      trans_ref: transRef,
      amount: slipAmount,
      sender_name: senderNameFromSlip,
      display_name: customDisplayName || senderNameFromSlip, // ใช้ชื่อที่ผู้ใช้เจาะจงมา ถ้าไม่มีใช้ชื่อจากสลิป
      message: customMessage, // ข้อความที่ผู้ใช้ฝากไว้
      user_id: authUserId, // ผูกกับรหัสผู้ใช้ (ถ้ามี)
      payload_data: slip, // ข้อมูลดิบทั้งหมด
    });

    return new Response(
      JSON.stringify({
        success: true,
        code: s2gResult.code,
        message: s2gResult.message,
        data: slip,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "server_error", message: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
