import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

function formatPrice(price) {
  return `₦${Number(price || 0).toLocaleString()}`;
}

function getLocation(property) {
  return property?.location || property?.city || property?.state || "No location";
}

export default function ContinueBrowsing() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function loadRecentlyViewed() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("recently_viewed")
        .select(
          `
          id,
          viewed_at,
          property_id,
          properties (*)
        `
        )
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(6);

      if (!error) {
        setItems((data || []).filter((item) => item.properties));
      }

      setLoading(false);
    }

    loadRecentlyViewed();
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <section className="bg-white py-24 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end"
        >
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-purple-600 dark:text-purple-300">
              Continue Browsing
            </p>
            <h2 className="mt-3 text-4xl font-black text-slate-950 dark:text-white md:text-5xl">
              Recently Viewed Again
            </h2>
            <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
              Pick up from the homes and listings you checked recently.
            </p>
          </div>

          <Link
            to="/dashboard/recently-viewed"
            className="rounded-2xl bg-slate-950 px-6 py-4 font-black text-white transition hover:-translate-y-1 hover:bg-purple-700 dark:bg-purple-700"
          >
            View All
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-3xl bg-slate-200 dark:bg-white/10"
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {items.map((item) => {
              const property = item.properties;

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -8, scale: 1.01 }}
                  className="min-w-[310px] overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80"
                >
                  <div className="relative h-52 overflow-hidden bg-slate-200">
                    {property.image_url ? (
                      <img
                        src={property.image_url}
                        alt={property.title}
                        className="h-full w-full object-cover transition duration-700 hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-500">
                        No Image
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-purple-700">
                      👁 Viewed
                    </span>
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
                      {property.type || "Property"}
                    </p>

                    <h3 className="mt-3 line-clamp-1 text-xl font-black text-slate-950 dark:text-white">
                      {property.title}
                    </h3>

                    <p className="mt-2 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">
                      📍 {getLocation(property)}
                    </p>

                    <p className="mt-4 text-2xl font-black text-purple-700 dark:text-purple-300">
                      {formatPrice(property.price)}
                    </p>

                    <Link
                      to={`/properties/${property.id}`}
                      className="mt-5 block rounded-2xl bg-slate-950 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-purple-700 dark:bg-purple-700"
                    >
                      Continue Viewing
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}