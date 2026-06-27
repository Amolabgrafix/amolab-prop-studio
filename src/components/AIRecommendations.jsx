import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function formatPrice(price) {
  return `₦${Number(price || 0).toLocaleString()}`;
}

function getLocation(property) {
  return property?.location || property?.city || property?.state || "No location";
}

function propertyLocationText(property) {
  return `${property?.location || ""} ${property?.city || ""} ${property?.state || ""}`.toLowerCase();
}

function getScore(property, signals) {
  let score = 0;

  const type = normalize(property.type || property.property_type);
  const locationText = propertyLocationText(property);
  const price = Number(property.price || 0);

  if (signals.types.includes(type)) score += 35;

  if (
    signals.locations.some(
      (location) => location && locationText.includes(location)
    )
  ) {
    score += 35;
  }

  if (signals.budget > 0 && price > 0 && price <= signals.budget) {
    score += 25;
  }

  if (property.is_featured) score += 18;
  if (property.is_boosted) score += 15;

  score += Math.min(Number(property.views || 0) / 10, 20);

  return Math.round(score);
}

function getReason(property, signals) {
  const type = normalize(property.type || property.property_type);
  const locationText = propertyLocationText(property);
  const price = Number(property.price || 0);

  if (
    signals.locations.some(
      (location) => location && locationText.includes(location)
    )
  ) {
    return "Because of locations you viewed";
  }

  if (signals.types.includes(type)) {
    return "Because you like this property type";
  }

  if (signals.budget > 0 && price > 0 && price <= signals.budget) {
    return "Within your saved budget";
  }

  if (property.is_featured || property.is_boosted) {
    return "Premium listing you may like";
  }

  return "Popular on Amolab Prop Studio";
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
      <div className="h-56 animate-pulse bg-slate-200 dark:bg-white/10" />
      <div className="space-y-4 p-6">
        <div className="h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-6 w-4/5 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
      </div>
    </div>
  );
}

function RecommendedCard({ property }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -10, scale: 1.015 }}
      className="group overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-xl shadow-slate-200/70 backdrop-blur-xl transition dark:border-white/10 dark:bg-slate-900/80"
    >
      <div className="relative h-60 overflow-hidden bg-slate-200 dark:bg-slate-800">
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

        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-purple-700 backdrop-blur">
          🧠 {property.ai_score || 0}% Match
        </span>

        {property.is_featured && (
          <span className="absolute right-4 top-4 rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-slate-950">
            ⭐ Featured
          </span>
        )}

        {property.is_boosted && (
          <span className="absolute bottom-4 left-4 rounded-full bg-purple-700 px-3 py-1 text-xs font-black text-white">
            🚀 Boosted
          </span>
        )}
      </div>

      <div className="p-6">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
          {property.type || property.property_type || "Property"}
        </p>

        <h3 className="mt-3 line-clamp-1 text-xl font-black text-slate-950 dark:text-white">
          {property.title}
        </h3>

        <p className="mt-2 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">
          📍 {getLocation(property)}
        </p>

        <div className="mt-4 rounded-2xl bg-purple-50 p-3 dark:bg-purple-500/10">
          <p className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
            Why this match
          </p>
          <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-300">
            {property.ai_reason}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-2xl font-black text-purple-700 dark:text-purple-300">
            {formatPrice(property.price)}
          </p>

          <Link
            to={`/properties/${property.id}`}
            className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
          >
            View
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function AIRecommendations() {
  const [loading, setLoading] = useState(true);
  const [recommended, setRecommended] = useState([]);
  const [signals, setSignals] = useState({
    types: [],
    locations: [],
    budget: 0,
    personalized: false,
  });

  useEffect(() => {
    async function loadRecommendations() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      let types = [];
      let locations = [];
      let budget = 0;
      let excludedIds = [];

      if (user) {
        const [favoritesResult, viewedResult, savedSearchesResult] =
          await Promise.all([
            supabase
              .from("favorites")
              .select("property_id, properties(id, type, property_type, location, city, state, price)")
              .eq("user_id", user.id)
              .limit(20),

            supabase
              .from("recently_viewed")
              .select("property_id, properties(id, type, property_type, location, city, state, price)")
              .eq("user_id", user.id)
              .order("viewed_at", { ascending: false })
              .limit(20),

            supabase
              .from("saved_searches")
              .select("location, type, budget")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(10),
          ]);

        const favorites = favoritesResult.data || [];
        const viewed = viewedResult.data || [];
        const savedSearches = savedSearchesResult.data || [];

        const behaviorProperties = [...favorites, ...viewed]
          .map((item) => item.properties)
          .filter(Boolean);

        excludedIds = [
          ...new Set(
            [...favorites, ...viewed]
              .map((item) => item.property_id || item.properties?.id)
              .filter(Boolean)
          ),
        ];

        types = [
          ...new Set(
            [
              ...behaviorProperties.map((item) =>
                normalize(item.type || item.property_type)
              ),
              ...savedSearches.map((item) => normalize(item.type)),
            ].filter(Boolean)
          ),
        ];

        locations = [
          ...new Set(
            [
              ...behaviorProperties.flatMap((item) => [
                normalize(item.location),
                normalize(item.city),
                normalize(item.state),
              ]),
              ...savedSearches.map((item) => normalize(item.location)),
            ].filter(Boolean)
          ),
        ];

        const budgets = savedSearches
          .map((item) => Number(item.budget || 0))
          .filter((item) => item > 0);

        budget = budgets.length ? Math.max(...budgets) : 0;
      }

      const smartSignals = {
        types,
        locations,
        budget,
        personalized: types.length > 0 || locations.length > 0 || budget > 0,
      };

      setSignals(smartSignals);

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "approved")
        .order("is_featured", { ascending: false })
        .order("is_boosted", { ascending: false })
        .order("views", { ascending: false })
        .limit(40);

      if (!error) {
        const ranked = (data || [])
          .filter((property) => !excludedIds.includes(property.id))
          .map((property) => {
            const score = getScore(property, smartSignals);

            return {
              ...property,
              ai_score: Math.min(score, 99),
              ai_reason: getReason(property, smartSignals),
            };
          })
          .sort((a, b) => b.ai_score - a.ai_score)
          .slice(0, 6);

        setRecommended(ranked);
      }

      setLoading(false);
    }

    loadRecommendations();
  }, []);

  const title = useMemo(() => {
    if (signals.personalized) return "Because You Viewed Similar Homes";
    return "Smart Property Picks";
  }, [signals.personalized]);

  return (
    <section className="bg-slate-50 py-24 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end"
        >
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-purple-600 dark:text-purple-300">
              AI Recommendations
            </p>
            <h2 className="mt-3 text-4xl font-black text-slate-950 dark:text-white md:text-5xl">
              {title}
            </h2>
            <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
              Ranked from your favorites, saved searches, recently viewed
              properties, preferred locations, budget and trending listings.
            </p>
          </div>

          <Link
            to="/properties"
            className="rounded-2xl bg-slate-950 px-6 py-4 font-black text-white transition hover:-translate-y-1 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
          >
            Explore More
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : recommended.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
            <p className="font-bold text-slate-600 dark:text-slate-400">
              No recommendations yet. Browse, save, or favorite properties to
              improve your suggestions.
            </p>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
            {recommended.map((property) => (
              <RecommendedCard key={property.id} property={property} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}