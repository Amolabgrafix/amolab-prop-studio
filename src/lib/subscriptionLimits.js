export const SUBSCRIPTION_LIMITS = {
  free: {
    name: "Free",
    maxProperties: 3,
    canBoost: false,
    canFeature: false,
  },
  pro: {
    name: "Pro",
    maxProperties: 20,
    canBoost: true,
    canFeature: true,
  },
  agency: {
    name: "Agency",
    maxProperties: Infinity,
    canBoost: true,
    canFeature: true,
  },
};

export function getSubscriptionLimits(plan) {
  return SUBSCRIPTION_LIMITS[plan] || SUBSCRIPTION_LIMITS.free;
}