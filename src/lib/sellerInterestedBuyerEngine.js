import { supabase } from "./supabase";
import { calculateBuyerMatchScore } from "./aiBuyerMatchEngine";

export async function getInterestedBuyersForProperty(propertyId) {
  if (!propertyId) {
    return {
      success: false,
      buyers: [],
      message: "Missing property ID.",
    };
  }

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .single();

  if (propertyError || !property) {
    return {
      success: false,
      buyers: [],
      message: propertyError?.message || "Property not found.",
    };
  }

  const { data: preferences, error: preferencesError } = await supabase
    .from("buyer_preferences")
    .select(`
      *,
      profiles:buyer_id (
        id,
        fullname,
        username,
        email,
        phone
      )
    `);

  if (preferencesError) {
    return {
      success: false,
      buyers: [],
      message: preferencesError.message,
    };
  }

  const buyers = (preferences || [])
    .map((preference) => {
      const match = calculateBuyerMatchScore(property, preference);

      return {
        buyer_id: preference.buyer_id,
        profile: preference.profiles,
        preference,
        match,
      };
    })
    .filter((item) => item.match.score >= 50)
    .sort((a, b) => b.match.score - a.match.score);

  return {
    success: true,
    buyers,
    property,
    message: `${buyers.length} interested buyer(s) found.`,
  };
}

export async function getInterestedBuyerSummaryForSeller(sellerId) {
  if (!sellerId) {
    return {
      success: false,
      properties: [],
      totalInterestedBuyers: 0,
      message: "Missing seller ID.",
    };
  }

  const { data: properties, error: propertiesError } = await supabase
    .from("properties")
    .select("*")
    .eq("owner_id", sellerId)
    .eq("status", "approved");

  if (propertiesError) {
    return {
      success: false,
      properties: [],
      totalInterestedBuyers: 0,
      message: propertiesError.message,
    };
  }

  const results = [];

  for (const property of properties || []) {
    const result = await getInterestedBuyersForProperty(property.id);

    results.push({
      property,
      interestedBuyers: result.buyers || [],
      interestedCount: result.buyers?.length || 0,
      topMatch: result.buyers?.[0]?.match?.score || 0,
    });
  }

  const totalInterestedBuyers = results.reduce(
    (sum, item) => sum + item.interestedCount,
    0
  );

  return {
    success: true,
    properties: results.sort((a, b) => b.interestedCount - a.interestedCount),
    totalInterestedBuyers,
    message: `${totalInterestedBuyers} total interested buyer match(es).`,
  };
}