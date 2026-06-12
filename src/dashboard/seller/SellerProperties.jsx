import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function SellerProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

 async function fetchProperties() {
    setLoading(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      setMessage(userError.message);
      setLoading(false);
      return;
    }

    const user = userData?.user;

    if (!user) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setProperties(data || []);
    }

    setLoading(false);
 }

 useEffect(() => {
  const loadData = async () => {
    await fetchProperties();
  };

  loadData();
}, []);

  async function deleteProperty(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase.from("properties").delete().eq("id", id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Property deleted successfully.");
      fetchProperties();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-10">
        Loading your properties...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              My Properties
            </h1>
            <p className="mt-2 text-slate-600">
              View and manage all properties you have uploaded.
            </p>
          </div>

          <Link
            to="/dashboard/seller/add-property"
            className="rounded-xl bg-purple-700 px-6 py-3 font-semibold text-white hover:bg-purple-800"
          >
            Add Property
          </Link>
        </div>

        {message && (
          <div className="mb-5 rounded-xl bg-purple-100 p-4 text-purple-700">
            {message}
          </div>
        )}

        {properties.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <p className="text-slate-600">
              You have not uploaded any property yet.
            </p>

            <Link
              to="/dashboard/seller/add-property"
              className="mt-5 inline-block rounded-xl bg-purple-700 px-6 py-3 font-semibold text-white"
            >
              Upload Your First Property
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {properties.map((property) => (
              <div
                key={property.id}
                className="overflow-hidden rounded-2xl bg-white shadow"
              >
                {property.image_url ? (
                  <img
                    src={property.image_url}
                    alt={property.title}
                    className="h-56 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-56 w-full items-center justify-center bg-slate-200 text-slate-500">
                    No Image
                  </div>
                )}

                <div className="p-5">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold text-slate-900">
                      {property.title}
                    </h2>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm capitalize text-slate-700">
                      {property.status}
                    </span>
                  </div>

                  <p className="text-slate-600">
                    {property.city}, {property.state}
                  </p>

                  <p className="mt-3 text-2xl font-bold text-purple-700">
                    ₦{Number(property.price).toLocaleString()}
                  </p>

                  <div className="mt-5 flex gap-3">
                    <Link
                      to={`/properties/${property.id}`}
                      className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-center font-semibold text-white"
                    >
                      View
                    </Link>

                    <button
                      onClick={() => deleteProperty(property.id)}
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}