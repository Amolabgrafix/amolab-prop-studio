function money(value) {
  const num = Number(value || 0);

  if (!num) return "Not specified";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(num);
}

function getValue(property, keys, fallback = "") {
  for (const key of keys) {
    if (property?.[key] !== undefined && property?.[key] !== null) {
      return property[key];
    }
  }

  return fallback;
}

function calculateConfidence(property) {
  let score = 70;

  if (property?.price) score += 5;
  if (property?.city || property?.location || property?.state) score += 5;
  if (property?.bedrooms) score += 4;
  if (property?.bathrooms) score += 3;
  if (property?.description) score += 5;
  if (property?.investmentScore || property?.investment_score) score += 5;
  if (property?.aiValuation || property?.ai_valuation) score += 5;

  return Math.min(score, 97);
}

function getPricePosition(property) {
  const price = Number(property?.price || 0);
  const valuation = Number(
    property?.aiValuation ||
      property?.ai_valuation ||
      property?.valuation ||
      property?.estimated_value ||
      0
  );

  if (!price || !valuation) {
    return {
      label: "valuation data is limited",
      note: "AI valuation is not available yet, so the price should be compared with similar listings manually.",
      action: "Review similar properties before making a final offer.",
    };
  }

  const difference = ((price - valuation) / valuation) * 100;

  if (difference > 12) {
    return {
      label: "slightly overpriced",
      note: `The asking price is above the estimated AI valuation. Listed price: ${money(
        price
      )}. Estimated value: ${money(valuation)}.`,
      action: "Negotiate strongly before committing.",
    };
  }

  if (difference < -8) {
    return {
      label: "competitively priced",
      note: `The asking price appears below the estimated AI valuation. Listed price: ${money(
        price
      )}. Estimated value: ${money(valuation)}.`,
      action: "Move fast, but still verify the documents.",
    };
  }

  return {
    label: "fairly priced",
    note: `The asking price is close to the estimated AI valuation. Listed price: ${money(
      price
    )}. Estimated value: ${money(valuation)}.`,
    action: "Proceed with normal negotiation.",
  };
}

function estimateRental(property) {
  const price = Number(property?.price || 0);

  if (!price) return "Rental estimate is unavailable because the price is missing.";

  const low = price * 0.035;
  const high = price * 0.07;

  return `Estimated annual rental income may fall around ${money(
    low
  )} – ${money(high)}, depending on location demand, furnishing, property condition and tenant profile.`;
}

function buildContext(property) {
  const title = getValue(property, ["title"], "This property");
  const city = getValue(property, ["city", "location"], "");
  const state = getValue(property, ["state"], "");
  const type = getValue(property, ["type", "property_type"], "property");
  const bedrooms = getValue(property, ["bedrooms", "beds"], "");
  const bathrooms = getValue(property, ["bathrooms", "baths"], "");
  const price = money(property?.price);
  const investmentScore = getValue(
    property,
    ["investmentScore", "investment_score", "score"],
    ""
  );

  const location = [city, state].filter(Boolean).join(", ") || "the listed area";

  return {
    title,
    city,
    state,
    type,
    bedrooms,
    bathrooms,
    price,
    investmentScore,
    location,
  };
}

export function generatePropertyAssistantReply(property, question = "") {
  const q = question.toLowerCase();
  const context = buildContext(property);
  const pricePosition = getPricePosition(property);
  const confidence = calculateConfidence(property);

  const pros = [
    `${context.location} gives the property a clearer market identity.`,
    context.bedrooms
      ? `${context.bedrooms} bedroom configuration improves buyer appeal.`
      : "The listing has enough basic information for early review.",
    pricePosition.label === "competitively priced"
      ? "The price appears attractive against AI valuation."
      : "The property can still perform well with the right buyer.",
  ];

  const cons = [
    "Physical inspection is still necessary before payment.",
    "Ownership documents should be verified before commitment.",
    "Final value depends on road access, finishing quality and neighborhood demand.",
  ];

  let summary = `${context.title} appears to be a ${pricePosition.label} ${context.type} in ${context.location}. The listed price is ${context.price}. ${pricePosition.note}`;

  let action = pricePosition.action;

  if (q.includes("negotiate") || q.includes("offer")) {
    summary = `${context.title} looks negotiable based on the available listing data. ${pricePosition.note} A reasonable buyer should compare similar properties and begin below the asking price while keeping room for adjustment.`;
    action = "Start with a professional offer below the asking price.";
  }

  if (q.includes("rent") || q.includes("rental") || q.includes("income")) {
    summary = `${estimateRental(property)} This estimate should be treated as a guide, not a fixed guarantee. Rental performance will depend on furnishing, access road, security, estate management, and demand in ${context.location}.`;
    action = "Confirm local rent prices before buying for rental income.";
  }

  if (
    q.includes("investment") ||
    q.includes("appreciation") ||
    q.includes("roi") ||
    q.includes("worth")
  ) {
    summary = `${context.title} has investment potential because of its location, property type and pricing profile. ${
      context.investmentScore
        ? `The current AI investment score is ${context.investmentScore}%.`
        : "The investment score should be reviewed alongside market demand."
    } ${pricePosition.note}`;
    action = "Good candidate for deeper investment review.";
  }

  if (q.includes("risk") || q.includes("problem") || q.includes("danger")) {
    summary = `The main risks for ${context.title} are document verification, actual property condition, neighborhood demand, access road quality and whether the asking price matches real market value. ${pricePosition.note}`;
    action = "Inspect, verify documents, then negotiate.";
  }

  if (
    q.includes("best for") ||
    q.includes("ideal") ||
    q.includes("buyer") ||
    q.includes("family")
  ) {
    summary = `${context.title} is likely suitable for ${
      context.bedrooms ? `buyers looking for a ${context.bedrooms} bedroom` : "buyers looking for a"
    } ${context.type} in ${context.location}. It may fit families, investors, or buyers who want long-term appreciation depending on the final inspection.`;
    action = "Target serious buyers looking in this location.";
  }

  if (q.includes("overpriced") || q.includes("price")) {
    summary = `${pricePosition.note} Based on this, the property appears ${pricePosition.label}. However, a final decision should include inspection, comparable listings and document verification.`;
    action = pricePosition.action;
  }

  return {
    confidence,
    summary,
    pros,
    cons,
    action,
  };
}