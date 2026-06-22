import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { getSubscriptionLimits } from "../../lib/subscriptionLimits";
import SellerAnalyticsCharts from "../../components/SellerAnalyticsCharts";

export default function SellerDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    verificationStatus: "unverified",
  });

  const [subscription, setSubscription] = useState({
    plan: "free",
    expiresAt: null,
    maxProperties: 3,
  });

  const [recentProperties, setRecentProperties] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSellerData() {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("verification_status, subscription_plan, subscription_expires_at")
        .eq("id", user.id)
        .single();

      const plan = profileData?.subscription_plan || "free";
      const limits = getSubscriptionLimits(plan);

      setSubscription({
        plan,
        expiresAt: profileData?.subscription_expires_at || null,
        maxProperties: limits.maxProperties,
      });

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setRecentProperties(data.slice(0, 5));

        const propertyIds = data.map((p) => p.id);

        if (propertyIds.length > 0) {
          const { data: enquiryData } = await supabase
            .from("enquiries")
            .select("*")
            .in("property_id", propertyIds);

          setEnquiries(enquiryData || []);
        } else {
          setEnquiries([]);
        }

        setStats({
          total: data.length,
          pending: data.filter((p) => p.status === "pending").length,
          approved: data.filter((p) => p.status === "approved").length,
          rejected: data.filter((p) => p.status === "rejected").length,
          verificationStatus: profileData?.verification_status || "unverified",
        });
      }

      setLoading(false);
    }

    fetchSellerData();
  }, []);

  if (loading) {
    return <div className="p-10">Loading seller dashboard...</div>;
  }

  const propertyLimitText =
    subscription.maxProperties === Infinity
      ? `${stats.total} / Unlimited`
      : `${stats.total} / ${subscription.maxProperties}`;

  const cardClass =
    "rounded-2xl bg-white p-6 shadow transition duration-300 hover:-translate-y-1 hover:shadow-2xl";

  const darkCardClass =
    "rounded-2xl bg-slate-900 p-6 text-white shadow transition duration-300 hover:-translate-y-1 hover:bg-black hover:shadow-2xl";

  const purpleCardClass =
    "rounded-2xl bg-purple-700 p-6 text-white shadow transition duration-300 hover:-translate-y-1 hover:bg-purple-800 hover:shadow-2xl";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Seller Dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            Manage your property listings, enquiries and verification status.
          </p>
        </div>

        <Link
          to="/dashboard/seller/add-property"
          className="rounded-xl bg-purple-700 px-6 py-3 font-semibold text-white transition duration-300 hover:-translate-y-1 hover:bg-purple-800 hover:shadow-xl"
        >
          Add New Property
        </Link>
      </div>

      <motion.div
        className="mb-8 rounded-2xl bg-white p-6 shadow transition duration-300 hover:shadow-xl"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-slate-500">Current Subscription</p>

            <h2 className="mt-2 text-3xl font-bold capitalize text-purple-700">
              {subscription.plan}
            </h2>

            <p className="mt-2 text-slate-600">
              Properties Used:{" "}
              <span className="font-semibold">{propertyLimitText}</span>
            </p>

            <p className="mt-1 text-slate-600">
              Expires:{" "}
              <span className="font-semibold">
                {subscription.expiresAt
                  ? new Date(subscription.expiresAt).toLocaleDateString()
                  : "No expiry"}
              </span>
            </p>
          </div>

          <Link
            to="/dashboard/seller/subscription"
            className="rounded-xl bg-slate-900 px-6 py-3 text-center font-semibold text-white transition duration-300 hover:-translate-y-1 hover:bg-black hover:shadow-xl"
          >
            Upgrade Plan
          </Link>
        </div>
      </motion.div>

      <motion.div
        className="grid gap-6 md:grid-cols-5"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className={cardClass}>
          <p className="text-slate-500">Total Properties</p>
          <h2 className="mt-2 text-4xl font-bold text-slate-900">
            {stats.total}
          </h2>
        </div>

        <div className={cardClass}>
          <p className="text-slate-500">Pending</p>
          <h2 className="mt-2 text-4xl font-bold text-yellow-600">
            {stats.pending}
          </h2>
        </div>

        <div className={cardClass}>
          <p className="text-slate-500">Approved</p>
          <h2 className="mt-2 text-4xl font-bold text-green-600">
            {stats.approved}
          </h2>
        </div>

        <div className={cardClass}>
          <p className="text-slate-500">Rejected</p>
          <h2 className="mt-2 text-4xl font-bold text-red-600">
            {stats.rejected}
          </h2>
        </div>

        <Link to="/dashboard/seller/verification" className={cardClass}>
          <p className="text-slate-500">Verification</p>
          <h2 className="mt-2 text-2xl font-bold capitalize text-purple-700">
            {stats.verificationStatus}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Click to update verification
          </p>
        </Link>
      </motion.div>

      <motion.div
        className="mt-8 grid gap-6 md:grid-cols-4"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Link to="/dashboard/seller/properties" className={purpleCardClass}>
          <h3 className="text-xl font-bold">My Properties</h3>
          <p className="mt-2 text-purple-100">
            View and manage all your uploaded properties.
          </p>
        </Link>

        <Link to="/dashboard/seller/enquiries" className={darkCardClass}>
          <h3 className="text-xl font-bold">My Enquiries</h3>
          <p className="mt-2 text-slate-300">
            View messages from interested buyers and tenants.
          </p>
        </Link>

        <Link to="/dashboard/seller/verification" className={cardClass}>
          <h3 className="text-xl font-bold text-slate-900">
            Identity Verification
          </h3>
          <p className="mt-2 text-slate-600">
            Submit or update your NIN verification.
          </p>
        </Link>

        <Link to="/dashboard/seller/analytics" className={cardClass}>
          <h3 className="text-xl font-bold text-slate-900">
            Property Analytics
          </h3>
          <p className="mt-2 text-slate-600">
            Track property views, enquiries and performance.
          </p>
        </Link>

        <Link to="/dashboard/seller/subscription" className={purpleCardClass}>
          <h3 className="text-xl font-bold">Subscription Plans</h3>
          <p className="mt-2 text-purple-100">Upgrade to Pro or Agency.</p>
        </Link>
      </motion.div>

      <motion.div
        className="mt-10"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <SellerAnalyticsCharts
          properties={recentProperties}
          enquiries={enquiries}
        />
      </motion.div>

      <motion.div
        className="mt-10 rounded-2xl bg-white p-6 shadow"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Recent Properties</h2>

          <Link
            to="/dashboard/seller/properties"
            className="text-sm font-semibold text-purple-700"
          >
            View All
          </Link>
        </div>

        {recentProperties.length === 0 ? (
          <p className="text-slate-500">
            You have not uploaded any property yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="p-3">Image</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {recentProperties.map((property) => (
                  <tr key={property.id} className="border-b">
                    <td className="p-3">
                      {property.image_url ? (
                        <img
                          src={property.image_url}
                          alt={property.title}
                          className="h-14 w-20 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-14 w-20 rounded-lg bg-slate-200" />
                      )}
                    </td>

                    <td className="p-3 font-semibold">{property.title}</td>

                    <td className="p-3">
                      ₦{Number(property.price || 0).toLocaleString()}
                    </td>

                    <td className="p-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm capitalize">
                        {property.status}
                      </span>
                    </td>

                    <td className="p-3">
                      {new Date(property.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}