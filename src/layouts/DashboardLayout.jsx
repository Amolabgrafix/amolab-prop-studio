import { Link, Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-slate-900 text-white hidden md:block">
        <div className="p-6 text-2xl font-bold text-purple-400">
          Amolab Prop
        </div>

        <nav className="px-4 space-y-2">
          <Link to="/admin/dashboard" className="block px-4 py-3 rounded-xl hover:bg-slate-800">
            Dashboard
          </Link>
          <Link to="/admin/users" className="block px-4 py-3 rounded-xl hover:bg-slate-800">
            Users
          </Link>
          <Link to="/admin/properties" className="block px-4 py-3 rounded-xl hover:bg-slate-800">
            Properties
          </Link>
          <Link to="/admin/design-requests" className="block px-4 py-3 rounded-xl hover:bg-slate-800">
            Design Requests
          </Link>
          <Link to="/admin/payments" className="block px-4 py-3 rounded-xl hover:bg-slate-800">
            Payments
          </Link>
        </nav>
      </aside>

      <main className="flex-1">
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
          <button className="bg-purple-700 text-white px-4 py-2 rounded-xl">
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