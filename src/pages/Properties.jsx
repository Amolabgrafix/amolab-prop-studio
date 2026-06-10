import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchProperties() {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProperties(data || []);
    } catch (error) {
      console.error("Error loading properties:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadProperties() {
      await fetchProperties();
    }

    loadProperties();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <h2 className="text-xl font-semibold">Loading properties...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Available Properties
        </h1>

        {properties.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow">
            <p>No approved properties available yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Link
                key={property.id}
                to={`/properties/${property.id}`}
                className="block bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition"
              >
                <img
                  src={
                    property.image_url ||
                    "https://via.placeholder.com/600x400?text=No+Image"
                  }
                  alt={property.title}
                  className="w-full h-56 object-cover"
                />

                <div className="p-4">
                  <h2 className="text-xl font-bold mb-2">
                    {property.title}
                  </h2>

                  <p className="text-gray-500">
                    {property.location}
                  </p>

                  <p className="text-blue-700 font-bold text-lg mt-3">
                    ₦{Number(property.price).toLocaleString()}
                  </p>

                  <div className="mt-3">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm capitalize">
                      {property.type}
                    </span>
                  </div>

                  <p className="text-gray-600 mt-3 line-clamp-2">
                    {property.description}
                  </p>

                  <button className="w-full mt-4 bg-blue-700 text-white py-2 rounded-lg">
                    View Details
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}