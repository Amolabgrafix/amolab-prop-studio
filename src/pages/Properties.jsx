import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

function PropertyImage({ src, title }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-56 w-full items-center justify-center bg-gray-200">
        <span className="font-semibold text-gray-500">No Image Available</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}
      onError={() => setFailed(true)}
      className="h-56 w-full object-cover"
    />
  );
}

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  async function loadPageData() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const loggedInUser = userData?.user || null;
      setUser(loggedInUser);

      const { data: propertyData, error: propertyError } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "approved")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (propertyError) throw propertyError;

      setProperties(propertyData || []);

      if (loggedInUser) {
        const { data: favData, error: favError } = await supabase
          .from("favorites")
          .select("property_id")
          .eq("user_id", loggedInUser.id);

        if (favError) throw favError;

        setFavoriteIds(favData?.map((fav) => fav.property_id) || []);
      }
    } catch (error) {
      console.error("Error loading properties:", error);
      alert(error.message || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        // call the existing loadPageData but guard state updates if unmounted
        await loadPageData();
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
  }, []);

  async function toggleFavorite(e, propertyId) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("Please login to save properties.");
      return;
    }

    const isSaved = favoriteIds.includes(propertyId);

    if (isSaved) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("property_id", propertyId);

      if (error) {
        alert(error.message);
        return;
      }

      setFavoriteIds((prev) => prev.filter((id) => id !== propertyId));
    } else {
      const { error } = await supabase.from("favorites").insert({
        user_id: user.id,
        property_id: propertyId,
      });

      if (error) {
        alert(error.message);
        return;
      }

      setFavoriteIds((prev) => [...prev, propertyId]);
    }
  }

  const filteredProperties = properties.filter((property) => {
    const searchText = search.toLowerCase();
    const locationText = location.toLowerCase();

    const matchesSearch =
      search === "" ||
      property.title?.toLowerCase().includes(searchText) ||
      property.description?.toLowerCase().includes(searchText);

    const matchesLocation =
      location === "" || property.location?.toLowerCase().includes(locationText);

    const matchesType = propertyType === "" || property.type === propertyType;

    const matchesMin =
      minPrice === "" || Number(property.price) >= Number(minPrice);

    const matchesMax =
      maxPrice === "" || Number(property.price) <= Number(maxPrice);

    return (
      matchesSearch &&
      matchesLocation &&
      matchesType &&
      matchesMin &&
      matchesMax
    );
  });

  function resetFilters() {
    setSearch("");
    setPropertyType("");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <h2 className="text-xl font-semibold">Loading properties...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Available Properties
          </h1>
          <p className="mt-2 text-gray-600">
            Search and browse approved properties on Amolab Prop Studio.
          </p>
        </div>

        <div className="mb-8 rounded-2xl bg-white p-5 shadow">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <input
              type="text"
              placeholder="Search title or description"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border p-3"
            />

            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border p-3"
            />

            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full rounded-lg border p-3"
            >
              <option value="">All Types</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>

            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-lg border p-3"
            />

            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-lg border p-3"
            />

            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg bg-gray-700 py-3 font-semibold text-white hover:bg-gray-800"
            >
              Reset
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Showing {filteredProperties.length} of {properties.length} approved
            properties
          </p>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            <p className="text-gray-600">No properties found.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property) => {
              const isSaved = favoriteIds.includes(property.id);

              return (
                <Link
                  key={property.id}
                  to={`/properties/${property.id}`}
                  className="relative block overflow-hidden rounded-2xl bg-white shadow transition hover:shadow-lg"
                >
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(e, property.id)}
                    className={`absolute right-4 top-4 z-10 rounded-full px-3 py-2 text-lg shadow ${
                      isSaved
                        ? "bg-red-600 text-white"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    {isSaved ? "❤️" : "🤍"}
                  </button>

                  {property.is_featured && (
                    <span className="absolute left-4 top-4 z-10 rounded-full bg-yellow-500 px-3 py-1 text-sm font-semibold text-white">
                      Featured
                    </span>
                  )}

                  <PropertyImage
                    src={property.image_url}
                    title={property.title}
                  />

                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm capitalize text-blue-700">
                        {property.type || "property"}
                      </span>

                      <span className="text-sm text-gray-500">Approved</span>
                    </div>

                    <h2 className="mb-2 text-xl font-bold text-gray-900">
                      {property.title}
                    </h2>

                    <p className="text-gray-500">{property.location}</p>

                    <p className="mt-3 text-lg font-bold text-blue-700">
                      ₦{Number(property.price).toLocaleString()}
                    </p>

                    <p className="mt-3 line-clamp-3 text-gray-600">
                      {property.description}
                    </p>

                    <div className="mt-4 w-full rounded-lg bg-blue-700 py-2 text-center font-semibold text-white">
                      View Details
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}