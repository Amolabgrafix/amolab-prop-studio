import { supabase } from "./supabase";
import { calculateBuyerMatchScore } from "./aiBuyerMatchEngine";

export async function notifyMatchingBuyersForProperty(propertyId) {
  if (!propertyId) {
    return {
      success: false,
      notified: 0,
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
      notified: 0,
      message: propertyError?.message || "Property not found.",
    };
  }

  if (property.status !== "approved") {
    return {
      success: false,
      notified: 0,
      message: "Property is not approved yet.",
    };
  }

  const { data: preferences, error: preferencesError } = await supabase
    .from("buyer_preferences")
    .select("*");

  if (preferencesError) {
    return {
      success: false,
      notified: 0,
      message: preferencesError.message,
    };
  }

  const strongMatches = (preferences || [])
    .map((preference) => {
      const match = calculateBuyerMatchScore(property, preference);

      return {
        preference,
        match,
      };
    })
    .filter((item) => item.match.score >= 70);

  if (!strongMatches.length) {
    return {
      success: true,
      notified: 0,
      message: "No strong buyer matches found.",
    };
  }

  let notified = 0;

  for (const item of strongMatches) {
    const buyerId = item.preference.buyer_id;
    const matchScore = item.match.score;

    const { error: matchLogError } = await supabase
      .from("property_match_notifications")
      .insert({
        property_id: property.id,
        buyer_id: buyerId,
        match_score: matchScore,
      });

    if (matchLogError?.code === "23505") {
      continue;
    }

    if (matchLogError) {
      continue;
    }

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: buyerId,
        title: "AI Property Match Found",
        message: `${property.title || "A new property"} matches your buying preference with ${matchScore}% accuracy.`,
        type: "ai_buyer_match",
        related_property_id: property.id,
        is_read: false,
      });

    if (!notificationError) {
      notified += 1;
    }
  }

  return {
    success: true,
    notified,
    message: `${notified} buyer notification(s) created.`,
  };
}