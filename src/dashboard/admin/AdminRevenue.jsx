import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

const STATUS_FILTERS = ["all", "success", "pending"];
const PURPOSE_FILTERS = ["all", "boost", "featured", "subscription"];

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function isSuccessfulPayment(payment) {
  return ["success", "successful", "paid", "completed"].includes(
    normalizeText(payment.status)
  );
}

function getPaymentAmount(payment) {
  return Number(payment.amount || 0);
}

function formatCurrency(value) {
  return `₦${Number(value || 0).toLocaleString()}`;
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function getPaymentPurpose(payment) {
  const purpose = normalizeText(payment.purpose);
  const reference = normalizeText(payment.reference);
  const plan = normalizeText(payment.plan);

  if (purpose.includes("boost") || reference.startsWith("boost")) {
    return "boost";
  }

  if (purpose.includes("feature") || reference.startsWith("feature")) {
    return "featured";
  }

  if (
    purpose.includes("subscription") ||
    purpose.includes("plan") ||
    reference.startsWith("sub") ||
    ["pro", "agency"].includes(plan)
  ) {
    return "subscription";
  }

  return purpose || "unknown";
}

export default function AdminRevenue() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    boostRevenue: 0,
    featuredRevenue: 0,
    subscriptionRevenue: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    proSubscribers: 0,
    agencySubscribers: 0,
  });

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [purposeFilter, setPurposeFilter] = useState("all");

  const loadRevenue = useCallback(async () => {
    setRefreshing(true);

    const { data, error } = await supabase.functions.invoke(
      "admin-revenue-stats"
    );

    console.log("ADMIN REVENUE FUNCTION DATA:", data);
    console.log("ADMIN REVENUE FUNCTION ERROR:", error);

    if (error || !data?.success) {
      toast.error(
        error?.message || data?.error || "Could not load admin revenue stats."
      );
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setStats({
      totalRevenue: Number(data.stats?.totalRevenue || 0),
      boostRevenue: Number(data.stats?.boostRevenue || 0),
      featuredRevenue: Number(data.stats?.featuredRevenue || 0),
      subscriptionRevenue: Number(data.stats?.subscriptionRevenue || 0),
      successfulPayments: Number(data.stats?.successfulPayments || 0),
      pendingPayments: Number(data.stats?.pendingPayments || 0),
      proSubscribers: Number(data.stats?.proSubscribers || 0),
      agencySubscribers: Number(data.stats?.agencySubscribers || 0),
    });

    setPayments(data.payments || []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    // Defer calling loadRevenue to avoid synchronous setState within the effect
    // which can trigger cascading renders.
    Promise.resolve().then(() => loadRevenue());
  }, [loadRevenue]);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        payment.reference?.toLowerCase().includes(keyword) ||
        payment.status?.toLowerCase().includes(keyword) ||
        payment.purpose?.toLowerCase().includes(keyword) ||
        payment.plan?.toLowerCase().includes(keyword);

      const paymentStatus = isSuccessfulPayment(payment) ? "success" : "pending";
      const matchesStatus =
        statusFilter === "all" || paymentStatus === statusFilter;

      const purpose = getPaymentPurpose(payment);
      const matchesPurpose =
        purposeFilter === "all" || purpose === purposeFilter;

      return matchesSearch && matchesStatus && matchesPurpose;
    });
  }, [payments, search, statusFilter, purposeFilter]);

  const latestRevenue = useMemo(() => {
    return filteredPayments
      .filter(isSuccessfulPayment)
      .reduce((sum, payment) => sum + getPaymentAmount(payment), 0);
  }, [filteredPayments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 h-56 animate-pulse rounded-3xl bg-white/70 shadow-xl" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-3xl bg-white/70 shadow-lg"
              />
            ))}
          </div>
          <div className="mt-8 h-96 animate-pulse rounded-3xl bg-white/70 shadow-xl" />
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
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-purple-200/50 blur-3xl" />
            <div className="absolute bottom-0 left-20 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-purple-600">
                  Admin Premium Phase
                </p>
                <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">
                  Revenue Command Center
                </h1>
                <p className="mt-3 max-w-2xl text-slate-600">
                  Monitor platform earnings, seller subscriptions, boost sales,
                  featured payments, and recent payment activity.
                </p>
              </div>

              <div className="rounded-3xl border border-white/70 bg-slate-950 p-6 text-white shadow-2xl">
                <p className="text-sm font-semibold text-slate-300">
                  Filtered Revenue
                </p>
                <h2 className="mt-2 text-4xl font-black">
                  {formatCurrency(latestRevenue)}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Based on current payment filters
                </p>
              </div>
            </div>

            <div className="relative mt-6">
              <button
                onClick={loadRevenue}
                disabled={refreshing}
                className="rounded-2xl bg-purple-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {refreshing ? "Refreshing..." : "Refresh Revenue"}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <RevenueCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} />
          <RevenueCard title="Boost Revenue" value={formatCurrency(stats.boostRevenue)} />
          <RevenueCard title="Featured Revenue" value={formatCurrency(stats.featuredRevenue)} />
          <RevenueCard title="Subscription Revenue" value={formatCurrency(stats.subscriptionRevenue)} />
          <RevenueCard title="Successful Payments" value={stats.successfulPayments} />
          <RevenueCard title="Pending Payments" value={stats.pendingPayments} />
          <RevenueCard title="Pro Subscribers" value={stats.proSubscribers} />
          <RevenueCard title="Agency Subscribers" value={stats.agencySubscribers} />
        </div>

        <div className="mb-6 rounded-3xl border border-white/70 bg-white/75 p-4 shadow-lg backdrop-blur-xl">
          <div className="grid gap-4 xl:grid-cols-[1fr_auto_auto]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, status, purpose or plan..."
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
            />

            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-2xl px-4 py-3 text-sm font-bold capitalize transition ${
                    statusFilter === status
                      ? "bg-slate-950 text-white shadow-lg"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {PURPOSE_FILTERS.map((purpose) => (
                <button
                  key={purpose}
                  onClick={() => setPurposeFilter(purpose)}
                  className={`rounded-2xl px-4 py-3 text-sm font-bold capitalize transition ${
                    purposeFilter === purpose
                      ? "bg-purple-700 text-white shadow-lg shadow-purple-200"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {purpose}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Recent Payments
              </h2>
              <p className="text-sm text-slate-500">
                Showing {filteredPayments.length} of {payments.length} payments
              </p>
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-lg font-black text-slate-900">
                No payments found
              </h3>
              <p className="mt-2 text-slate-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                      <th className="p-4">Reference</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Purpose</th>
                      <th className="p-4">Plan</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    <AnimatePresence>
                      {filteredPayments.map((payment, index) => (
                        <motion.tr
                          key={payment.id || payment.reference || index}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.025 }}
                          className="border-b border-slate-100 transition hover:bg-purple-50/60"
                        >
                          <td className="max-w-[260px] truncate p-4 font-bold text-slate-800">
                            {payment.reference || "-"}
                          </td>

                          <td className="p-4 font-black text-slate-950">
                            {formatCurrency(getPaymentAmount(payment))}
                          </td>

                          <td className="p-4">
                            <PaymentStatusBadge payment={payment} />
                          </td>

                          <td className="p-4 capitalize text-slate-600">
                            {payment.purpose || getPaymentPurpose(payment)}
                          </td>

                          <td className="p-4 capitalize text-slate-600">
                            {payment.plan || "-"}
                          </td>

                          <td className="p-4 text-slate-500">
                            {formatDate(payment.created_at)}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 p-4 lg:hidden">
                {filteredPayments.map((payment, index) => (
                  <motion.div
                    key={payment.id || payment.reference || index}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="rounded-3xl border border-slate-100 bg-white p-4 shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Reference
                        </p>
                        <h3 className="mt-1 break-all text-sm font-black text-slate-900">
                          {payment.reference || "-"}
                        </h3>
                      </div>
                      <PaymentStatusBadge payment={payment} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <MobileInfo
                        label="Amount"
                        value={formatCurrency(getPaymentAmount(payment))}
                      />
                      <MobileInfo
                        label="Purpose"
                        value={payment.purpose || getPaymentPurpose(payment)}
                      />
                      <MobileInfo label="Plan" value={payment.plan || "-"} />
                      <MobileInfo
                        label="Date"
                        value={formatDate(payment.created_at)}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function RevenueCard({ title, value }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl"
    >
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <h3 className="mt-3 text-2xl font-black text-purple-700 md:text-3xl">
        {value}
      </h3>
    </motion.div>
  );
}

function PaymentStatusBadge({ payment }) {
  const success = isSuccessfulPayment(payment);

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
        success
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {payment.status || "pending"}
    </span>
  );
}

function MobileInfo({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-black capitalize text-slate-800">
        {value}
      </p>
    </div>
  );
}