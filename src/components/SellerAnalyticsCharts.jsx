import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function SellerAnalyticsCharts({
  properties = [],
  enquiries = [],
}) {
  const totalViews = properties.reduce(
    (sum, item) => sum + Number(item.views || 0),
    0
  );

  const approvedCount = properties.filter((p) => p.status === "approved").length;
  const pendingCount = properties.filter((p) => p.status === "pending").length;
  const rejectedCount = properties.filter((p) => p.status === "rejected").length;

  const chartData = properties.slice(0, 6).map((item) => ({
    name: item.title?.slice(0, 12) || "Property",
    views: Number(item.views || 0),
  }));

  const enquiryData = [
    {
      name: "Enquiries",
      value: enquiries.length,
    },
    {
      name: "Properties",
      value: properties.length,
    },
  ];

  const pieData = [
    {
      name: "Approved",
      value: approvedCount,
    },
    {
      name: "Pending",
      value: pendingCount,
    },
    {
      name: "Rejected",
      value: rejectedCount,
    },
  ].filter((item) => item.value > 0);

  const COLORS = ["#16a34a", "#eab308", "#dc2626"];

  const topProperties = [...properties]
    .sort((a, b) => Number(b.views || 0) - Number(a.views || 0))
    .slice(0, 5);

  const averageViews =
    properties.length > 0 ? Math.round(totalViews / properties.length) : 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Total Views</p>
          <h3 className="mt-2 text-3xl font-bold text-purple-700">
            {totalViews}
          </h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Total Enquiries</p>
          <h3 className="mt-2 text-3xl font-bold text-green-600">
            {enquiries.length}
          </h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Properties Listed</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900">
            {properties.length}
          </h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Average Views</p>
          <h3 className="mt-2 text-3xl font-bold text-orange-600">
            {averageViews}
          </h3>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-slate-900">
          Property Views Performance
        </h2>

        {chartData.length === 0 ? (
          <p className="text-slate-500">No property views data yet.</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="views" fill="#7e22ce" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-slate-900">
          Enquiry Summary
        </h2>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={enquiryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#16a34a"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-slate-900">
          Property Status Distribution
        </h2>

        {pieData.length === 0 ? (
          <p className="text-slate-500">No property status data yet.</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={90} label>
                  {pieData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-white p-6 shadow">
        <h2 className="mb-5 text-xl font-bold text-slate-900">
          🏆 Top Performing Properties
        </h2>

        {topProperties.length === 0 ? (
          <p className="text-slate-500">No properties uploaded yet.</p>
        ) : (
          <div className="space-y-4">
            {topProperties.map((property) => (
              <div
                key={property.id}
                className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
              >
                <div>
                  <h3 className="font-bold text-slate-900">
                    {property.title}
                  </h3>

                  <p className="text-sm text-slate-500">
                    ₦{Number(property.price || 0).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-purple-700">
                    {property.views || 0}
                  </p>

                  <p className="text-sm text-slate-500">views</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}