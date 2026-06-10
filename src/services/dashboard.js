import { supabase } from "../lib/supabase";

export async function getDashboardStats() {
  const { count: users } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: properties } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true });

  const { count: payments } = await supabase
    .from("payments")
    .select("*", { count: "exact", head: true });

  const { count: pendingUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  return {
    users: users || 0,
    properties: properties || 0,
    payments: payments || 0,
    pendingUsers: pendingUsers || 0,
  };
}