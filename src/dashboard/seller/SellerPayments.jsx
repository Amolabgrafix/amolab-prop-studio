import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function SellerPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadPayments() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setPayments(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPayments();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <p className="p-6 text-slate-600">Loading payment history...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        Payment History
      </h1>

      <div className="rounded-xl bg-white p-5 shadow">
        {payments.length === 0 ? (
          <p className="text-slate-500">You have not made any payments yet.</p>
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
                  <th className="p-3">Duration</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b">
                    <td className="p-3">{payment.reference}</td>

                    <td className="p-3">
                      ₦{Number(payment.amount || 0).toLocaleString()}
                    </td>

                    <td className="p-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          payment.status === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>

                    <td className="p-3">{payment.purpose || "-"}</td>

                    <td className="p-3">{payment.plan || "-"}</td>

                    <td className="p-3">
                      {payment.duration_days
                        ? `${payment.duration_days} days`
                        : "-"}
                    </td>

                    <td className="p-3">
                      {payment.created_at
                        ? new Date(payment.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}