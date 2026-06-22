import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { getSubscriptionLimits } from "../../lib/subscriptionLimits";
import SellerAnalyticsCharts from "../../components/SellerAnalyticsCharts";
import AnimatedCard from "../../components/AnimatedCard";
import { DashboardGridLoader } from "../../components/LoadingGrid";

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
    return (
      <div className="space-y-8">
        <DashboardGridLoader count={5} />
        <DashboardGridLoader count={4} />
      </div>
    );
  }

  const propertyLimitText =
    subscription.maxProperties === Infinity
      ? `${stats.total} / Unlimited`
      : `${stats.total} / ${subscription.maxProperties}`;

  const statCards = [
    {
      label: "Total Properties",
      value: stats.total,
      color: "text-slate-900",
      icon: "🏠",
    },
    {
      label: "Pending",
      value: stats.pending,
      color: "text-yellow-600",
      icon: "⏳",
    },
    {
      label: "Approved",
      value: stats.approved,
      color: "text-green-600",
      icon: "✅",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      color: "text-red-600",
      icon: "❌",
    },
  ];

  const quickLinks = [
    {
      title: "My Properties",
      desc: "View and manage all your uploaded properties.",
      to: "/dashboard/seller/properties",
      icon: "🏘",
      className: "bg-gradient-to-br from-purple-700 to-indigo-700 text-white",
      descClass: "text-purple-100",
    },
    {
      title: "My Enquiries",
      desc: "View messages from interested buyers and tenants.",
      to: "/dashboard/seller/enquiries",
      icon: "💬",
      className: "bg-gradient-to-br from-slate-900 to-black text-white",
      descClass: "text-slate-300",
    },
    {
      title: "Identity Verification",
      desc: "Submit or update your NIN verification.",
      to: "/dashboard/seller/verification",
      icon: "🪪",
      className: "bg-white text-slate-900",
      descClass: "text-slate-600",
    },
    {
      title: "Property Analytics",
      desc: "Track property views, enquiries and performance.",
      to: "/dashboard/seller/analytics",
      icon: "📈",
      className: "bg-white text-slate-900",
      descClass: "text-slate-600",
    },
    {
      title: "Subscription Plans",
      desc: "Upgrade to Pro or Agency.",
      to: "/dashboard/seller/subscription",
      icon: "🚀",
      className: "bg-gradient-to-br from-purple-700 to-fuchsia-700 text-white",
      descClass: "text-purple-100",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      className="space-y-10"
    >
      <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-purple-900 to-indigo-900 p-8 text-white shadow-2xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-purple-200">
              Seller Workspace
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight">
              Seller Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-purple-100">
              Manage your property listings, enquiries, verification,
              subscription, and performance analytics from one premium dashboard.
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/dashboard/seller/add-property"
              className="inline-flex rounded-2xl bg-white px-6 py-4 font-black text-purple-800 shadow-xl transition hover:bg-purple-50"
            >
              Add New Property
            </Link>
          </motion.div>
        </div>
      </div>

      <AnimatedCard className="rounded-[2rem] border border-purple-100 bg-white p-6 shadow-xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500">
              Current Subscription
            </p>

            <h2 className="mt-3 text-4xl font-black capitalize text-purple-700">
              {subscription.plan}
            </h2>

            <p className="mt-3 text-slate-600">
              Properties Used:{" "}
              <span className="font-black">{propertyLimitText}</span>
            </p>

            <p className="mt-1 text-slate-600">
              Expires:{" "}
              <span className="font-black">
                {subscription.expiresAt
                  ? new Date(subscription.expiresAt).toLocaleDateString()
                  : "No expiry"}
              </span>
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/dashboard/seller/subscription"
              className="inline-flex rounded-2xl bg-slate-900 px-6 py-4 text-center font-black text-white shadow-lg transition hover:bg-black"
            >
              Upgrade Plan
            </Link>
          </motion.div>
        </div>
      </AnimatedCard>

      <div className="grid gap-6 md:grid-cols-5">
        {statCards.map((card, index) => (
          <AnimatedCard
            key={card.label}
            delay={index * 0.08}
            className="rounded-3xl bg-white p-6 shadow-lg"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-2xl">
              {card.icon}
            </div>

            <p className="text-slate-500">{card.label}</p>

            <h2 className={`mt-2 text-4xl font-black ${card.color}`}>
              {card.value}
            </h2>
          </AnimatedCard>
        ))}

        <AnimatedCard
          delay={0.4}
          className="rounded-3xl bg-white p-6 shadow-lg"
        >
          <Link to="/dashboard/seller/verification" className="block">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-2xl">
              🛡
            </div>

            <p className="text-slate-500">Verification</p>

            <h2 className="mt-2 text-2xl font-black capitalize text-purple-700">
              {stats.verificationStatus}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Click to update verification
            </p>
          </Link>
        </AnimatedCard>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {quickLinks.map((item, index) => {
          const isDark = item.className.includes("text-white");

          return (
            <AnimatedCard key={item.to} delay={index * 0.08}>
              <Link
                to={item.to}
                className={`group relative block min-h-[180px] overflow-hidden rounded-3xl p-6 shadow-lg transition ${item.className}`}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className={`absolute -right-10 -top-10 h-28 w-28 rounded-full ${
                    isDark ? "bg-white/10" : "bg-purple-100"
                  }`}
                />

                <div className="relative">
                  <div
                    className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow ${
                      isDark ? "bg-white/15" : "bg-purple-50"
                    }`}
                  >
                    {item.icon}
                  </div>

                  <h3
                    className={`text-xl font-black ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {item.title}
                  </h3>

                  <p className={`mt-2 text-sm ${item.descClass}`}>
                    {item.desc}
                  </p>

                  <div
                    className={`mt-5 inline-flex items-center gap-2 text-sm font-black transition group-hover:translate-x-1 ${
                      isDark ? "text-white" : "text-purple-700"
                    }`}
                  >
                    Open <span>→</span>
                  </div>
                </div>
              </Link>
            </AnimatedCard>
          );
        })}
      </div>

      <AnimatedCard className="rounded-[2rem] bg-white p-6 shadow-xl">
        <SellerAnalyticsCharts properties={recentProperties} enquiries={enquiries} />
      </AnimatedCard>

      <AnimatedCard className="rounded-[2rem] bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Recent Properties
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your latest uploaded listings.
            </p>
          </div>

          <Link
            to="/dashboard/seller/properties"
            className="rounded-xl bg-purple-50 px-4 py-2 text-sm font-black text-purple-700 transition hover:bg-purple-100"
          >
            View All
          </Link>
        </div>

        {recentProperties.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-8 text-center">
            <p className="text-slate-500">
              You have not uploaded any property yet.
            </p>
          </div>
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
                  <motion.tr
                    key={property.id}
                    className="border-b"
                    whileHover={{ backgroundColor: "#f8fafc" }}
                    transition={{ duration: 0.2 }}
                  >
                    <td className="p-3">
                      {property.image_url ? (
                        <img
                          src={property.image_url}
                          alt={property.title}
                          className="h-14 w-20 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="h-14 w-20 rounded-xl bg-slate-200" />
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
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AnimatedCard>
    </motion.div>
  );
}