import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function normalizeText(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function isSuccessfulPayment(payment: any) {
  return ["success", "successful", "paid", "completed"].includes(
    normalizeText(payment.status)
  );
}

function amount(payment: any) {
  return Number(payment.amount || 0);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase environment variables.");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (paymentsError) throw paymentsError;

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("subscription_plan");

    if (profilesError) throw profilesError;

    const allPayments = payments || [];
    const successful = allPayments.filter(isSuccessfulPayment);
    const pending = allPayments.filter(
      (p) => normalizeText(p.status) === "pending"
    );

    const totalRevenue = successful.reduce((sum, p) => sum + amount(p), 0);

    const boostRevenue = successful
      .filter((p) => {
        const purpose = normalizeText(p.purpose);
        const reference = normalizeText(p.reference);
        return purpose.includes("boost") || reference.startsWith("boost-");
      })
      .reduce((sum, p) => sum + amount(p), 0);

    const featuredRevenue = successful
      .filter((p) => {
        const purpose = normalizeText(p.purpose);
        const reference = normalizeText(p.reference);
        return (
          purpose.includes("feature") ||
          purpose.includes("featured") ||
          reference.startsWith("feature-")
        );
      })
      .reduce((sum, p) => sum + amount(p), 0);

    const subscriptionRevenue = successful
      .filter((p) => {
        const purpose = normalizeText(p.purpose);
        const reference = normalizeText(p.reference);
        const plan = normalizeText(p.plan);

        return (
          purpose === "subscription" ||
          reference.startsWith("sub-") ||
          plan === "pro" ||
          plan === "agency"
        );
      })
      .reduce((sum, p) => sum + amount(p), 0);

    const proSubscribers =
      profiles?.filter((p) => normalizeText(p.subscription_plan) === "pro")
        .length || 0;

    const agencySubscribers =
      profiles?.filter((p) => normalizeText(p.subscription_plan) === "agency")
        .length || 0;

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          totalRevenue,
          boostRevenue,
          featuredRevenue,
          subscriptionRevenue,
          successfulPayments: successful.length,
          pendingPayments: pending.length,
          proSubscribers,
          agencySubscribers,
        },
        payments: allPayments,
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