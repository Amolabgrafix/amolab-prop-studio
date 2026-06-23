import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
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

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchFavorites() {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        if (isMounted) setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select(`
          id,
          property_id,
          created_at,
          properties!favorites_property_id_fkey (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        console.log("Favorites error:", error.message);
        setFavorites([]);
        toast.error(error.message);
      } else {
        setFavorites(data || []);
      }

      if (isMounted) setLoading(false);
    }

    fetchFavorites();

    return () => {
      isMounted = false;
    };
  }, []);

  async function removeFavorite(favoriteId) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", favoriteId);

    if (error) {
      toast.error(error.message);
      return;
    }

    setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
    toast.success("Removed from favorites");
  }

  const visibleFavorites = favorites.filter((fav) => {
    const property = Array.isArray(fav.properties)
      ? fav.properties[0]
      : fav.properties;

    return property;
  });

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
            Saved Properties
          </p>

          <h1 className="mt-3 text-4xl font-black md:text-5xl">
            My Favorites
          </h1>

          <p className="mt-3 max-w-2xl text-purple-100">
            Keep your best property picks in one place and return to them anytime.
          </p>

          <div className="mt-6 inline-flex rounded-2xl bg-white/10 px-5 py-3 font-bold backdrop-blur">
            ❤️ {loading ? "..." : visibleFavorites.length} Saved Properties
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : visibleFavorites.length === 0 ? (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-8 rounded-[2rem] bg-white p-10 text-center shadow-xl"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 text-4xl">
            ♡
          </div>

          <h2 className="mt-6 text-3xl font-black text-slate-900">
            No saved properties yet
          </h2>

          <p className="mx-auto mt-3 max-w-md text-slate-600">
            Browse available properties and tap favorite to save the ones you love.
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
          {visibleFavorites.map((fav) => {
            const property = Array.isArray(fav.properties)
              ? fav.properties[0]
              : fav.properties;

            return (
              <motion.div
                key={fav.id}
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
                      No Image
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

                  <button
                    onClick={() => removeFavorite(fav.id)}
                    className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-600 font-black text-white shadow-lg transition hover:scale-110 hover:bg-red-700"
                    title="Remove favorite"
                  >
                    ×
                  </button>
                </div>

                <div className="p-6">
                  <h2 className="line-clamp-1 text-xl font-black text-slate-900">
                    {property.title}
                  </h2>

                  <p className="mt-2 line-clamp-1 text-slate-600">
                    📍{" "}
                    {property.location ||
                      property.city ||
                      property.state ||
                      "No location"}
                  </p>

                  <p className="mt-4 text-2xl font-black text-purple-700">
                    ₦{Number(property.price || 0).toLocaleString()}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    Saved {new Date(fav.created_at).toLocaleDateString()}
                  </p>

                  <div className="mt-5 flex gap-3">
                    <Link
                      to={`/properties/${property.id}`}
                      className="flex-1 rounded-xl bg-purple-700 py-3 text-center font-bold text-white transition hover:bg-purple-800"
                    >
                      View
                    </Link>

                    <button
                      onClick={() => removeFavorite(fav.id)}
                      className="flex-1 rounded-xl bg-slate-900 py-3 font-bold text-white transition hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}