export function calculateBuyerMatchScore(property, preference) {
  if (!property || !preference) {
    return {
      score: 0,
      grade: "No Match",
      reasons: ["Missing property or buyer preference data."],
    };
  }

  let score = 0;
  const reasons = [];

  const normalize = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();

  const propertyPrice = Number(property.price || 0);
  const minPrice = Number(preference.min_price || 0);
  const maxPrice = Number(preference.max_price || 0);

  if (
    preference.property_type &&
    normalize(property.type) === normalize(preference.property_type)
  ) {
    score += 20;
    reasons.push("Property type matches buyer preference.");
  }

  if (preference.state && normalize(property.state) === normalize(preference.state)) {
    score += 15;
    reasons.push("State matches buyer preference.");
  }

  if (preference.city && normalize(property.city) === normalize(preference.city)) {
    score += 15;
    reasons.push("City matches buyer preference.");
  }

  if (propertyPrice > 0 && minPrice > 0 && maxPrice > 0) {
    if (propertyPrice >= minPrice && propertyPrice <= maxPrice) {
      score += 25;
      reasons.push("Price is within buyer budget range.");
    }
  }

  if (
    preference.bedrooms &&
    Number(property.bedrooms || 0) >= Number(preference.bedrooms)
  ) {
    score += 10;
    reasons.push("Bedroom count meets buyer requirement.");
  }

  if (
    preference.bathrooms &&
    Number(property.bathrooms || 0) >= Number(preference.bathrooms)
  ) {
    score += 10;
    reasons.push("Bathroom count meets buyer requirement.");
  }

  if (
    preference.purpose &&
    normalize(property.purpose || property.category) === normalize(preference.purpose)
  ) {
    score += 5;
    reasons.push("Property purpose matches buyer intent.");
  }

  const finalScore = Math.min(score, 100);

  let grade = "Low Match";

  if (finalScore >= 85) grade = "Excellent Match";
  else if (finalScore >= 70) grade = "Strong Match";
  else if (finalScore >= 50) grade = "Good Match";
  else if (finalScore >= 30) grade = "Fair Match";

  return {
    score: finalScore,
    grade,
    reasons:
      reasons.length > 0
        ? reasons
        : ["This property does not strongly match the buyer preference yet."],
  };
}

export function sortPropertiesByBuyerMatch(properties = [], preference) {
  return [...properties]
    .map((property) => ({
      ...property,
      buyerMatch: calculateBuyerMatchScore(property, preference),
    }))
    .sort((a, b) => b.buyerMatch.score - a.buyerMatch.score);
}

export function isStrongBuyerMatch(property, preference, minimumScore = 70) {
  const match = calculateBuyerMatchScore(property, preference);
  return match.score >= minimumScore;
}