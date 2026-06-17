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

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: paymentRow, error: paymentFetchError } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("reference", reference)
      .single();

    if (paymentFetchError || !paymentRow) {
      throw new Error("Payment record not found in database.");
    }

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

    if (verifyResult.data.status !== "success") {
      throw new Error("Payment was not successful.");
    }

    const propertyId = paymentRow.property_id;
    const userId = paymentRow.user_id;
    const durationDays = Number(paymentRow.duration_days || 0);

    if (!propertyId || !userId || !durationDays) {
      throw new Error("Payment record is missing property_id, user_id, or duration_days.");
    }

    const featuredExpiresAt = new Date();
    featuredExpiresAt.setDate(featuredExpiresAt.getDate() + durationDays);

    const { error: paymentUpdateError } = await supabaseAdmin
      .from("payments")
      .update({
        status: "success",
      })
      .eq("reference", reference);

    if (paymentUpdateError) throw paymentUpdateError;

    const { error: propertyUpdateError } = await supabaseAdmin
      .from("properties")
      .update({
        is_featured: true,
        featured_expires_at: featuredExpiresAt.toISOString(),
      })
      .eq("id", propertyId)
      .eq("owner_id", userId);

    if (propertyUpdateError) throw propertyUpdateError;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified and property featured.",
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