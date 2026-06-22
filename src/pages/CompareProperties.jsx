import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function CompareProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompareProperties() {
      setLoading(true);

      const compareIds = JSON.parse(
        localStorage.getItem("compare_properties") || "[]"
      );

      if (compareIds.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .in("id", compareIds);

      if (error) {
        console.error("Compare error:", error);
        setProperties([]);
      } else {
        setProperties(data || []);
      }

      setLoading(false);
    }

    loadCompareProperties();
  }, []);

  function removeProperty(id) {
    const current = JSON.parse(
      localStorage.getItem("compare_properties") || "[]"
    );

    const updated = current.filter((item) => item !== id);
    localStorage.setItem("compare_properties", JSON.stringify(updated));

    setProperties((prev) => prev.filter((property) => property.id !== id));
  }

  function clearComparison() {
    localStorage.removeItem("compare_properties");
    setProperties([]);
  }

  if (loading) {
    return <p className="p-10">Loading comparison...</p>;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Compare Properties
            </h1>
            <p className="mt-2 text-slate-600">
              Compare selected properties side by side.
            </p>
          </div>

          {properties.length > 0 && (
            <button
              onClick={clearComparison}
              className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
            >
              Clear Comparison
            </button>
          )}
        </div>

        {properties.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow">
            <p className="text-slate-600">
              No properties selected for comparison.
            </p>

            <Link
              to="/properties"
              className="mt-5 inline-block rounded-xl bg-purple-700 px-6 py-3 font-semibold text-white hover:bg-purple-800"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="min-w-40 p-4 font-bold text-slate-700">
                    Feature
                  </th>

                  {properties.map((property) => (
                    <th
                      key={property.id}
                      className="min-w-64 border-l p-4 align-top"
                    >
                      {property.image_url ? (
                        <img
                          src={property.image_url}
                          alt={property.title}
                          className="mb-3 h-40 w-full rounded-xl object-cover"
                        />
                      ) : (
                        <div className="mb-3 flex h-40 items-center justify-center rounded-xl bg-slate-200 text-slate-500">
                          No Image
                        </div>
                      )}

                      <h2 className="text-lg font-bold text-slate-900">
                        {property.title}
                      </h2>

                      <button
                        onClick={() => removeProperty(property.id)}
                        className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                <tr className="border-b">
                  <td className="p-4 font-semibold text-slate-700">Price</td>
                  {properties.map((property) => (
                    <td key={property.id} className="border-l p-4">
                      ₦{Number(property.price || 0).toLocaleString()}
                    </td>
                  ))}
                </tr>

                <tr className="border-b">
                  <td className="p-4 font-semibold text-slate-700">Location</td>
                  {properties.map((property) => (
                    <td key={property.id} className="border-l p-4">
                      {property.location ||
                        property.city ||
                        property.state ||
                        "Not available"}
                    </td>
                  ))}
                </tr>

                <tr className="border-b">
                  <td className="p-4 font-semibold text-slate-700">Type</td>
                  {properties.map((property) => (
                    <td key={property.id} className="border-l p-4 capitalize">
                      {property.type || property.property_type || "Property"}
                    </td>
                  ))}
                </tr>

                <tr className="border-b">
                  <td className="p-4 font-semibold text-slate-700">Bedrooms</td>
                  {properties.map((property) => (
                    <td key={property.id} className="border-l p-4">
                      {property.bedrooms || "Not available"}
                    </td>
                  ))}
                </tr>

                <tr className="border-b">
                  <td className="p-4 font-semibold text-slate-700">
                    Bathrooms
                  </td>
                  {properties.map((property) => (
                    <td key={property.id} className="border-l p-4">
                      {property.bathrooms || "Not available"}
                    </td>
                  ))}
                </tr>

                <tr className="border-b">
                  <td className="p-4 font-semibold text-slate-700">Views</td>
                  {properties.map((property) => (
                    <td key={property.id} className="border-l p-4">
                      {property.views || 0}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 font-semibold text-slate-700">Action</td>
                  {properties.map((property) => (
                    <td key={property.id} className="border-l p-4">
                      <Link
                        to={`/properties/${property.id}`}
                        className="inline-block rounded-xl bg-purple-700 px-4 py-2 font-semibold text-white hover:bg-purple-800"
                      >
                        View Property
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}