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
      setProperties(data);
    }
  }

  async function updateStatus(id, status) {
    await supabase
      .from("properties")
      .update({ status })
      .eq("id", id);

    loadProperties();
  }

 useEffect(() => {
  async function fetchProperties() {
    await loadProperties();
  }

  fetchProperties();
}, []);
  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800">
        Property Management
      </h2>

      <p className="text-slate-500 mt-2">
        Review and approve submitted properties.
      </p>

      <div className="bg-white rounded-2xl shadow mt-8 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Type</th>
              <th className="p-4">Listing</th>
              <th className="p-4">Price</th>
              <th className="p-4">City</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {properties.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4">
                  No properties found.
                </td>
              </tr>
            ) : (
              properties.map((property) => (
                <tr key={property.id} className="border-t">
                  <td className="p-4">{property.title}</td>
                  <td className="p-4">{property.property_type}</td>
                  <td className="p-4">{property.listing_type}</td>
                  <td className="p-4">
                    ₦{Number(property.price).toLocaleString()}
                  </td>
                  <td className="p-4">{property.city}</td>
                  <td className="p-4 capitalize">{property.status}</td>

                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() =>
                        updateStatus(property.id, "approved")
                      }
                      className="bg-green-600 text-white px-3 py-2 rounded-lg"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(property.id, "rejected")
                      }
                      className="bg-red-600 text-white px-3 py-2 rounded-lg"
                    >
                      Reject
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(property.id, "sold")
                      }
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg"
                    >
                      Sold
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(property.id, "rented")
                      }
                      className="bg-purple-600 text-white px-3 py-2 rounded-lg"
                    >
                      Rented
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