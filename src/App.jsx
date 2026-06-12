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
import AdminDesignRequests from "./dashboard/admin/AdminDesignRequests";
import AdminPayments from "./dashboard/admin/AdminPayments";

import AddProperty from "./dashboard/seller/AddProperty";
import SellerDashboard from "./dashboard/seller/SellerDashboard";
import SellerProperties from "./dashboard/seller/SellerProperties";
import SellerVerification from "./dashboard/seller/SellerVerification";
import SellerEnquiries from "./dashboard/seller/SellerEnquiries";

import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import DashboardHome from "./dashboard/DashboardHome";

import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import Favorites from "./dashboard/Favorites";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public Properties */}
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />

        {/* General Dashboard */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="favorites" element={<Favorites />} />

          {/* Seller Pages */}
          <Route path="seller" element={<SellerDashboard />} />
          <Route path="seller/properties" element={<SellerProperties />} />
          <Route path="seller/add-property" element={<AddProperty />} />
          <Route path="seller/verification" element={<SellerVerification />} />
          <Route path="seller/enquiries" element={<SellerEnquiries />} />

          {/* Admin Pages */}
          <Route
            path="admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="admin/users"
            element={
              <ProtectedAdminRoute>
                <AdminUsers />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="admin/properties"
            element={
              <ProtectedAdminRoute>
                <AdminProperties />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="admin/verifications"
            element={
              <ProtectedAdminRoute>
                <AdminVerifications />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="admin/enquiries"
            element={
              <ProtectedAdminRoute>
                <AdminEnquiries />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="admin/payments"
            element={
              <ProtectedAdminRoute>
                <AdminPayments />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="admin/design-requests"
            element={
              <ProtectedAdminRoute>
                <AdminDesignRequests />
              </ProtectedAdminRoute>
            }
          />
        </Route>

        {/* Old routes redirect safety can be added later */}

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