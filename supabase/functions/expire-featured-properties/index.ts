import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error } = await supabase
      .from("properties")
      .update({
        is_featured: false,
        featured_expires_at: null,
      })
      .eq("is_featured", true)
      .lt("featured_expires_at", new Date().toISOString());

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Expired featured properties removed successfully",
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