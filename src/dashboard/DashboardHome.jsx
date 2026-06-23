import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const sellerLinks = [
  {
    title: "Seller Dashboard",
    desc: "View your seller overview.",
    to: "/dashboard/seller",
    icon: "📊",
    theme: "dark",
  },
  {
    title: "My Properties",
    desc: "Manage your uploaded listings.",
    to: "/dashboard/seller/properties",
    icon: "🏠",
  },
  {
    title: "Add Property",
    desc: "Upload a new property.",
    to: "/dashboard/seller/add-property",
    icon: "➕",
  },
  {
    title: "Verification",
    desc: "Submit or update your NIN.",
    to: "/dashboard/seller/verification",
    icon: "✅",
  },
  {
    title: "My Enquiries",
    desc: "View buyer and tenant messages.",
    to: "/dashboard/seller/enquiries",
    icon: "💬",
  },
  {
    title: "Payment History",
    desc: "Review boost, featured and subscription payments.",
    to: "/dashboard/seller/payments",
    icon: "💳",
  },
  {
    title: "Recently Viewed",
    desc: "View properties you recently visited.",
    to: "/dashboard/recently-viewed",
    icon: "👁",
  },
  {
    title: "Browse Properties",
    desc: "See approved public listings.",
    to: "/properties",
    icon: "🔎",
    theme: "black",
  },
];

const adminLinks = [
  {
    title: "Admin Dashboard",
    desc: "View admin overview.",
    to: "/dashboard/admin",
    icon: "🛡",
    theme: "admin",
  },
  {
    title: "Manage Users",
    desc: "Approve users and access.",
    to: "/dashboard/admin/users",
    icon: "👥",
  },
  {
    title: "Manage Properties",
    desc: "Approve or reject listings.",
    to: "/dashboard/admin/properties",
    icon: "🏘",
  },
  {
    title: "Verifications",
    desc: "Review seller verification requests.",
    to: "/dashboard/admin/verifications",
    icon: "✅",
  },
  {
    title: "Revenue",
    desc: "Track subscriptions, boosts and featured payments.",
    to: "/dashboard/admin/revenue",
    icon: "📈",
  },
  {
    title: "Payments",
    desc: "Monitor platform payments.",
    to: "/dashboard/admin/payments",
    icon: "💰",
  },
];

function formatPrice(price) {
  return `₦${Number(price || 0).toLocaleString()}`;
}

function getLocation(property) {
  return property?.location || property?.city || property?.state || "No location";
}

function DashboardLinkCard({ item }) {
  const isDark = item.theme === "dark";
  const isBlack = item.theme === "black";
  const isAdmin = item.theme === "admin";

  const darkClass = isDark
    ? "bg-gradient-to-br from-purple-700 to-indigo-800 text-white"
    : isBlack
    ? "bg-gradient-to-br from-slate-950 to-black text-white"
    : isAdmin
    ? "bg-gradient-to-br from-red-600 to-rose-700 text-white"
    : "bg-white text-slate-900";

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -7, scale: 1.01 }}>
      <Link
        to={item.to}
        className={`group relative block overflow-hidden rounded-[2rem] p-6 shadow-xl ${darkClass}`}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute -right-10 -top-10 h-28 w-28 rounded-full ${
            item.theme ? "bg-white/10" : "bg-purple-100"
          }`}
        />

        <div className="relative z-10">
          <div
            className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow ${
              item.theme ? "bg-white/15" : "bg-purple-50"
            }`}
          >
            {item.icon}
          </div>

          <h2 className={`text-xl font-black ${item.theme ? "text-white" : "text-slate-900"}`}>
            {item.title}
          </h2>

          <p className={`mt-2 text-sm ${item.theme ? "text-white/75" : "text-slate-600"}`}>
            {item.desc}
          </p>

          <div
            className={`mt-5 inline-flex items-center gap-2 text-sm font-black transition group-hover:translate-x-1 ${
              item.theme ? "text-white" : "text-purple-700"
            }`}
          >
            Open <span>→</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function RecentPropertyCard({ property }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6, scale: 1.01 }}
      className="group overflow-hidden rounded-[2rem] bg-white shadow-xl"
    >
      <div className="relative h-48 overflow-hidden bg-slate-200">
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

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black capitalize text-purple-700">
          {property.status || "pending"}
        </span>

        <span className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-white">
          👁 {property.views || 0} views
        </span>
      </div>

      <div className="p-5">
        <h3 className="line-clamp-1 text-lg font-black text-slate-900">
          {property.title}
        </h3>

        <p className="mt-2 line-clamp-1 text-sm text-slate-600">
          📍 {getLocation(property)}
        </p>

        <p className="mt-3 text-xl font-black text-purple-700">
          {formatPrice(property.price)}
        </p>

        <Link
          to={`/properties/${property.id}`}
          className="mt-4 block rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-bold text-white hover:bg-purple-700"
        >
          View Property
        </Link>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-xl">
      <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />
      <div className="mt-5 h-6 w-32 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-4 w-48 animate-pulse rounded bg-slate-200" />
    </div>
  );
}

