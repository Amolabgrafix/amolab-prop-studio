import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function PortalCard({ item }) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -7, scale: 1.01 }}>
      <Link
        to={item.to}
        className={`group relative block overflow-hidden rounded-[2rem] border border-white/70 p-6 shadow-xl backdrop-blur-xl transition dark:border-white/10 ${
          item.featured
            ? "bg-gradient-to-br from-purple-700 to-slate-950 text-white"
            : "bg-white/85 text-slate-900 dark:bg-slate-900/80 dark:text-white"
        }`}
      >
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-purple-400/20 blur-2xl" />

        <div className="relative z-10">
          <div
            className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow ${
              item.featured
                ? "bg-white/15"
                : "bg-purple-100 dark:bg-purple-500/20"
            }`}
          >
            {item.icon}
          </div>

          <h2 className="text-xl font-black">{item.title}</h2>

          <p
            className={`mt-2 text-sm ${
              item.featured
                ? "text-white/75"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {item.desc}
          </p>

          <div
            className={`mt-5 inline-flex items-center gap-2 text-sm font-black transition group-hover:translate-x-1 ${
              item.featured
                ? "text-white"
                : "text-purple-700 dark:text-purple-300"
            }`}
          >
            Open <span>→</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -5 }}
      className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl transition dark:border-white/10 dark:bg-slate-900/80"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-2xl dark:bg-purple-500/20">
        {icon}
      </div>

      <p className="mt-5 text-3xl font-black text-slate-950 dark:text-white">
        {formatNumber(value)}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
        {title}
      </p>
    </motion.div>
  );
}

function NotificationItem({ item }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
      <p className="font-black text-slate-900 dark:text-white">
        {item.title || "Notification"}
      </p>
      <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
        {item.message || "No message"}
      </p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl dark:border-white/10 dark:bg-slate-900/80">
      <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-white/10" />
      <div className="mt-5 h-6 w-32 rounded bg-slate-200 dark:bg-white/10" />
      <div className="mt-3 h-4 w-48 rounded bg-slate-200 dark:bg-white/10" />
    </div>
  );
}

