import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

function PropertyImage({ src, title }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500 font-semibold">No Image Available</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}
      onError={() => setFailed(true)}
      className="w-full h-56 object-cover"
    />
  );
}

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");


  useEffect(() => {
    let isMounted = true;

    async function loadProperties() {
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("status", "approved")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (isMounted) {
          setProperties(data || []);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error loading properties:", error);
          alert("Failed to load properties");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProperties();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProperties = properties.filter((property) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      property.title?.toLowerCase().includes(searchText) ||
      property.location?.toLowerCase().includes(searchText);

    const matchesType = propertyType === "" || property.type === propertyType;

    const matchesMin =
      minPrice === "" || Number(property.price) >= Number(minPrice);

    const matchesMax =
      maxPrice === "" || Number(property.price) <= Number(maxPrice);

    return matchesSearch && matchesType && matchesMin && matchesMax;
  });

  function resetFilters() {
    setSearch("");
    setPropertyType("");
    setMinPrice("");
    setMaxPrice("");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <h2 className="text-xl font-semibold">Loading properties...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Available Properties
          </h1>
          <p className="text-gray-600 mt-2">
            Search and browse approved properties on Amolab Prop Studio.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Search title or location"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-3 rounded-lg w-full"
            />

            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="border p-3 rounded-lg w-full"
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
              className="border p-3 rounded-lg w-full"
            />

            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="border p-3 rounded-lg w-full"
            />

            <button
              type="button"
              onClick={resetFilters}
              className="bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-800 py-3"
            >
              Reset
            </button>
          </div>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center">
            <p className="text-gray-600">No properties found.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Link
                key={property.id}
                to={`/properties/${property.id}`}
                className="block bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition"
              >
                <PropertyImage src={property.image_url} title={property.title} />

                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h2>

                  <p className="text-gray-500">{property.location}</p>

                  <p className="text-blue-700 font-bold text-lg mt-3">
                    ₦{Number(property.price).toLocaleString()}
                  </p>

                  <div className="mt-3">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm capitalize">
                      {property.type || "property"}
                    </span>
                  </div>

                  <p className="text-gray-600 mt-3">
                    {property.description}
                  </p>

                  <div className="w-full mt-4 bg-blue-700 text-white py-2 rounded-lg font-semibold text-center">
                    View Details
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}