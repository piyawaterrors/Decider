// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/introduction

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const SLIP2GO_API_KEY = Deno.env.get('SLIP2GO_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!SLIP2GO_API_KEY) throw new Error('SLIP2GO_API_KEY is not set')

    // 1. Send to Slip2Go
    const s2gFormData = new FormData()
    s2gFormData.append('files', file)

    const s2gResponse = await fetch('https://api.slip2go.com/v1/verify/', {
      method: 'POST',
      headers: {
        'x-api-key': SLIP2GO_API_KEY,
      },
      body: s2gFormData,
    })

    const s2gResult = await s2gResponse.json()

    if (!s2gResponse.ok) {
      return new Response(
        JSON.stringify({ error: s2gResult.message || 'Verification failed at Slip2Go' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const slip = s2gResult.data?.[0]?.payload
    if (!slip || s2gResult.data?.[0]?.status !== 'success') {
      return new Response(
        JSON.stringify({ error: 'invalid_slip', message: 'สลิปปลอมหรือข้อมูลไม่ถูกต้องนะจ๊ะ! 🙄' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 2. Fetch My Account Info from Settings
    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    const { data: settings } = await supabaseAdmin
      .from('settings')
      .select('key, value')
      .in('key', ['promptpay_id', 'min_donation_amount'])

    const myPromptPay = settings?.find(s => s.key === 'promptpay_id')?.value?.replace(/-/g, '')
    const minAmount = parseFloat(settings?.find(s => s.key === 'min_donation_amount')?.value || '0')

    // 3. Validation Logic
    const receiverAcc = slip.receiver?.account?.replace(/-/g, '')
    // Some slips might have receiver.name instead of account if it's within same bank or other reasons
    // But account is more reliable. We check both or either as requested.
    
    if (receiverAcc !== myPromptPay) {
      return new Response(
        JSON.stringify({ error: 'wrong_receiver', message: 'โอนผิดบ้านหรือเปล่าจ๊ะ? กลับไปดูใหม่นะ 🤨' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (slip.amount < minAmount) {
      return new Response(
        JSON.stringify({ error: 'insufficient_amount', message: 'ยอดเงินไม่ครบนะจ๊ะ! อย่ามาเนียน 💸' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 4. Record Donation
    const { error: dbError } = await supabaseAdmin
      .from('donations')
      .insert({
        trans_ref: slip.trans_ref,
        amount: slip.amount,
        sender_name: slip.sender?.displayName || slip.sender?.name,
        receiver_account: myPromptPay,
        raw_data: slip
      })

    if (dbError) {
      if (dbError.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'duplicate', message: 'สลิปนี้มีคนใช้ไปแล้ว อย่ามาเนียน! 🛑' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      throw dbError
    }

    return new Response(
      JSON.stringify({ success: true, data: slip }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error(error)
    return new Response(
      JSON.stringify({ error: 'server_error', message: 'เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