export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("seller");

  const [stats, setStats] = useState({
    myProperties: 0,
    favorites: 0,
    notifications: 0,
    recentlyViewed: 0,
    enquiries: 0,
    payments: 0,
    inspections: 0,
    platformProperties: 0,
  });

  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    async function loadPortal() {
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

      const [
        { count: myPropertiesCount },
        { count: favoritesCount },
        { count: notificationsCount },
        { count: recentlyViewedCount },
        { count: paymentsCount },
        { count: inspectionsCount },
        { count: platformPropertiesCount },
      ] = await Promise.all([
        supabase
          .from("properties")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", user.id),

        supabase
          .from("favorites")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),

        supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_read", false),

        supabase
          .from("recently_viewed")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),

        supabase
          .from("payments")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),

        supabase
          .from("property_inspections")
          .select("*", { count: "exact", head: true })
          .eq("buyer_id", user.id),

        supabase
          .from("properties")
          .select("*", { count: "exact", head: true })
          .eq("status", "approved"),
      ]);

      const { data: sellerProperties } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", user.id);

      const sellerPropertyIds = (sellerProperties || []).map((item) => item.id);

      let enquiriesCount = 0;

      if (sellerPropertyIds.length > 0) {
        const { count } = await supabase
          .from("enquiries")
          .select("*", { count: "exact", head: true })
          .in("property_id", sellerPropertyIds);

        enquiriesCount = count || 0;
      }

      const { data: notificationsData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(4);

      setStats({
        myProperties: myPropertiesCount || 0,
        favorites: favoritesCount || 0,
        notifications: notificationsCount || 0,
        recentlyViewed: recentlyViewedCount || 0,
        enquiries: enquiriesCount,
        payments: paymentsCount || 0,
        inspections: inspectionsCount || 0,
        platformProperties: platformPropertiesCount || 0,
      });

      setRecentNotifications(notificationsData || []);
      setLoading(false);
    }

    loadPortal();
  }, []);

  const mainLinks = useMemo(() => {
    const links = [
      {
        title: "Browse Properties",
        desc: "Explore verified homes, rentals and premium listings.",
        to: "/properties",
        icon: "🔎",
        featured: true,
      },
      {
        title: "Favorites",
        desc: "View all properties you saved for later.",
        to: "/dashboard/favorites",
        icon: "❤️",
      },
      {
        title: "Recently Viewed",
        desc: "Continue from properties you checked before.",
        to: "/dashboard/recently-viewed",
        icon: "👁",
      },
      {
        title: "Notifications",
        desc: "Read updates, alerts and system messages.",
        to: "/dashboard/notifications",
        icon: "🔔",
      },
      {
        title: "Property Alerts",
        desc: "Track your saved property alert preferences.",
        to: "/dashboard/property-alerts",
        icon: "🚨",
      },
      {
        title: "Compare Properties",
        desc: "Compare homes side by side before deciding.",
        to: "/compare",
        icon: "⚖️",
      },
    ];

    if (role === "seller" || role === "admin") {
      links.push(
        {
          title: "Seller Workspace",
          desc: "Open your seller dashboard and property tools.",
          to: "/dashboard/seller",
          icon: "📊",
          featured: true,
        },
        {
          title: "Add Property",
          desc: "Upload a new property listing to the platform.",
          to: "/dashboard/seller/add-property",
          icon: "➕",
        },
        {
          title: "Seller Analytics",
          desc: "Track views, enquiries and listing performance.",
          to: "/dashboard/seller/analytics",
          icon: "📈",
        }
      );
    }

    if (role === "admin") {
      links.push(
        {
          title: "Admin Center",
          desc: "Manage platform users, properties and revenue.",
          to: "/dashboard/admin",
          icon: "🛡",
          featured: true,
        },
        {
          title: "Admin Analytics",
          desc: "Monitor platform growth and marketplace performance.",
          to: "/dashboard/admin/analytics",
          icon: "📊",
        },
        {
          title: "KYC Verifications",
          desc: "Review seller identity documents and notes.",
          to: "/dashboard/admin/verifications",
          icon: "✅",
        }
      );
    }

    return links;
  }, [role]);

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
              Main Portal
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              Welcome to your dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-purple-100">
              This is your central portal for browsing properties, managing
              favorites, notifications, seller tools, inspections and admin
              access.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-2xl bg-white/10 px-5 py-3 font-bold capitalize backdrop-blur">
                Role: {role}
              </span>

              <span className="rounded-2xl bg-white/10 px-5 py-3 font-bold backdrop-blur">
                🔔 {loading ? "..." : stats.notifications} Unread
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/properties"
              className="rounded-2xl bg-white px-6 py-4 font-black text-purple-700 shadow-xl hover:bg-purple-50"
            >
              Browse Properties
            </Link>

            <Link
              to="/dashboard/seller/add-property"
              className="rounded-2xl bg-purple-600 px-6 py-4 font-black text-white shadow-xl hover:bg-purple-700"
            >
              List Property
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
          <StatCard title="Approved Properties" value={stats.platformProperties} icon="🏘" />
          <StatCard title="My Properties" value={stats.myProperties} icon="🏠" />
          <StatCard title="Favorites" value={stats.favorites} icon="❤️" />
          <StatCard title="Recently Viewed" value={stats.recentlyViewed} icon="👁" />
          <StatCard title="Unread Alerts" value={stats.notifications} icon="🔔" />
          <StatCard title="Seller Enquiries" value={stats.enquiries} icon="💬" />
          <StatCard title="Payments" value={stats.payments} icon="💳" />
          <StatCard title="Inspections" value={stats.inspections} icon="📅" />
        </motion.section>
      )}

      <div className="mt-10 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Portal Shortcuts
            </h2>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Choose where you want to go next.
            </p>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2"
          >
            {mainLinks.map((item) => (
              <PortalCard key={`${item.title}-${item.to}`} item={item} />
            ))}
          </motion.div>
        </section>

        <aside className="space-y-8">
          <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Portal Guide
            </h2>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-purple-50 p-4 dark:bg-purple-500/10">
                <p className="font-black text-purple-700 dark:text-purple-300">
                  Buyer Tools
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Browse, compare, save favorites and track recently viewed
                  properties.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <p className="font-black text-slate-900 dark:text-white">
                  Seller Tools
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Add listings, manage enquiries, subscriptions, verification
                  and analytics.
                </p>
              </div>

              {role === "admin" && (
                <div className="rounded-2xl bg-rose-50 p-4 dark:bg-rose-500/10">
                  <p className="font-black text-rose-700 dark:text-rose-300">
                    Admin Tools
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Manage users, properties, payments, revenue, analytics and
                    verifications.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Recent Notifications
              </h2>

              <Link
                to="/dashboard/notifications"
                className="text-sm font-black text-purple-700 dark:text-purple-300"
              >
                View all
              </Link>
            </div>

            {recentNotifications.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">
                No notifications yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentNotifications.map((item) => (
                  <NotificationItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}