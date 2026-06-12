import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadFavorites() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
    .from("favorites")
    .select(`
        id,
        property_id,
        created_at,
        properties!favorites_property_id_fkey (*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

    if (error) {
      console.log("Favorites error:", error.message);
      setFavorites([]);
    } else {
      console.log("Favorites data:", data);
      setFavorites(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    // run async loader inside effect to avoid calling setState synchronously in the effect body
    (async () => {
      await loadFavorites();
    })();
  }, []);

  async function removeFavorite(favoriteId) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", favoriteId);

    if (error) {
      alert(error.message);
      return;
    }

    setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
  }

  if (loading) {
    return <p className="p-6">Loading favorites...</p>;
  }

  const visibleFavorites = favorites.filter((fav) => {
    const property = Array.isArray(fav.properties)
      ? fav.properties[0]
      : fav.properties;

    return property;
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">My Favorites</h1>

      <p className="mt-2 text-slate-600">
        Properties you saved for later.
      </p>

      {visibleFavorites.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow">
          <p className="text-slate-600">No saved properties yet.</p>

          <Link
            to="/properties"
            className="mt-4 inline-block rounded-xl bg-purple-700 px-6 py-3 font-semibold text-white"
          >
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleFavorites.map((fav) => {
            const property = Array.isArray(fav.properties)
              ? fav.properties[0]
              : fav.properties;

            return (
              <div
                key={fav.id}
                className="overflow-hidden rounded-2xl bg-white shadow"
              >
                {property.image_url ? (
                  <img
                    src={property.image_url}
                    alt={property.title}
                    className="h-56 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center bg-slate-200">
                    No Image
                  </div>
                )}

                <div className="p-5">
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-sm capitalize text-purple-700">
                    {property.type || "property"}
                  </span>

                  <h2 className="mt-4 text-xl font-bold text-slate-900">
                    {property.title}
                  </h2>

                  <p className="mt-2 text-slate-600">
                    {property.city || "No location"}
                  </p>

                  <p className="mt-3 text-lg font-bold text-purple-700">
                    ₦{Number(property.price || 0).toLocaleString()}
                  </p>

                  <div className="mt-5 flex gap-3">
                    <Link
                      to={`/properties/${property.id}`}
                      className="flex-1 rounded-lg bg-purple-700 py-2 text-center font-semibold text-white"
                    >
                      View
                    </Link>

                    <button
                      onClick={() => removeFavorite(fav.id)}
                      className="flex-1 rounded-lg bg-red-600 py-2 font-semibold text-white"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}