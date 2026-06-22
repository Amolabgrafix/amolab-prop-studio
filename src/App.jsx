import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

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
import NotificationsCenter from "./dashboard/NotificationsCenter";
import PropertyAlerts from "./dashboard/PropertyAlerts";

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

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageWrapper>
              <Home />
            </PageWrapper>
          }
        />

        <Route
          path="/login"
          element={
            <PageWrapper>
              <Login />
            </PageWrapper>
          }
        />

        <Route
          path="/register"
          element={
            <PageWrapper>
              <Register />
            </PageWrapper>
          }
        />

        <Route
          path="/properties"
          element={
            <PageWrapper>
              <Properties />
            </PageWrapper>
          }
        />

        <Route
          path="/properties/:id"
          element={
            <PageWrapper>
              <PropertyDetails />
            </PageWrapper>
          }
        />

        <Route
          path="/agent/:id"
          element={
            <PageWrapper>
              <AgentProfile />
            </PageWrapper>
          }
        />

        <Route
          path="/compare"
          element={
            <PageWrapper>
              <CompareProperties />
            </PageWrapper>
          }
        />

        <Route
          path="/payment/success"
          element={
            <PageWrapper>
              <PaymentSuccess />
            </PageWrapper>
          }
        />

        <Route
          path="/payment-success"
          element={
            <PageWrapper>
              <PaymentSuccess />
            </PageWrapper>
          }
        />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="recently-viewed" element={<RecentlyViewed />} />
          <Route path="notifications" element={<NotificationsCenter />} />
          <Route path="property-alerts" element={<PropertyAlerts />} />

          <Route path="seller" element={<SellerDashboard />} />
          <Route path="seller/properties" element={<SellerProperties />} />
          <Route path="seller/add-property" element={<AddProperty />} />
          <Route path="seller/verification" element={<SellerVerification />} />
          <Route path="seller/enquiries" element={<SellerEnquiries />} />
          <Route path="seller/payments" element={<SellerPayments />} />
          <Route path="seller/subscription" element={<SubscriptionPlans />} />
          <Route path="seller/analytics" element={<SellerAnalytics />} />
          <Route path="seller/inspections" element={<SellerInspections />} />

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

        <Route
          path="*"
          element={
            <PageWrapper>
              <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <h1 className="text-3xl font-bold text-purple-700">
                  Page Not Found
                </h1>
              </div>
            </PageWrapper>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;