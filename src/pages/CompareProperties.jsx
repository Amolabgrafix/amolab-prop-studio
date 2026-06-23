import { useEffect, useMemo, useState } from "react";
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

function formatPrice(price) {
  return `₦${Number(price || 0).toLocaleString()}`;
}

function getLocation(property) {
  return property.location || property.city || property.state || "Not available";
}

function getType(property) {
  return property.type || property.property_type || "Property";
}

function SkeletonColumn() {
  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl">
      <div className="h-48 animate-pulse bg-slate-200" />
      <div className="space-y-4 p-5">
        <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

export default function CompareProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompareProperties() {
      setLoading(true);

      const compareIds = JSON.parse(
        localStorage.getItem("compare_properties") || "[]"
      );

      if (compareIds.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .in("id", compareIds);

      if (error) {
        console.error("Compare error:", error);
        toast.error(error.message);
        setProperties([]);
      } else {
        setProperties(data || []);
      }

      setLoading(false);
    }

    loadCompareProperties();
  }, []);

  function removeProperty(id) {
    const current = JSON.parse(
      localStorage.getItem("compare_properties") || "[]"
    );

    const updated = current.filter((item) => item !== id);
    localStorage.setItem("compare_properties", JSON.stringify(updated));

    setProperties((prev) => prev.filter((property) => property.id !== id));
    toast.success("Property removed from comparison");
  }

  function clearComparison() {
    localStorage.removeItem("compare_properties");
    setProperties([]);
    toast.success("Comparison cleared");
  }

  const cheapestId = useMemo(() => {
    if (!properties.length) return null;

    const validPrices = properties
      .filter((property) => Number(property.price || 0) > 0)
      .map((property) => ({
        id: property.id,
        price: Number(property.price || 0),
      }));

    if (!validPrices.length) return null;

    return validPrices.sort((a, b) => a.price - b.price)[0].id;
  }, [properties]);

  const highestViewsId = useMemo(() => {
    if (!properties.length) return null;

    return [...properties].sort(
      (a, b) => Number(b.views || 0) - Number(a.views || 0)
    )[0]?.id;
  }, [properties]);

  const rows = [
    {
      label: "Price",
      render: (property) => formatPrice(property.price),
      highlight: (property) => property.id === cheapestId,
      highlightText: "Best Price",
    },
    {
      label: "Location",
      render: (property) => getLocation(property),
    },
    {
      label: "Type",
      render: (property) => getType(property),
    },
    {
      label: "Bedrooms",
      render: (property) => property.bedrooms || "Not available",
    },
    {
      label: "Bathrooms",
      render: (property) => property.bathrooms || "Not available",
    },
    {
      label: "Views",
      render: (property) => property.views || 0,
      highlight: (property) => property.id === highestViewsId,
      highlightText: "Most Viewed",
    },
    {
      label: "Status",
      render: (property) => property.status || "Not available",
    },
  ];

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

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-purple-200">
              Property Comparison
            </p>

            <h1 className="mt-3 text-4xl font-black md:text-5xl">
              Compare Properties
            </h1>

            <p className="mt-3 max-w-2xl text-purple-100">
              Compare price, location, type, rooms, views and property quality side by side.
            </p>

            <div className="mt-6 inline-flex rounded-2xl bg-white/10 px-5 py-3 font-bold backdrop-blur">
              ⚖️ {loading ? "..." : properties.length} Selected
            </div>
          </div>

          {properties.length > 0 && (
            <button
              onClick={clearComparison}
              className="rounded-2xl bg-red-600 px-6 py-4 font-black text-white shadow-xl transition hover:-translate-y-1 hover:bg-red-700"
            >
              Clear Comparison
            </button>
          )}
        </div>
      </motion.div>

      {loading ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonColumn />
          <SkeletonColumn />
          <SkeletonColumn />
        </div>
      ) : properties.length === 0 ? (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-8 rounded-[2rem] bg-white p-10 text-center shadow-xl"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 text-4xl">
            ⚖️
          </div>

          <h2 className="mt-6 text-3xl font-black text-slate-900">
            No properties selected
          </h2>

          <p className="mx-auto mt-3 max-w-md text-slate-600">
            Add properties to comparison from the property listing page to see them side by side.
          </p>

          <Link
            to="/properties"
            className="mt-6 inline-block rounded-2xl bg-purple-700 px-7 py-4 font-bold text-white shadow-lg shadow-purple-200 hover:bg-purple-800"
          >
            Browse Properties
          </Link>
        </motion.div>
      ) : (
        <>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {properties.map((property) => (
              <motion.div
                key={property.id}
                variants={fadeUp}
                whileHover={{ y: -8, scale: 1.01 }}
                className="group overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-slate-200/70"
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

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black capitalize text-purple-700 backdrop-blur">
                      {getType(property)}
                    </span>

                    {property.id === cheapestId && (
                      <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-black text-white">
                        Best Price
                      </span>
                    )}

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

                  <button
                    onClick={() => removeProperty(property.id)}
                    className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-600 font-black text-white shadow-lg transition hover:scale-110 hover:bg-red-700"
                  >
                    ×
                  </button>
                </div>

                <div className="p-6">
                  <h2 className="line-clamp-1 text-xl font-black text-slate-900">
                    {property.title}
                  </h2>

                  <p className="mt-2 line-clamp-1 text-slate-600">
                    📍 {getLocation(property)}
                  </p>

                  <p className="mt-4 text-2xl font-black text-purple-700">
                    {formatPrice(property.price)}
                  </p>

                  <Link
                    to={`/properties/${property.id}`}
                    className="mt-5 block rounded-xl bg-slate-900 px-4 py-3 text-center font-bold text-white transition hover:bg-purple-700"
                  >
                    View Property
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-8 overflow-x-auto rounded-[2rem] bg-white shadow-xl">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="min-w-44 p-5 text-sm font-black uppercase tracking-wider text-slate-600">
                    Feature
                  </th>

                  {properties.map((property) => (
                    <th
                      key={property.id}
                      className="min-w-72 border-l p-5 align-top"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="line-clamp-2 text-lg font-black text-slate-900">
                            {property.title}
                          </h2>

                          <p className="mt-1 text-sm text-slate-500">
                            {getLocation(property)}
                          </p>
                        </div>

                        <button
                          onClick={() => removeProperty(property.id)}
                          className="rounded-xl bg-red-100 px-3 py-2 text-xs font-black text-red-700 hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b last:border-b-0">
                    <td className="bg-slate-50 p-5 font-black text-slate-700">
                      {row.label}
                    </td>

                    {properties.map((property) => {
                      const isHighlighted = row.highlight?.(property);

                      return (
                        <td
                          key={`${property.id}-${row.label}`}
                          className={`border-l p-5 font-semibold capitalize ${
                            isHighlighted
                              ? "bg-green-50 text-green-700"
                              : "text-slate-700"
                          }`}
                        >
                          <div className="flex flex-col gap-2">
                            <span>{row.render(property)}</span>

                            {isHighlighted && row.highlightText && (
                              <span className="w-fit rounded-full bg-green-600 px-3 py-1 text-xs font-black text-white">
                                {row.highlightText}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                <tr>
                  <td className="bg-slate-50 p-5 font-black text-slate-700">
                    Action
                  </td>

                  {properties.map((property) => (
                    <td key={property.id} className="border-l p-5">
                      <Link
                        to={`/properties/${property.id}`}
                        className="inline-block rounded-xl bg-purple-700 px-5 py-3 font-bold text-white hover:bg-purple-800"
                      >
                        View Property
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}