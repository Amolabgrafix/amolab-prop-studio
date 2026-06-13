import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

function createBoostReference(propertyId) {
  return `BOOST-${propertyId}-${Date.now()}`;
}

export default function SellerProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [boostingId, setBoostingId] = useState(null);
  const [message, setMessage] = useState("");

  async function fetchProperties() {
    setLoading(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      setMessage(userError.message);
      setLoading(false);
      return;
    }

    const user = userData?.user;

    if (!user) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setProperties(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    const loadProperties = async () => {
      await fetchProperties();
    };

    void loadProperties();
  }, []);

  async function deleteProperty(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase.from("properties").delete().eq("id", id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Property deleted successfully.");
      fetchProperties();
    }
  }

  async function requestBoost(property, plan, amount, durationDays) {
    try {
      setMessage("");
      setBoostingId(property.id);

      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) throw userError;

      const user = userData?.user;

      if (!user) {
        setMessage("Please login first.");
        return;
      }

      const reference = createBoostReference(property.id);

      const { error: paymentError } = await supabase.from("payments").insert({
        user_id: user.id,
        property_id: property.id,
        reference,
        amount,
        status: "pending",
        purpose: "property_boost",
        plan,
        duration_days: durationDays,
      });

      if (paymentError) throw paymentError;

      const { data, error } = await supabase.functions.invoke(
        "initialize-boost-payment",
        {
          body: {
            email: user.email,
            amount,
            property_id: property.id,
            user_id: user.id,
            plan,
            duration_days: durationDays,
            reference,
          },
        }
      );

      if (error) throw error;

      if (!data?.success || !data?.authorization_url) {
        throw new Error(data?.error || "Failed to initialize Paystack payment.");
      }

      // use assign to navigate to the payment authorization URL
      window.location.assign(data.authorization_url);
    } catch (error) {
      console.error("Boost payment error:", error);
      setMessage(error.message || "Failed to start boost payment.");
    } finally {
      setBoostingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-10">
        Loading your properties...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              My Properties
            </h1>
            <p className="mt-2 text-slate-600">
              View, manage and promote all properties you have uploaded.
            </p>
          </div>

          <Link
            to="/dashboard/seller/add-property"
            className="rounded-xl bg-purple-700 px-6 py-3 font-semibold text-white hover:bg-purple-800"
          >
            Add Property
          </Link>
        </div>

        {message && (
          <div className="mb-5 rounded-xl bg-purple-100 p-4 text-purple-700">
            {message}
          </div>
        )}

        {properties.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <p className="text-slate-600">
              You have not uploaded any property yet.
            </p>

            <Link
              to="/dashboard/seller/add-property"
              className="mt-5 inline-block rounded-xl bg-purple-700 px-6 py-3 font-semibold text-white"
            >
              Upload Your First Property
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {properties.map((property) => {
              const isBoosting = boostingId === property.id;

              return (
                <div
                  key={property.id}
                  className="overflow-hidden rounded-2xl bg-white shadow"
                >
                  {property.image_url ? (
                    <img
                      src={property.image_url}
                      alt={property.title}
                      className="h-56 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-56 w-full items-center justify-center bg-slate-200 text-slate-500">
                      No Image
                    </div>
                  )}

                  <div className="p-5">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h2 className="text-xl font-bold text-slate-900">
                        {property.title}
                      </h2>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm capitalize text-slate-700">
                        {property.status}
                      </span>
                    </div>

                    <div className="mb-3 flex flex-wrap gap-2">
                      {property.is_boosted && (
                        <span className="rounded-full bg-purple-700 px-3 py-1 text-sm font-semibold text-white">
                          🚀 Boosted
                        </span>
                      )}

                      {property.is_featured && (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                          ⭐ Featured
                        </span>
                      )}
                    </div>

                    <p className="text-slate-600">
                      {property.city}, {property.state}
                    </p>

                    <p className="mt-3 text-2xl font-bold text-purple-700">
                      ₦{Number(property.price || 0).toLocaleString()}
                    </p>

                    {property.boost_expires_at && (
                      <p className="mt-2 text-sm text-slate-500">
                        Boost expires:{" "}
                        {new Date(
                          property.boost_expires_at
                        ).toLocaleDateString()}
                      </p>
                    )}

                    {property.status === "approved" && !property.is_boosted && (
                      <div className="mt-5 rounded-xl bg-purple-50 p-4">
                        <p className="mb-3 font-semibold text-purple-800">
                          Promote this property
                        </p>

                        <div className="grid gap-2">
                          <button
                            disabled={isBoosting}
                            onClick={() =>
                              requestBoost(property, "7_days", 2500, 7)
                            }
                            className="rounded-lg bg-purple-700 px-4 py-2 font-semibold text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isBoosting ? "Starting payment..." : "Boost 7 Days — ₦2,500"}
                          </button>

                          <button
                            disabled={isBoosting}
                            onClick={() =>
                              requestBoost(property, "14_days", 4500, 14)
                            }
                            className="rounded-lg bg-indigo-700 px-4 py-2 font-semibold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isBoosting ? "Starting payment..." : "Boost 14 Days — ₦4,500"}
                          </button>

                          <button
                            disabled={isBoosting}
                            onClick={() =>
                              requestBoost(property, "30_days", 8000, 30)
                            }
                            className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isBoosting ? "Starting payment..." : "Boost 30 Days — ₦8,000"}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="mt-5 flex gap-3">
                      <Link
                        to={`/properties/${property.id}`}
                        className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-center font-semibold text-white"
                      >
                        View
                      </Link>

                      <button
                        onClick={() => deleteProperty(property.id)}
                        className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}