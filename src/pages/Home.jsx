import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        <section className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Find, Buy, Sell & Rent Properties
              </h1>

              <p className="mt-6 text-lg md:text-xl text-gray-200">
                Amolab Prop Studio connects buyers, sellers, agents and tenants
                through a modern real estate platform built for speed,
                transparency and trust.
              </p>

              <div className="flex gap-4">
              <Link
                to="/properties"
                className="rounded-xl bg-white px-6 py-4 font-semibold text-purple-700"
              >
                Browse Properties
              </Link>

              <Link
                to="/seller/add-property"
                className="rounded-xl border border-white px-6 py-4 font-semibold text-white"
              >
                List Property
              </Link>
            </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <h2 className="text-4xl font-bold text-purple-700">500+</h2>
                <p className="text-gray-600 mt-2">Properties</p>
              </div>

              <div>
                <h2 className="text-4xl font-bold text-purple-700">120+</h2>
                <p className="text-gray-600 mt-2">Agents</p>
              </div>

              <div>
                <h2 className="text-4xl font-bold text-purple-700">5K+</h2>
                <p className="text-gray-600 mt-2">Customers</p>
              </div>

              <div>
                <h2 className="text-4xl font-bold text-purple-700">98%</h2>
                <p className="text-gray-600 mt-2">Satisfaction</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-100 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-12">
              Featured Properties
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="h-56 bg-gray-300"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold">Luxury 4 Bedroom Duplex</h3>
                  <p className="text-gray-600 mt-2">Lekki, Lagos State</p>
                  <p className="text-purple-700 text-2xl font-bold mt-4">
                    ₦120,000,000
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="h-56 bg-gray-300"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold">Modern Apartment</h3>
                  <p className="text-gray-600 mt-2">Ikeja, Lagos State</p>
                  <p className="text-purple-700 text-2xl font-bold mt-4">
                    ₦65,000,000
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="h-56 bg-gray-300"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold">Premium Terrace House</h3>
                  <p className="text-gray-600 mt-2">Ajah, Lagos State</p>
                  <p className="text-purple-700 text-2xl font-bold mt-4">
                    ₦85,000,000
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-purple-700 text-white py-20">
          <div className="max-w-4xl mx-auto text-center px-6">
            <h2 className="text-4xl font-bold">
              Ready To Find Your Next Property?
            </h2>

            <p className="mt-4 text-lg text-purple-100">
              Join thousands of buyers, sellers, agents and tenants using
              Amolab Prop Studio.
            </p>

           <Link
              to="/register"
              className="mt-8 inline-block bg-white text-purple-700 px-8 py-4 rounded-xl font-semibold"
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