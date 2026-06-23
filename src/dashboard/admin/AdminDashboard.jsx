import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getDashboardStats } from "../../services/dashboard";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

function StatCard({ card }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6, scale: 1.01 }}
      className="relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-xl"
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-100" />

      <div className="relative z-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
          {card.icon}
        </div>

        <p className="mt-5 text-sm font-bold text-slate-500">{card.title}</p>

        <h3 className={`mt-1 text-4xl font-black ${card.color}`}>
          {card.value}
        </h3>
      </div>
    </motion.div>
  );
}

function ToolCard({ item }) {
  const isDark = item.dark;

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -7, scale: 1.01 }}>
      <Link
        to={item.to}
        className={`group relative block overflow-hidden rounded-[2rem] p-6 shadow-xl ${
          isDark
            ? "bg-gradient-to-br from-purple-700 to-indigo-800 text-white"
            : "bg-white text-slate-900"
        }`}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute -right-10 -top-10 h-28 w-28 rounded-full ${
            isDark ? "bg-white/10" : "bg-purple-100"
          }`}
        />

        <div className="relative z-10">
          <div
            className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow ${
              isDark ? "bg-white/15" : "bg-purple-50"
            }`}
          >
            {item.icon}
          </div>

          <h3 className={`text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
            {item.title}
          </h3>

          <p className={`mt-2 text-sm ${isDark ? "text-purple-100" : "text-slate-600"}`}>
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
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-xl">
      <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />
      <div className="mt-5 h-5 w-28 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-8 w-20 animate-pulse rounded bg-slate-200" />
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    properties: 0,
    approvedProperties: 0,
    pendingProperties: 0,
    rejectedProperties: 0,
    featuredProperties: 0,
    enquiries: 0,
    payments: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
      setLoading(false);
    }

    loadStats();
  }, []);

  const approvalRate = useMemo(() => {
    if (!stats.properties) return 0;
    return Math.round((stats.approvedProperties / stats.properties) * 100);
  }, [stats]);

  const pendingRate = useMemo(() => {
    if (!stats.properties) return 0;
    return Math.round((stats.pendingProperties / stats.properties) * 100);
  }, [stats]);

  const featuredRate = useMemo(() => {
    if (!stats.properties) return 0;
    return Math.round((stats.featuredProperties / stats.properties) * 100);
  }, [stats]);

  const cards = [
    {
      title: "Users",
      value: stats.users,
      color: "text-purple-700",
      icon: "👥",
    },
    {
      title: "Properties",
      value: stats.properties,
      color: "text-blue-700",
      icon: "🏘",
    },
    {
      title: "Approved",
      value: stats.approvedProperties,
      color: "text-green-700",
      icon: "✅",
    },
    {
      title: "Pending",
      value: stats.pendingProperties,
      color: "text-yellow-600",
      icon: "⏳",
    },
    {
      title: "Rejected",
      value: stats.rejectedProperties,
      color: "text-red-600",
      icon: "❌",
    },
    {
      title: "Featured",
      value: stats.featuredProperties,
      color: "text-orange-600",
      icon: "⭐",
    },
    {
      title: "Enquiries",
      value: stats.enquiries,
      color: "text-indigo-700",
      icon: "💬",
    },
    {
      title: "Payments",
      value: stats.payments,
      color: "text-pink-700",
      icon: "💳",
    },
  ];

  const tools = [
    {
      title: "Manage Users",
      desc: "View and manage all platform users.",
      to: "/dashboard/admin/users",
      icon: "👥",
    },
    {
      title: "Manage Properties",
      desc: "Approve, reject and feature property listings.",
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
      title: "Enquiries",
      desc: "View all buyer and tenant enquiries.",
      to: "/dashboard/admin/enquiries",
      icon: "📩",
    },
    {
      title: "Payments",
      desc: "Monitor all payment transactions.",
      to: "/dashboard/admin/payments",
      icon: "💰",
    },
    {
      title: "Revenue Dashboard",
      desc: "Track revenue, subscriptions and earnings.",
      to: "/dashboard/admin/revenue",
      icon: "📈",
      dark: true,
    },
    {
      title: "Design Requests",
      desc: "Review submitted design requests.",
      to: "/dashboard/admin/design-requests",
      icon: "🎨",
    },
    {
      title: "Platform Analytics",
      desc: "Monitor growth, views, enquiries and top properties.",
      to: "/dashboard/admin/analytics",
      icon: "📊",
      dark: true,
    },
  ];

  return (
    <div className="min-h-screen">
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
              Admin Control Center
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              Admin Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-purple-100">
              Monitor platform performance, users, listings, enquiries, payments and revenue operations from one premium workspace.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-2xl bg-white/10 px-5 py-3 font-bold backdrop-blur">
                🏘 {loading ? "..." : stats.properties} Properties
              </span>

              <span className="rounded-2xl bg-white/10 px-5 py-3 font-bold backdrop-blur">
                👥 {loading ? "..." : stats.users} Users
              </span>

              <span className="rounded-2xl bg-white/10 px-5 py-3 font-bold backdrop-blur">
                💳 {loading ? "..." : stats.payments} Payments
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/dashboard/admin/properties"
              className="rounded-2xl bg-white px-6 py-4 font-black text-purple-700 shadow-xl hover:bg-purple-50"
            >
              Review Listings
            </Link>

            <Link
              to="/dashboard/admin/revenue"
              className="rounded-2xl bg-purple-600 px-6 py-4 font-black text-white shadow-xl hover:bg-purple-700"
            >
              Revenue
            </Link>
          </div>
        </div>
      </motion.section>

      {loading ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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
          className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4"
        >
          {cards.map((card) => (
            <StatCard key={card.title} card={card} />
          ))}
        </motion.section>
      )}

      <div className="mt-10 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] bg-white p-6 shadow-xl">
          <h2 className="text-2xl font-black text-slate-900">
            Platform Health
          </h2>

          <p className="mt-1 text-slate-600">
            Quick operational status based on current property records.
          </p>

          <div className="mt-6 space-y-6">
            <div>
              <div className="mb-2 flex justify-between text-sm font-bold text-slate-600">
                <span>Approval Rate</span>
                <span>{approvalRate}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-green-600"
                  style={{ width: `${approvalRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm font-bold text-slate-600">
                <span>Pending Listings</span>
                <span>{pendingRate}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-yellow-500"
                  style={{ width: `${pendingRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm font-bold text-slate-600">
                <span>Featured Listings</span>
                <span>{featuredRate}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-purple-700"
                  style={{ width: `${featuredRate}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl">
          <h2 className="text-2xl font-black">
            Admin Priorities
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Link
              to="/dashboard/admin/properties"
              className="rounded-2xl bg-white/10 p-5 font-bold text-white backdrop-blur hover:bg-white/15"
            >
              ⏳ {stats.pendingProperties} pending listings need review
            </Link>

            <Link
              to="/dashboard/admin/verifications"
              className="rounded-2xl bg-white/10 p-5 font-bold text-white backdrop-blur hover:bg-white/15"
            >
              ✅ Review seller verification requests
            </Link>

            <Link
              to="/dashboard/admin/payments"
              className="rounded-2xl bg-white/10 p-5 font-bold text-white backdrop-blur hover:bg-white/15"
            >
              💳 Monitor payment transactions
            </Link>

            <Link
              to="/dashboard/admin/revenue"
              className="rounded-2xl bg-white/10 p-5 font-bold text-white backdrop-blur hover:bg-white/15"
            >
              📈 Check revenue performance
            </Link>
          </div>
        </section>
      </div>

      <section className="mt-10">
        <div className="mb-5">
          <h2 className="text-2xl font-black text-slate-900">
            Admin Tools
          </h2>

          <p className="mt-1 text-slate-600">
            Quick access to platform management panels.
          </p>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
        >
          {tools.map((item) => (
            <ToolCard key={item.to} item={item} />
          ))}
        </motion.div>
      </section>
    </div>
  );
}