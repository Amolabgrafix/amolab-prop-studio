import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [role, setRole] = useState("seller");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchUserRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!isMounted) return;
      setRole(data?.role || "seller");
      setLoading(false);
    }

    fetchUserRole();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-purple-700 font-bold">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-slate-900 text-white hidden md:block">
        <div className="p-6 text-2xl font-bold text-purple-400">
          Amolab Prop
        </div>

        <nav className="px-4 space-y-2">
          <Link
            to="/dashboard"
            className="block px-4 py-3 rounded-xl hover:bg-slate-800"
          >
            Dashboard Home
          </Link>
          <Link
              to="/dashboard/favorites"
              className="block px-4 py-3 rounded-xl hover:bg-slate-800"
            >
              My Favorites
            </Link>

          {/* Seller Links */}
          <Link
            to="/dashboard/seller"
            className="block px-4 py-3 rounded-xl hover:bg-slate-800"
          >
            Seller Dashboard
          </Link>

          <Link
            to="/dashboard/seller/properties"
            className="block px-4 py-3 rounded-xl hover:bg-slate-800"
          >
            My Properties
          </Link>

          <Link
            to="/dashboard/seller/add-property"
            className="block px-4 py-3 rounded-xl hover:bg-slate-800"
          >
            Add Property
          </Link>

          <Link
            to="/dashboard/seller/verification"
            className="block px-4 py-3 rounded-xl hover:bg-slate-800"
          >
            Verification
          </Link>

          <Link
            to="/dashboard/seller/enquiries"
            className="block px-4 py-3 rounded-xl hover:bg-slate-800"
          >
            My Enquiries
          </Link>

          {/* Admin Links */}
          {role === "admin" && (
            <>
              <div className="pt-4 text-xs uppercase text-slate-400 px-4">
                Admin Tools
              </div>

              <Link
                to="/dashboard/admin"
                className="block px-4 py-3 rounded-xl hover:bg-slate-800"
              >
                Admin Dashboard
              </Link>

              <Link
                to="/dashboard/admin/users"
                className="block px-4 py-3 rounded-xl hover:bg-slate-800"
              >
                Users
              </Link>

              <Link
                to="/dashboard/admin/properties"
                className="block px-4 py-3 rounded-xl hover:bg-slate-800"
              >
                Properties
              </Link>

              <Link
                to="/dashboard/admin/verifications"
                className="block px-4 py-3 rounded-xl hover:bg-slate-800"
              >
                Verifications
              </Link>

              <Link
                to="/dashboard/admin/design-requests"
                className="block px-4 py-3 rounded-xl hover:bg-slate-800"
              >
                Design Requests
              </Link>

              <Link
                to="/dashboard/admin/payments"
                className="block px-4 py-3 rounded-xl hover:bg-slate-800"
              >
                Payments
              </Link>

              <Link
                to="/dashboard/admin/enquiries"
                className="block px-4 py-3 rounded-xl hover:bg-slate-800"
              >
                Enquiries
              </Link>
            </>
          )}
        </nav>
      </aside>

      <main className="flex-1">
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>

          <button
            onClick={handleLogout}
            className="bg-purple-700 text-white px-4 py-2 rounded-xl hover:bg-purple-800"
          >
            Logout
          </button>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}