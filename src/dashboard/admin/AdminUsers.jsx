import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

function getStatusClass(status) {
  const clean = String(status || "pending").toLowerCase();

  if (clean === "approved") return "bg-green-100 text-green-700";
  if (clean === "rejected") return "bg-red-100 text-red-700";
  if (clean === "suspended") return "bg-slate-200 text-slate-700";
  if (clean === "pending") return "bg-yellow-100 text-yellow-700";

  return "bg-purple-100 text-purple-700";
}

function getRoleClass(role) {
  const clean = String(role || "user").toLowerCase();

  if (clean === "admin") return "bg-red-100 text-red-700";
  if (clean === "seller") return "bg-purple-100 text-purple-700";

  return "bg-blue-100 text-blue-700";
}

function SkeletonRow() {
  return (
    <tr className="border-t">
      <td className="p-4">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
      </td>
      <td className="p-4">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
      </td>
      <td className="p-4">
        <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
      </td>
      <td className="p-4">
        <div className="h-7 w-20 animate-pulse rounded-full bg-slate-200" />
      </td>
      <td className="p-4">
        <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200" />
      </td>
      <td className="p-4">
        <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200" />
      </td>
      <td className="p-4">
        <div className="h-9 w-48 animate-pulse rounded bg-slate-200" />
      </td>
    </tr>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  async function loadUsers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setUsers([]);
    } else {
      setUsers(data || []);
    }

    setLoading(false);
  }

  async function updateUserStatus(userId, status) {
    setUpdatingId(userId);

    const { error } = await supabase
      .from("profiles")
      .update({
        status: status,
        access_granted: status === "approved",
      })
      .eq("id", userId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`User ${status} successfully`);
      await loadUsers();
    }

    setUpdatingId(null);
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!mounted) return;
      await loadUsers();
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    return {
      total: users.length,
      approved: users.filter((user) => user.status === "approved").length,
      pending: users.filter((user) => user.status === "pending").length,
      suspended: users.filter((user) => user.status === "suspended").length,
      sellers: users.filter((user) => user.role === "seller").length,
      admins: users.filter((user) => user.role === "admin").length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        String(user.username || "").toLowerCase().includes(term) ||
        String(user.full_name || user.fullname || "").toLowerCase().includes(term) ||
        String(user.email || "").toLowerCase().includes(term) ||
        String(user.role || "").toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" || String(user.status || "") === statusFilter;

      const matchesRole =
        roleFilter === "all" || String(user.role || "") === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, statusFilter, roleFilter]);

  return (
    <div className="min-h-screen">
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="relative overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-slate-950 via-purple-900 to-indigo-900 p-8 text-white shadow-2xl"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-8 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative z-10">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-purple-200">
            Admin User Management
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
            Users
          </h1>

          <p className="mt-3 max-w-2xl text-purple-100">
            Manage registered users, approval status, access control and platform roles.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-2xl bg-white/10 px-5 py-3 font-bold backdrop-blur">
              👥 {loading ? "..." : stats.total} Total Users
            </span>

            <span className="rounded-2xl bg-white/10 px-5 py-3 font-bold backdrop-blur">
              ✅ {loading ? "..." : stats.approved} Approved
            </span>

            <span className="rounded-2xl bg-white/10 px-5 py-3 font-bold backdrop-blur">
              🏠 {loading ? "..." : stats.sellers} Sellers
            </span>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-6"
      >
        {[
          { label: "Total", value: stats.total, icon: "👥" },
          { label: "Approved", value: stats.approved, icon: "✅" },
          { label: "Pending", value: stats.pending, icon: "⏳" },
          { label: "Suspended", value: stats.suspended, icon: "🚫" },
          { label: "Sellers", value: stats.sellers, icon: "🏠" },
          { label: "Admins", value: stats.admins, icon: "🛡️" },
        ].map((item) => (
          <motion.div
            key={item.label}
            variants={fadeUp}
            whileHover={{ y: -5 }}
            className="rounded-[2rem] bg-white p-6 shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
              {item.icon}
            </div>

            <p className="mt-5 text-3xl font-black text-slate-950">
              {loading ? "..." : item.value}
            </p>

            <p className="mt-1 text-sm font-bold text-slate-500">
              {item.label}
            </p>
          </motion.div>
        ))}
      </motion.section>

      <section className="mt-8 rounded-[2rem] bg-white p-5 shadow-xl">
        <div className="grid gap-4 md:grid-cols-3">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, email, username or role..."
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-semibold outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-semibold outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-semibold outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-[2rem] bg-white shadow-xl">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-2xl font-black text-slate-900">
            Registered Users
          </h2>

          <p className="mt-1 text-slate-600">
            Showing {loading ? "..." : filteredUsers.length} user(s).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-sm font-black uppercase tracking-wider text-slate-500">
                  Username
                </th>
                <th className="p-4 text-sm font-black uppercase tracking-wider text-slate-500">
                  Full Name
                </th>
                <th className="p-4 text-sm font-black uppercase tracking-wider text-slate-500">
                  Email
                </th>
                <th className="p-4 text-sm font-black uppercase tracking-wider text-slate-500">
                  Role
                </th>
                <th className="p-4 text-sm font-black uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="p-4 text-sm font-black uppercase tracking-wider text-slate-500">
                  Payment
                </th>
                <th className="p-4 text-sm font-black uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td className="p-8 text-center text-slate-500" colSpan="7">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t transition hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">
                      {user.username || "No username"}
                    </td>

                    <td className="p-4 text-slate-700">
                      {user.full_name || user.fullname || "Not available"}
                    </td>

                    <td className="p-4 text-slate-700">
                      {user.email || "Not available"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black capitalize ${getRoleClass(
                          user.role
                        )}`}
                      >
                        {user.role || "user"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black capitalize ${getStatusClass(
                          user.status
                        )}`}
                      >
                        {user.status || "pending"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black capitalize text-slate-700">
                        {user.payment_status || "none"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          disabled={updatingId === user.id}
                          onClick={() => updateUserStatus(user.id, "approved")}
                          className="rounded-xl bg-green-600 px-3 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60"
                        >
                          Approve
                        </button>

                        <button
                          disabled={updatingId === user.id}
                          onClick={() => updateUserStatus(user.id, "rejected")}
                          className="rounded-xl bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          Reject
                        </button>

                        <button
                          disabled={updatingId === user.id}
                          onClick={() => updateUserStatus(user.id, "suspended")}
                          className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-bold text-white hover:bg-slate-900 disabled:opacity-60"
                        >
                          Suspend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}