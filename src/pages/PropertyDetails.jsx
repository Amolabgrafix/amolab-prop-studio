import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  const [enquiry, setEnquiry] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [sent, setSent] = useState("");

  useEffect(() => {
    async function fetchProperty() {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setProperty(data);
      setLoading(false);
    }

    fetchProperty();
  }, [id]);

  function handleChange(e) {
    setEnquiry({ ...enquiry, [e.target.name]: e.target.value });
  }

  async function submitEnquiry(e) {
    e.preventDefault();

    const { error } = await supabase.from("enquiries").insert({
      property_id: id,
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone,
      message: enquiry.message,
    });

    if (error) {
      setSent(error.message);
    } else {
      setSent("Enquiry sent successfully.");
      setEnquiry({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    }
  }

  if (loading) return <p className="p-10">Loading...</p>;
  if (!property) return <p className="p-10">Property not found.</p>;

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow overflow-hidden">
        {property.image_url ? (
          <img
            src={property.image_url}
            alt={property.title}
            className="w-full h-96 object-cover"
          />
        ) : (
          <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
            No Image Available
          </div>
        )}

        <div className="p-6">
          <h1 className="text-3xl font-bold">{property.title}</h1>
          <p className="text-gray-600 mt-2">{property.location}</p>
          <p className="text-2xl font-bold mt-4">
            ₦{Number(property.price).toLocaleString()}
          </p>
          <p className="mt-6">{property.description}</p>

          <div className="mt-10 border-t pt-6">
            <h2 className="text-2xl font-bold mb-4">Send Enquiry</h2>

            {sent && (
              <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
                {sent}
              </div>
            )}

            <form onSubmit={submitEnquiry} className="space-y-4">
              <input
                name="name"
                value={enquiry.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full border p-3 rounded"
                required
              />

              <input
                name="email"
                value={enquiry.email}
                onChange={handleChange}
                placeholder="Your email"
                type="email"
                className="w-full border p-3 rounded"
                required
              />

              <input
                name="phone"
                value={enquiry.phone}
                onChange={handleChange}
                placeholder="Your phone number"
                className="w-full border p-3 rounded"
                required
              />

              <textarea
                name="message"
                value={enquiry.message}
                onChange={handleChange}
                placeholder="Your message"
                className="w-full border p-3 rounded h-32"
                required
              />

              <button className="bg-black text-white px-6 py-3 rounded font-semibold">
                Send Enquiry
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}