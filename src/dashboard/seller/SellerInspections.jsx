import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function SellerInspections() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadInspections() {
    setLoading(true);
    setMessage("");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    const { data: sellerProperties, error: propertyError } = await supabase
    .from("properties")
    .select("id, title, owner_id")
    .eq("owner_id", user.id);

    if (propertyError) {
      setMessage(propertyError.message);
      setLoading(false);
      return;
    }

    const propertyIds = sellerProperties?.map((item) => item.id) || [];

    if (propertyIds.length === 0) {
      setInspections([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("property_inspections")
      .select("*")
      .in("property_id", propertyIds)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setInspections([]);
    } else {
      const propertyMap = {};
      sellerProperties.forEach((property) => {
        propertyMap[property.id] = property.title;
      });

      const formatted = (data || []).map((inspection) => ({
        ...inspection,
        property_title: propertyMap[inspection.property_id] || "Property",
      }));

      setInspections(formatted);
    }

    setLoading(false);
  }

  async function updateStatus(id, status) {
    setMessage("");

    const { error } = await supabase
      .from("property_inspections")
      .update({ status })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(`Inspection ${status} successfully.`);
      loadInspections();
    }
  }

  useEffect(() => {
    const fetchInspections = async () => {
      await loadInspections();
    };

    void fetchInspections();
  }, []);

  if (loading) {
    return <p className="p-6">Loading inspections...</p>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Inspection Requests
        </h1>
        <p className="mt-2 text-slate-600">
          Manage property inspection bookings from interested clients.
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-lg bg-blue-100 p-4 text-blue-700">
          {message}
        </div>
      )}

      {inspections.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <p className="text-slate-600">No inspection requests yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4">Property</th>
                <th className="p-4">Client</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Inspection Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {inspections.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-4 font-semibold">{item.property_title}</td>
                  <td className="p-4">{item.name}</td>
                  <td className="p-4">{item.phone}</td>
                  <td className="p-4">
                    {item.inspection_date
                      ? new Date(item.inspection_date).toLocaleString()
                      : "Not set"}
                  </td>
                  <td className="p-4 capitalize">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">
                      {item.status}
                    </span>
                  </td>
                  <td className="space-x-2 p-4">
                    <button
                      onClick={() => updateStatus(item.id, "approved")}
                      className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => updateStatus(item.id, "rejected")}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}