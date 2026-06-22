import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [role, setRole] = useState("seller");
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

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
        const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      setUnreadCount(count || 0);
      setLoading(false);
    }

    let notificationsChannel;

async function start() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    navigate("/login");
    return;
  }

  await fetchUserRole();

  notificationsChannel = supabase
    .channel(`notifications-${user.id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.id}`,
      },
      async () => {
        const { count } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_read", false);

        setUnreadCount(count || 0);
      }
    )
    .subscribe();
}

      start();

      return () => {
        isMounted = false;

        if (notificationsChannel) {
          supabase.removeChannel(notificationsChannel);
        }
      };
  }, [navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  const linkClass = "block px-4 py-3 rounded-xl hover:bg-slate-800";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-purple-700 font-bold">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-slate-900 text-white hidden md:block overflow-y-auto">
        <div className="p-6 text-2xl font-bold text-purple-400">
          Amolab Prop
        </div>

        <nav className="px-4 space-y-2 pb-8">
          <Link to="/dashboard" className={linkClass}>
            Dashboard Home
          </Link>

          <Link
          to="/dashboard/notifications"
          className={`${linkClass} flex items-center justify-between`}
        >
          <span>🔔 Notifications</span>

          {unreadCount > 0 && (
            <span className="rounded-full bg-purple-600 px-2 py-0.5 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Link>

          <Link to="/dashboard/property-alerts" className={linkClass}>
            🔔 Property Alerts
          </Link>

          <Link to="/dashboard/favorites" className={linkClass}>
            My Favorites
          </Link>

          <Link to="/dashboard/recently-viewed" className={linkClass}>
            👁 Recently Viewed
          </Link>

          <div className="pt-4 text-xs uppercase text-slate-400 px-4">
            Seller Tools
          </div>

          <Link to="/dashboard/seller" className={linkClass}>
            Seller Dashboard
          </Link>

          <Link to="/dashboard/seller/properties" className={linkClass}>
            My Properties
          </Link>

          <Link to="/dashboard/seller/add-property" className={linkClass}>
            Add Property
          </Link>

          <Link to="/dashboard/seller/verification" className={linkClass}>
            Verification
          </Link>

          <Link to="/dashboard/seller/enquiries" className={linkClass}>
            My Enquiries
          </Link>

          <Link to="/dashboard/seller/payments" className={linkClass}>
            Payment History
          </Link>

          <Link to="/dashboard/seller/inspections" className={linkClass}>
            📅 Inspection Requests
          </Link>

          {role === "admin" && (
            <>
              <div className="pt-4 text-xs uppercase text-slate-400 px-4">
                Admin Tools
              </div>

              <Link to="/dashboard/admin" className={linkClass}>
                Admin Dashboard
              </Link>

              <Link to="/dashboard/admin/users" className={linkClass}>
                Users
              </Link>

              <Link to="/dashboard/admin/properties" className={linkClass}>
                Properties
              </Link>

              <Link to="/dashboard/admin/verifications" className={linkClass}>
                Verifications
              </Link>

              <Link to="/dashboard/admin/design-requests" className={linkClass}>
                Design Requests
              </Link>

              <Link to="/dashboard/admin/payments" className={linkClass}>
                Payments
              </Link>

              <Link to="/dashboard/admin/enquiries" className={linkClass}>
                Enquiries
              </Link>

              <Link to="/dashboard/admin/revenue" className={linkClass}>
                Revenue
              </Link>

              <Link to="/dashboard/admin/inspections" className={linkClass}>
                📅 Inspections
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