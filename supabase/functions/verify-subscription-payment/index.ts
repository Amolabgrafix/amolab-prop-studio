import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { reference } = await req.json();

    if (!reference) {
      throw new Error("Payment reference is required.");
    }

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!paystackSecretKey || !supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing environment variables.");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const paystackData = await response.json();

    if (!paystackData.status || paystackData.data.status !== "success") {
      throw new Error("Payment has not been completed.");
    }

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("reference", reference)
      .single();

    if (paymentError) throw paymentError;

    const plan = payment.plan;
    const durationDays = payment.duration_days || 30;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        subscription_plan: plan,
        subscription_expires_at: expiresAt.toISOString(),
      })
      .eq("id", payment.user_id);

    if (profileError) throw profileError;

    const { error: updatePaymentError } = await supabase
      .from("payments")
      .update({
        status: "success",
      })
      .eq("reference", reference);

    if (updatePaymentError) throw updatePaymentError;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscription activated successfully.",
        plan,
        subscription_expires_at: expiresAt.toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});