export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("seller");
  const [stats, setStats] = useState({
    properties: 0,
    approved: 0,
    boosted: 0,
    featured: 0,
    views: 0,
    enquiries: 0,
    inspections: 0,
    unread: 0,
  });
  const [recentProperties, setRecentProperties] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    async function loadDashboardHome() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const userRole = profile?.role || "seller";
      setRole(userRole);

      const { data: propertiesData } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      const sellerProperties = propertiesData || [];

      const [{ count: enquiriesCount }, { count: inspectionsCount }, { count: unreadCount }] =
        await Promise.all([
          supabase
            .from("enquiries")
            .select("*", { count: "exact", head: true })
            .in(
              "property_id",
              sellerProperties.map((item) => item.id).length
                ? sellerProperties.map((item) => item.id)
                : ["00000000-0000-0000-0000-000000000000"]
            ),

          supabase
            .from("property_inspections")
            .select("*", { count: "exact", head: true })
            .in(
              "property_id",
              sellerProperties.map((item) => item.id).length
                ? sellerProperties.map((item) => item.id)
                : ["00000000-0000-0000-0000-000000000000"]
            ),

          supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("is_read", false),
        ]);

      const { data: notificationsData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      setStats({
        properties: sellerProperties.length,
        approved: sellerProperties.filter((item) => item.status === "approved").length,
        boosted: sellerProperties.filter((item) => item.is_boosted).length,
        featured: sellerProperties.filter((item) => item.is_featured).length,
        views: sellerProperties.reduce((sum, item) => sum + Number(item.views || 0), 0),
        enquiries: enquiriesCount || 0,
        inspections: inspectionsCount || 0,
        unread: unreadCount || 0,
      });

      setRecentProperties(sellerProperties.slice(0, 3));
      setRecentNotifications(notificationsData || []);
      setLoading(false);
    }

    loadDashboardHome();
  }, []);

  const approvalRate = useMemo(() => {
    if (!stats.properties) return 0;
    return Math.round((stats.approved / stats.properties) * 100);
  }, [stats]);

  const featureRate = useMemo(() => {
    if (!stats.properties) return 0;
    return Math.round((stats.featured / stats.properties) * 100);
  }, [stats]);

  return (
    <div className="relative">
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="relative overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-slate-950 via-purple-900 to-indigo-900 p-8 text-white shadow-2xl"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-8 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-purple-200">
              Control Center
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-purple-100">
              Manage your properties, verification, enquiries, recently viewed homes and admin tools from one premium workspace.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-2xl bg-white/10 px-5 py-3 font-bold capitalize backdrop-blur">
                Role: {role}
              </span>

              <span className="rounded-2xl bg-white/10 px-5 py-3 font-bold backdrop-blur">
                🔔 {loading ? "..." : stats.unread} Unread
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/dashboard/seller/add-property"
              className="rounded-2xl bg-white px-6 py-4 font-black text-purple-700 shadow-xl hover:bg-purple-50"
            >
              Add Property
            </Link>

            <Link
              to="/properties"
              className="rounded-2xl bg-purple-600 px-6 py-4 font-black text-white shadow-xl hover:bg-purple-700"
            >
              Browse
            </Link>
          </div>
        </div>
      </motion.section>

      {loading ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <motion.section
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4"
        >
          {[
            { label: "Properties", value: stats.properties, icon: "🏠" },
            { label: "Total Views", value: stats.views, icon: "👁" },
            { label: "Enquiries", value: stats.enquiries, icon: "💬" },
            { label: "Inspections", value: stats.inspections, icon: "📅" },
            { label: "Approved", value: stats.approved, icon: "✅" },
            { label: "Boosted", value: stats.boosted, icon: "🚀" },
            { label: "Featured", value: stats.featured, icon: "⭐" },
            { label: "Unread", value: stats.unread, icon: "🔔" },
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
      )}

      <div className="mt-10 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Quick Actions
              </h2>
              <p className="mt-1 text-slate-600">
                Everything you need to manage your real estate workspace.
              </p>
            </div>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-2"
          >
            {sellerLinks.map((item) => (
              <DashboardLinkCard key={item.to} item={item} />
            ))}
          </motion.div>
        </section>

        <aside className="space-y-8">
          <section className="rounded-[2rem] bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-black text-slate-900">
              Performance
            </h2>

            <div className="mt-6 space-y-6">
              <div>
                <div className="mb-2 flex justify-between text-sm font-bold text-slate-600">
                  <span>Approval Rate</span>
                  <span>{approvalRate}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-purple-700"
                    style={{ width: `${approvalRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm font-bold text-slate-600">
                  <span>Featured Rate</span>
                  <span>{featureRate}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-yellow-500"
                    style={{ width: `${featureRate}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900">
                Recent Notifications
              </h2>

              <Link
                to="/dashboard/notifications"
                className="text-sm font-black text-purple-700"
              >
                View all
              </Link>
            </div>

            {recentNotifications.length === 0 ? (
              <p className="text-slate-500">No notifications yet.</p>
            ) : (
              <div className="space-y-3">
                {recentNotifications.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-black text-slate-900">
                      {item.title || "Notification"}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>

      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Recent Properties
            </h2>
            <p className="mt-1 text-slate-600">
              Your latest uploaded property listings.
            </p>
          </div>

          <Link
            to="/dashboard/seller/properties"
            className="rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white hover:bg-purple-700"
          >
            View All
          </Link>
        </div>

        {recentProperties.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-10 text-center shadow-xl">
            <p className="text-slate-600">No recent properties yet.</p>
            <Link
              to="/dashboard/seller/add-property"
              className="mt-5 inline-block rounded-2xl bg-purple-700 px-6 py-3 font-bold text-white"
            >
              Add Property
            </Link>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-3"
          >
            {recentProperties.map((property) => (
              <RecentPropertyCard key={property.id} property={property} />
            ))}
          </motion.div>
        )}
      </section>

      {role === "admin" && (
        <section className="mt-12">
          <div className="mb-5">
            <h2 className="text-2xl font-black text-slate-900">
              Admin Tools
            </h2>
            <p className="mt-1 text-slate-600">
              Quick access to admin management panels.
            </p>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-3"
          >
            {adminLinks.map((item) => (
              <DashboardLinkCard key={item.to} item={item} />
            ))}
          </motion.div>
        </section>
      )}
    </div>
  );
}