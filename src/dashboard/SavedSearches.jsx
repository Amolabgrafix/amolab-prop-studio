import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";

function formatBudget(value) {
  if (!value) return "Any budget";
  return `₦${Number(value || 0).toLocaleString()}`;
}

function formatDate(value) {
  if (!value) return "No date";
  return new Date(value).toLocaleString();
}

export default function SavedSearches() {
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  async function loadSavedSearches() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSavedSearches([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("saved_searches")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setSavedSearches([]);
    } else {
      setSavedSearches(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    async function fetchSavedSearches() {
      await loadSavedSearches();
    }

    fetchSavedSearches();
  }, []);

  async function deleteSavedSearch(id) {
    setDeletingId(id);

    const { error } = await supabase
      .from("saved_searches")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
    } else {
      setSavedSearches((prev) => prev.filter((item) => item.id !== id));
      toast.success("Saved search deleted");
    }

    setDeletingId(null);
  }

  function buildSearchUrl(item) {
    const params = new URLSearchParams();

    if (item.location) params.set("location", item.location);
    if (item.type) params.set("type", item.type);
    if (item.budget) params.set("budget", item.budget);

    return `/properties${params.toString() ? `?${params.toString()}` : ""}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="mb-8 h-48 animate-pulse rounded-[2rem] bg-white/80 shadow-xl dark:bg-slate-900/80" />
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-56 animate-pulse rounded-[2rem] bg-white/80 shadow-xl dark:bg-slate-900/80"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-purple-900 to-indigo-900 p-8 text-white shadow-2xl"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="relative z-10">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-purple-200">
            Saved Searches
          </p>

          <h1 className="mt-3 text-4xl font-black md:text-5xl">
            Property Alerts Center
          </h1>

          <p className="mt-3 max-w-2xl text-purple-100">
            Keep track of your favorite search filters and quickly run them
            again anytime.
          </p>
        </div>
      </motion.section>

      {savedSearches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-[2rem] border border-dashed border-slate-300 bg-white/85 p-12 text-center shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80"
        >
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">
            No saved searches yet
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Go to properties, apply filters, then click “Save Search”.
          </p>

          <Link
            to="/properties"
            className="mt-6 inline-block rounded-2xl bg-purple-700 px-6 py-4 font-black text-white transition hover:bg-purple-800"
          >
            Browse Properties
          </Link>
        </motion.div>
      ) : (
        <motion.div layout className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {savedSearches.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-2xl dark:bg-purple-500/20">
                  🔔
                </div>

                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Saved Property Search
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {formatDate(item.created_at)}
                </p>

                <div className="mt-5 space-y-3">
                  <Info label="Location" value={item.location || "Any location"} />
                  <Info label="Type" value={item.type || "Any type"} />
                  <Info label="Budget" value={formatBudget(item.budget)} />
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to={buildSearchUrl(item)}
                    className="flex-1 rounded-2xl bg-purple-700 px-5 py-3 text-center font-black text-white transition hover:bg-purple-800"
                  >
                    Run Search
                  </Link>

                  <button
                    onClick={() => deleteSavedSearch(item.id)}
                    disabled={deletingId === item.id}
                    className="flex-1 rounded-2xl bg-rose-600 px-5 py-3 font-black text-white transition hover:bg-rose-700 disabled:opacity-60"
                  >
                    {deletingId === item.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-black capitalize text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
}