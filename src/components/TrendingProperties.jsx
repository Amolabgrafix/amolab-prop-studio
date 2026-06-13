import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function TrendingProperties() {
  const [properties, setProperties] = useState([]);

  async function loadTrending() {
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("status", "approved")
      .order("is_featured", { ascending: false })
       .order("views", { ascending: false })
      .limit(6);

    setProperties(data || []);
  }

  useEffect(() => {
    async function init() {
      await loadTrending();
    }

    init();
  }, []);

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {properties.map((property) => (
        <Link
          key={property.id}
          to={`/properties/${property.id}`}
          className="overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl"
        >
          {property.image_url ? (
            <img
              src={property.image_url}
              alt={property.title}
              className="h-56 w-full object-cover"
            />
          ) : (
            <div className="h-56 bg-slate-200" />
          )}

          <div className="p-6">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                🔥 Trending
              </span>

              <span className="text-sm text-slate-500">
                👁 {property.views || 0}
              </span>
            </div>

            <h3 className="mt-4 text-xl font-bold">
              {property.title}
            </h3>

            <p className="mt-2 text-slate-600">
              {property.location || property.city}
            </p>

            <p className="mt-4 text-2xl font-bold text-purple-700">
              ₦{Number(property.price).toLocaleString()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}