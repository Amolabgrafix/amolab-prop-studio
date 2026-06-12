import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);

  async function loadProperties() {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setProperties(data || []);
    }
  }

  async function updateStatus(id, status) {
    await supabase.from("properties").update({ status }).eq("id", id);
    loadProperties();
  }

  async function toggleFeatured(id, currentValue) {
    await supabase
      .from("properties")
      .update({ is_featured: !currentValue })
      .eq("id", id);

    loadProperties();
  }

  useEffect(() => {
    let mounted = true;

    async function fetchProperties() {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && mounted) {
        setProperties(data || []);
      }
    }

    fetchProperties();

    return () => {
      mounted = false;
    };

    
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800">
        Property Management
      </h2>

      <p className="mt-2 text-slate-500">
        Review, approve, reject and feature submitted properties.
      </p>

      <div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow">
        <table className="w-full text-left">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Type</th>
              <th className="p-4">Listing</th>
              <th className="p-4">Price</th>
              <th className="p-4">City</th>
              <th className="p-4">Status</th>
              <th className="p-4">Featured</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {properties.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-4">
                  No properties found.
                </td>
              </tr>
            ) : (
              properties.map((property) => (
                <tr key={property.id} className="border-t">
                  <td className="p-4 font-semibold">
                    {property.title || "Untitled"}
                  </td>

                  <td className="p-4">
                    {property.property_type || property.type || "N/A"}
                  </td>

                  <td className="p-4">
                    {property.listing_type || property.type || "N/A"}
                  </td>

                  <td className="p-4">
                    ₦{Number(property.price || 0).toLocaleString()}
                  </td>

                  <td className="p-4">
                    {property.city || property.location || "N/A"}
                  </td>

                  <td className="p-4 capitalize">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
                      {property.status || "pending"}
                    </span>
                  </td>

                  <td className="p-4">
                    {property.is_featured ? (
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                        Featured
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                        Normal
                      </span>
                    )}
                  </td>

                  <td className="flex flex-wrap gap-2 p-4">
                    <button
                      onClick={() => updateStatus(property.id, "approved")}
                      className="rounded-lg bg-green-600 px-3 py-2 text-white"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => updateStatus(property.id, "rejected")}
                      className="rounded-lg bg-red-600 px-3 py-2 text-white"
                    >
                      Reject
                    </button>

                    <button
                      onClick={() => updateStatus(property.id, "sold")}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-white"
                    >
                      Sold
                    </button>

                    <button
                      onClick={() => updateStatus(property.id, "rented")}
                      className="rounded-lg bg-purple-600 px-3 py-2 text-white"
                    >
                      Rented
                    </button>

                    <button
                      onClick={() =>
                        toggleFeatured(property.id, property.is_featured)
                      }
                      className={`rounded-lg px-3 py-2 text-white ${
                        property.is_featured
                          ? "bg-slate-700"
                          : "bg-yellow-600"
                      }`}
                    >
                      {property.is_featured ? "Unfeature" : "Feature"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}