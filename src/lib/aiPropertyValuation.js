export function calculatePropertyValuation(property) {
  const askingPrice = Number(property?.price || 0);

  let multiplier = 1;

  // Featured properties generally command higher value
  if (property?.is_featured) multiplier += 0.05;

  // Boosted properties
  if (property?.is_boosted) multiplier += 0.03;

  // Buyer interest
  const views = Number(property?.views || 0);

  if (views >= 200) multiplier += 0.08;
  else if (views >= 100) multiplier += 0.05;
  else if (views >= 50) multiplier += 0.03;

  // Bedrooms
  const bedrooms = Number(property?.bedrooms || 0);
  multiplier += bedrooms * 0.01;

  // Bathrooms
  const bathrooms = Number(property?.bathrooms || 0);
  multiplier += bathrooms * 0.005;

  // Premium locations
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
    "banana island",
    "ajah",
    "ikeja",
    "yaba",
    "surulere",
  ];

  if (premiumAreas.some((area) => location.includes(area))) {
    multiplier += 0.08;
  }

  const estimatedValue = Math.round(askingPrice * multiplier);
  const difference = estimatedValue - askingPrice;

  let verdict = "Fairly Priced";

  if (difference > askingPrice * 0.08) {
    verdict = "Excellent Deal";
  } else if (difference > askingPrice * 0.03) {
    verdict = "Good Deal";
  } else if (difference < -askingPrice * 0.08) {
    verdict = "Overpriced";
  }

  return {
    askingPrice,
    estimatedValue,
    difference,
    verdict,
  };
}