import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import PaymentSuccess from "./pages/PaymentSuccess";
import AgentProfile from "./pages/AgentProfile";
import CompareProperties from "./pages/CompareProperties";
import RecentlyViewed from "./pages/RecentlyViewed";

import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./dashboard/DashboardHome";
import Favorites from "./dashboard/Favorites";

import AdminDashboard from "./dashboard/admin/AdminDashboard";
import AdminUsers from "./dashboard/admin/AdminUsers";
import AdminProperties from "./dashboard/admin/AdminProperties";
import AdminVerifications from "./dashboard/admin/AdminVerifications";
import AdminEnquiries from "./dashboard/admin/AdminEnquiries";
import AdminDesignRequests from "./dashboard/admin/AdminDesignRequests";
import AdminPayments from "./dashboard/admin/AdminPayments";
import AdminRevenue from "./dashboard/admin/AdminRevenue";
import AdminAnalytics from "./dashboard/admin/AdminAnalytics";
import AdminInspections from "./dashboard/admin/AdminInspections";

import AddProperty from "./dashboard/seller/AddProperty";
import SellerDashboard from "./dashboard/seller/SellerDashboard";
import SellerProperties from "./dashboard/seller/SellerProperties";
import SellerVerification from "./dashboard/seller/SellerVerification";
import SellerEnquiries from "./dashboard/seller/SellerEnquiries";
import SellerPayments from "./dashboard/seller/SellerPayments";
import SubscriptionPlans from "./dashboard/seller/SubscriptionPlans";
import SellerAnalytics from "./dashboard/seller/SellerAnalytics";
import SellerInspections from "./dashboard/seller/SellerInspections";

import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

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
        <Route path="/agent/:id" element={<AgentProfile />} />
        <Route path="/compare" element={<CompareProperties />} />

        {/* Payment Success Routes */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="recently-viewed" element={<RecentlyViewed />} />

          {/* Seller Pages */}
          <Route path="seller" element={<SellerDashboard />} />
          <Route path="seller/properties" element={<SellerProperties />} />
          <Route path="seller/add-property" element={<AddProperty />} />
          <Route path="seller/verification" element={<SellerVerification />} />
          <Route path="seller/enquiries" element={<SellerEnquiries />} />
          <Route path="seller/payments" element={<SellerPayments />} />
          <Route path="seller/subscription" element={<SubscriptionPlans />} />
          <Route path="seller/analytics" element={<SellerAnalytics />} />
          <Route path="seller/inspections" element={<SellerInspections />} />

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
            path="admin/revenue"
            element={
              <ProtectedAdminRoute>
                <AdminRevenue />
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

          <Route
            path="admin/inspections"
            element={
              <ProtectedAdminRoute>
                <AdminInspections />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="admin/analytics"
            element={
              <ProtectedAdminRoute>
                <AdminAnalytics />
              </ProtectedAdminRoute>
            }
          />
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
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