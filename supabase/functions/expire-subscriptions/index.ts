import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_plan: "free",
        subscription_expires_at: null,
      })
      .in("subscription_plan", ["pro", "agency"])
      .lt("subscription_expires_at", new Date().toISOString());

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Expired subscriptions reset to free successfully.",
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500 }
    );
  }
});