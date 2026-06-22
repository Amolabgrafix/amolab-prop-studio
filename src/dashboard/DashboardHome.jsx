import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedCard from "../components/AnimatedCard";
import StaggerContainer from "../components/StaggerContainer";
import StaggerItem from "../components/StaggerItem";

const sellerLinks = [
  {
    title: "Seller Dashboard",
    desc: "View your seller overview.",
    to: "/dashboard/seller",
    icon: "📊",
    className: "bg-gradient-to-br from-purple-700 to-indigo-700 text-white",
    descClass: "text-purple-100",
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
    desc: "View buyer/tenant messages.",
    to: "/dashboard/seller/enquiries",
    icon: "💬",
  },
  {
    title: "Browse Public Properties",
    desc: "See approved public listings.",
    to: "/properties",
    icon: "🔎",
    className: "bg-gradient-to-br from-slate-900 to-black text-white",
    descClass: "text-slate-300",
  },
  {
    title: "Recently Viewed",
    desc: "View properties you recently visited.",
    to: "/dashboard/recently-viewed",
    icon: "👁",
  },
];

const adminLinks = [
  {
    title: "Admin Dashboard",
    desc: "View admin overview.",
    to: "/dashboard/admin",
    icon: "🛡",
    className: "bg-gradient-to-br from-red-600 to-rose-700 text-white",
    descClass: "text-red-100",
  },
  {
    title: "Manage Users",
    desc: "Approve users and access.",
    to: "/dashboard/admin/users",
    icon: "👥",
  },
  {
    title: "Manage Properties",
    desc: "Approve or reject property listings.",
    to: "/dashboard/admin/properties",
    icon: "🏘",
  },
];

function DashboardLinkCard({ item }) {
  const isDark = item.className?.includes("text-white");

  return (
    <Link
      to={item.to}
      className={`group relative block overflow-hidden rounded-3xl p-6 shadow-lg transition ${
        item.className || "bg-white text-slate-900"
      }`}
    >
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
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

        <h2
          className={`text-xl font-black ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {item.title}
        </h2>

        <p
          className={`mt-2 text-sm ${
            item.descClass || "text-slate-600"
          }`}
        >
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
  );
}

export default function DashboardHome() {
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-purple-900 to-indigo-900 p-8 text-white shadow-2xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-purple-200">
            Control Center
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight">
            Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-purple-100">
            Manage your properties, verification, enquiries, recently viewed
            homes, and admin tools from one premium workspace.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Fast", "Property management"],
            ["Secure", "Verified access"],
            ["Smart", "Tools & analytics"],
          ].map((stat, index) => (
            <AnimatedCard
              key={stat[0]}
              delay={index * 0.1}
              className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur"
            >
              <h3 className="text-2xl font-black">{stat[0]}</h3>
              <p className="mt-1 text-sm text-purple-100">{stat[1]}</p>
            </AnimatedCard>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Seller Workspace
            </h2>
            <p className="mt-1 text-slate-600">
              Everything you need to manage your real estate listings.
            </p>
          </div>
        </div>

        <StaggerContainer className="grid gap-6 md:grid-cols-3">
          {sellerLinks.map((item) => (
            <StaggerItem key={item.to}>
              <AnimatedCard hover={false}>
                <DashboardLinkCard item={item} />
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      <div className="mt-12">
        <div className="mb-5">
          <h2 className="text-2xl font-black text-slate-900">Admin Tools</h2>
          <p className="mt-1 text-slate-600">
            Quick access to admin management panels.
          </p>
        </div>

        <StaggerContainer className="grid gap-6 md:grid-cols-3">
          {adminLinks.map((item) => (
            <StaggerItem key={item.to}>
              <AnimatedCard hover={false}>
                <DashboardLinkCard item={item} />
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  );
}