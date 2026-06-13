import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

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
    const frontendUrl = Deno.env.get("FRONTEND_URL");

    if (!paystackSecretKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured.");
    }

    if (!frontendUrl) {
      throw new Error("FRONTEND_URL is not configured.");
    }

    const {
      email,
      amount,
      property_id,
      user_id,
      plan,
      duration_days,
      reference,
    } = await req.json();

    if (!email || !amount || !property_id || !user_id || !plan || !duration_days) {
      throw new Error("Missing required payment details.");
    }

    const paymentReference =
      reference || `BOOST-${property_id}-${Date.now()}`;

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: Number(amount) * 100,
          reference: paymentReference,
          callback_url: `${frontendUrl}/payment-success?reference=${paymentReference}`,
          metadata: {
            purpose: "property_boost",
            property_id,
            user_id,
            plan,
            duration_days,
          },
        }),
      }
    );

    const result = await paystackResponse.json();

    if (!paystackResponse.ok || !result.status) {
      throw new Error(result.message || "Failed to initialize payment.");
    }

    return new Response(
      JSON.stringify({
        success: true,
        reference: paymentReference,
        authorization_url: result.data.authorization_url,
        access_code: result.data.access_code,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
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
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});