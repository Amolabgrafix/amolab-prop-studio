import { supabase } from "../lib/supabase";

export async function getDashboardStats() {
  const [
    profiles,
    properties,
    enquiries,
    payments,
    featuredProperties,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("properties").select("*"),
    supabase.from("enquiries").select("*", { count: "exact", head: true }),
    supabase.from("payments").select("*", { count: "exact", head: true }),
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("is_featured", true),
  ]);

  const propertyRows = properties.data || [];

  return {
    users: profiles.count || 0,
    properties: propertyRows.length,
    approvedProperties: propertyRows.filter(
      (p) => p.status === "approved"
    ).length,
    pendingProperties: propertyRows.filter(
      (p) => p.status === "pending"
    ).length,
    rejectedProperties: propertyRows.filter(
      (p) => p.status === "rejected"
    ).length,
    featuredProperties: featuredProperties.count || 0,
    enquiries: enquiries.count || 0,
    payments: payments.count || 0,
  };
}