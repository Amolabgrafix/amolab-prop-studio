import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [seller, setSeller] = useState(null);
  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState("");
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
      const { data: propertyData, error: propertyError } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (!propertyError && propertyData) {
        const newViews = Number(propertyData.views || 0) + 1;

        await supabase
          .from("properties")
          .update({ views: newViews })
          .eq("id", id);

        setProperty({
          ...propertyData,
          views: newViews,
        });

        const ownerId = propertyData.owner_id || propertyData.user_id;

        if (ownerId) {
          const { data: sellerData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", ownerId)
            .maybeSingle();

          setSeller(sellerData || null);
        }

        const { data: imageData } = await supabase
          .from("property_images")
          .select("*")
          .eq("property_id", id)
          .order("created_at", { ascending: true });

        const gallery = imageData?.length
          ? imageData.map((img) => img.image_url)
          : propertyData.image_url
          ? [propertyData.image_url]
          : [];

        setImages(gallery);
        setMainImage(gallery[0] || "");
      }

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

  function cleanWhatsAppNumber(number) {
    if (!number) return "";
    return number.replace(/\D/g, "");
  }

  const whatsappNumber = cleanWhatsAppNumber(seller?.whatsapp);

  const whatsappMessage = encodeURIComponent(
    `Hello, I am interested in this property: ${property?.title || ""}`
  );

  if (loading) return <p className="p-10">Loading...</p>;
  if (!property) return <p className="p-10">Property not found.</p>;

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow">
          {mainImage ? (
            <img
              src={mainImage}
              alt={property.title}
              className="h-96 w-full object-cover"
            />
          ) : (
            <div className="flex h-96 w-full items-center justify-center bg-gray-200">
              No Image Available
            </div>
          )}

          {images.length > 1 && (
            <div className="grid grid-cols-3 gap-3 p-4 md:grid-cols-6">
              {images.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setMainImage(img)}
                  className={`overflow-hidden rounded-xl border ${
                    mainImage === img
                      ? "border-purple-700"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Property ${index + 1}`}
                    className="h-24 w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="grid gap-8 p-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold capitalize text-purple-700">
                  {property.type || property.property_type || "property"}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                  👁 {property.views || 0} views
                </span>

                {property.is_featured && (
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                    ⭐ Featured
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-bold text-slate-900">
                {property.title}
              </h1>

              <p className="mt-2 text-slate-600">
                {property.location || property.city || "No location"}
              </p>

              <p className="mt-4 text-3xl font-bold text-purple-700">
                ₦{Number(property.price || 0).toLocaleString()}
              </p>

              <div className="mt-6 border-t pt-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Description
                </h2>

                <p className="mt-3 leading-7 text-slate-700">
                  {property.description}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {seller && (
                <div className="rounded-2xl border bg-slate-50 p-5">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Seller Information
                  </h2>

                  <p className="mt-3 text-slate-700">
                    <strong>Name:</strong>{" "}
                    {seller.agency_name || "Property Owner"}
                  </p>

                  {seller.phone && (
                    <a
                      href={`tel:${seller.phone}`}
                      className="mt-4 block rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white hover:bg-blue-700"
                    >
                      📞 Call Seller
                    </a>
                  )}

                  {whatsappNumber && (
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 block rounded-lg bg-green-600 px-4 py-3 text-center font-semibold text-white hover:bg-green-700"
                    >
                      💬 Chat on WhatsApp
                    </a>
                  )}
                </div>
              )}

              <div className="rounded-2xl border bg-slate-50 p-5">
                <h2 className="mb-4 text-2xl font-bold text-slate-900">
                  Send Enquiry
                </h2>

                {sent && (
                  <div className="mb-4 rounded bg-blue-100 p-3 text-blue-700">
                    {sent}
                  </div>
                )}

                <form onSubmit={submitEnquiry} className="space-y-4">
                  <input
                    name="name"
                    value={enquiry.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full rounded border p-3"
                    required
                  />

                  <input
                    name="email"
                    value={enquiry.email}
                    onChange={handleChange}
                    placeholder="Your email"
                    type="email"
                    className="w-full rounded border p-3"
                    required
                  />

                  <input
                    name="phone"
                    value={enquiry.phone}
                    onChange={handleChange}
                    placeholder="Your phone number"
                    className="w-full rounded border p-3"
                    required
                  />

                  <textarea
                    name="message"
                    value={enquiry.message}
                    onChange={handleChange}
                    placeholder="Your message"
                    className="h-32 w-full rounded border p-3"
                    required
                  />

                  <button className="w-full rounded bg-black px-6 py-3 font-semibold text-white hover:bg-slate-800">
                    Send Enquiry
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}