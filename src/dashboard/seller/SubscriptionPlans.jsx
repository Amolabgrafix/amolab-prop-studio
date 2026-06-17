import { useState } from "react";
import { supabase } from "../../lib/supabase";

const plans = [
  {
    name: "Free",
    plan: "free",
    price: 0,
    durationDays: 0,
    features: ["3 Properties", "No Boost", "No Featured"],
  },
  {
    name: "Pro",
    plan: "pro",
    price: 5000,
    durationDays: 30,
    features: ["20 Properties", "Boost Allowed", "Featured Allowed"],
  },
  {
    name: "Agency",
    plan: "agency",
    price: 15000,
    durationDays: 30,
    features: ["Unlimited Properties", "Boost Allowed", "Featured Allowed"],
  },
];

export default function SubscriptionPlans() {
  const [loadingPlan, setLoadingPlan] = useState("");
  const [message, setMessage] = useState("");

  async function handleUpgrade(selectedPlan) {
    setMessage("");

    if (selectedPlan.plan === "free") {
      setMessage("Free plan is already your default plan.");
      return;
    }

    setLoadingPlan(selectedPlan.plan);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) throw userError;

      const user = userData?.user;

      if (!user) {
        setMessage("Please login first.");
        setLoadingPlan("");
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "initialize-subscription-payment",
        {
          body: {
            email: user.email,
            amount: selectedPlan.price,
            plan: selectedPlan.plan,
            duration_days: selectedPlan.durationDays,
            callbackUrl: `${window.location.origin}/payment/success`,
          },
        }
      );

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.authorization_url) {
        throw new Error("Payment link was not created.");
      }

      window.location.replace(data.authorization_url);
    } catch (error) {
      setMessage(error.message || "Subscription payment failed.");
      setLoadingPlan("");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Subscription Plans</h1>

      {message && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
          {message}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((item) => (
          <div key={item.plan} className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold">{item.name}</h2>

            <p className="text-3xl font-bold mt-4">
              ₦{item.price.toLocaleString()}
            </p>

            <p className="text-slate-500 mt-1">
              {item.price === 0 ? "Forever" : "30 days"}
            </p>

            <ul className="mt-6 space-y-2">
              {item.features.map((feature) => (
                <li key={feature}>✅ {feature}</li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(item)}
              disabled={loadingPlan === item.plan}
              className="mt-6 w-full bg-black text-white py-3 rounded font-semibold disabled:bg-gray-400"
            >
              {loadingPlan === item.plan
                ? "Redirecting..."
                : item.plan === "free"
                ? "Current Default"
                : `Upgrade to ${item.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}