import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

const PROPERTY_SORTS = ["views", "enquiries"];
const SELLER_SORTS = ["views", "enquiries", "properties"];

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function getPropertyEnquiries(property) {
  return property.enquiries?.length || Number(property.enquiries_count || 0) || 0;
}

function getSellerName(seller) {
  return seller.name || seller.fullname || seller.username || "Unknown Seller";
}

function getSellerPlan(seller) {
  return seller.subscriptionPlan || seller.subscription_plan || "free";
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalEnquiries: 0,
    totalProperties: 0,
    approvedProperties: 0,
    boostedProperties: 0,
    featuredProperties: 0,
    totalSellers: 0,
    proSellers: 0,
    agencySellers: 0,
  });

  const [topProperties, setTopProperties] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [propertySearch, setPropertySearch] = useState("");
  const [sellerSearch, setSellerSearch] = useState("");
  const [propertySort, setPropertySort] = useState("views");
  const [sellerSort, setSellerSort] = useState("views");

  const loadAnalytics = useCallback(async () => {
    setRefreshing(true);

    const { data, error } = await supabase.functions.invoke(
      "admin-analytics-stats"
    );

    if (error || !data?.success) {
      toast.error(
        error?.message || data?.error || "Could not load admin analytics."
      );
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setStats({
      totalViews: Number(data.stats?.totalViews || 0),
      totalEnquiries: Number(data.stats?.totalEnquiries || 0),
      totalProperties: Number(data.stats?.totalProperties || 0),
      approvedProperties: Number(data.stats?.approvedProperties || 0),
      boostedProperties: Number(data.stats?.boostedProperties || 0),
      featuredProperties: Number(data.stats?.featuredProperties || 0),
      totalSellers: Number(data.stats?.totalSellers || 0),
      proSellers: Number(data.stats?.proSellers || 0),
      agencySellers: Number(data.stats?.agencySellers || 0),
    });

    setTopProperties(data.topProperties || []);
    setTopSellers(data.topSellers || []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const initializeAnalytics = async () => {
      await loadAnalytics();
    };

    initializeAnalytics();
  }, [loadAnalytics]);

  const filteredProperties = useMemo(() => {
    const keyword = propertySearch.toLowerCase();

    return [...topProperties]
      .filter((property) => {
        return (
          property.title?.toLowerCase().includes(keyword) ||
          property.status?.toLowerCase().includes(keyword) ||
          property.type?.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => {
        if (propertySort === "enquiries") {
          return getPropertyEnquiries(b) - getPropertyEnquiries(a);
        }

        return Number(b.views || 0) - Number(a.views || 0);
      });
  }, [topProperties, propertySearch, propertySort]);

  const filteredSellers = useMemo(() => {
    const keyword = sellerSearch.toLowerCase();

    return [...topSellers]
      .filter((seller) => {
        return (
          getSellerName(seller).toLowerCase().includes(keyword) ||
          seller.email?.toLowerCase().includes(keyword) ||
          getSellerPlan(seller).toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => {
        if (sellerSort === "enquiries") {
          return Number(b.enquiries || 0) - Number(a.enquiries || 0);
        }

        if (sellerSort === "properties") {
          return Number(b.properties || 0) - Number(a.properties || 0);
        }

        return Number(b.views || 0) - Number(a.views || 0);
      });
  }, [topSellers, sellerSearch, sellerSort]);

  const performanceScore = useMemo(() => {
    const propertyScore =
      stats.totalProperties > 0
        ? (stats.approvedProperties / stats.totalProperties) * 100
        : 0;

    const engagementScore =
      stats.totalProperties > 0
        ? Math.min(
            100,
            ((stats.totalViews + stats.totalEnquiries * 10) /
              stats.totalProperties /
              100) *
              100
          )
        : 0;

    return Math.round((propertyScore + engagementScore) / 2);
  }, [stats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 h-56 animate-pulse rounded-3xl bg-white/70 shadow-xl" />

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-3xl bg-white/70 shadow-lg"
              />
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <SkeletonPanel />
            <SkeletonPanel />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 px-4 py-6 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mx-auto max-w-7xl"
      >
        <div className="mb-8 overflow-hidden rounded-3xl border border-white/70 bg-white/75 shadow-xl shadow-purple-100/60 backdrop-blur-xl">
          <div className="relative p-6 md:p-8">
            <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-purple-200/60 blur-3xl" />
            <div className="absolute bottom-0 left-24 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-purple-600">
                  Admin Premium Phase
                </p>
                <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">
                  Platform Analytics
                </h1>
                <p className="mt-3 max-w-2xl text-slate-600">
                  Monitor views, enquiries, seller performance, property
                  activity, subscriptions, boosted listings, and premium
                  marketplace growth.
                </p>

                <button
                  onClick={loadAnalytics}
                  disabled={refreshing}
                  className="mt-6 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {refreshing ? "Refreshing..." : "Refresh Analytics"}
                </button>
              </div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="rounded-3xl border border-white/70 bg-slate-950 p-6 text-white shadow-2xl"
              >
                <p className="text-sm font-bold text-slate-300">
                  Platform Health Score
                </p>

                <div className="mt-4 flex items-end gap-2">
                  <h2 className="text-5xl font-black">
                    {performanceScore}
                  </h2>
                  <span className="mb-2 text-lg font-black text-slate-400">
                    /100
                  </span>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(performanceScore, 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-purple-500"
                  />
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Based on approval rate, views, enquiries and overall activity.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <AnalyticsCard title="Total Views" value={stats.totalViews} />
          <AnalyticsCard title="Total Enquiries" value={stats.totalEnquiries} />
          <AnalyticsCard title="Properties" value={stats.totalProperties} />
          <AnalyticsCard title="Approved" value={stats.approvedProperties} />
          <AnalyticsCard title="Boosted" value={stats.boostedProperties} />
          <AnalyticsCard title="Featured" value={stats.featuredProperties} />
          <AnalyticsCard title="Sellers" value={stats.totalSellers} />
          <AnalyticsCard title="Pro Sellers" value={stats.proSellers} />
          <AnalyticsCard title="Agency Sellers" value={stats.agencySellers} />
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          <AnalyticsPanel
            title="Top Performing Properties"
            subtitle="Top properties ranked by marketplace activity."
            search={propertySearch}
            setSearch={setPropertySearch}
            searchPlaceholder="Search property title, status or type..."
            sortOptions={PROPERTY_SORTS}
            activeSort={propertySort}
            setActiveSort={setPropertySort}
          >
            {filteredProperties.length === 0 ? (
              <EmptyState text="No properties found." />
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredProperties.map((property, index) => (
                    <PropertyRow
                      key={property.id || index}
                      property={property}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </AnalyticsPanel>

          <AnalyticsPanel
            title="Top Sellers"
            subtitle="Sellers ranked by total views, enquiries and listings."
            search={sellerSearch}
            setSearch={setSellerSearch}
            searchPlaceholder="Search seller name, email or plan..."
            sortOptions={SELLER_SORTS}
            activeSort={sellerSort}
            setActiveSort={setSellerSort}
          >
            {filteredSellers.length === 0 ? (
              <EmptyState text="No sellers found." />
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredSellers.map((seller, index) => (
                    <SellerRow
                      key={seller.id || index}
                      seller={seller}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </AnalyticsPanel>
        </div>
      </motion.div>
    </div>
  );
}

function AnalyticsPanel({
  title,
  subtitle,
  search,
  setSearch,
  searchPlaceholder,
  sortOptions,
  activeSort,
  setActiveSort,
  children,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl"
    >
      <div className="mb-5">
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
        />

        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <button
              key={option}
              onClick={() => setActiveSort(option)}
              className={`rounded-2xl px-4 py-3 text-sm font-bold capitalize transition ${
                activeSort === option
                  ? "bg-purple-700 text-white shadow-lg shadow-purple-200"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {children}
    </motion.div>
  );
}

function PropertyRow({ property, index }) {
  const views = Number(property.views || 0);
  const enquiries = getPropertyEnquiries(property);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.035 }}
      className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="min-w-0">
          <h3 className="truncate text-base font-black text-slate-950">
            {property.title || "Untitled Property"}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-600">
              {property.status || "pending"}
            </span>
            {property.type && (
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black uppercase text-purple-700">
                {property.type}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:min-w-[220px]">
          <MiniMetric label="Views" value={formatNumber(views)} />
          <MiniMetric label="Enquiries" value={formatNumber(enquiries)} />
        </div>
      </div>
    </motion.div>
  );
}

function SellerRow({ seller, index }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.035 }}
      className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-slate-950">
              {getSellerName(seller)}
            </h3>
            <p className="mt-1 truncate text-sm text-slate-500">
              {seller.email || "No email"}
            </p>
          </div>

          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black uppercase text-purple-700">
            {getSellerPlan(seller)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <MiniMetric label="Properties" value={formatNumber(seller.properties)} />
          <MiniMetric label="Views" value={formatNumber(seller.views)} />
          <MiniMetric label="Enquiries" value={formatNumber(seller.enquiries)} />
        </div>
      </div>
    </motion.div>
  );
}

function AnalyticsCard({ title, value }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl"
    >
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <h2 className="mt-3 text-2xl font-black text-purple-700 md:text-3xl">
        {formatNumber(value)}
      </h2>
    </motion.div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-10 text-center">
      <p className="font-bold text-slate-500">{text}</p>
    </div>
  );
}

function SkeletonPanel() {
  return (
    <div className="animate-pulse rounded-3xl border border-white/70 bg-white/70 p-5 shadow-xl backdrop-blur-xl">
      <div className="mb-5 space-y-3">
        <div className="h-6 w-2/3 rounded-full bg-slate-200" />
        <div className="h-4 w-1/2 rounded-full bg-slate-200" />
      </div>

      <div className="mb-5 h-12 rounded-2xl bg-slate-200" />

      <div className="space-y-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-28 rounded-3xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}