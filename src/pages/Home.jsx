import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [boostedProperties, setBoostedProperties] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [trendingProperties, setTrendingProperties] = useState([]);

  const [stats, setStats] = useState({
    properties: 0,
    sellers: 0,
    enquiries: 0,
    featured: 0,
  });

  async function loadBoostedProperties() {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("status", "approved")
      .eq("is_boosted", true)
      .order("created_at", { ascending: false })
      .limit(3);

    if (!error) setBoostedProperties(data || []);
  }

  async function loadFeaturedProperties() {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("status", "approved")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(3);

    if (!error) setFeaturedProperties(data || []);
  }

  async function loadTrendingProperties() {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("status", "approved")
      .gt("views", 0)
      .order("views", { ascending: false })
      .limit(3);

    if (!error) setTrendingProperties(data || []);
  }

  async function loadStats() {
    const [propertiesResult, sellersResult, enquiriesResult, featuredResult] =
      await Promise.all([
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("status", "approved"),

        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "seller"),

        supabase.from("enquiries").select("id", { count: "exact", head: true }),

        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("status", "approved")
          .eq("is_featured", true),
      ]);

    setStats({
      properties: propertiesResult.count || 0,
      sellers: sellersResult.count || 0,
      enquiries: enquiriesResult.count || 0,
      featured: featuredResult.count || 0,
    });
  }

  useEffect(() => {
    async function fetchHomeData() {
      await Promise.all([
        loadBoostedProperties(),
        loadFeaturedProperties(),
        loadTrendingProperties(),
        loadStats(),
      ]);
    }

    fetchHomeData();
  }, []);

  function PropertyCard({ property }) {
    return (
      <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
        {property.image_url ? (
          <img
            src={property.image_url}
            alt={property.title}
            className="h-56 w-full object-cover"
          />
        ) : (
          <div className="flex h-56 items-center justify-center bg-gray-300">
            No Image
          </div>
        )}

        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {property.is_boosted && (
              <span className="rounded-full bg-purple-700 px-3 py-1 text-sm font-semibold text-white">
                🚀 Boosted
              </span>
            )}

            {property.is_featured && (
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                ⭐ Featured
              </span>
            )}

            <span className="rounded-full bg-purple-100 px-3 py-1 text-sm capitalize text-purple-700">
              {property.type || property.property_type || "property"}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
              👁 {property.views || 0} views
            </span>
          </div>

          <h3 className="mt-4 text-xl font-bold">{property.title}</h3>

          <p className="mt-2 text-gray-600">
            {property.location || property.city || property.state || "No location"}
          </p>

          <p className="mt-4 text-2xl font-bold text-purple-700">
            ₦{Number(property.price || 0).toLocaleString()}
          </p>

          <Link
            to={`/properties/${property.id}`}
            className="mt-5 block rounded-xl bg-purple-700 px-5 py-3 text-center font-semibold text-white hover:bg-purple-800"
          >
            View Property
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        <section className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-bold leading-tight md:text-7xl">
                Find, Buy, Sell & Rent Properties
              </h1>

              <p className="mt-6 text-lg text-gray-200 md:text-xl">
                Amolab Prop Studio connects buyers, sellers, agents and tenants
                through a modern real estate platform built for speed,
                transparency and trust.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/properties"
                  className="rounded-xl bg-white px-6 py-4 font-semibold text-purple-700"
                >
                  Browse Properties
                </Link>

                <Link
                  to="/dashboard/seller/add-property"
                  className="rounded-xl border border-white px-6 py-4 font-semibold text-white"
                >
                  List Property
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-bold">Platform Stats</h2>
              <p className="mt-3 text-gray-600">
                Snapshot of Amolab Prop Studio activity and performance.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Approved Properties", value: stats.properties },
                { label: "Trusted Sellers", value: stats.sellers },
                { label: "Enquiries", value: stats.enquiries },
                { label: "Featured", value: stats.featured },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl bg-slate-50 p-8 text-center shadow-sm"
                >
                  <p className="text-4xl font-bold text-purple-700">
                    {item.value.toLocaleString()}+
                  </p>
                  <p className="mt-2 text-sm text-gray-600">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-purple-950 py-20 text-white">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-bold">🚀 Boosted Properties</h2>
              <p className="mt-3 text-purple-200">
                Premium promoted listings getting extra visibility.
              </p>
            </div>

            {boostedProperties.length === 0 ? (
              <div className="rounded-2xl bg-white/10 p-8 text-center shadow">
                <p className="text-purple-100">No boosted properties yet.</p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-3">
                {boostedProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="bg-slate-100 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-bold">Trending Properties</h2>
              <p className="mt-3 text-gray-600">
                Most viewed approved properties on Amolab Prop Studio.
              </p>
            </div>

            {trendingProperties.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center shadow">
                <p className="text-gray-600">
                  No trending properties yet. Open property details pages to
                  increase views.
                </p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-3">
                {trendingProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-bold">Featured Properties</h2>
              <p className="mt-3 text-gray-600">
                Handpicked approved properties from Amolab Prop Studio.
              </p>
            </div>

            {featuredProperties.length === 0 ? (
              <div className="rounded-2xl bg-slate-100 p-8 text-center shadow">
                <p className="text-gray-600">
                  No featured properties available yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-3">
                {featuredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}

            <div className="mt-10 text-center">
              <Link
                to="/properties"
                className="inline-block rounded-xl bg-slate-900 px-7 py-4 font-semibold text-white hover:bg-black"
              >
                View All Properties
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-purple-700 py-20 text-white">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-4xl font-bold">
              Ready To Find Your Next Property?
            </h2>

            <p className="mt-4 text-lg text-purple-100">
              Join buyers, sellers, agents and tenants using Amolab Prop Studio.
            </p>

            <Link
              to="/register"
              className="mt-8 inline-block rounded-xl bg-white px-8 py-4 font-semibold text-purple-700"
            >
              Get Started Today
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}