import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
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

function formatPrice(price) {
  return `₦${Number(price || 0).toLocaleString()}`;
}

function cleanPhone(number) {
  if (!number) return "";
  return number.replace(/\D/g, "");
}

function getPropertyLocation(property) {
  return property.location || property.city || property.state || "No location";
}

function getPropertyType(property) {
  return property.type || property.property_type || "Property";
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl">
      <div className="h-56 animate-pulse bg-slate-200" />
      <div className="space-y-4 p-5">
        <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

function PropertyCard({ property }) {
  return (
    <motion.div
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
            {getPropertyType(property)}
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
        <h3 className="line-clamp-1 text-xl font-black text-slate-900">
          {property.title}
        </h3>

        <p className="mt-2 line-clamp-1 text-slate-600">
          📍 {getPropertyLocation(property)}
        </p>

        <p className="mt-4 text-2xl font-black text-purple-700">
          {formatPrice(property.price)}
        </p>

        <Link
          to={`/properties/${property.id}`}
          className="mt-5 block rounded-xl bg-purple-700 px-4 py-3 text-center font-bold text-white transition hover:bg-purple-800"
        >
          View Property
        </Link>
      </div>
    </motion.div>
  );
}

export default function AgentProfile() {
  const { id } = useParams();

  const [agent, setAgent] = useState(null);
  const [properties, setProperties] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAgentProfile() {
      setLoading(true);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      console.log("Agent ID from URL:", id);
      console.log("Profile found:", profile);
      console.log("Profile error:", profileError);

      if (profileError) {
        console.error("Agent profile error:", profileError);
        setLoading(false);
        return;
      }

      setAgent(profile || null);

      const { data: propertyData, error: propertyError } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", id)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (propertyError) {
        console.error("Agent properties error:", propertyError);
        setProperties([]);
      } else {
        setProperties(propertyData || []);
      }

      const { data: reviewData, error: reviewError } = await supabase
        .from("seller_reviews")
        .select("*")
        .eq("seller_id", id)
        .order("created_at", { ascending: false });

      if (reviewError) {
        console.error("Agent reviews error:", reviewError);
        setReviews([]);
      } else {
        setReviews(reviewData || []);
      }

      setLoading(false);
    }

    if (id) loadAgentProfile();
  }, [id]);

  const displayName =
    agent?.agency_name || agent?.fullname || agent?.username || "Property Agent";

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;

    const total = reviews.reduce((sum, item) => {
      return sum + Number(item.rating || 0);
    }, 0);

    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const totalViews = useMemo(() => {
    return properties.reduce((sum, item) => {
      return sum + Number(item.views || 0);
    }, 0);
  }, [properties]);

  const featuredCount = useMemo(() => {
    return properties.filter((item) => item.is_featured).length;
  }, [properties]);

  const boostedCount = useMemo(() => {
    return properties.filter((item) => item.is_boosted).length;
  }, [properties]);

  const whatsappNumber = cleanPhone(agent?.whatsapp || agent?.phone);

  const whatsappMessage = encodeURIComponent(
    `Hello ${displayName}, I saw your profile on Amolab Prop Studio and I am interested in your properties.`
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] bg-white p-8 shadow-xl">
            <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 h-4 w-96 max-w-full animate-pulse rounded bg-slate-200" />

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="rounded-[2rem] bg-white p-10 text-center shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl">
            ⚠️
          </div>

          <h1 className="mt-6 text-3xl font-black text-red-600">
            Agent not found
          </h1>

          <p className="mx-auto mt-3 max-w-md text-slate-600">
            This agent profile could not be loaded. The profile may not exist or the link may be incorrect.
          </p>

          <Link
            to="/properties"
            className="mt-6 inline-block rounded-2xl bg-purple-700 px-7 py-4 font-bold text-white hover:bg-purple-800"
          >
            Back To Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-10">
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="relative overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-purple-800 via-slate-950 to-indigo-950 p-8 text-white shadow-2xl md:p-10"
        >
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />
          <div className="absolute -bottom-24 left-8 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-[2rem] border border-white/20 bg-white/15 text-5xl font-black text-white shadow-2xl backdrop-blur">
                {displayName?.[0]?.toUpperCase() || "A"}
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-purple-200">
                  Property Agent
                </p>

                <h1 className="mt-3 text-4xl font-black md:text-6xl">
                  {displayName}
                </h1>

                <p className="mt-3 max-w-2xl text-purple-100">
                  Trusted property agent on Amolab Prop Studio with verified listings, client reviews and direct contact options.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  {agent.verification_status === "approved" && (
                    <span className="rounded-full bg-green-400 px-4 py-2 text-sm font-black text-slate-950">
                      ✅ Verified Agent
                    </span>
                  )}

                  <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-black capitalize text-white backdrop-blur">
                    {agent.subscription_plan || "free"} plan
                  </span>

                  <span className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950">
                    ⭐ {averageRating} / 5
                  </span>

                  <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur">
                    {reviews.length} Review(s)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {agent.phone && (
                <a
                  href={`tel:${agent.phone}`}
                  className="rounded-2xl bg-white px-5 py-4 font-black text-slate-950 shadow-xl transition hover:-translate-y-1 hover:bg-purple-50"
                >
                  📞 Call
                </a>
              )}

              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-green-600 px-5 py-4 font-black text-white shadow-xl transition hover:-translate-y-1 hover:bg-green-700"
                >
                  💬 WhatsApp
                </a>
              )}

              {agent.email && (
                <a
                  href={`mailto:${agent.email}`}
                  className="rounded-2xl bg-purple-700 px-5 py-4 font-black text-white shadow-xl transition hover:-translate-y-1 hover:bg-purple-800"
                >
                  ✉️ Email
                </a>
              )}
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-5"
        >
          {[
            { label: "Properties", value: properties.length, icon: "🏠" },
            { label: "Total Views", value: totalViews, icon: "👁" },
            { label: "Rating", value: `${averageRating}/5`, icon: "⭐" },
            { label: "Featured", value: featuredCount, icon: "🔥" },
            { label: "Boosted", value: boostedCount, icon: "🚀" },
          ].map((item) => (
            <motion.div
              key={item.label}
              variants={fadeUp}
              whileHover={{ y: -5 }}
              className="rounded-[2rem] bg-white p-6 shadow-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
                {item.icon}
              </div>

              <p className="mt-5 text-3xl font-black text-slate-950">
                {item.value}
              </p>

              <p className="mt-1 text-sm font-bold text-slate-500">
                {item.label}
              </p>
            </motion.div>
          ))}
        </motion.section>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="rounded-[2rem] bg-white p-6 shadow-xl md:p-8"
        >
          <div className="mb-6 flex flex-col gap-2">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-purple-600">
              Agent Information
            </p>

            <h2 className="text-3xl font-black text-slate-900">
              Contact Details
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-500">Email</p>
              <p className="mt-2 break-all font-black text-slate-800">
                {agent.email || "Not available"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-500">Phone</p>
              <p className="mt-2 font-black text-slate-800">
                {agent.phone || "Not available"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-500">Joined</p>
              <p className="mt-2 font-black text-slate-800">
                {agent.created_at
                  ? new Date(agent.created_at).toLocaleDateString()
                  : "Not available"}
              </p>
            </div>
          </div>
        </motion.section>

        <section>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end"
          >
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-purple-600">
                Agent Listings
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-900">
                Properties by {displayName}
              </h2>
            </div>

            <Link
              to="/properties"
              className="rounded-2xl bg-slate-900 px-5 py-3 text-center font-bold text-white hover:bg-purple-700"
            >
              Browse All Properties
            </Link>
          </motion.div>

          {properties.length === 0 ? (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="rounded-[2rem] bg-white p-10 text-center shadow-xl"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 text-4xl">
                🏠
              </div>

              <h3 className="mt-6 text-2xl font-black text-slate-900">
                No approved properties yet
              </h3>

              <p className="mt-2 text-slate-600">
                This agent has no approved properties available at the moment.
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            >
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </motion.div>
          )}
        </section>

        <section>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mb-6"
          >
            <p className="text-sm font-black uppercase tracking-[0.25em] text-purple-600">
              Customer Feedback
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Customer Reviews
            </h2>
          </motion.div>

          {reviews.length === 0 ? (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="rounded-[2rem] bg-white p-10 text-center shadow-xl"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 text-4xl">
                ⭐
              </div>

              <h3 className="mt-6 text-2xl font-black text-slate-900">
                No reviews yet
              </h3>

              <p className="mt-2 text-slate-600">
                Customer reviews for this agent will appear here.
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid gap-6 md:grid-cols-2"
            >
              {reviews.map((item) => (
                <motion.div
                  key={item.id}
                  variants={fadeUp}
                  whileHover={{ y: -5 }}
                  className="rounded-[2rem] bg-white p-6 shadow-xl"
                >
                  <p className="text-lg font-black text-yellow-600">
                    {"⭐".repeat(Number(item.rating || 0))}
                  </p>

                  <p className="mt-4 leading-8 text-slate-700">
                    {item.review}
                  </p>

                  <p className="mt-4 text-sm font-semibold text-slate-400">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : ""}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}