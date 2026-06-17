import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../../services/dashboard";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    properties: 0,
    approvedProperties: 0,
    pendingProperties: 0,
    rejectedProperties: 0,
    featuredProperties: 0,
    enquiries: 0,
    payments: 0,
  });

  useEffect(() => {
    async function loadStats() {
      const data = await getDashboardStats();
      setStats(data);
    }

    loadStats();
  }, []);

  const cards = [
    {
      title: "Users",
      value: stats.users,
      color: "text-purple-700",
    },
    {
      title: "Properties",
      value: stats.properties,
      color: "text-blue-700",
    },
    {
      title: "Approved",
      value: stats.approvedProperties,
      color: "text-green-700",
    },
    {
      title: "Pending",
      value: stats.pendingProperties,
      color: "text-yellow-600",
    },
    {
      title: "Rejected",
      value: stats.rejectedProperties,
      color: "text-red-600",
    },
    {
      title: "Featured",
      value: stats.featuredProperties,
      color: "text-orange-600",
    },
    {
      title: "Enquiries",
      value: stats.enquiries,
      color: "text-indigo-700",
    },
    {
      title: "Payments",
      value: stats.payments,
      color: "text-pink-700",
    },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800">
        Admin Dashboard
      </h2>

      <p className="mt-2 text-slate-500">
        Platform overview and analytics.
      </p>

      {/* Statistics */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl bg-white p-6 shadow"
          >
            <p className="text-slate-500">{card.title}</p>

            <h3 className={`mt-2 text-4xl font-bold ${card.color}`}>
              {card.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Admin Tools */}
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        <Link
          to="/dashboard/admin/users"
          className="rounded-2xl bg-white p-6 shadow hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold text-slate-900">
            Manage Users
          </h3>
          <p className="mt-2 text-slate-600">
            View and manage all platform users.
          </p>
        </Link>

        <Link
          to="/dashboard/admin/properties"
          className="rounded-2xl bg-white p-6 shadow hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold text-slate-900">
            Manage Properties
          </h3>
          <p className="mt-2 text-slate-600">
            Approve, reject and feature property listings.
          </p>
        </Link>

        <Link
          to="/dashboard/admin/verifications"
          className="rounded-2xl bg-white p-6 shadow hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold text-slate-900">
            Verifications
          </h3>
          <p className="mt-2 text-slate-600">
            Review seller verification requests.
          </p>
        </Link>

        <Link
          to="/dashboard/admin/enquiries"
          className="rounded-2xl bg-white p-6 shadow hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold text-slate-900">
            Enquiries
          </h3>
          <p className="mt-2 text-slate-600">
            View all buyer and tenant enquiries.
          </p>
        </Link>

        <Link
          to="/dashboard/admin/payments"
          className="rounded-2xl bg-white p-6 shadow hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold text-slate-900">
            Payments
          </h3>
          <p className="mt-2 text-slate-600">
            Monitor all payment transactions.
          </p>
        </Link>

        <Link
          to="/dashboard/admin/revenue"
          className="rounded-2xl bg-white p-6 shadow hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold text-slate-900">
            Revenue Dashboard
          </h3>
          <p className="mt-2 text-slate-600">
            Track revenue, subscriptions and earnings.
          </p>
        </Link>

        <Link
          to="/dashboard/admin/design-requests"
          className="rounded-2xl bg-white p-6 shadow hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold text-slate-900">
            Design Requests
          </h3>
          <p className="mt-2 text-slate-600">
            Review submitted design requests.
          </p>
        </Link>

        <Link
          to="/dashboard/admin/analytics"
          className="rounded-2xl bg-purple-700 p-6 text-white shadow hover:bg-purple-800 transition"
        >
          <h3 className="text-xl font-bold">
            Platform Analytics
          </h3>
          <p className="mt-2 text-purple-100">
            Monitor growth, views, enquiries and top properties.
          </p>
        </Link>

      </div>
    </div>
  );
}