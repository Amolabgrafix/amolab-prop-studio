import { useEffect, useState } from "react";
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
    </div>
  );
}