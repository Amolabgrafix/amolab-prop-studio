import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { supabase } from "../lib/supabase";


import AIRecommendations from "../components/AIRecommendations";

import ContinueBrowsing from "../components/ContinueBrowsing";

import TrendingNearYou from "../components/TrendingNearYou";

import NewestListings from "../components/NewestListings";

import LuxuryCollection from "../components/LuxuryCollection";

import AgentSpotlight from "../components/AgentSpotlight";

import PopularLocations from "../components/PopularLocations";

import AffordablePicks from "../components/AffordablePicks";

import PropertyTypeExplorer from "../components/PropertyTypeExplorer";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const heroSlides = [
  {
    title: "Find Your Next Perfect Property",
    text: "Buy, rent, sell and discover verified homes with a smarter real estate experience.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80",
  },
  {
    title: "Premium Homes. Trusted Sellers.",
    text: "Explore boosted, featured and trending properties across trusted locations.",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=80",
  },
  {
    title: "List Faster. Sell Smarter.",
    text: "Give your property maximum visibility with modern tools built for sellers and agents.",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1800&q=80",
  },
];

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-xl">
      <div className="h-56 animate-pulse bg-slate-200" />
      <div className="space-y-4 p-6">
        <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
        <div className="h-6 w-4/5 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

function PropertyCard({ property, badge }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -10, scale: 1.015 }}
      className="group overflow-hidden rounded-3xl border border-white/70 bg-white shadow-xl shadow-slate-200/70 transition"
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
          {badge && (
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-purple-700 backdrop-blur">
              {badge}
            </span>
          )}

          {property.is_featured && (
            <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-slate-900">
              ⭐ Featured
            </span>
          )}
        </div>

        <p className="absolute bottom-4 left-4 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          👁 {property.views || 0} views
        </p>
      </div>

      <div className="p-6">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-600">
          {property.type || property.property_type || "Property"}
        </p>

        <h3 className="mt-3 line-clamp-1 text-xl font-black text-slate-950">
          {property.title}
        </h3>

        <p className="mt-2 line-clamp-1 text-sm text-slate-500">
          📍 {property.location || property.city || property.state || "No location"}
        </p>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-2xl font-black text-purple-700">
            ₦{Number(property.price || 0).toLocaleString()}
          </p>

          <Link
            to={`/properties/${property.id}`}
            className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
          >
            View
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function PropertySection({ title, subtitle, badge, properties, loading, dark }) {
  return (
    <section className={dark ? "bg-slate-950 py-24 text-white" : "bg-white py-24"}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end"
        >
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-purple-500">
              Amolab Listings
            </p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">{title}</h2>
            <p className={dark ? "mt-4 max-w-2xl text-slate-300" : "mt-4 max-w-2xl text-slate-600"}>
              {subtitle}
            </p>
          </div>

          <Link
            to="/properties"
            className={dark ? "rounded-2xl bg-white px-6 py-4 font-bold text-slate-950" : "rounded-2xl bg-slate-950 px-6 py-4 font-bold text-white"}
          >
            View All
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : properties.length === 0 ? (
          <div className={dark ? "rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-300" : "rounded-3xl bg-slate-50 p-10 text-center text-slate-600"}>
            No properties available yet.
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} badge={badge} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const [activeSlide, setActiveSlide] = useState(0);
  const [boostedProperties, setBoostedProperties] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [trendingProperties, setTrendingProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState({
    location: "",
    type: "",
    budget: "",
  });

  const [stats, setStats] = useState({
    properties: 0,
    sellers: 0,
    enquiries: 0,
    featured: 0,
  });

  const currentHero = heroSlides[activeSlide];

  const statItems = useMemo(
    () => [
      { label: "Approved Properties", value: stats.properties, icon: "🏠" },
      { label: "Trusted Sellers", value: stats.sellers, icon: "🤝" },
      { label: "Buyer Enquiries", value: stats.enquiries, icon: "💬" },
      { label: "Featured Listings", value: stats.featured, icon: "⭐" },
    ],
    [stats]
  );

  async function loadBoostedProperties() {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("status", "approved")
      .eq("is_boosted", true)
      .order("created_at", { ascending: false })
      .limit(3);

    if (!error) setBoostedProperties(data || []);
  }

  async function loadFeaturedProperties() {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("status", "approved")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(3);

    if (!error) setFeaturedProperties(data || []);
  }

  async function loadTrendingProperties() {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("status", "approved")
      .gt("views", 0)
      .order("views", { ascending: false })
      .limit(3);

    if (!error) setTrendingProperties(data || []);
  }

  async function loadStats() {
    const [propertiesResult, sellersResult, enquiriesResult, featuredResult] =
      await Promise.all([
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("status", "approved"),

        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "seller"),

        supabase.from("enquiries").select("id", { count: "exact", head: true }),

        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("status", "approved")
          .eq("is_featured", true),
      ]);

    setStats({
      properties: propertiesResult.count || 0,
      sellers: sellersResult.count || 0,
      enquiries: enquiriesResult.count || 0,
      featured: featuredResult.count || 0,
    });
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchHomeData() {
      setLoading(true);

      await Promise.all([
        loadBoostedProperties(),
        loadFeaturedProperties(),
        loadTrendingProperties(),
        loadStats(),
      ]);

      setLoading(false);
    }

    fetchHomeData();
  }, []);

  function handleSearch(e) {
    e.preventDefault();

    const params = new URLSearchParams();

    if (search.location.trim()) params.set("location", search.location.trim());
    if (search.type.trim()) params.set("type", search.type.trim());
    if (search.budget.trim()) params.set("budget", search.budget.trim());

    navigate(`/properties${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen overflow-hidden bg-white">
        <section className="relative min-h-[92vh] overflow-hidden bg-slate-950 text-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <img
                src={currentHero.image}
                alt={currentHero.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-purple-950/30" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.35),transparent_35%)]" />
            </motion.div>
          </AnimatePresence>

          <motion.div
            animate={{ y: [0, -18, 0], rotate: [0, 4, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-10 top-28 h-40 w-40 rounded-full bg-purple-500/25 blur-3xl"
          />

          <motion.div
            animate={{ y: [0, 20, 0], x: [0, 18, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 left-10 h-52 w-52 rounded-full bg-blue-500/20 blur-3xl"
          />

          <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl items-center px-6 py-24">
            <div className="grid w-full items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="max-w-3xl"
              >
                <motion.p
                  variants={fadeUp}
                  className="inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-bold uppercase tracking-[0.25em] text-purple-100 backdrop-blur"
                >
                  Premium Real Estate Platform
                </motion.p>

                <motion.h1
                  variants={fadeUp}
                  className="mt-6 text-5xl font-black leading-tight md:text-7xl"
                >
                  {currentHero.title}
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 md:text-xl"
                >
                  {currentHero.text}
                </motion.p>

                <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
                  <Link
                    to="/properties"
                    className="rounded-2xl bg-white px-7 py-4 font-black text-purple-700 shadow-2xl shadow-purple-950/30 transition hover:-translate-y-1 hover:bg-purple-50"
                  >
                    Browse Properties
                  </Link>

                  <Link
                    to="/dashboard/seller/add-property"
                    className="rounded-2xl border border-white/30 bg-white/10 px-7 py-4 font-black text-white backdrop-blur transition hover:-translate-y-1 hover:bg-white/20"
                  >
                    List Property
                  </Link>
                </motion.div>

                <motion.div variants={fadeUp} className="mt-10 flex gap-3">
                  {heroSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveSlide(index)}
                      className={`h-3 rounded-full transition-all ${
                        activeSlide === index ? "w-10 bg-white" : "w-3 bg-white/40"
                      }`}
                      aria-label={`Go to hero slide ${index + 1}`}
                    />
                  ))}
                </motion.div>
              </motion.div>

              <motion.form
                onSubmit={handleSearch}
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.25 }}
                className="rounded-[2rem] border border-white/20 bg-white/15 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-7"
              >
                <div className="rounded-[1.5rem] bg-white p-6 text-slate-950 shadow-2xl">
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-purple-600">
                    Smart Search
                  </p>

                  <h2 className="mt-2 text-3xl font-black">
                    Search properties faster
                  </h2>

                  <div className="mt-6 grid gap-4">
                    <input
                      value={search.location}
                      onChange={(e) =>
                        setSearch({ ...search, location: e.target.value })
                      }
                      placeholder="Location, city or state"
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-semibold outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                    />

                    <select
                      value={search.type}
                      onChange={(e) => setSearch({ ...search, type: e.target.value })}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-semibold outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                    >
                      <option value="">Property Type</option>
                      <option value="rent">Rent</option>
                      <option value="sale">Sale</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="land">Land</option>
                    </select>

                    <input
                      value={search.budget}
                      onChange={(e) => setSearch({ ...search, budget: e.target.value })}
                      placeholder="Budget e.g. 5000000"
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-semibold outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                    />

                    <button className="rounded-2xl bg-purple-700 px-6 py-4 font-black text-white shadow-xl shadow-purple-200 transition hover:-translate-y-1 hover:bg-purple-800">
                      Search Properties
                    </button>
                  </div>
                </div>
              </motion.form>
            </div>
          </div>
        </section>

        <section className="-mt-14 relative z-20 px-6">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="mx-auto grid max-w-7xl gap-5 rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-2xl shadow-slate-300/60 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4"
          >
            {statItems.map((item) => (
              <motion.div
                key={item.label}
                variants={fadeUp}
                className="rounded-3xl bg-slate-50 p-6 text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
                  {item.icon}
                </div>
                <p className="mt-4 text-4xl font-black text-slate-950">
                  {loading ? "..." : `${item.value.toLocaleString()}+`}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {item.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <AIRecommendations />

        <ContinueBrowsing />
        
        <TrendingNearYou />

        <NewestListings />

        <LuxuryCollection />

        <AgentSpotlight />

        <PopularLocations />

        <AffordablePicks />

        <PropertyTypeExplorer />

        <PropertySection
          title="Boosted Properties"
          subtitle="Premium promoted listings getting stronger visibility and faster buyer attention."
          badge="🚀 Boosted"
          properties={boostedProperties}
          loading={loading}
          dark
        />

        <PropertySection
          title="Trending Properties"
          subtitle="Most viewed approved properties currently attracting attention on Amolab Prop Studio."
          badge="🔥 Trending"
          properties={trendingProperties}
          loading={loading}
        />

        <PropertySection
          title="Featured Properties"
          subtitle="Handpicked approved listings with premium positioning for serious buyers and tenants."
          badge="⭐ Featured"
          properties={featuredProperties}
          loading={loading}
        />

        <section className="bg-slate-50 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="mx-auto mb-14 max-w-3xl text-center"
            >
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-purple-600">
                Why Choose Us
              </p>
              <h2 className="mt-3 text-4xl font-black text-slate-950 md:text-5xl">
                Built for trust, speed and property visibility
              </h2>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid gap-6 md:grid-cols-3"
            >
              {[
                {
                  icon: "✅",
                  title: "Approved Listings",
                  text: "Properties are organized around approval, visibility and seller confidence.",
                },
                {
                  icon: "🚀",
                  title: "Boost & Feature Tools",
                  text: "Sellers can push listings higher with premium visibility tools.",
                },
                {
                  icon: "📊",
                  title: "Smart Discovery",
                  text: "Buyers can explore trending, boosted and featured listings faster.",
                },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  whileHover={{ y: -8 }}
                  className="rounded-[2rem] border border-white bg-white p-8 shadow-xl shadow-slate-200/70"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-3xl">
                    {item.icon}
                  </div>
                  <h3 className="mt-6 text-2xl font-black text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-3 leading-7 text-slate-600">{item.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="mb-14 text-center"
            >
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-purple-600">
                Testimonials
              </p>
              <h2 className="mt-3 text-4xl font-black text-slate-950 md:text-5xl">
                People trust Amolab Prop Studio
              </h2>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid gap-6 md:grid-cols-3"
            >
              {[
                {
                  name: "Property Buyer",
                  text: "The homepage made it easy to discover available homes and compare options quickly.",
                },
                {
                  name: "Verified Seller",
                  text: "Boosted listings gave my property more attention and made the process feel premium.",
                },
                {
                  name: "Real Estate Agent",
                  text: "The platform feels clean, modern and built for serious real estate presentation.",
                },
              ].map((item) => (
                <motion.div
                  key={item.name}
                  variants={fadeUp}
                  className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-300/70"
                >
                  <p className="text-3xl">“</p>
                  <p className="mt-2 leading-8 text-slate-200">{item.text}</p>
                  <p className="mt-6 font-black text-purple-300">{item.name}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-purple-700 py-24 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_35%)]" />
          <div className="relative mx-auto max-w-5xl px-6 text-center">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-black md:text-6xl">
                Ready to find or list your next property?
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-purple-100">
                Join buyers, sellers, agents and tenants using Amolab Prop Studio
                to move faster in real estate.
              </p>

              <div className="mt-9 flex flex-wrap justify-center gap-4">
                <Link
                  to="/register"
                  className="rounded-2xl bg-white px-8 py-4 font-black text-purple-700 shadow-2xl transition hover:-translate-y-1"
                >
                  Get Started Today
                </Link>

                <Link
                  to="/properties"
                  className="rounded-2xl border border-white/40 bg-white/10 px-8 py-4 font-black text-white backdrop-blur transition hover:-translate-y-1 hover:bg-white/20"
                >
                  Explore Properties
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}