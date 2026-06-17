import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminAnalytics() {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalEnquiries: 0,
    totalProperties: 0,
    approvedProperties: 0,
    boostedProperties: 0,
    featuredProperties: 0,
    totalSellers: 0,
    proSellers: 0,
    agencySellers: 0,
  });

  const [topProperties, setTopProperties] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      setMessage("");

      const { data, error } = await supabase.functions.invoke(
        "admin-analytics-stats"
      );

      if (error || !data?.success) {
        setMessage(
          error?.message || data?.error || "Could not load admin analytics."
        );
        setLoading(false);
        return;
      }

      setStats(data.stats || {});
      setTopProperties(data.topProperties || []);
      setTopSellers(data.topSellers || []);
      setLoading(false);
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return <p className="p-6 text-slate-600">Loading admin analytics...</p>;
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-slate-900">
        Platform Analytics
      </h1>

      <p className="mb-8 text-slate-600">
        Monitor platform performance, views, enquiries, sellers and top
        properties.
      </p>

      {message && (
        <div className="mb-6 rounded-xl bg-red-100 p-4 text-red-700">
          {message}
        </div>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <AnalyticsCard title="Total Views" value={stats.totalViews} />
        <AnalyticsCard title="Total Enquiries" value={stats.totalEnquiries} />
        <AnalyticsCard title="Properties" value={stats.totalProperties} />
        <AnalyticsCard title="Approved" value={stats.approvedProperties} />
        <AnalyticsCard title="Boosted" value={stats.boostedProperties} />
        <AnalyticsCard title="Featured" value={stats.featuredProperties} />
        <AnalyticsCard title="Sellers" value={stats.totalSellers} />
        <AnalyticsCard title="Pro Sellers" value={stats.proSellers} />
        <AnalyticsCard title="Agency Sellers" value={stats.agencySellers} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-1 text-xl font-bold text-slate-900">
            Top Performing Properties
          </h2>

          <p className="mb-4 text-sm text-slate-500">
            Top 10 properties ranked by views.
          </p>

          {topProperties.length === 0 ? (
            <p className="text-slate-500">No properties found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="p-3">Property</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Views</th>
                    <th className="p-3">Enquiries</th>
                  </tr>
                </thead>

                <tbody>
                  {topProperties.map((property) => (
                    <tr key={property.id} className="border-b">
                      <td className="p-3 font-semibold">{property.title}</td>

                      <td className="p-3 capitalize">
                        {property.status || "pending"}
                      </td>

                      <td className="p-3">
                        {Number(property.views || 0).toLocaleString()}
                      </td>

                      <td className="p-3">
                        {property.enquiries?.length || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-1 text-xl font-bold text-slate-900">
            Top Sellers
          </h2>

          <p className="mb-4 text-sm text-slate-500">
            Sellers ranked by total views and enquiries.
          </p>

          {topSellers.length === 0 ? (
            <p className="text-slate-500">No sellers found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="p-3">Seller</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3">Properties</th>
                    <th className="p-3">Views</th>
                    <th className="p-3">Enquiries</th>
                  </tr>
                </thead>

                <tbody>
                  {topSellers.map((seller) => (
                    <tr key={seller.id} className="border-b">
                      <td className="p-3">
                        <p className="font-semibold">{seller.name}</p>
                        <p className="text-xs text-slate-500">
                          {seller.email}
                        </p>
                      </td>

                      <td className="p-3 capitalize">
                        {seller.subscriptionPlan || "free"}
                      </td>

                      <td className="p-3">{seller.properties}</td>

                      <td className="p-3">
                        {Number(seller.views || 0).toLocaleString()}
                      </td>

                      <td className="p-3">{seller.enquiries}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnalyticsCard({ title, value }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className="mt-2 text-3xl font-bold text-purple-700">
        {Number(value || 0).toLocaleString()}
      </h2>
    </div>
  );
}