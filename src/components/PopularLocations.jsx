import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

const locationImages = {
  lagos:
    "https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?auto=format&fit=crop&w=1200&q=80",
  lekki:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  ikeja:
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
  abuja:
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  ibadan:
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
  "port harcourt":
    "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1200&q=80",
};

const fallbackLocations = ["Lagos", "Lekki", "Ikeja", "Abuja", "Ibadan", "Port Harcourt"];

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function getLocationName(property) {
  return property.city || property.state || property.location || "Nigeria";
}

function getImage(name) {
  return (
    locationImages[normalize(name)] ||
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
  );
}

export default function PopularLocations() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    async function loadLocations() {
      setLoading(true);

      const { data, error } = await supabase
        .from("properties")
        .select("id, city, state, location")
        .eq("status", "approved")
        .limit(500);

      if (!error) setProperties(data || []);
      setLoading(false);
    }

    loadLocations();
  }, []);

  const locations = useMemo(() => {
    const map = new Map();

    properties.forEach((property) => {
      const name = getLocationName(property);
      const key = normalize(name);

      if (!key) return;

      map.set(key, {
        name,
        count: (map.get(key)?.count || 0) + 1,
      });
    });

    const realLocations = Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    if (realLocations.length > 0) return realLocations;

    return fallbackLocations.map((name) => ({
      name,
      count: 0,
    }));
  }, [properties]);

  return (
    <section className="bg-white py-24 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-purple-600 dark:text-purple-300">
              Popular Locations
            </p>

            <h2 className="mt-3 text-4xl font-black text-slate-950 dark:text-white md:text-5xl">
              Explore Homes By Location
            </h2>

            <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
              Discover approved properties across high-demand cities and
              neighborhoods.
            </p>
          </div>

          <Link
            to="/properties"
            className="rounded-2xl bg-slate-950 px-6 py-4 font-black text-white transition hover:-translate-y-1 hover:bg-purple-700 dark:bg-purple-700"
          >
            Browse All Locations
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-[2rem] bg-slate-200 dark:bg-white/10"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {locations.map((location, index) => (
              <motion.div
                key={location.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -8, scale: 1.01 }}
              >
                <Link
                  to={`/properties?location=${encodeURIComponent(location.name)}`}
                  className="group relative block h-72 overflow-hidden rounded-[2rem] shadow-2xl"
                >
                  <img
                    src={getImage(location.name)}
                    alt={location.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-purple-200">
                      Explore
                    </p>

                    <h3 className="mt-2 text-3xl font-black">
                      {location.name}
                    </h3>

                    <p className="mt-2 text-sm font-bold text-white/80">
                      {location.count > 0
                        ? `${location.count.toLocaleString()} approved properties`
                        : "Explore available listings"}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}