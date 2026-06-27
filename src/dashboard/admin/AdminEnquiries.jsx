import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

const SORT_OPTIONS = ["newest", "oldest"];

function formatDate(value) {
  if (!value) return "No date";
  return new Date(value).toLocaleString();
}

function getInitials(name) {
  return String(name || "A")
    .trim()
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  async function loadEnquiries() {
    setRefreshing(true);

    try {
      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error(error.message);
        setEnquiries([]);
        return;
      }

      const propertyIds = [
        ...new Set((data || []).map((item) => item.property_id).filter(Boolean)),
      ];

      let properties = [];

      if (propertyIds.length > 0) {
        const { data: propertyData, error: propertyError } = await supabase
          .from("properties")
          .select("id, title, location, city, state, price, type")
          .in("id", propertyIds);

        if (propertyError) {
          toast.error(propertyError.message);
        } else {
          properties = propertyData || [];
        }
      }

      const merged = (data || []).map((enquiry) => {
        const property = properties.find(
          (item) => item.id === enquiry.property_id
        );

        return {
          ...enquiry,
          property_title: property?.title || "Unknown Property",
          property_location:
            property?.location ||
            [property?.city, property?.state].filter(Boolean).join(", ") ||
            "Location unavailable",
          property_price: property?.price || null,
          property_type: property?.type || "Property",
        };
      });

      setEnquiries(merged);
    } catch (err) {
      toast.error(err.message || String(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function init() {
      setRefreshing(true);

      try {
        const { data, error } = await supabase
          .from("enquiries")
          .select("*")
          .order("created_at", { ascending: false });

        if (!isMounted) return;

        if (error) {
          toast.error(error.message);
          setEnquiries([]);
          return;
        }

        const propertyIds = [
          ...new Set((data || []).map((item) => item.property_id).filter(Boolean)),
        ];

        let properties = [];

        if (propertyIds.length > 0) {
          const { data: propertyData, error: propertyError } = await supabase
            .from("properties")
            .select("id, title, location, city, state, price, type")
            .in("id", propertyIds);

          if (propertyError) {
            toast.error(propertyError.message);
          } else {
            properties = propertyData || [];
          }
        }

        if (!isMounted) return;

        const merged = (data || []).map((enquiry) => {
          const property = properties.find(
            (item) => item.id === enquiry.property_id
          );

          return {
            ...enquiry,
            property_title: property?.title || "Unknown Property",
            property_location:
              property?.location ||
              [property?.city, property?.state].filter(Boolean).join(", ") ||
              "Location unavailable",
            property_price: property?.price || null,
            property_type: property?.type || "Property",
          };
        });

        setEnquiries(merged);
      } catch (err) {
        toast.error(err.message || String(err));
      } finally {
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredEnquiries = useMemo(() => {
    const keyword = search.toLowerCase();

    return enquiries
      .filter((enquiry) => {
        return (
          enquiry.property_title?.toLowerCase().includes(keyword) ||
          enquiry.property_location?.toLowerCase().includes(keyword) ||
          enquiry.name?.toLowerCase().includes(keyword) ||
          enquiry.email?.toLowerCase().includes(keyword) ||
          enquiry.phone?.toLowerCase().includes(keyword) ||
          enquiry.message?.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => {
        const firstDate = new Date(a.created_at || 0).getTime();
        const secondDate = new Date(b.created_at || 0).getTime();

        return sortBy === "newest"
          ? secondDate - firstDate
          : firstDate - secondDate;
      });
  }, [enquiries, search, sortBy]);

  const stats = useMemo(() => {
    const uniqueProperties = new Set(
      enquiries.map((item) => item.property_id).filter(Boolean)
    );

    const uniqueContacts = new Set(
      enquiries
        .map((item) => item.email || item.phone)
        .filter(Boolean)
        .map((item) => String(item).toLowerCase())
    );

    return {
      total: enquiries.length,
      properties: uniqueProperties.size,
      contacts: uniqueContacts.size,
      today: enquiries.filter((item) => {
        if (!item.created_at) return false;

        const created = new Date(item.created_at);
        const now = new Date();

        return (
          created.getFullYear() === now.getFullYear() &&
          created.getMonth() === now.getMonth() &&
          created.getDate() === now.getDate()
        );
      }).length,
    };
  }, [enquiries]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 h-52 animate-pulse rounded-3xl bg-white/70 shadow-xl" />
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-3xl bg-white/70 shadow-lg"
              />
            ))}
          </div>
          <div className="grid gap-5">
            {[1, 2, 3, 4].map((item) => (
              <SkeletonEnquiry key={item} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 px-4 py-6 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mx-auto max-w-7xl"
      >
        <div className="mb-8 overflow-hidden rounded-3xl border border-white/70 bg-white/75 shadow-xl shadow-purple-100/60 backdrop-blur-xl">
          <div className="relative p-6 md:p-8">
            <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-purple-200/60 blur-3xl" />
            <div className="absolute bottom-0 left-24 h-32 w-32 rounded-full bg-blue-200/40 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-purple-600">
                  Admin Premium Phase
                </p>
                <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">
                  Enquiries Inbox
                </h1>
                <p className="mt-3 max-w-2xl text-slate-600">
                  Manage buyer enquiries, property requests, contact details,
                  and client messages from one premium admin center.
                </p>
              </div>

              <button
                onClick={loadEnquiries}
                disabled={refreshing}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {refreshing ? "Refreshing..." : "Refresh Enquiries"}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Enquiries" value={stats.total} />
          <StatCard title="Properties Contacted" value={stats.properties} />
          <StatCard title="Unique Contacts" value={stats.contacts} />
          <StatCard title="Today" value={stats.today} />
        </div>

        <div className="mb-6 rounded-3xl border border-white/70 bg-white/75 p-4 shadow-lg backdrop-blur-xl">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search buyer name, email, phone, property or message..."
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
            />

            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => setSortBy(option)}
                  className={`rounded-2xl px-4 py-3 text-sm font-bold capitalize transition ${
                    sortBy === option
                      ? "bg-purple-700 text-white shadow-lg shadow-purple-200"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredEnquiries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border border-dashed border-slate-300 bg-white/75 p-12 text-center shadow-lg backdrop-blur-xl"
          >
            <h2 className="text-xl font-black text-slate-900">
              No enquiries found
            </h2>
            <p className="mt-2 text-slate-500">
              Try changing your search keyword.
            </p>
          </motion.div>
        ) : (
          <motion.div layout className="grid gap-5">
            <AnimatePresence>
              {filteredEnquiries.map((enquiry, index) => (
                <EnquiryCard
                  key={enquiry.id || index}
                  enquiry={enquiry}
                  index={index}
                  onOpen={() => setSelectedEnquiry(enquiry)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedEnquiry && (
          <EnquiryModal
            enquiry={selectedEnquiry}
            onClose={() => setSelectedEnquiry(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EnquiryCard({ enquiry, index, onOpen }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, delay: index * 0.035 }}
      className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-xl shadow-slate-200/60 backdrop-blur-xl"
    >
      <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-700 to-slate-950 text-xl font-black text-white shadow-lg">
          {getInitials(enquiry.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                {enquiry.property_title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {enquiry.property_location}
              </p>
            </div>

            <span className="rounded-full bg-purple-100 px-4 py-2 text-xs font-black uppercase tracking-wider text-purple-700">
              {enquiry.property_type || "Property"}
            </span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Info label="Name" value={enquiry.name || "N/A"} />
            <Info label="Email" value={enquiry.email || "N/A"} />
            <Info label="Phone" value={enquiry.phone || "N/A"} />
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Message
              </p>
              <p className="text-xs font-bold text-slate-400">
                {formatDate(enquiry.created_at)}
              </p>
            </div>

            <p className="line-clamp-3 text-sm leading-6 text-slate-700">
              {enquiry.message || "No message"}
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onOpen}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
            >
              View Details
            </button>

            {enquiry.email && (
              <a
                href={`mailto:${enquiry.email}`}
                className="rounded-2xl bg-purple-100 px-5 py-3 text-center text-sm font-bold text-purple-700 transition hover:bg-purple-200"
              >
                Email Buyer
              </a>
            )}

            {enquiry.phone && (
              <a
                href={`tel:${enquiry.phone}`}
                className="rounded-2xl bg-emerald-100 px-5 py-3 text-center text-sm font-bold text-emerald-700 transition hover:bg-emerald-200"
              >
                Call Buyer
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EnquiryModal({ enquiry, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 24 }}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/20 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-purple-600">
              Enquiry Details
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              {enquiry.property_title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {formatDate(enquiry.created_at)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-200"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Info label="Name" value={enquiry.name || "N/A"} />
          <Info label="Email" value={enquiry.email || "N/A"} />
          <Info label="Phone" value={enquiry.phone || "N/A"} />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Info label="Property ID" value={enquiry.property_id || "N/A"} />
          <Info label="Location" value={enquiry.property_location || "N/A"} />
        </div>

        <div className="mt-4 rounded-3xl bg-slate-50 p-5">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            Full Message
          </p>
          <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">
            {enquiry.message || "No message"}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {enquiry.email && (
            <a
              href={`mailto:${enquiry.email}`}
              className="flex-1 rounded-2xl bg-purple-700 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-purple-800"
            >
              Email Buyer
            </a>
          )}

          {enquiry.phone && (
            <a
              href={`tel:${enquiry.phone}`}
              className="flex-1 rounded-2xl bg-emerald-600 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              Call Buyer
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ title, value }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl"
    >
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <h3 className="mt-3 text-2xl font-black text-purple-700 md:text-3xl">
        {value}
      </h3>
    </motion.div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function SkeletonEnquiry() {
  return (
    <div className="animate-pulse rounded-3xl border border-white/70 bg-white/70 p-5 shadow-xl backdrop-blur-xl">
      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="h-16 w-16 rounded-3xl bg-slate-200" />

        <div className="flex-1 space-y-4">
          <div className="h-6 w-2/3 rounded-full bg-slate-200" />
          <div className="h-4 w-1/2 rounded-full bg-slate-200" />

          <div className="grid gap-3 md:grid-cols-3">
            <div className="h-20 rounded-2xl bg-slate-200" />
            <div className="h-20 rounded-2xl bg-slate-200" />
            <div className="h-20 rounded-2xl bg-slate-200" />
          </div>

          <div className="h-28 rounded-2xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}