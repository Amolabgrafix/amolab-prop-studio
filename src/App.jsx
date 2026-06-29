import { useEffect, useState } from "react";
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
import SavedSearches from "./dashboard/SavedSearches";
import MyOffers from "./dashboard/MyOffers";

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
import SellerOffers from "./dashboard/seller/SellerOffers";
import WatchedProperties from "./dashboard/WatchedProperties";

import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import { CompareProvider } from "./components/CompareContext";
import FloatingCompare from "./components/FloatingCompare";



function ThemeController() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("amolab-theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("amolab-theme", theme);

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.add("bg-slate-950");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("bg-slate-950");
    }
  }, [theme]);

  return (
    <motion.button
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.94 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed bottom-6 right-6 z-50 rounded-2xl border border-white/30 bg-white/80 px-5 py-3 text-sm font-black text-slate-900 shadow-2xl backdrop-blur-xl transition hover:bg-purple-700 hover:text-white dark:border-white/10 dark:bg-slate-900/80 dark:text-white dark:hover:bg-purple-700"
    >
      {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </motion.button>
  );
}

function PremiumBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-50 transition dark:bg-slate-950">
      <motion.div
        animate={{
          x: [0, 120, 0],
          y: [0, 80, 0],
          scale: [1, 1.25, 1],
          opacity: [0.2, 0.45, 0.2],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-40 top-10 h-[520px] w-[520px] rounded-full bg-purple-500 blur-[160px] dark:bg-purple-700"
      />

      <motion.div
        animate={{
          x: [0, -140, 0],
          y: [0, -90, 0],
          scale: [1.2, 1, 1.2],
          opacity: [0.18, 0.38, 0.18],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-44 bottom-0 h-[560px] w-[560px] rounded-full bg-blue-500 blur-[170px] dark:bg-indigo-700"
      />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-200/40 dark:border-purple-400/10"
      />
    </div>
  );
}

function PageWrapper({ children }) {
  return (
    <motion.main
      initial={{
        opacity: 0,
        y: 42,
        scale: 0.96,
        filter: "blur(12px)",
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      exit={{
        opacity: 0,
        y: -28,
        scale: 1.03,
        filter: "blur(10px)",
      }}
      transition={{
        duration: 0.75,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="text-slate-900 transition dark:text-white"
    >
      {children}
    </motion.main>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/properties" element={<PageWrapper><Properties /></PageWrapper>} />
        <Route path="/properties/:id" element={<PageWrapper><PropertyDetails /></PageWrapper>} />
        <Route path="/agent/:id" element={<PageWrapper><AgentProfile /></PageWrapper>} />
        <Route path="/compare" element={<PageWrapper><CompareProperties /></PageWrapper>} />
        <Route path="/payment/success" element={<PageWrapper><PaymentSuccess /></PageWrapper>} />
        <Route path="/payment-success" element={<PageWrapper><PaymentSuccess /></PageWrapper>} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="my-offers" element={<MyOffers />} />
          <Route path="watched-properties" element={<WatchedProperties />} />
          <Route path="recently-viewed" element={<RecentlyViewed />} />
          <Route path="notifications" element={<NotificationsCenter />} />
          <Route path="property-alerts" element={<PropertyAlerts />} />
          <Route path="saved-searches" element={<SavedSearches />} />
          

          <Route path="seller" element={<SellerDashboard />} />
          <Route path="seller/properties" element={<SellerProperties />} />
          <Route path="seller/add-property" element={<AddProperty />} />
          <Route path="seller/verification" element={<SellerVerification />} />
          <Route path="seller/enquiries" element={<SellerEnquiries />} />
          <Route path="seller/offers" element={<SellerOffers />} />
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
              <div className="flex min-h-screen items-center justify-center">
                <h1 className="text-3xl font-black text-purple-700 dark:text-purple-300">
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

export default function App() {
  return (
    <CompareProvider>
      <BrowserRouter>
        <PremiumBackground />
        <AnimatedRoutes />
        <ThemeController />
        <FloatingCompare />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: "18px",
              background: "rgba(15, 23, 42, 0.92)",
              color: "#fff",
              padding: "14px 18px",
              fontWeight: "800",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 20px 60px rgba(15, 23, 42, 0.35)",
            },
            success: {
              iconTheme: {
                primary: "#22c55e",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </BrowserRouter>
    </CompareProvider>
  );
}