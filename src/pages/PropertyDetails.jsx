import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import MortgageCalculator from "../components/MortgageCalculator";
import PropertyMap from "../components/PropertyMap";

export default function PropertyDetails() {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [seller, setSeller] = useState(null);
  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [similarProperties, setSimilarProperties] = useState([]);

  const [inspection, setInspection] = useState({
    name: "",
    phone: "",
    inspection_date: "",
  });

  const [inspectionMessage, setInspectionMessage] = useState("");

  const [review, setReview] = useState({
    rating: 5,
    review: "",
  });

  const [reviewMessage, setReviewMessage] = useState("");
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  const [enquiry, setEnquiry] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [sent, setSent] = useState("");

  useEffect(() => {
    async function fetchProperty() {
      setLoading(true);

      const { data: propertyData, error: propertyError } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (propertyError || !propertyData) {
        setProperty(null);
        setLoading(false);
        return;
      }

      const newViews = Number(propertyData.views || 0) + 1;

      await supabase.from("properties").update({ views: newViews }).eq("id", id);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (user) {
        await supabase.from("recently_viewed").upsert(
          {
            user_id: user.id,
            property_id: id,
            viewed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,property_id" }
        );
      }

      setProperty({ ...propertyData, views: newViews });

      if (propertyData.owner_id) {
        const { data: sellerData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", propertyData.owner_id)
          .maybeSingle();

        setSeller(sellerData || null);

        if (sellerData) {
          await loadReviews(sellerData.id);
        }
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

      await loadSimilarProperties(propertyData);

      setLoading(false);
    }

    fetchProperty();
  }, [id]);

  async function loadReviews(sellerId) {
    if (!sellerId) return;

    const { data } = await supabase
      .from("seller_reviews")
      .select("*")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });

    setReviews(data || []);

    if (data?.length) {
      const total = data.reduce((sum, item) => sum + Number(item.rating || 0), 0);
      setAverageRating((total / data.length).toFixed(1));
    } else {
      setAverageRating(0);
    }
  }

  async function loadSimilarProperties(propertyData) {
    const propertyType = propertyData.type || propertyData.property_type;

    let query = supabase
      .from("properties")
      .select("*")
      .neq("id", id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(3);

    if (propertyType) {
      query = query.eq("type", propertyType);
    }

    const { data: similarData } = await query;

    if (similarData?.length) {
      setSimilarProperties(similarData);
      return;
    }

    const { data: fallbackData } = await supabase
      .from("properties")
      .select("*")
      .neq("id", id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(3);

    setSimilarProperties(fallbackData || []);
  }

  function handleChange(e) {
    setEnquiry({ ...enquiry, [e.target.name]: e.target.value });
  }

  function handleInspectionChange(e) {
    setInspection({ ...inspection, [e.target.name]: e.target.value });
  }

  function handleReviewChange(e) {
    setReview({ ...review, [e.target.name]: e.target.value });
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
      setEnquiry({ name: "", email: "", phone: "", message: "" });
    }
  }

  async function submitInspection(e) {
    e.preventDefault();
    setInspectionMessage("");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    const { error } = await supabase.from("property_inspections").insert({
      property_id: id,
      user_id: user?.id || null,
      name: inspection.name,
      phone: inspection.phone,
      inspection_date: inspection.inspection_date,
      status: "pending",
    });

    if (error) {
      setInspectionMessage(error.message);
    } else {
      setInspectionMessage("Inspection request sent successfully.");
      setInspection({ name: "", phone: "", inspection_date: "" });
    }
  }

  async function submitReview(e) {
    e.preventDefault();

    if (!seller) return;

    setReviewMessage("");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    const { error } = await supabase.from("seller_reviews").insert({
      seller_id: seller.id,
      user_id: user?.id || null,
      rating: Number(review.rating),
      review: review.review,
    });

    if (error) {
      setReviewMessage(error.message);
    } else {
      setReviewMessage("Review submitted successfully.");
      setReview({ rating: 5, review: "" });
      await loadReviews(seller.id);
    }
  }

  function cleanWhatsAppNumber(number) {
    if (!number) return "";
    return number.replace(/\D/g, "");
  }

  const whatsappNumber = cleanWhatsAppNumber(seller?.whatsapp || seller?.phone);

  const whatsappMessage = encodeURIComponent(
    `Hello, I am interested in this property: ${property?.title || ""}`
  );

  if (loading) return <p className="p-10">Loading...</p>;
  if (!property) return <p className="p-10">Property not found.</p>;

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="overflow-hidden rounded-3xl bg-white shadow">
          <div className="relative">
            {mainImage ? (
              <img
                src={mainImage}
                alt={property.title}
                className="h-[430px] w-full object-cover"
              />
            ) : (
              <div className="flex h-[430px] w-full items-center justify-center bg-slate-200 text-slate-500">
                No Image Available
              </div>
            )}

            <div className="absolute left-5 top-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold capitalize text-purple-700 shadow">
                {property.type || property.property_type || "Property"}
              </span>

              {property.is_featured && (
                <span className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-900 shadow">
                  ⭐ Featured
                </span>
              )}

              {property.is_boosted && (
                <span className="rounded-full bg-purple-700 px-4 py-2 text-sm font-bold text-white shadow">
                  🚀 Boosted
                </span>
              )}
            </div>
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-3 gap-3 p-4 md:grid-cols-6">
              {images.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setMainImage(img)}
                  className={`overflow-hidden rounded-2xl border-2 transition ${
                    mainImage === img
                      ? "border-purple-700"
                      : "border-transparent hover:border-purple-300"
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
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <main className="space-y-8 lg:col-span-2">
            <section className="rounded-3xl bg-white p-6 shadow">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                  👁 {property.views || 0} views
                </span>

                <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
                  {property.status || "approved"}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">
                {property.title}
              </h1>

              <p className="mt-2 text-lg text-slate-600">
                📍 {property.location || property.city || property.state || "No location"}
              </p>

              <p className="mt-5 text-4xl font-extrabold text-purple-700">
                ₦{Number(property.price || 0).toLocaleString()}
              </p>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow">
              <h2 className="text-2xl font-bold text-slate-900">
                Property Description
              </h2>

              <p className="mt-4 leading-8 text-slate-700">
                {property.description || "No description provided."}
              </p>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow">
              <h2 className="mb-4 text-2xl font-bold text-slate-900">
                Location Map
              </h2>

              <PropertyMap
                latitude={property.latitude}
                longitude={property.longitude}
                title={property.title}
                location={property.location || property.city || property.state}
              />
            </section>
          </main>

          <aside className="space-y-6">
            {seller && (
              <section className="rounded-3xl bg-white p-6 shadow">
                <h2 className="text-2xl font-bold text-slate-900">
                  Seller Information
                </h2>

                <div className="mt-4 rounded-2xl bg-yellow-50 p-4">
                  <p className="text-xl font-bold text-yellow-700">
                    ⭐ {averageRating} / 5
                  </p>
                  <p className="text-sm text-slate-600">
                    {reviews.length} review(s)
                  </p>
                </div>

                <p className="mt-4 text-slate-700">
                  <strong>Name:</strong>{" "}
                  {seller.agency_name ||
                    seller.fullname ||
                    seller.username ||
                    "Property Owner"}
                </p>

                {seller.verification_status === "approved" && (
                  <p className="mt-3 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                    ✅ Verified Agent
                  </p>
                )}

                {seller.phone && (
                  <a
                    href={`tel:${seller.phone}`}
                    className="mt-5 block rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white hover:bg-blue-700"
                  >
                    📞 Call Seller
                  </a>
                )}

                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 block rounded-xl bg-green-600 px-4 py-3 text-center font-semibold text-white hover:bg-green-700"
                  >
                    💬 Chat on WhatsApp
                  </a>
                )}

                <Link
                  to={`/agent/${seller.id}`}
                  className="mt-3 block rounded-xl bg-purple-700 px-4 py-3 text-center font-semibold text-white hover:bg-purple-800"
                >
                  👤 View Agent Profile
                </Link>
              </section>
            )}

            <MortgageCalculator propertyPrice={property.price} />

            <section className="rounded-3xl bg-white p-6 shadow">
              <h2 className="mb-4 text-2xl font-bold text-slate-900">
                Schedule Inspection
              </h2>

              {inspectionMessage && (
                <div className="mb-4 rounded-xl bg-green-100 p-3 text-green-700">
                  {inspectionMessage}
                </div>
              )}

              <form onSubmit={submitInspection} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={inspection.name}
                  onChange={handleInspectionChange}
                  placeholder="Your name"
                  className="w-full rounded-xl border p-3"
                  required
                />

                <input
                  type="text"
                  name="phone"
                  value={inspection.phone}
                  onChange={handleInspectionChange}
                  placeholder="Your phone number"
                  className="w-full rounded-xl border p-3"
                  required
                />

                <input
                  type="datetime-local"
                  name="inspection_date"
                  value={inspection.inspection_date}
                  onChange={handleInspectionChange}
                  className="w-full rounded-xl border p-3"
                  required
                />

                <button className="w-full rounded-xl bg-purple-700 px-4 py-3 font-semibold text-white hover:bg-purple-800">
                  Schedule Inspection
                </button>
              </form>
            </section>

            {seller && (
              <section className="rounded-3xl bg-white p-6 shadow">
                <h2 className="mb-4 text-2xl font-bold text-slate-900">
                  Leave Seller Review
                </h2>

                {reviewMessage && (
                  <div className="mb-4 rounded-xl bg-green-100 p-3 text-green-700">
                    {reviewMessage}
                  </div>
                )}

                <form onSubmit={submitReview} className="space-y-4">
                  <select
                    name="rating"
                    value={review.rating}
                    onChange={handleReviewChange}
                    className="w-full rounded-xl border p-3"
                    required
                  >
                    <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                    <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                    <option value="3">⭐⭐⭐ 3 Stars</option>
                    <option value="2">⭐⭐ 2 Stars</option>
                    <option value="1">⭐ 1 Star</option>
                  </select>

                  <textarea
                    name="review"
                    value={review.review}
                    onChange={handleReviewChange}
                    placeholder="Write your review about this seller..."
                    className="h-28 w-full rounded-xl border p-3"
                    required
                  />

                  <button className="w-full rounded-xl bg-yellow-600 px-4 py-3 font-semibold text-white hover:bg-yellow-700">
                    Submit Review
                  </button>
                </form>

                {reviews.length > 0 && (
                  <div className="mt-6 border-t pt-5">
                    <h3 className="mb-3 text-lg font-bold text-slate-900">
                      Recent Reviews
                    </h3>

                    <div className="space-y-3">
                      {reviews.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl bg-slate-50 p-4"
                        >
                          <p className="font-semibold text-yellow-600">
                            {"⭐".repeat(Number(item.rating || 0))}
                          </p>

                          <p className="mt-2 text-sm text-slate-700">
                            {item.review}
                          </p>

                          <p className="mt-2 text-xs text-slate-400">
                            {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            <section className="rounded-3xl bg-white p-6 shadow">
              <h2 className="mb-4 text-2xl font-bold text-slate-900">
                Send Enquiry
              </h2>

              {sent && (
                <div className="mb-4 rounded-xl bg-blue-100 p-3 text-blue-700">
                  {sent}
                </div>
              )}

              <form onSubmit={submitEnquiry} className="space-y-4">
                <input
                  name="name"
                  value={enquiry.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full rounded-xl border p-3"
                  required
                />

                <input
                  name="email"
                  value={enquiry.email}
                  onChange={handleChange}
                  placeholder="Your email"
                  type="email"
                  className="w-full rounded-xl border p-3"
                  required
                />

                <input
                  name="phone"
                  value={enquiry.phone}
                  onChange={handleChange}
                  placeholder="Your phone number"
                  className="w-full rounded-xl border p-3"
                  required
                />

                <textarea
                  name="message"
                  value={enquiry.message}
                  onChange={handleChange}
                  placeholder="Your message"
                  className="h-32 w-full rounded-xl border p-3"
                  required
                />

                <button className="w-full rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800">
                  Send Enquiry
                </button>
              </form>
            </section>
          </aside>
        </div>

        {similarProperties.length > 0 && (
          <section>
            <h2 className="mb-6 text-2xl font-bold text-slate-900">
              ⭐ You May Also Like
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              {similarProperties.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-3xl bg-white shadow"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-52 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-52 w-full items-center justify-center bg-slate-200 text-slate-500">
                      No Image Available
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-slate-600">
                      {item.location || item.city || "No location"}
                    </p>

                    <p className="mt-3 text-2xl font-bold text-purple-700">
                      ₦{Number(item.price || 0).toLocaleString()}
                    </p>

                    <Link
                      to={`/properties/${item.id}`}
                      className="mt-4 block rounded-xl bg-purple-700 px-4 py-3 text-center font-semibold text-white hover:bg-purple-800"
                    >
                      View Property
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}