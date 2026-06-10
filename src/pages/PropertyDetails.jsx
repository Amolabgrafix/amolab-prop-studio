import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function PropertyDetails() {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function loadProperty() {
      setLoading(true);

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        alert("Failed to load property");
      } else {
        setProperty(data);
      }

      setLoading(false);
    }

    loadProperty();
  }, [id]);

  async function submitEnquiry(e) {
    e.preventDefault();
    setSending(true);

    const { error } = await supabase.from("enquiries").insert([
      {
        property_id: property.id,
        seller_id: property.user_id,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_phone: buyerPhone,
        message,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Failed to send enquiry");
    } else {
      alert("Enquiry sent successfully");

      setBuyerName("");
      setBuyerEmail("");
      setBuyerPhone("");
      setMessage("");
    }

    setSending(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">Loading property...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">Property not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <img
          src={
            property.image_url ||
            "https://via.placeholder.com/1000x600?text=No+Image"
          }
          alt={property.title}
          className="w-full h-[450px] object-cover rounded-xl shadow"
        />

        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
            <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm capitalize mb-4">
              {property.type}
            </span>

            <h1 className="text-3xl font-bold text-gray-900">
              {property.title}
            </h1>

            <p className="text-gray-600 mt-3">{property.location}</p>

            <p className="text-blue-700 font-bold text-2xl mt-4">
              ₦{Number(property.price).toLocaleString()}
            </p>

            <div className="mt-6">
              <h2 className="text-xl font-bold mb-2">Description</h2>
              <p className="text-gray-700 leading-7">{property.description}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow h-fit">
            <h2 className="text-xl font-bold mb-4">Send Enquiry</h2>

            <form onSubmit={submitEnquiry} className="space-y-4">
              <input
                type="text"
                placeholder="Your name"
                className="w-full border p-3 rounded"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder="Your email"
                className="w-full border p-3 rounded"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Your phone number"
                className="w-full border p-3 rounded"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                required
              />

              <textarea
                placeholder="Message"
                className="w-full border p-3 rounded h-32"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-blue-700 text-white py-3 rounded font-semibold hover:bg-blue-800"
              >
                {sending ? "Sending..." : "Send Enquiry"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}