import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { getInterestedBuyerSummaryForSeller } from "../lib/sellerInterestedBuyerEngine";

export default function SellerInterestedBuyers() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    properties: [],
    totalInterestedBuyers: 0,
  });
  const [message, setMessage] = useState("");

  async function loadInterestedBuyers() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    const result = await getInterestedBuyerSummaryForSeller(user.id);

    if (!result.success) {
      setMessage(result.message);
    } else {
      setSummary(result);
    }

    setLoading(false);
  }

  useEffect(() => {
    async function initialize() {
      await loadInterestedBuyers();
    }

    initialize();
  }, []);

  if (loading) {
    return (
      <div className="rounded-[2rem] bg-white p-6 shadow-xl dark:bg-slate-900">
        <p className="font-bold text-slate-600 dark:text-slate-300">
          AI is analyzing interested buyers...
        </p>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mt-8"
    >
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.28em] text-purple-600 dark:text-purple-300">
            AI Seller Intelligence
          </p>

          <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
            Interested Buyers
          </h2>

          <p className="mt-1 text-slate-500 dark:text-slate-400">
            AI scans buyer preferences and shows buyers likely to be interested
            in your approved properties.
          </p>
        </div>

        <div className="rounded-2xl bg-purple-700 px-5 py-4 text-white shadow-lg">
          <p className="text-xs font-black uppercase tracking-wider text-purple-200">
            Total Matches
          </p>
          <p className="text-3xl font-black">
            {summary.totalInterestedBuyers || 0}
          </p>
        </div>
      </div>

      {message && (
        <div className="rounded-2xl bg-red-100 p-4 font-bold text-red-700">
          {message}
        </div>
      )}

      {!summary.properties.length ? (
        <div className="rounded-[2rem] bg-white p-8 shadow-xl dark:bg-slate-900">
          <p className="font-bold text-slate-600 dark:text-slate-300">
            No interested buyer matches yet. Once buyers save preferences that
            match your approved properties, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {summary.properties.map((item, index) => (
            <motion.div
              key={item.property.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="border-b border-slate-100 p-6 dark:border-slate-800">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                      {item.property.title || "Untitled Property"}
                    </h3>

                    <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {item.property.city || item.property.location || "N/A"},{" "}
                      {item.property.state || "N/A"}
                    </p>

                    <p className="mt-2 text-xl font-black text-purple-700 dark:text-purple-300">
                      ₦{Number(item.property.price || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <StatCard label="Interested" value={item.interestedCount} />
                    <StatCard label="Top Match" value={`${item.topMatch}%`} />
                  </div>
                </div>
              </div>

              <div className="p-6">
                {!item.interestedBuyers.length ? (
                  <p className="font-bold text-slate-500">
                    No buyer match for this property yet.
                  </p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {item.interestedBuyers.slice(0, 6).map((buyer) => (
                      <div
                        key={`${item.property.id}-${buyer.buyer_id}`}
                        className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-black text-slate-900 dark:text-white">
                              {buyer.profile?.fullname ||
                                buyer.profile?.username ||
                                "Buyer"}
                            </p>

                            <p className="mt-1 text-xs font-bold text-slate-500">
                              {buyer.profile?.email || "No email"}
                            </p>
                          </div>

                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                            {buyer.match.score}%
                          </span>
                        </div>

                        <div className="mt-3 space-y-1">
                          {buyer.match.reasons.slice(0, 3).map((reason) => (
                            <p
                              key={reason}
                              className="text-xs font-semibold text-slate-600 dark:text-slate-300"
                            >
                              ✅ {reason}
                            </p>
                          ))}
                        </div>

                        {buyer.profile?.phone && (
                          <a
                            href={`tel:${buyer.profile.phone}`}
                            className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-black"
                          >
                            📞 Call Buyer
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-100 px-4 py-3 text-center dark:bg-slate-950">
      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}