import { Link } from "react-router-dom";

export default function DashboardHome() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-2 text-slate-600">
        Manage your properties, verification, enquiries and admin tools.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Link to="/dashboard/seller" className="rounded-2xl bg-purple-700 p-6 text-white shadow hover:bg-purple-800">
          <h2 className="text-xl font-bold">Seller Dashboard</h2>
          <p className="mt-2 text-purple-100">View your seller overview.</p>
        </Link>

        <Link to="/dashboard/seller/properties" className="rounded-2xl bg-white p-6 shadow hover:shadow-lg">
          <h2 className="text-xl font-bold text-slate-900">My Properties</h2>
          <p className="mt-2 text-slate-600">Manage your uploaded listings.</p>
        </Link>

        <Link to="/dashboard/seller/add-property" className="rounded-2xl bg-white p-6 shadow hover:shadow-lg">
          <h2 className="text-xl font-bold text-slate-900">Add Property</h2>
          <p className="mt-2 text-slate-600">Upload a new property.</p>
        </Link>

        <Link to="/dashboard/seller/verification" className="rounded-2xl bg-white p-6 shadow hover:shadow-lg">
          <h2 className="text-xl font-bold text-slate-900">Verification</h2>
          <p className="mt-2 text-slate-600">Submit or update your NIN.</p>
        </Link>

        <Link to="/dashboard/seller/enquiries" className="rounded-2xl bg-white p-6 shadow hover:shadow-lg">
          <h2 className="text-xl font-bold text-slate-900">My Enquiries</h2>
          <p className="mt-2 text-slate-600">View buyer/tenant messages.</p>
        </Link>

        <Link to="/properties" className="rounded-2xl bg-slate-900 p-6 text-white shadow hover:bg-black">
          <h2 className="text-xl font-bold">Browse Public Properties</h2>
          <p className="mt-2 text-slate-300">See approved public listings.</p>
        </Link>
              <Link
            to="/dashboard/recently-viewed"
            className="rounded-2xl bg-white p-6 shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold">👁 Recently Viewed</h2>
            <p className="mt-2 text-slate-600">
              View properties you recently visited.
            </p>
          </Link>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">Admin Tools</h2>

        <div className="grid gap-6 md:grid-cols-3">
          <Link to="/dashboard/admin" className="rounded-2xl bg-red-600 p-6 text-white shadow hover:bg-red-700">
            <h2 className="text-xl font-bold">Admin Dashboard</h2>
            <p className="mt-2 text-red-100">View admin overview.</p>
          </Link>

          <Link to="/dashboard/admin/users" className="rounded-2xl bg-white p-6 shadow hover:shadow-lg">
            <h2 className="text-xl font-bold text-slate-900">Manage Users</h2>
            <p className="mt-2 text-slate-600">Approve users and access.</p>
          </Link>

          <Link to="/dashboard/admin/properties" className="rounded-2xl bg-white p-6 shadow hover:shadow-lg">
            <h2 className="text-xl font-bold text-slate-900">Manage Properties</h2>
            <p className="mt-2 text-slate-600">Approve or reject property listings.</p>
          </Link>
    
        </div>
      </div>
    </div>
  );
}