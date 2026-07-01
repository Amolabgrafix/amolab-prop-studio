import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { sortPropertiesByBuyerMatch } from "../lib/aiBuyerMatchEngine";

export default function AIMatchedProperties() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadMatches = async () => {
      if (!isMounted) return;
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) return;
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: preference } = await supabase
        .from("buyer_preferences")
        .select("*")
        .eq("buyer_id", user.id)
        .maybeSingle();

      if (!isMounted) return;
      if (!preference) {
        setLoading(false);
        return;
      }

      const { data: properties } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "approved");

      if (!isMounted) return;
      const ranked = sortPropertiesByBuyerMatch(
        properties || [],
        preference
      );

      if (!isMounted) return;
      setMatches(ranked);
      setLoading(false);
    };

    loadMatches();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="mt-8 rounded-3xl bg-white p-8 shadow-xl dark:bg-slate-900">
        <p className="text-slate-500 dark:text-slate-300">
          AI is searching for matching properties...
        </p>
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="mt-8 rounded-3xl bg-white p-8 shadow-xl dark:bg-slate-900">
        <h2 className="text-xl font-bold">
          No Matching Properties Yet
        </h2>

        <p className="mt-2 text-slate-500">
          Once new approved properties match your preference,
          they will automatically appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black dark:text-white">
            🤖 AI Matched Properties
          </h2>

          <p className="text-slate-500 dark:text-slate-400">
            {matches.length} property matches found
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {matches.map((property, index) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: index * 0.05,
            }}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-bold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                  {property.buyerMatch.score}% Match
                </span>

                <span className="font-bold text-green-600">
                  {property.buyerMatch.grade}
                </span>
              </div>

              <h3 className="text-2xl font-black dark:text-white">
                {property.title}
              </h3>

              <p className="mt-2 text-slate-500">
                {property.city}, {property.state}
              </p>

              <p className="mt-3 text-2xl font-black text-purple-700">
                ₦{Number(property.price).toLocaleString()}
              </p>

              <div className="mt-6 space-y-2">
                {property.buyerMatch.reasons.map((reason) => (
                  <div
                    key={reason}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span>✅</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>

              <Link
                to={`/properties/${property.id}`}
                className="mt-8 inline-flex rounded-2xl bg-purple-700 px-6 py-3 font-bold text-white transition hover:bg-purple-800"
              >
                View Property
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}