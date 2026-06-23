import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
      <div className="h-56 animate-pulse bg-slate-200" />
      <div className="space-y-4 p-5">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-6 w-4/5 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

export default function RecentlyViewed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentlyViewed() {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("recently_viewed")
        .select(`
          id,
          viewed_at,
          properties (
            id,
            title,
            price,
            location,
            city,
            type,
            property_type,
            image_url,
            views,
            is_featured,
            is_boosted
          )
        `)
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(12);

      if (!error) {
        setItems(data || []);
      }

      setLoading(false);
    }

    fetchRecentlyViewed();
  }, []);

  const visibleItems = items.filter((item) => item.properties);

  return (
    <div className="min-h-screen">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-purple-800 via-slate-950 to-indigo-950 p-8 text-white shadow-2xl"
      >
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-purple-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative z-10">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-purple-200">
            Viewing History
          </p>

          <h1 className="mt-3 text-4xl font-black md:text-5xl">
            Recently Viewed
          </h1>

          <p className="mt-3 max-w-2xl text-purple-100">
            Quickly return to properties you opened recently and continue your search.
          </p>

          <div className="mt-6 inline-flex rounded-2xl bg-white/10 px-5 py-3 font-bold backdrop-blur">
            👁 {loading ? "..." : visibleItems.length} Recently Viewed
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : visibleItems.length === 0 ? (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-8 rounded-[2rem] bg-white p-10 text-center shadow-xl"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 text-4xl">
            👁
          </div>

          <h2 className="mt-6 text-3xl font-black text-slate-900">
            No recently viewed properties yet
          </h2>

          <p className="mx-auto mt-3 max-w-md text-slate-600">
            Properties you open will appear here so you can easily check them again.
          </p>

          <Link
            to="/properties"
            className="mt-6 inline-block rounded-2xl bg-purple-700 px-7 py-4 font-bold text-white shadow-lg shadow-purple-200 hover:bg-purple-800"
          >
            Browse Properties
          </Link>
        </motion.div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {visibleItems.map((item) => {
            const property = item.properties;

            return (
              <motion.div
                key={item.id}
                variants={fadeUp}
                whileHover={{ y: -8, scale: 1.01 }}
                className="group overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-slate-200/70"
              >
                <div className="relative h-60 overflow-hidden bg-slate-200">
                  {property.image_url ? (
                    <img
                      src={property.image_url}
                      alt={property.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-500">
                      No Image Available
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black capitalize text-purple-700 backdrop-blur">
                      {property.type || property.property_type || "property"}
                    </span>

                    {property.is_featured && (
                      <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-slate-900">
                        ⭐ Featured
                      </span>
                    )}

                    {property.is_boosted && (
                      <span className="rounded-full bg-purple-700 px-3 py-1 text-xs font-black text-white">
                        🚀 Boosted
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                    👁 {property.views || 0} views
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="line-clamp-1 text-xl font-black text-slate-900">
                    {property.title}
                  </h2>

                  <p className="mt-2 line-clamp-1 text-slate-600">
                    📍 {property.location || property.city || "No location"}
                  </p>

                  <p className="mt-4 text-2xl font-black text-purple-700">
                    ₦{Number(property.price || 0).toLocaleString()}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    Viewed {new Date(item.viewed_at).toLocaleDateString()}
                  </p>

                  <Link
                    to={`/properties/${property.id}`}
                    className="mt-5 block rounded-xl bg-slate-900 px-4 py-3 text-center font-bold text-white transition hover:bg-purple-700"
                  >
                    View Again
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}