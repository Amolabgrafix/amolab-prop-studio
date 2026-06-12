import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import DashboardLayout from "./layouts/DashboardLayout";

import AdminDashboard from "./dashboard/admin/AdminDashboard";
import AdminUsers from "./dashboard/admin/AdminUsers";
import AdminProperties from "./dashboard/admin/AdminProperties";
import AdminVerifications from "./dashboard/admin/AdminVerifications";
import AdminEnquiries from "./dashboard/admin/AdminEnquiries";

import AddProperty from "./dashboard/seller/AddProperty";
import SellerDashboard from "./dashboard/seller/SellerDashboard";
import SellerProperties from "./dashboard/seller/SellerProperties";
import SellerVerification from "./dashboard/seller/SellerVerification";
import SellerEnquiries from "./dashboard/seller/SellerEnquiries";

import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import DashboardHome from "./dashboard/DashboardHome";

import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminDesignRequests from "./dashboard/admin/AdminDesignRequests";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route
            path="dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="users"
            element={
              <ProtectedAdminRoute>
                <AdminUsers />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="properties"
            element={
              <ProtectedAdminRoute>
                <AdminProperties />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="verifications"
            element={
              <ProtectedAdminRoute>
                <AdminVerifications />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="enquiries"
            element={
              <ProtectedAdminRoute>
                <AdminEnquiries />
              </ProtectedAdminRoute>
            }
          />
          <Route
          path="design-requests"
          element={
            <ProtectedAdminRoute>
              <AdminDesignRequests />
            </ProtectedAdminRoute>
          }
/>
        </Route>

        {/* Seller Routes */}
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/properties" element={<SellerProperties />} />
        <Route path="/seller/add-property" element={<AddProperty />} />
        <Route path="/seller/verification" element={<SellerVerification />} />
        <Route path="/seller/enquiries" element={<SellerEnquiries />} />

        {/* Properties */}
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />

        {/* User Dashboard */}
        <Route path="/dashboard" element={<DashboardHome />} />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
              <h1 className="text-3xl font-bold text-purple-700">
                Page Not Found
              </h1>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;