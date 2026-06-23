import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

function createBoostReference(propertyId) {
  return `BOOST-${propertyId}-${Date.now()}`;
}

function createFeatureReference(propertyId) {
  return `FEATURE-${propertyId}-${Date.now()}`;
}

function formatPrice(price) {
  return `₦${Number(price || 0).toLocaleString()}`;
}

function formatDate(date) {
  if (!date) return "Not available";
  return new Date(date).toLocaleDateString();
}

function getLocation(property) {
  return (
    property.city ||
    property.location ||
    property.address ||
    property.state ||
    "No location"
  );
}

function getType(property) {
  return property.type || property.property_type || "Property";
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl">
      <div className="h-60 animate-pulse bg-slate-200" />
      <div className="space-y-4 p-5">
        <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-8 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

export default function SellerProperties() {
  const [properties, setProperties] = useState([]);
  const [subscriptionPlan, setSubscriptionPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [boostingId, setBoostingId] = useState(null);
  const [featuringId, setFeaturingId] = useState(null);
  const [message, setMessage] = useState("");

  const stats = useMemo(() => {
    return {
      total: properties.length,
      approved: properties.filter((item) => item.status === "approved").length,
      pending: properties.filter((item) => item.status === "pending").length,
      boosted: properties.filter((item) => item.is_boosted).length,
      featured: properties.filter((item) => item.is_featured).length,
      views: properties.reduce((sum, item) => sum + Number(item.views || 0), 0),
    };
  }, [properties]);

  async function fetchProperties(showLoading = true) {
    if (showLoading) {
      setLoading(true);
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      setMessage(userError.message);
      toast.error(userError.message);
      setLoading(false);
      return;
    }

    const user = userData?.user;

    if (!user) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_plan")
      .eq("id", user.id)
      .single();

    setSubscriptionPlan(profile?.subscription_plan || "free");

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      toast.error(error.message);
    } else {
      setProperties(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    const loadProperties = async () => {
      await fetchProperties(false);
    };
    loadProperties();
  }, []);

  async function deleteProperty(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase.from("properties").delete().eq("id", id);

    if (error) {
      setMessage(error.message);
      toast.error(error.message);
    } else {
      setMessage("Property deleted successfully.");
      toast.success("Property deleted successfully.");
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
        toast.error("Please login first.");
        return;
      }

      if (subscriptionPlan === "free") {
        setMessage("Please upgrade to Pro or Agency to boost properties.");
        toast.error("Please upgrade to Pro or Agency to boost properties.");
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

      window.location.replace(data.authorization_url);
    } catch (error) {
      console.error("Boost payment error:", error);
      setMessage(error.message || "Failed to start boost payment.");
      toast.error(error.message || "Failed to start boost payment.");
    } finally {
      setBoostingId(null);
    }
  }

  async function requestFeature(property, plan, amount, durationDays) {
    try {
      setMessage("");
      setFeaturingId(property.id);

      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) throw userError;

      const user = userData?.user;

      if (!user) {
        setMessage("Please login first.");
        toast.error("Please login first.");
        return;
      }

      if (subscriptionPlan === "free") {
        setMessage("Please upgrade to Pro or Agency to feature properties.");
        toast.error("Please upgrade to Pro or Agency to feature properties.");
        return;
      }

      const reference = createFeatureReference(property.id);

      const { error: paymentError } = await supabase.from("payments").insert({
        user_id: user.id,
        property_id: property.id,
        reference,
        amount,
        status: "pending",
        purpose: "property_feature",
        plan,
        duration_days: durationDays,
      });

      if (paymentError) throw paymentError;

      const { data, error } = await supabase.functions.invoke(
        "initialize-featured-payment",
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

      if (error) {
        setMessage(error.message || "Featured payment initialization failed.");
        toast.error(error.message || "Featured payment initialization failed.");
        return;
      }

      if (!data?.success || !data?.authorization_url) {
        setMessage(data?.error || "Failed to initialize featured payment.");
        toast.error(data?.error || "Failed to initialize featured payment.");
        return;
      }

      window.location.replace(data.authorization_url);
    } catch (error) {
      console.error("Featured payment error:", error);
      setMessage(error.message || "Failed to start featured payment.");
      toast.error(error.message || "Failed to start featured payment.");
    } finally {
      setFeaturingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl">
          <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-96 max-w-full animate-pulse rounded bg-slate-200" />

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="relative overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-purple-800 via-slate-950 to-indigo-950 p-8 text-white shadow-2xl"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-8 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-purple-200">
              Seller Property Manager
            </p>

            <h1 className="mt-3 text-4xl font-black md:text-5xl">
              My Properties
            </h1>

            <p className="mt-3 max-w-2xl text-purple-100">
              Manage your listings, boost visibility, feature premium properties and track performance.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-2xl bg-white/10 px-5 py-3 font-bold capitalize backdrop-blur">
                Current Plan: {subscriptionPlan}
              </span>

              <span className="rounded-2xl bg-white/10 px-5 py-3 font-bold backdrop-blur">
                👁 {stats.views} Total Views
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/dashboard/seller/subscription"
              className="rounded-2xl bg-white px-6 py-4 font-black text-slate-950 shadow-xl transition hover:-translate-y-1 hover:bg-purple-50"
            >
              Upgrade Plan
            </Link>

            <Link
              to="/dashboard/seller/add-property"
              className="rounded-2xl bg-purple-600 px-6 py-4 font-black text-white shadow-xl transition hover:-translate-y-1 hover:bg-purple-700"
            >
              Add Property
            </Link>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-6"
      >
        {[
          { label: "Total", value: stats.total, icon: "🏠" },
          { label: "Approved", value: stats.approved, icon: "✅" },
          { label: "Pending", value: stats.pending, icon: "⏳" },
          { label: "Boosted", value: stats.boosted, icon: "🚀" },
          { label: "Featured", value: stats.featured, icon: "⭐" },
          { label: "Views", value: stats.views, icon: "👁" },
        ].map((item) => (
          <motion.div
            key={item.label}
            variants={fadeUp}
            whileHover={{ y: -5 }}
            className="rounded-[2rem] bg-white p-6 shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
              {item.icon}
            </div>

            <p className="mt-5 text-3xl font-black text-slate-950">
              {item.value}
            </p>

            <p className="mt-1 text-sm font-bold text-slate-500">
              {item.label}
            </p>
          </motion.div>
        ))}
      </motion.section>

      {message && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6 rounded-2xl bg-purple-100 p-4 font-semibold text-purple-700"
        >
          {message}
        </motion.div>
      )}

      {properties.length === 0 ? (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-8 rounded-[2rem] bg-white p-10 text-center shadow-xl"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 text-4xl">
            🏠
          </div>

          <h2 className="mt-6 text-3xl font-black text-slate-900">
            No property uploaded yet
          </h2>

          <p className="mx-auto mt-3 max-w-md text-slate-600">
            Upload your first property and start reaching real buyers and tenants.
          </p>

          <Link
            to="/dashboard/seller/add-property"
            className="mt-6 inline-block rounded-2xl bg-purple-700 px-7 py-4 font-bold text-white shadow-lg shadow-purple-200 hover:bg-purple-800"
          >
            Upload Your First Property
          </Link>
        </motion.div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {properties.map((property) => {
            const isBoosting = boostingId === property.id;
            const isFeaturing = featuringId === property.id;

            return (
              <motion.div
                key={property.id}
                variants={fadeUp}
                whileHover={{ y: -8, scale: 1.01 }}
                className="group overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-slate-200/70"
              >
                <div className="relative h-60 overflow-hidden bg-slate-200">
                  {property.image_url ? (
                    <img
                      src={property.image_url}
                      alt={property.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-500">
                      No Image
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black capitalize text-purple-700 backdrop-blur">
                      {getType(property)}
                    </span>

                    <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs font-black capitalize text-white backdrop-blur">
                      {property.status || "pending"}
                    </span>

                    {subscriptionPlan === "agency" && (
                      <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-black text-white">
                        🏢 Agency
                      </span>
                    )}

                    {property.is_boosted && (
                      <span className="rounded-full bg-purple-700 px-3 py-1 text-xs font-black text-white">
                        🚀 Boosted
                      </span>
                    )}

                    {property.is_featured && (
                      <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-slate-900">
                        ⭐ Featured
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                    👁 {property.views || 0} views
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="line-clamp-1 text-xl font-black text-slate-900">
                    {property.title}
                  </h2>

                  <p className="mt-2 line-clamp-1 text-slate-600">
                    📍 {getLocation(property)}
                    {property.state ? `, ${property.state}` : ""}
                  </p>

                  <p className="mt-4 text-2xl font-black text-purple-700">
                    {formatPrice(property.price)}
                  </p>

                  <div className="mt-4 grid gap-2 text-sm text-slate-500">
                    {property.created_at && (
                      <p>Uploaded: {formatDate(property.created_at)}</p>
                    )}

                    {property.boost_expires_at && (
                      <p>🚀 Boost expires: {formatDate(property.boost_expires_at)}</p>
                    )}

                    {property.featured_expires_at && (
                      <p>
                        ⭐ Featured expires:{" "}
                        {formatDate(property.featured_expires_at)}
                      </p>
                    )}
                  </div>

                  {subscriptionPlan === "free" &&
                    property.status === "approved" && (
                      <div className="mt-5 rounded-2xl bg-orange-50 p-4">
                        <p className="font-bold text-orange-800">
                          Upgrade to Pro or Agency to boost or feature this property.
                        </p>

                        <Link
                          to="/dashboard/seller/subscription"
                          className="mt-3 inline-block rounded-xl bg-orange-600 px-4 py-3 font-bold text-white hover:bg-orange-700"
                        >
                          Upgrade Now
                        </Link>
                      </div>
                    )}

                  {subscriptionPlan !== "free" &&
                    property.status === "approved" &&
                    !property.is_boosted && (
                      <div className="mt-5 rounded-2xl bg-purple-50 p-4">
                        <p className="mb-3 font-black text-purple-800">
                          Promote this property
                        </p>

                        <div className="grid gap-2">
                          <button
                            disabled={isBoosting}
                            onClick={() =>
                              requestBoost(property, "7_days", 2500, 7)
                            }
                            className="rounded-xl bg-purple-700 px-4 py-3 font-bold text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isBoosting
                              ? "Starting payment..."
                              : "Boost 7 Days — ₦2,500"}
                          </button>

                          <button
                            disabled={isBoosting}
                            onClick={() =>
                              requestBoost(property, "14_days", 4500, 14)
                            }
                            className="rounded-xl bg-indigo-700 px-4 py-3 font-bold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isBoosting
                              ? "Starting payment..."
                              : "Boost 14 Days — ₦4,500"}
                          </button>

                          <button
                            disabled={isBoosting}
                            onClick={() =>
                              requestBoost(property, "30_days", 8000, 30)
                            }
                            className="rounded-xl bg-slate-900 px-4 py-3 font-bold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isBoosting
                              ? "Starting payment..."
                              : "Boost 30 Days — ₦8,000"}
                          </button>
                        </div>
                      </div>
                    )}

                  {subscriptionPlan !== "free" &&
                    property.status === "approved" &&
                    !property.is_featured && (
                      <div className="mt-5 rounded-2xl bg-yellow-50 p-4">
                        <p className="mb-3 font-black text-yellow-800">
                          Feature this property
                        </p>

                        <div className="grid gap-2">
                          <button
                            disabled={isFeaturing}
                            onClick={() =>
                              requestFeature(property, "7_days", 3500, 7)
                            }
                            className="rounded-xl bg-yellow-500 px-4 py-3 font-bold text-white hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isFeaturing
                              ? "Starting payment..."
                              : "Feature 7 Days — ₦3,500"}
                          </button>

                          <button
                            disabled={isFeaturing}
                            onClick={() =>
                              requestFeature(property, "14_days", 6500, 14)
                            }
                            className="rounded-xl bg-amber-600 px-4 py-3 font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isFeaturing
                              ? "Starting payment..."
                              : "Feature 14 Days — ₦6,500"}
                          </button>

                          <button
                            disabled={isFeaturing}
                            onClick={() =>
                              requestFeature(property, "30_days", 10000, 30)
                            }
                            className="rounded-xl bg-orange-700 px-4 py-3 font-bold text-white hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isFeaturing
                              ? "Starting payment..."
                              : "Feature 30 Days — ₦10,000"}
                          </button>
                        </div>
                      </div>
                    )}

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Link
                      to={`/properties/${property.id}`}
                      className="rounded-xl bg-slate-900 px-4 py-3 text-center font-bold text-white hover:bg-purple-700"
                    >
                      View
                    </Link>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/properties/${property.id}`
                        );
                        toast.success("Property link copied");
                      }}
                      className="rounded-xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700"
                    >
                      Share
                    </button>

                    <Link
                      to={`/dashboard/seller/edit-property/${property.id}`}
                      className="rounded-xl bg-purple-700 px-4 py-3 text-center font-bold text-white hover:bg-purple-800"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => deleteProperty(property.id)}
                      className="rounded-xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}