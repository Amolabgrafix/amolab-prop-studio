import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function WatchedProperties() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  function formatMoney(value) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }

  // Load watched properties inside effect to avoid synchronous setState calls

  async function removeWatch(id) {
    const { error } = await supabase
      .from("property_watchlists")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
    } else {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setMessage("Property removed from watchlist.");
    }
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setMessage("Please login to view your watched properties.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("property_watchlists")
        .select(
          `
        id,
        created_at,
        properties (
          id,
          title,
          price,
          city,
          state,
          location,
          status,
          is_featured,
          is_boosted,
          image_url,
          views
        )
      `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (error) {
        setMessage(error.message);
      } else {
        setItems(data || []);
      }

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-gradient-to-r from-purple-700 to-indigo-700 p-8 text-white shadow-xl">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-purple-100">
            Buyer Watchlist
          </p>

          <h1 className="mt-2 text-3xl font-black md:text-4xl">
            Watched Properties
          </h1>

          <p className="mt-3 max-w-2xl text-purple-100">
            Track properties you are interested in and receive updates when key
            details change.
          </p>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl bg-white p-4 text-sm font-semibold text-slate-700 shadow dark:bg-slate-900 dark:text-slate-300">
            {message}
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-3xl bg-white p-8 text-center font-bold text-slate-600 shadow dark:bg-slate-900 dark:text-slate-300">
            Loading watched properties...
          </div>
        ) : items.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-8 text-center shadow dark:bg-slate-900">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              No watched properties yet
            </h2>

            <p className="mt-2 text-slate-600 dark:text-slate-300">
              When you watch properties, they will appear here.
            </p>

            <Link
              to="/properties"
              className="mt-6 inline-block rounded-2xl bg-purple-700 px-6 py-3 font-black text-white hover:bg-purple-800"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6">
            {items.map((item) => {
              const property = item.properties || {};

              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="grid md:grid-cols-[240px_1fr]">
                    <div className="h-56 bg-slate-200 dark:bg-slate-800">
                      {property.image_url ? (
                        <img
                          src={property.image_url}
                          alt={property.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm font-bold text-slate-500">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                            {property.title || "Property"}
                          </h2>

                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {[property.city || property.location, property.state]
                              .filter(Boolean)
                              .join(", ") || "Location not specified"}
                          </p>
                        </div>

                        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black capitalize text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                          {property.status || "listed"}
                        </span>
                      </div>

                      <div className="mt-6 grid gap-4 md:grid-cols-4">
                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                          <p className="text-xs font-bold uppercase text-slate-500">
                            Current Price
                          </p>
                          <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                            {formatMoney(property.price)}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-purple-50 p-4 dark:bg-purple-950/40">
                          <p className="text-xs font-bold uppercase text-purple-600 dark:text-purple-300">
                            Views
                          </p>
                          <p className="mt-1 text-lg font-black text-purple-800 dark:text-purple-200">
                            {property.views || 0}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-yellow-50 p-4 dark:bg-yellow-950/40">
                          <p className="text-xs font-bold uppercase text-yellow-700 dark:text-yellow-300">
                            Featured
                          </p>
                          <p className="mt-1 text-lg font-black text-yellow-800 dark:text-yellow-200">
                            {property.is_featured ? "Yes" : "No"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-blue-50 p-4 dark:bg-blue-950/40">
                          <p className="text-xs font-bold uppercase text-blue-700 dark:text-blue-300">
                            Boosted
                          </p>
                          <p className="mt-1 text-lg font-black text-blue-800 dark:text-blue-200">
                            {property.is_boosted ? "Yes" : "No"}
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
                        Watching since{" "}
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                          to={`/properties/${property.id}`}
                          className="rounded-2xl bg-purple-700 px-5 py-3 font-black text-white hover:bg-purple-800"
                        >
                          View Property
                        </Link>

                        <button
                          onClick={() => removeWatch(item.id)}
                          className="rounded-2xl bg-red-600 px-5 py-3 font-black text-white hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}