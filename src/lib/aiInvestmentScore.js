export function calculateInvestmentScore(property) {
  let score = 40;
  const reasons = [];

  const views = Number(property?.views || 0);
  const price = Number(property?.price || 0);

  // Featured
  if (property?.is_featured) {
    score += 20;
    reasons.push("Featured property");
  }

  // Boosted
  if (property?.is_boosted) {
    score += 15;
    reasons.push("Boosted listing");
  }

  // Popularity
  if (views >= 100) {
    score += 15;
    reasons.push("Very high buyer interest");
  } else if (views >= 50) {
    score += 10;
    reasons.push("High buyer interest");
  } else if (views >= 20) {
    score += 5;
    reasons.push("Growing buyer interest");
  }

  // Price
  if (price > 0 && price <= 25000000) {
    score += 12;
    reasons.push("Excellent affordability");
  } else if (price > 0 && price <= 50000000) {
    score += 8;
    reasons.push("Competitive pricing");
  }

  // Premium Locations
  const location = (
    property?.location ||
    property?.city ||
    property?.state ||
    ""
  ).toLowerCase();

  const premiumAreas = [
    "lekki",
    "ikoyi",
    "victoria island",
    "ajah",
    "ikeja",
    "banana island",
    "yaba",
    "surulere",
  ];

  if (premiumAreas.some((area) => location.includes(area))) {
    score += 10;
    reasons.push("High demand location");
  }

  // Bedrooms
  const bedrooms = Number(property?.bedrooms || 0);

  if (bedrooms >= 5) {
    score += 8;
    reasons.push("Large family-sized property");
  } else if (bedrooms >= 3) {
    score += 5;
    reasons.push("Good bedroom capacity");
  }

  // Bathrooms
  const bathrooms = Number(property?.bathrooms || 0);

  if (bathrooms >= 3) {
    score += 5;
    reasons.push("Multiple bathrooms");
  }

  // Cap score at 100
  score = Math.min(score, 100);

  let grade = "Average";

  if (score >= 90) {
    grade = "Excellent";
  } else if (score >= 80) {
    grade = "Very Good";
  } else if (score >= 70) {
    grade = "Good";
  } else if (score >= 60) {
    grade = "Fair";
  }

  return {
    score,
    grade,
    reasons,
  };
}