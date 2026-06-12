import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("enquiries")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          if (isMounted) setMessage(error.message);
          return;
        }

        const propertyIds = [...new Set((data || []).map((e) => e.property_id))];

        const { data: properties } = await supabase
          .from("properties")
          .select("id, title")
          .in("id", propertyIds);

        const merged = (data || []).map((enquiry) => {
          const property = properties?.find((p) => p.id === enquiry.property_id);

          return {
            ...enquiry,
            property_title: property?.title || "Unknown Property",
          };
        });

        if (isMounted) {
          setEnquiries(merged);
        }
      } catch (err) {
        if (isMounted) setMessage(err.message || String(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <div className="p-6">Loading enquiries...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-purple-700 mb-6">
        Admin Enquiries
      </h1>

      <div className="mb-6 rounded-xl bg-white p-5 shadow">
        <p className="font-semibold text-purple-700">
          Total Enquiries: {enquiries.length}
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-xl bg-red-100 p-4 text-red-700">
          {message}
        </div>
      )}

      {enquiries.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-600">No enquiries yet.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {enquiries.map((enquiry) => (
            <div key={enquiry.id} className="rounded-xl bg-white p-5 shadow">
              <h2 className="text-lg font-bold text-purple-700">
                {enquiry.property_title}
              </h2>

              <p className="text-sm text-gray-500">
                {new Date(enquiry.created_at).toLocaleString()}
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  {enquiry.name || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {enquiry.email || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  {enquiry.phone || "N/A"}
                </p>
              </div>

              <div className="mt-4 rounded-lg bg-slate-50 p-4">
                <p className="font-semibold">Message:</p>
                <p className="text-gray-700">{enquiry.message || "No message"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}