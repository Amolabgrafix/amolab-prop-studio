import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

function formatPrice(price) {
  return `₦${Number(price || 0).toLocaleString()}`;
}

function getLocation(property) {
  return property?.location || property?.city || property?.state || "Prime Location";
}

export default function LuxuryCollection() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    async function loadLuxury() {
      setLoading(true);

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "approved")
        .order("price", { ascending: false })
        .limit(6);

      if (!error) {
        setProperties(data || []);
      }

      setLoading(false);
    }

    loadLuxury();
  }, []);

  if (!loading && properties.length === 0) return null;

  return (
    <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-black py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
              Luxury Collection
            </p>

            <h2 className="mt-3 text-4xl font-black text-white md:text-5xl">
              Premium Luxury Properties
            </h2>

            <p className="mt-4 max-w-2xl text-slate-300">
              Discover exclusive homes, luxury apartments, premium estates and
              high-value investment opportunities.
            </p>
          </div>

          <Link
            to="/properties"
            className="rounded-2xl bg-yellow-400 px-6 py-4 font-black text-slate-950 transition hover:-translate-y-1"
          >
            Explore Luxury
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[420px] animate-pulse rounded-3xl bg-white/10"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                whileHover={{
                  y: -10,
                  scale: 1.015,
                }}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl"
              >
                <div className="relative h-72 overflow-hidden">
                  {property.image_url ? (
                    <img
                      src={property.image_url}
                      alt={property.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-slate-800 text-white">
                      No Image
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  <div className="absolute left-4 top-4 flex gap-2">
                    <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-slate-950">
                      👑 Luxury
                    </span>

                    {property.is_featured && (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-950">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-400">
                    {property.type || "Property"}
                  </p>

                  <h3 className="mt-3 line-clamp-1 text-2xl font-black text-white">
                    {property.title}
                  </h3>

                  <p className="mt-2 text-slate-400">
                    📍 {getLocation(property)}
                  </p>

                  <p className="mt-5 text-3xl font-black text-yellow-400">
                    {formatPrice(property.price)}
                  </p>

                  <Link
                    to={`/properties/${property.id}`}
                    className="mt-6 block rounded-2xl bg-yellow-400 px-5 py-3 text-center font-black text-slate-950 transition hover:bg-yellow-300"
                  >
                    View Luxury Property
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