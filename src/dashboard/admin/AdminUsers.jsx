import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  async function loadUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setUsers(data);
    }
  }

  async function updateUserStatus(userId, status) {
    await supabase
      .from("profiles")
      .update({
        status: status,
        access_granted: status === "approved",
      })
      .eq("id", userId);

    loadUsers();
  }

  useEffect(() => {
  async function fetchUsers() {
    await loadUsers();
  }

  fetchUsers();
}, []);

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800">Users</h2>

      <p className="text-slate-500 mt-2">
        Manage registered users and approval status.
      </p>

      <div className="bg-white rounded-2xl shadow mt-8 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4">Username</th>
              <th className="p-4">Full Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td className="p-4 text-slate-500" colSpan="7">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-4">{user.username}</td>
                  <td className="p-4">{user.full_name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4 capitalize">{user.role}</td>
                  <td className="p-4 capitalize">{user.status}</td>
                  <td className="p-4 capitalize">{user.payment_status}</td>

                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => updateUserStatus(user.id, "approved")}
                      className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => updateUserStatus(user.id, "rejected")}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                    >
                      Reject
                    </button>

                    <button
                      onClick={() => updateUserStatus(user.id, "suspended")}
                      className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm"
                    >
                      Suspend
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}