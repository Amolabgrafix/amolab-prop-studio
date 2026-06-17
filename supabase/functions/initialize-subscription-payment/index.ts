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
    const { email, amount, plan, duration_days, callbackUrl } =
      await req.json();

    if (!email || !amount || !plan || !duration_days) {
      throw new Error("Missing required subscription payment fields.");
    }

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!paystackSecretKey || !supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing environment variables.");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: userData, error: userError } =
      await supabase.auth.admin.listUsers();

    if (userError) throw userError;

    const user = userData.users.find((u) => u.email === email);

    if (!user) {
      throw new Error("User not found.");
    }

    const reference = `SUB-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    const { error: paymentError } = await supabase.from("payments").insert({
      user_id: user.id,
      reference,
      amount,
      status: "pending",
      purpose: "subscription",
      plan,
      duration_days,
    });

    if (paymentError) throw paymentError;

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100,
        reference,
        callback_url: `${callbackUrl}?reference=${reference}&purpose=subscription`,
        metadata: {
          user_id: user.id,
          purpose: "subscription",
          plan,
          duration_days,
        },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message || "Paystack initialization failed.");
    }

    return new Response(
      JSON.stringify({
        authorization_url: data.data.authorization_url,
        reference,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});