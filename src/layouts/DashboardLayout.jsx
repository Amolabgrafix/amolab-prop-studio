import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

function SidebarContent({ role, userLinks, sellerLinks, adminLinks, linkClass, setMobileOpen }) {
  return (
    <>
      <div className="p-6">
        <div className="rounded-[2rem] bg-white/10 p-5 backdrop-blur">
          <h1 className="text-2xl font-black text-white">Amolab Prop</h1>
          <p className="mt-1 text-xs font-semibold text-purple-200">
            Premium Property Studio
          </p>

          <div className="mt-4 rounded-2xl bg-purple-500/20 px-4 py-3 text-sm font-bold capitalize text-purple-100">
            Role: {role}
          </div>
        </div>
      </div>

      <nav className="space-y-6 px-4 pb-8">
        <div>
          <p className="mb-3 px-4 text-xs font-black uppercase tracking-[0.25em] text-slate-500">
            Main
          </p>

          <div className="space-y-2">
            {userLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={linkClass(item.to)}
              >
                <span>
                  {item.icon} {item.label}
                </span>

                {item.badge > 0 && (
                  <span className="rounded-full bg-purple-600 px-2 py-0.5 text-xs font-black text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 px-4 text-xs font-black uppercase tracking-[0.25em] text-slate-500">
            Seller Tools
          </p>

          <div className="space-y-2">
            {sellerLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={linkClass(item.to)}
              >
                <span>
                  {item.icon} {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {role === "admin" && (
          <div>
            <p className="mb-3 px-4 text-xs font-black uppercase tracking-[0.25em] text-slate-500">
              Admin Tools
            </p>

            <div className="space-y-2">
              {adminLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={linkClass(item.to)}
                >
                  <span>
                    {item.icon} {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState("seller");
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let notificationsChannel;

    async function fetchUnread(userId) {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (isMounted) setUnreadCount(count || 0);
    }

    async function start() {
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
      await fetchUnread(user.id);
      setLoading(false);

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
            await fetchUnread(user.id);
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

  function isActive(path) {
    return location.pathname === path;
  }

  const baseLink =
    "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition";

  function linkClass(path) {
    return `${baseLink} ${
      isActive(path)
        ? "bg-white text-purple-700 shadow-lg shadow-purple-950/20"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;
  }

  const userLinks = [
    { to: "/dashboard", label: "Dashboard Home", icon: "🏠" },
    { to: "/dashboard/notifications", label: "Notifications", icon: "🔔", badge: unreadCount },
    { to: "/dashboard/property-alerts", label: "Property Alerts", icon: "🚨" },
    { to: "/dashboard/favorites", label: "My Favorites", icon: "❤️" },
    { to: "/dashboard/recently-viewed", label: "Recently Viewed", icon: "👁" },
  ];

  const sellerLinks = [
    { to: "/dashboard/seller", label: "Seller Dashboard", icon: "📊" },
    { to: "/dashboard/seller/properties", label: "My Properties", icon: "🏘" },
    { to: "/dashboard/seller/add-property", label: "Add Property", icon: "➕" },
    { to: "/dashboard/seller/verification", label: "Verification", icon: "🛡" },
    { to: "/dashboard/seller/enquiries", label: "My Enquiries", icon: "💬" },
    { to: "/dashboard/seller/payments", label: "Payment History", icon: "💳" },
    { to: "/dashboard/seller/inspections", label: "Inspection Requests", icon: "📅" },
  ];

  const adminLinks = [
    { to: "/dashboard/admin", label: "Admin Dashboard", icon: "⚙️" },
    { to: "/dashboard/admin/users", label: "Users", icon: "👥" },
    { to: "/dashboard/admin/properties", label: "Properties", icon: "🏢" },
    { to: "/dashboard/admin/verifications", label: "Verifications", icon: "✅" },
    { to: "/dashboard/admin/design-requests", label: "Design Requests", icon: "🎨" },
    { to: "/dashboard/admin/payments", label: "Payments", icon: "💰" },
    { to: "/dashboard/admin/enquiries", label: "Enquiries", icon: "📩" },
    { to: "/dashboard/admin/revenue", label: "Revenue", icon: "📈" },
    { to: "/dashboard/admin/inspections", label: "Inspections", icon: "📅" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-[2rem] bg-white p-8 text-center shadow-xl">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-700" />
          <p className="mt-4 font-black text-purple-700">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 overflow-y-auto bg-slate-950 text-white md:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.25),transparent_35%)]" />
        <div className="relative z-10">
          <SidebarContent
            role={role}
            userLinks={userLinks}
            sellerLinks={sellerLinks}
            adminLinks={adminLinks}
            linkClass={linkClass}
            setMobileOpen={setMobileOpen}
          />
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/50"
          />

          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            className="relative h-full w-80 overflow-y-auto bg-slate-950 text-white"
          >
            <SidebarContent
              role={role}
              userLinks={userLinks}
              sellerLinks={sellerLinks}
              adminLinks={adminLinks}
              linkClass={linkClass}
              setMobileOpen={setMobileOpen}
            />
          </motion.aside>
        </div>
      )}

      <main className="flex-1 md:ml-72">
        <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 px-4 py-4 backdrop-blur-xl md:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-xl bg-slate-900 px-4 py-2 font-black text-white md:hidden"
              >
                ☰
              </button>

              <div>
                <h1 className="text-xl font-black text-slate-900">
                  Dashboard
                </h1>
                <p className="text-sm text-slate-500">
                  Manage properties, enquiries, payments and tools.
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-2xl bg-purple-700 px-5 py-3 font-black text-white shadow-lg shadow-purple-200 hover:bg-purple-800"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}