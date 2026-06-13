import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
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
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!paystackSecretKey) throw new Error("PAYSTACK_SECRET_KEY missing.");
    if (!supabaseUrl) throw new Error("SUPABASE_URL missing.");
    if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing.");

    const { reference } = await req.json();

    if (!reference) throw new Error("Payment reference is required.");

    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const verifyResult = await verifyResponse.json();

    if (!verifyResponse.ok || !verifyResult.status) {
      throw new Error(verifyResult.message || "Payment verification failed.");
    }

    const paymentData = verifyResult.data;

    if (paymentData.status !== "success") {
      throw new Error("Payment was not successful.");
    }

    const metadata = paymentData.metadata || {};
    const propertyId = metadata.property_id;
    const userId = metadata.user_id;
    const durationDays = Number(metadata.duration_days || 0);

    if (!propertyId || !userId || !durationDays) {
      throw new Error("Missing payment metadata.");
    }

    const boostExpiresAt = new Date();
    boostExpiresAt.setDate(boostExpiresAt.getDate() + durationDays);

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    await supabaseAdmin
      .from("payments")
      .update({
        status: "success",
      })
      .eq("reference", reference);

    await supabaseAdmin
      .from("properties")
      .update({
        is_boosted: true,
        boost_expires_at: boostExpiresAt.toISOString(),
      })
      .eq("id", propertyId)
      .eq("owner_id", userId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified and property boosted.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});