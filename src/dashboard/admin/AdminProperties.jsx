import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

function formatPrice(price) {
  return `₦${Number(price || 0).toLocaleString()}`;
}

function getLocation(property) {
  return (
    property.city ||
    property.location ||
    property.address ||
    property.state ||
    "N/A"
  );
}

function getType(property) {
  return property.property_type || property.type || "N/A";
}

function getStatusClass(status) {
  const clean = String(status || "pending").toLowerCase();

  if (clean === "approved") return "bg-green-100 text-green-700";
  if (clean === "rejected") return "bg-red-100 text-red-700";
  if (clean === "sold") return "bg-blue-100 text-blue-700";
  if (clean === "rented") return "bg-purple-100 text-purple-700";
  if (clean === "pending") return "bg-yellow-100 text-yellow-700";

  return "bg-slate-100 text-slate-700";
}

function SkeletonRow() {
  return (
    <tr className="border-t">
      {Array.from({ length: 8 }).map((_, index) => (
        <td key={index} className="p-4">
          <div className="h-5 animate-pulse rounded bg-slate-200" />
        </td>
      ))}
    </tr>
  );
}

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");

  const loadProperties = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      toast.error(error.message);
    } else {
      setProperties(data || []);
    }

    setLoading(false);
  }, []);

  async function updateStatus(id, status) {
    setUpdatingId(id);
    setMessage("");

    const { data, error } = await supabase
      .from("properties")
      .update({ status })
      .eq("id", id)
      .select("id, title, status");

    console.log("UPDATE RESULT:", data);
    console.log("UPDATE ERROR:", error);

    if (error) {
      setMessage(error.message);
      toast.error(error.message);
    } else if (!data || data.length === 0) {
      const warning = "No property was updated. This may be an RLS permission issue.";
      setMessage(warning);
      toast.error(warning);
    } else {
      const success = `Property marked as ${data[0].status}.`;
      setMessage(success);
      toast.success(success);
      await loadProperties();
    }

    setUpdatingId(null);
  }

  async function toggleFeatured(id, currentValue) {
    setUpdatingId(id);
    setMessage("");

    const { data, error } = await supabase
      .from("properties")
      .update({ is_featured: !currentValue })
      .eq("id", id)
      .select("id, title, is_featured");

    if (error) {
      setMessage(error.message);
      toast.error(error.message);
    } else if (!data || data.length === 0) {
      const warning = "No property was updated. This may be an RLS permission issue.";
      setMessage(warning);
      toast.error(warning);
    } else {
      const success = data[0].is_featured
        ? "Property featured."
        : "Property unfeatured.";

      setMessage(success);
      toast.success(success);
      await loadProperties();
    }

    setUpdatingId(null);
  }

  useEffect(() => {
    let isMounted = true;

    const initializeProperties = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        setMessage(error.message);
        toast.error(error.message);
      } else {
        setProperties(data || []);
      }

      setLoading(false);
    };

    initializeProperties();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    return {
      total: properties.length,
      approved: properties.filter((item) => item.status === "approved").length,
      pending: properties.filter((item) => item.status === "pending").length,
      rejected: properties.filter((item) => item.status === "rejected").length,
      featured: properties.filter((item) => item.is_featured).length,
      boosted: properties.filter((item) => item.is_boosted).length,
    };
  }, [properties]);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        String(property.title || "").toLowerCase().includes(term) ||
        String(property.city || "").toLowerCase().includes(term) ||
        String(property.location || "").toLowerCase().includes(term) ||
        String(property.state || "").toLowerCase().includes(term) ||
        String(property.type || "").toLowerCase().includes(term) ||
        String(property.property_type || "").toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" || String(property.status || "pending") === statusFilter;

      const matchesFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "featured" && property.is_featured) ||
        (featuredFilter === "normal" && !property.is_featured);

      return matchesSearch && matchesStatus && matchesFeatured;
    });
  }, [properties, searchTerm, statusFilter, featuredFilter]);

  return (
    <div className="min-h-screen">
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="relative overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-slate-950 via-purple-900 to-indigo-900 p-8 text-white shadow-2xl"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-8 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative z-10">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-purple-200">
            Admin Property Control
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
            Property Management
          </h1>

          <p className="mt-3 max-w-2xl text-purple-100">
            Review, approve, reject, mark sold/rented, and feature submitted property listings.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-2xl bg-white/10 px-5 py-3 font-bold backdrop-blur">
              🏘 {loading ? "..." : stats.total} Total
            </span>

            <span className="rounded-2xl bg-white/10 px-5 py-3 font-bold backdrop-blur">
              ✅ {loading ? "..." : stats.approved} Approved
            </span>

            <span className="rounded-2xl bg-white/10 px-5 py-3 font-bold backdrop-blur">
              ⏳ {loading ? "..." : stats.pending} Pending
            </span>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-6"
      >
        {[
          { label: "Total", value: stats.total, icon: "🏘" },
          { label: "Approved", value: stats.approved, icon: "✅" },
          { label: "Pending", value: stats.pending, icon: "⏳" },
          { label: "Rejected", value: stats.rejected, icon: "❌" },
          { label: "Featured", value: stats.featured, icon: "⭐" },
          { label: "Boosted", value: stats.boosted, icon: "🚀" },
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
              {loading ? "..." : item.value}
            </p>

            <p className="mt-1 text-sm font-bold text-slate-500">
              {item.label}
            </p>
          </motion.div>
        ))}
      </motion.section>

      {message && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-8 rounded-2xl bg-purple-100 p-5 font-semibold text-purple-700 shadow"
        >
          {message}
        </motion.div>
      )}

      <section className="mt-8 rounded-[2rem] bg-white p-5 shadow-xl">
        <div className="grid gap-4 md:grid-cols-3">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search title, city, location or type..."
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-semibold outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-semibold outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
          </select>

          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-semibold outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
          >
            <option value="all">All Listings</option>
            <option value="featured">Featured Only</option>
            <option value="normal">Normal Only</option>
          </select>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-[2rem] bg-white shadow-xl">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-2xl font-black text-slate-900">
            Submitted Properties
          </h2>

          <p className="mt-1 text-slate-600">
            Showing {loading ? "..." : filteredProperties.length} property listing(s).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-sm font-black uppercase tracking-wider text-slate-500">
                  Property
                </th>
                <th className="p-4 text-sm font-black uppercase tracking-wider text-slate-500">
                  Type
                </th>
                <th className="p-4 text-sm font-black uppercase tracking-wider text-slate-500">
                  Listing
                </th>
                <th className="p-4 text-sm font-black uppercase tracking-wider text-slate-500">
                  Price
                </th>
                <th className="p-4 text-sm font-black uppercase tracking-wider text-slate-500">
                  Location
                </th>
                <th className="p-4 text-sm font-black uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="p-4 text-sm font-black uppercase tracking-wider text-slate-500">
                  Featured
                </th>
                <th className="p-4 text-sm font-black uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    No properties found.
                  </td>
                </tr>
              ) : (
                filteredProperties.map((property) => {
                  const isUpdating = updatingId === property.id;

                  return (
                    <tr key={property.id} className="border-t transition hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          {property.image_url ? (
                            <img
                              src={property.image_url}
                              alt={property.title || "Property"}
                              className="h-16 w-20 rounded-2xl object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-20 items-center justify-center rounded-2xl bg-slate-200 text-xs text-slate-500">
                              No Image
                            </div>
                          )}

                          <div>
                            <p className="max-w-[220px] font-black text-slate-900 line-clamp-1">
                              {property.title || "Untitled"}
                            </p>

                            <div className="mt-1 flex flex-wrap gap-1">
                              {property.is_boosted && (
                                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">
                                  🚀 Boosted
                                </span>
                              )}

                              {property.views !== undefined && (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                                  👁 {property.views || 0}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 capitalize text-slate-700">
                        {getType(property)}
                      </td>

                      <td className="p-4 capitalize text-slate-700">
                        {property.listing_type || property.type || "N/A"}
                      </td>

                      <td className="p-4 font-black text-purple-700">
                        {formatPrice(property.price)}
                      </td>

                      <td className="p-4 text-slate-700">
                        {getLocation(property)}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black capitalize ${getStatusClass(
                            property.status
                          )}`}
                        >
                          {property.status || "pending"}
                        </span>
                      </td>

                      <td className="p-4">
                        {property.is_featured ? (
                          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-700">
                            ⭐ Featured
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                            Normal
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => updateStatus(property.id, "approved")}
                            className="rounded-xl bg-green-600 px-3 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            {isUpdating ? "Updating..." : "Approve"}
                          </button>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => updateStatus(property.id, "rejected")}
                            className="rounded-xl bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Reject
                          </button>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => updateStatus(property.id, "sold")}
                            className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            Sold
                          </button>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => updateStatus(property.id, "rented")}
                            className="rounded-xl bg-purple-600 px-3 py-2 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-50"
                          >
                            Rented
                          </button>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              toggleFeatured(property.id, property.is_featured)
                            }
                            className={`rounded-xl px-3 py-2 text-sm font-bold text-white disabled:opacity-50 ${
                              property.is_featured
                                ? "bg-slate-700 hover:bg-slate-800"
                                : "bg-yellow-600 hover:bg-yellow-700"
                            }`}
                          >
                            {property.is_featured ? "Unfeature" : "Feature"}
                          </button>

                          <Link
                            to={`/properties/${property.id}`}
                            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white hover:bg-black"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}