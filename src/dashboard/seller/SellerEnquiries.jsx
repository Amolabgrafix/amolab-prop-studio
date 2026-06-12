import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function SellerEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  async function fetchSellerEnquiries() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    const { data: properties, error: propertyError } = await supabase
      .from("properties")
      .select("id, title")
      .eq("owner_id", user.id);

    if (propertyError) {
      setMessage(propertyError.message);
      setLoading(false);
      return;
    }

    if (!properties || properties.length === 0) {
      setEnquiries([]);
      setLoading(false);
      return;
    }

    const propertyIds = properties.map((property) => property.id);

    const { data: enquiryData, error: enquiryError } = await supabase
      .from("enquiries")
      .select("*")
      .in("property_id", propertyIds)
      .order("created_at", { ascending: false });

    if (enquiryError) {
      setMessage(enquiryError.message);
      setLoading(false);
      return;
    }

    const merged = enquiryData.map((enquiry) => {
      const property = properties.find((p) => p.id === enquiry.property_id);

      return {
        ...enquiry,
        property_title: property?.title || "Unknown Property",
      };
    });

    setEnquiries(merged);
    setLoading(false);
  }

  useEffect(() => {
    const loadEnquiries = async () => {
      await fetchSellerEnquiries();
    };

    loadEnquiries();
  }, []);

  if (loading) {
    return <div className="p-10">Loading enquiries...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow">
          <h1 className="text-3xl font-bold text-slate-900">
            Seller Enquiries
          </h1>

          <p className="mt-2 text-slate-600">
            View enquiries sent to your listed properties.
          </p>

          <div className="mt-4 rounded-xl bg-purple-100 p-4">
            <p className="font-semibold text-purple-700">
              Total Enquiries: {enquiries.length}
            </p>
          </div>
        </div>

        {message && (
          <div className="mb-5 rounded-xl bg-red-100 p-4 text-red-700">
            {message}
          </div>
        )}

        {enquiries.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center shadow">
            <p className="text-slate-600">No enquiries yet.</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {enquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                className="rounded-2xl bg-white p-6 shadow"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-purple-700">
                    {enquiry.property_title}
                  </h2>

                  <p className="text-sm text-slate-500">
                    Received:{" "}
                    {new Date(enquiry.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-slate-500">Name</p>
                    <p className="font-semibold">{enquiry.name || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-semibold">{enquiry.email || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-semibold">{enquiry.phone || "N/A"}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Message</p>
                  <p className="mt-1 text-slate-700">
                    {enquiry.message || "No message"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}