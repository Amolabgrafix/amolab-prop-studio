import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

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
  const [message, setMessage] = useState("");

  const loadRevenue = useCallback(async () => {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.functions.invoke(
      "admin-revenue-stats"
    );

    console.log("ADMIN REVENUE FUNCTION DATA:", data);
    console.log("ADMIN REVENUE FUNCTION ERROR:", error);

    if (error || !data?.success) {
      setMessage(
        error?.message ||
          data?.error ||
          "Could not load admin revenue stats."
      );
      setLoading(false);
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
  }, []);

  useEffect(() => {
    async function initializeRevenue() {
      await loadRevenue();
    }

    initializeRevenue();
  }, [loadRevenue]);

  if (loading) {
    return <p className="p-6 text-slate-600">Loading revenue...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        Revenue Dashboard
      </h1>

      {message && (
        <div className="mb-6 rounded-xl bg-red-100 p-4 text-red-700">
          {message}
        </div>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <RevenueCard
          title="Total Revenue"
          value={`₦${stats.totalRevenue.toLocaleString()}`}
        />

        <RevenueCard
          title="Boost Revenue"
          value={`₦${stats.boostRevenue.toLocaleString()}`}
        />

        <RevenueCard
          title="Featured Revenue"
          value={`₦${stats.featuredRevenue.toLocaleString()}`}
        />

        <RevenueCard
          title="Subscription Revenue"
          value={`₦${stats.subscriptionRevenue.toLocaleString()}`}
        />

        <RevenueCard
          title="Successful Payments"
          value={stats.successfulPayments}
        />

        <RevenueCard title="Pending Payments" value={stats.pendingPayments} />

        <RevenueCard title="Pro Subscribers" value={stats.proSubscribers} />

        <RevenueCard
          title="Agency Subscribers"
          value={stats.agencySubscribers}
        />
      </div>

      <div className="rounded-xl bg-white p-5 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            Recent Payments
          </h2>

          <button
            onClick={loadRevenue}
            className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800"
          >
            Refresh
          </button>
        </div>

        {payments.length === 0 ? (
          <p className="text-slate-500">No payments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-100">
                  <th className="p-3">Reference</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => {
                  const isSuccess = isSuccessfulPayment(payment);

                  return (
                    <tr
                      key={payment.id || payment.reference}
                      className="border-b"
                    >
                      <td className="p-3">{payment.reference}</td>

                      <td className="p-3">
                        ₦{getPaymentAmount(payment).toLocaleString()}
                      </td>

                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            isSuccess
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>

                      <td className="p-3">{payment.purpose}</td>

                      <td className="p-3">{payment.plan || "-"}</td>

                      <td className="p-3">
                        {payment.created_at
                          ? new Date(payment.created_at).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function RevenueCard({ title, value }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <p className="text-sm text-slate-500">{title}</p>
      <h3 className="mt-2 text-2xl font-bold text-purple-700">{value}</h3>
    </div>
  );
}