import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function SellerAnalytics() {
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({
    totalViews: 0,
    averageViews: 0,
    totalEnquiries: 0,
    totalProperties: 0,
    boosted: 0,
    featured: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: sellerProperties, error } = await supabase
        .from("properties")
        .select("*, enquiries(id)")
        .eq("owner_id", user.id)
        .order("views", { ascending: false })
        .limit(10);

      if (!error && sellerProperties) {
        const totalViews = sellerProperties.reduce(
          (sum, property) => sum + Number(property.views || 0),
          0
        );

        const totalEnquiries = sellerProperties.reduce(
          (sum, property) => sum + Number(property.enquiries?.length || 0),
          0
        );

        const totalProperties = sellerProperties.length;

        setStats({
          totalViews,
          averageViews: totalProperties
            ? Math.round(totalViews / totalProperties)
            : 0,
          totalEnquiries,
          totalProperties,
          boosted: sellerProperties.filter((p) => p.is_boosted).length,
          featured: sellerProperties.filter((p) => p.is_featured).length,
        });

        setProperties(sellerProperties);
      }

      setLoading(false);
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return <p className="p-6 text-slate-600">Loading analytics...</p>;
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-slate-900">
        Property Analytics
      </h1>

      <p className="mb-8 text-slate-600">
        Track views, enquiries and performance for your uploaded properties.
      </p>

      <div className="mb-8 grid gap-4 md:grid-cols-6">
        <AnalyticsCard title="Total Views" value={stats.totalViews} />
        <AnalyticsCard title="Average Views" value={stats.averageViews} />
        <AnalyticsCard title="Total Enquiries" value={stats.totalEnquiries} />
        <AnalyticsCard title="Properties" value={stats.totalProperties} />
        <AnalyticsCard title="Boosted" value={stats.boosted} />
        <AnalyticsCard title="Featured" value={stats.featured} />
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-1 text-xl font-bold text-slate-900">
          Top Performing Properties
        </h2>

        <p className="mb-4 text-sm text-slate-500">
          Showing your top 10 properties ranked by views.
        </p>

        {properties.length === 0 ? (
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
                  <th className="p-3">Boosted</th>
                  <th className="p-3">Featured</th>
                </tr>
              </thead>

              <tbody>
                {properties.map((property) => (
                  <tr key={property.id} className="border-b">
                    <td className="p-3 font-semibold">{property.title}</td>

                    <td className="p-3 capitalize">{property.status}</td>

                    <td className="p-3">
                      {Number(property.views || 0).toLocaleString()}
                    </td>

                    <td className="p-3">{property.enquiries?.length || 0}</td>

                    <td className="p-3">
                      {property.is_boosted ? "Yes" : "No"}
                    </td>

                    <td className="p-3">
                      {property.is_featured ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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