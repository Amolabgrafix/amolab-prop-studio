import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [featuredProperties, setFeaturedProperties] = useState([]);

  useEffect(() => {
    async function loadFeaturedProperties() {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "approved")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (!error) {
        setFeaturedProperties(data || []);
      }
    }

    loadFeaturedProperties();
  }, []);

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

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
              <div>
                <h2 className="text-4xl font-bold text-purple-700">500+</h2>
                <p className="mt-2 text-gray-600">Properties</p>
              </div>

              <div>
                <h2 className="text-4xl font-bold text-purple-700">120+</h2>
                <p className="mt-2 text-gray-600">Agents</p>
              </div>

              <div>
                <h2 className="text-4xl font-bold text-purple-700">5K+</h2>
                <p className="mt-2 text-gray-600">Customers</p>
              </div>

              <div>
                <h2 className="text-4xl font-bold text-purple-700">98%</h2>
                <p className="mt-2 text-gray-600">Satisfaction</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-100 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-bold">Featured Properties</h2>
              <p className="mt-3 text-gray-600">
                Hand-picked approved listings from Amolab Prop Studio.
              </p>
            </div>

            {featuredProperties.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center shadow">
                <p className="text-gray-600">
                  No featured properties yet. Feature approved properties from
                  the admin dashboard.
                </p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-3">
                {featuredProperties.map((property) => (
                  <div
                    key={property.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-lg"
                  >
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
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-sm capitalize text-purple-700">
                        {property.type || "property"}
                      </span>

                      <h3 className="mt-4 text-xl font-bold">
                        {property.title}
                      </h3>

                      <p className="mt-2 text-gray-600">
                        {property.location || property.city}
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
              Join thousands of buyers, sellers, agents and tenants using
              Amolab Prop Studio.
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