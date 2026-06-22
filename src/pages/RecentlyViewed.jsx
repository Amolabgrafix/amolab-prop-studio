import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function RecentlyViewed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentlyViewed() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("recently_viewed")
        .select(`
          id,
          viewed_at,
          properties (
            id,
            title,
            price,
            location,
            city,
            type,
            image_url
          )
        `)
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(12);

      if (!error) {
        setItems(data || []);
      }

      setLoading(false);
    }

    fetchRecentlyViewed();
  }, []);

  if (loading) {
    return <p className="p-10">Loading recently viewed properties...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          Recently Viewed Properties
        </h1>

        {items.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow">
            <h2 className="text-xl font-bold text-slate-900">
              No recently viewed properties yet
            </h2>
            <p className="mt-2 text-slate-600">
              Properties you open will appear here.
            </p>
            <Link
              to="/properties"
              className="mt-5 inline-block rounded-lg bg-purple-700 px-5 py-3 font-semibold text-white hover:bg-purple-800"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {items.map((item) => {
              const property = item.properties;

              if (!property) return null;

              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl bg-white shadow"
                >
                  {property.image_url ? (
                    <img
                      src={property.image_url}
                      alt={property.title}
                      className="h-52 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-gray-200 text-slate-500">
                      No Image Available
                    </div>
                  )}

                  <div className="p-5">
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold capitalize text-purple-700">
                      {property.type || "property"}
                    </span>

                    <h2 className="mt-3 text-xl font-bold text-slate-900">
                      {property.title}
                    </h2>

                    <p className="mt-1 text-slate-600">
                      {property.location || property.city || "No location"}
                    </p>

                    <p className="mt-3 text-2xl font-bold text-purple-700">
                      ₦{Number(property.price || 0).toLocaleString()}
                    </p>

                    <Link
                      to={`/properties/${property.id}`}
                      className="mt-4 block rounded-lg bg-black px-4 py-3 text-center font-semibold text-white hover:bg-slate-800"
                    >
                      View Again
                    </Link>
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