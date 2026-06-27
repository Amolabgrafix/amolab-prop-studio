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

export default function TrendingNearYou() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    async function loadTrending() {
      setLoading(true);

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "approved")
        .order("is_featured", { ascending: false })
        .order("is_boosted", { ascending: false })
        .order("views", { ascending: false })
        .limit(8);

      if (!error) {
        setProperties(data || []);
      }

      setLoading(false);
    }

    loadTrending();
  }, []);

  if (!loading && properties.length === 0) return null;

  return (
    <section className="bg-slate-50 py-24 dark:bg-slate-950">
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
              Trending Near You
            </p>

            <h2 className="mt-3 text-4xl font-black text-slate-950 dark:text-white md:text-5xl">
              Popular Properties Right Now
            </h2>

            <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
              Discover the most active approved listings based on views,
              featured status and boosted visibility.
            </p>
          </div>

          <Link
            to="/properties"
            className="rounded-2xl bg-slate-950 px-6 py-4 font-black text-white transition hover:-translate-y-1 hover:bg-purple-700 dark:bg-purple-700"
          >
            Explore All
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-96 animate-pulse rounded-3xl bg-slate-200 dark:bg-white/10"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {properties.map((property) => (
              <motion.div
                key={property.id}
                whileHover={{ y: -8, scale: 1.01 }}
                className="group overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80"
              >
                <div className="relative h-56 overflow-hidden bg-slate-200">
                  {property.image_url ? (
                    <img
                      src={property.image_url}
                      alt={property.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-500">
                      No Image
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-purple-700">
                      🔥 Trending
                    </span>

                    {property.is_featured && (
                      <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-slate-950">
                        ⭐ Featured
                      </span>
                    )}

                    {property.is_boosted && (
                      <span className="rounded-full bg-purple-700 px-3 py-1 text-xs font-black text-white">
                        🚀 Boosted
                      </span>
                    )}
                  </div>

                  <span className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                    👁 {Number(property.views || 0).toLocaleString()} views
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
                    View Property
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}