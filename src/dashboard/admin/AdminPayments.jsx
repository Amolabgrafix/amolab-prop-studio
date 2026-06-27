import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

const STATUS_FILTERS = ["all", "success", "pending"];
const PURPOSE_FILTERS = ["all", "boost", "featured", "subscription", "other"];

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function isSuccessfulPayment(payment) {
  return ["success", "successful", "paid", "completed"].includes(
    normalizeText(payment.status)
  );
}

function formatCurrency(value) {
  return `₦${Number(value || 0).toLocaleString()}`;
}

function formatDate(value) {
  if (!value) return "No date";
  return new Date(value).toLocaleString();
}

function getPaymentAmount(payment) {
  return Number(payment.amount || 0);
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

  return purpose || "other";
}

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [purposeFilter, setPurposeFilter] = useState("all");

  async function fetchPayments() {
    setRefreshing(true);

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setPayments([]);
    } else {
      setPayments(data || []);
    }

    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadPayments() {
      setRefreshing(true);

      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (!isMounted) {
        return;
      }

      if (error) {
        toast.error(error.message);
        setPayments([]);
      } else {
        setPayments(data || []);
      }

      setLoading(false);
      setRefreshing(false);
    }

    loadPayments();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        payment.reference?.toLowerCase().includes(keyword) ||
        payment.user_id?.toLowerCase().includes(keyword) ||
        payment.status?.toLowerCase().includes(keyword) ||
        payment.purpose?.toLowerCase().includes(keyword) ||
        payment.plan?.toLowerCase().includes(keyword);

      const paymentStatus = isSuccessfulPayment(payment) ? "success" : "pending";

      const matchesStatus =
        statusFilter === "all" || paymentStatus === statusFilter;

      const purpose = getPaymentPurpose(payment);

      const matchesPurpose =
        purposeFilter === "all" ||
        purpose === purposeFilter ||
        (purposeFilter === "other" &&
          !["boost", "featured", "subscription"].includes(purpose));

      return matchesSearch && matchesStatus && matchesPurpose;
    });
  }, [payments, search, statusFilter, purposeFilter]);

  const stats = useMemo(() => {
    const successful = payments.filter(isSuccessfulPayment);
    const pending = payments.filter((payment) => !isSuccessfulPayment(payment));

    return {
      totalPayments: payments.length,
      successfulPayments: successful.length,
      pendingPayments: pending.length,
      totalAmount: successful.reduce(
        (sum, payment) => sum + getPaymentAmount(payment),
        0
      ),
    };
  }, [payments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 h-52 animate-pulse rounded-3xl bg-white/70 shadow-xl" />
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-3xl bg-white/70 shadow-lg"
              />
            ))}
          </div>
          <div className="grid gap-5">
            {[1, 2, 3, 4].map((item) => (
              <SkeletonPayment key={item} />
            ))}
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

            <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-purple-600">
                  Admin Premium Phase
                </p>
                <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">
                  Payments Control Center
                </h1>
                <p className="mt-3 max-w-2xl text-slate-600">
                  Track all platform transactions, payment purposes, buyer
                  references, seller upgrades, boosts, and featured listings.
                </p>
              </div>

              <button
                onClick={fetchPayments}
                disabled={refreshing}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {refreshing ? "Refreshing..." : "Refresh Payments"}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Payments" value={stats.totalPayments} />
          <StatCard
            title="Successful Payments"
            value={stats.successfulPayments}
          />
          <StatCard title="Pending Payments" value={stats.pendingPayments} />
          <StatCard title="Confirmed Revenue" value={formatCurrency(stats.totalAmount)} />
        </div>

        <div className="mb-6 rounded-3xl border border-white/70 bg-white/75 p-4 shadow-lg backdrop-blur-xl">
          <div className="grid gap-4 xl:grid-cols-[1fr_auto_auto]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, user ID, status, purpose or plan..."
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

        {filteredPayments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border border-dashed border-slate-300 bg-white/75 p-12 text-center shadow-lg backdrop-blur-xl"
          >
            <h2 className="text-xl font-black text-slate-900">
              No payments found
            </h2>
            <p className="mt-2 text-slate-500">
              Try changing your search keyword or payment filters.
            </p>
          </motion.div>
        ) : (
          <motion.div layout className="grid gap-5">
            <AnimatePresence>
              {filteredPayments.map((payment, index) => (
                <PaymentCard
                  key={payment.id || payment.reference || index}
                  payment={payment}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function PaymentCard({ payment, index }) {
  const success = isSuccessfulPayment(payment);
  const purpose = getPaymentPurpose(payment);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, delay: index * 0.035 }}
      className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-xl shadow-slate-200/60 backdrop-blur-xl"
    >
      <div className="flex flex-col justify-between gap-5 p-5 lg:flex-row lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
            Payment Amount
          </p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">
            {formatCurrency(getPaymentAmount(payment))}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {formatDate(payment.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge success={success} status={payment.status} />
          <PurposeBadge purpose={purpose} />
          {payment.plan && <PlanBadge plan={payment.plan} />}
        </div>
      </div>

      <div className="grid gap-3 border-t border-slate-100 p-5 md:grid-cols-2 xl:grid-cols-4">
        <Info label="User ID" value={payment.user_id || "N/A"} />
        <Info label="Purpose" value={payment.purpose || purpose || "N/A"} />
        <Info label="Plan" value={payment.plan || "N/A"} />
        <Info label="Property ID" value={payment.property_id || "N/A"} />
        <Info
          label="Reference"
          value={payment.reference || "N/A"}
          className="md:col-span-2 xl:col-span-4"
        />
      </div>
    </motion.div>
  );
}

function StatCard({ title, value }) {
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

function Info({ label, value, className = "" }) {
  return (
    <div className={`rounded-2xl bg-slate-50 p-4 ${className}`}>
      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ success, status }) {
  return (
    <span
      className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider ${
        success
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {status || "pending"}
    </span>
  );
}

function PurposeBadge({ purpose }) {
  return (
    <span className="rounded-full bg-purple-100 px-4 py-2 text-xs font-black uppercase tracking-wider text-purple-700">
      {purpose || "other"}
    </span>
  );
}

function PlanBadge({ plan }) {
  return (
    <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-700">
      {plan}
    </span>
  );
}

function SkeletonPayment() {
  return (
    <div className="animate-pulse rounded-3xl border border-white/70 bg-white/70 p-5 shadow-xl backdrop-blur-xl">
      <div className="flex flex-col justify-between gap-5 lg:flex-row">
        <div className="space-y-3">
          <div className="h-4 w-32 rounded-full bg-slate-200" />
          <div className="h-8 w-48 rounded-full bg-slate-200" />
          <div className="h-4 w-40 rounded-full bg-slate-200" />
        </div>

        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-full bg-slate-200" />
          <div className="h-9 w-24 rounded-full bg-slate-200" />
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="h-20 rounded-2xl bg-slate-200" />
        <div className="h-20 rounded-2xl bg-slate-200" />
        <div className="h-20 rounded-2xl bg-slate-200" />
        <div className="h-20 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}