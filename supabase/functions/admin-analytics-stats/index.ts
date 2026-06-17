import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase secrets.");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: properties, error: propertyError } = await supabase
      .from("properties")
      .select("*")
      .order("views", { ascending: false });

    if (propertyError) throw propertyError;

    const { data: enquiries, error: enquiryError } = await supabase
      .from("enquiries")
      .select("*");

    if (enquiryError) throw enquiryError;

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*");

    if (profileError) throw profileError;

    const allProperties = properties || [];
    const allEnquiries = enquiries || [];
    const allProfiles = profiles || [];

    const propertiesWithEnquiries = allProperties.map((property) => {
      const propertyEnquiries = allEnquiries.filter(
        (enquiry) => enquiry.property_id === property.id
      );

      return {
        ...property,
        enquiries: propertyEnquiries,
      };
    });

    const totalViews = propertiesWithEnquiries.reduce(
      (sum, property) => sum + Number(property.views || 0),
      0
    );

    const totalEnquiries = allEnquiries.length;

    const sellers = allProfiles.filter((profile) => {
      const role = normalize(profile.role);
      const plan = normalize(profile.subscription_plan);

      return role === "seller" || role === "admin" || plan === "pro" || plan === "agency";
    });

    const sellerMap = {};

    sellers.forEach((seller) => {
      sellerMap[seller.id] = {
        id: seller.id,
        name:
          seller.fullname ||
          seller.full_name ||
          seller.username ||
          seller.email ||
          "Unknown Seller",
        email: seller.email || "-",
        subscriptionPlan: seller.subscription_plan || "free",
        properties: 0,
        views: 0,
        enquiries: 0,
      };
    });

    propertiesWithEnquiries.forEach((property) => {
      const ownerId = property.owner_id;

      if (!sellerMap[ownerId]) {
        sellerMap[ownerId] = {
          id: ownerId,
          name: "Unknown Seller",
          email: "-",
          subscriptionPlan: "free",
          properties: 0,
          views: 0,
          enquiries: 0,
        };
      }

      sellerMap[ownerId].properties += 1;
      sellerMap[ownerId].views += Number(property.views || 0);
      sellerMap[ownerId].enquiries += property.enquiries.length;
    });

    const topSellers = Object.values(sellerMap)
      .sort((a, b) => b.views + b.enquiries - (a.views + a.enquiries))
      .slice(0, 10);

    const responseData = {
      success: true,
      stats: {
        totalViews,
        totalEnquiries,
        totalProperties: propertiesWithEnquiries.length,
        approvedProperties: propertiesWithEnquiries.filter(
          (property) => normalize(property.status) === "approved"
        ).length,
        boostedProperties: propertiesWithEnquiries.filter(
          (property) => property.is_boosted === true
        ).length,
        featuredProperties: propertiesWithEnquiries.filter(
          (property) => property.is_featured === true
        ).length,
        totalSellers: sellers.length,
        proSellers: sellers.filter(
          (seller) => normalize(seller.subscription_plan) === "pro"
        ).length,
        agencySellers: sellers.filter(
          (seller) => normalize(seller.subscription_plan) === "agency"
        ).length,
      },
      topProperties: propertiesWithEnquiries.slice(0, 10),
      topSellers,
    };

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || String(error),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});