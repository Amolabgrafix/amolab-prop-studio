import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function WatchPropertyButton({ property }) {
  const [watching, setWatching] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function checkWatchStatus() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !property?.id) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("property_watchlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("property_id", property.id)
      .maybeSingle();

    if (data) {
      setWatching(true);
      setWatchId(data.id);
    } else {
      setWatching(false);
      setWatchId(null);
    }

    setLoading(false);
  }

  async function toggleWatch() {
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login to watch this property.");
      return;
    }

    if (!property?.id) {
      setMessage("Property information is missing.");
      return;
    }

    setLoading(true);

    if (watching && watchId) {
      const { error } = await supabase
        .from("property_watchlists")
        .delete()
        .eq("id", watchId);

      if (error) {
        setMessage(error.message);
      } else {
        setWatching(false);
        setWatchId(null);
        setMessage("Removed from watchlist.");
      }
    } else {
      const { data, error } = await supabase
        .from("property_watchlists")
        .insert({
          user_id: user.id,
          property_id: property.id,
        })
        .select("id")
        .single();

      if (error) {
        setMessage(error.message);
      } else {
        setWatching(true);
        setWatchId(data.id);
        setMessage("Property added to watchlist.");
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    async function fetchWatchStatus() {
      await checkWatchStatus();
    }

    fetchWatchStatus();
  }, [property?.id]);

  return (
    <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-xl dark:border-purple-900 dark:bg-slate-950">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white">
        Watch Property
      </h2>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Get notified when price, status, or major listing details change.
      </p>

      <button
        onClick={toggleWatch}
        disabled={loading}
        className={`mt-5 w-full rounded-2xl px-5 py-3 font-black text-white shadow-lg transition disabled:opacity-50 ${
          watching
            ? "bg-red-600 hover:bg-red-700"
            : "bg-purple-700 hover:bg-purple-800"
        }`}
      >
        {loading
          ? "Checking..."
          : watching
          ? "Remove From Watchlist"
          : "❤️ Watch Property"}
      </button>

      {message && (
        <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {message}
        </p>
      )}
    </div>
  );
}