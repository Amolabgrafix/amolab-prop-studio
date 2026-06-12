import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchPayments() {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
      } else {
        setPayments(data || []);
      }

      setLoading(false);
    }

    fetchPayments();
  }, []);

  if (loading) {
    return <div className="p-6">Loading payments...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-purple-700 mb-6">
        Admin Payments
      </h1>

      <div className="mb-6 rounded-xl bg-white p-5 shadow">
        <p className="font-semibold text-purple-700">
          Total Payments: {payments.length}
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-xl bg-red-100 p-4 text-red-700">
          {message}
        </div>
      )}

      {payments.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-600">No payments yet.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {payments.map((payment) => (
            <div key={payment.id} className="rounded-xl bg-white p-5 shadow">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    ₦{payment.amount || "0"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {payment.created_at
                      ? new Date(payment.created_at).toLocaleString()
                      : "No date"}
                  </p>
                </div>

                <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700">
                  {payment.status || "unknown"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <p>
                  <span className="font-semibold">User ID:</span>{" "}
                  {payment.user_id || "N/A"}
                </p>

                <p>
                  <span className="font-semibold">Purpose:</span>{" "}
                  {payment.purpose || "N/A"}
                </p>

                <p className="md:col-span-2">
                  <span className="font-semibold">Reference:</span>{" "}
                  {payment.reference || "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}