import { useEffect, useState } from "react";
import { getDashboardStats } from "../../services/dashboard";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    pendingUsers: 0,
    properties: 0,
    payments: 0,
  });

  useEffect(() => {
    async function loadStats() {
      const data = await getDashboardStats();
      setStats(data);
    }

    loadStats();
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800">
        Admin Dashboard
      </h2>

      <p className="text-slate-500 mt-2">
        Manage users, properties, payments and design requests.
      </p>

      <div className="grid md:grid-cols-4 gap-6 mt-8">
        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-slate-500">Total Users</p>
          <h3 className="text-3xl font-bold text-purple-700 mt-2">
            {stats.users}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-slate-500">Pending Users</p>
          <h3 className="text-3xl font-bold text-purple-700 mt-2">
            {stats.pendingUsers}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-slate-500">Properties</p>
          <h3 className="text-3xl font-bold text-purple-700 mt-2">
            {stats.properties}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-slate-500">Payments</p>
          <h3 className="text-3xl font-bold text-purple-700 mt-2">
            {stats.payments}
          </h3>
        </div>
      </div>
    </div>
  );
}