import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AgentProfile() {
  const { id } = useParams();

  const [agent, setAgent] = useState(null);
  const [properties, setProperties] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAgentProfile() {
      setLoading(true);

     const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    console.log("Agent ID from URL:", id);
    console.log("Profile found:", profile);
    console.log("Profile error:", profileError);

      if (profileError) {
        console.error("Agent profile error:", profileError);
        setLoading(false);
        return;
      }

      setAgent(profile);

      const { data: propertyData, error: propertyError } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", id)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (propertyError) {
        console.error("Agent properties error:", propertyError);
      } else {
        setProperties(propertyData || []);
      }

      const { data: reviewData, error: reviewError } = await supabase
        .from("seller_reviews")
        .select("*")
        .eq("seller_id", id)
        .order("created_at", { ascending: false });

      if (reviewError) {
        console.error("Agent reviews error:", reviewError);
      } else {
        setReviews(reviewData || []);
      }

      setLoading(false);
    }

    if (id) loadAgentProfile();
  }, [id]);

  const displayName =
    agent?.agency_name || agent?.fullname || agent?.username || "Property Agent";

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;

    const total = reviews.reduce((sum, item) => {
      return sum + Number(item.rating || 0);
    }, 0);

    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const totalViews = useMemo(() => {
    return properties.reduce((sum, item) => {
      return sum + Number(item.views || 0);
    }, 0);
  }, [properties]);

  const featuredCount = useMemo(() => {
    return properties.filter((item) => item.is_featured).length;
  }, [properties]);

  function cleanPhone(number) {
    if (!number) return "";
    return number.replace(/\D/g, "");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 px-6 py-10">
        <p className="text-center text-slate-600">Loading agent profile...</p>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-slate-100 px-6 py-10">
        <p className="text-center text-red-600">Agent not found.</p>
      </div>
    );
  }

  const whatsappNumber = cleanPhone(agent.whatsapp || agent.phone);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {displayName}
              </h1>

              <p className="mt-2 text-slate-600">
                Trusted property agent on Amolab Prop Studio.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {agent.verification_status === "approved" && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                    ✅ Verified Agent
                  </span>
                )}

                <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold capitalize text-purple-700">
                  {agent.subscription_plan || "free"} plan
                </span>

                <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                  ⭐ {averageRating} / 5
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  {reviews.length} Review(s)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {agent.phone && (
                <a
                  href={`tel:${agent.phone}`}
                  className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
                >
                  📞 Call Agent
                </a>
              )}

              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                >
                  💬 WhatsApp
                </a>
              )}

              {agent.email && (
                <a
                  href={`mailto:${agent.email}`}
                  className="rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white hover:bg-purple-800"
                >
                  ✉️ Email
                </a>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Properties</p>
              <p className="text-2xl font-bold text-slate-900">
                {properties.length}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Total Views</p>
              <p className="text-2xl font-bold text-slate-900">{totalViews}</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Featured Listings</p>
              <p className="text-2xl font-bold text-slate-900">
                {featuredCount}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Status</p>
              <p className="text-2xl font-bold capitalize text-slate-900">
                {agent.verification_status || "unverified"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Email</p>
              <p className="break-all font-semibold text-slate-800">
                {agent.email || "Not available"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Phone</p>
              <p className="font-semibold text-slate-800">
                {agent.phone || "Not available"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Joined</p>
              <p className="font-semibold text-slate-800">
                {agent.created_at
                  ? new Date(agent.created_at).toLocaleDateString()
                  : "Not available"}
              </p>
            </div>
          </div>
        </div>

        <h2 className="mt-10 text-2xl font-bold text-slate-900">
          Properties by {displayName}
        </h2>

        {properties.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-6 text-center shadow">
            <p className="text-slate-600">
              This agent has no approved properties yet.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {properties.map((property) => (
              <div
                key={property.id}
                className="overflow-hidden rounded-2xl bg-white shadow"
              >
                {property.image_url ? (
                  <img
                    src={property.image_url}
                    alt={property.title}
                    className="h-52 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center bg-slate-200 text-slate-500">
                    No Image
                  </div>
                )}

                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900">
                    {property.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {property.location || property.city || property.state}
                  </p>

                  <p className="mt-3 text-xl font-bold text-purple-700">
                    ₦{Number(property.price || 0).toLocaleString()}
                  </p>

                  <Link
                    to={`/properties/${property.id}`}
                    className="mt-4 inline-block rounded-xl bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800"
                  >
                    View Property
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className="mt-10 text-2xl font-bold text-slate-900">
          Customer Reviews
        </h2>

        {reviews.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-6 text-center shadow">
            <p className="text-slate-600">No reviews yet.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {reviews.map((item) => (
              <div key={item.id} className="rounded-2xl bg-white p-5 shadow">
                <p className="text-lg font-bold text-yellow-600">
                  {"⭐".repeat(Number(item.rating || 0))}
                </p>

                <p className="mt-3 leading-7 text-slate-700">{item.review}</p>

                <p className="mt-3 text-sm text-slate-400">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString()
                    : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}