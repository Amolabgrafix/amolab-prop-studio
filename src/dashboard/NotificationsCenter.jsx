import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

function getNotificationIcon(type) {
  const cleanType = String(type || "").toLowerCase();

  if (cleanType.includes("enquiry")) return "💬";
  if (cleanType.includes("inspection")) return "📅";
  if (cleanType.includes("payment")) return "💳";
  if (cleanType.includes("review")) return "⭐";
  if (cleanType.includes("ai_match")) return "🎯";
  if (cleanType.includes("property")) return "🏠";

  return "🔔";
}

function formatDate(date) {
  if (!date) return "Unknown date";
  return new Date(date).toLocaleString();
}

function SkeletonNotification() {
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-xl">
      <div className="flex gap-4">
        <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-200" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-1/3 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default function NotificationsCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadNotifications() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setNotifications([]);
    } else {
      setNotifications(data || []);
    }

    setLoading(false);
  }

  async function markAsRead(id) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Notification marked as read");
    loadNotifications();
  }

  async function markAllAsRead() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("All notifications marked as read");
    loadNotifications();
  }

  useEffect(() => {
    let isMounted = true;

    async function fetchNotifications() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !isMounted) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (isMounted) {
        if (error) {
          toast.error(error.message);
          setNotifications([]);
        } else {
          setNotifications(data || []);
        }

        setLoading(false);
      }
    }

    fetchNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  const unreadCount = notifications.filter((item) => !item.is_read).length;
  const readCount = notifications.length - unreadCount;

  return (
    <div className="min-h-screen">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-purple-800 via-slate-950 to-indigo-950 p-8 text-white shadow-2xl"
      >
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-purple-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-purple-200">
              Notification Center
            </p>

            <h1 className="mt-3 text-4xl font-black md:text-5xl">
              Notifications
            </h1>

            <p className="mt-3 max-w-2xl text-purple-100">
              Stay updated on enquiries, inspections, payments, reviews and important platform alerts.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-2xl bg-white/10 px-5 py-3 font-bold backdrop-blur">
                🔔 {loading ? "..." : notifications.length} Total
              </span>

              <span className="rounded-2xl bg-white/10 px-5 py-3 font-bold backdrop-blur">
                🟣 {loading ? "..." : unreadCount} Unread
              </span>

              <span className="rounded-2xl bg-white/10 px-5 py-3 font-bold backdrop-blur">
                ✅ {loading ? "..." : readCount} Read
              </span>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="rounded-2xl bg-white px-6 py-4 font-black text-purple-700 shadow-xl transition hover:-translate-y-1 hover:bg-purple-50"
            >
              Mark all as read
            </button>
          )}
        </div>
      </motion.div>

      {loading ? (
        <div className="mt-8 space-y-4">
          <SkeletonNotification />
          <SkeletonNotification />
          <SkeletonNotification />
        </div>
      ) : notifications.length === 0 ? (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-8 rounded-[2rem] bg-white p-10 text-center shadow-xl"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 text-4xl">
            🔔
          </div>

          <h2 className="mt-6 text-3xl font-black text-slate-900">
            No notifications yet
          </h2>

          <p className="mx-auto mt-3 max-w-md text-slate-600">
            Your platform updates will appear here when buyers, sellers or system actions need your attention.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mt-8 space-y-4"
        >
          {notifications.map((item) => (
            <motion.div
              key={item.id}
              variants={fadeUp}
              whileHover={{ y: -4, scale: 1.005 }}
             className={`relative overflow-hidden rounded-[2rem] border p-5 shadow-xl transition ${
            item.type === "ai_match"
              ? "border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50"
              : item.is_read
              ? "border-white bg-white"
              : "border-purple-200 bg-purple-50"
          }`}
            >
              {!item.is_read && (
                <div className="absolute left-0 top-0 h-full w-1.5 bg-purple-700" />
              )}

              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                      item.is_read
                        ? "bg-slate-100"
                        : "bg-purple-700 text-white"
                    }`}
                  >
                    {getNotificationIcon(item.type)}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {!item.is_read && (
                        <span className="h-2.5 w-2.5 rounded-full bg-purple-700" />
                      )}

                      <h2 className="text-lg font-black text-slate-900">
                        {item.title || "Notification"}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          item.is_read
                            ? "bg-slate-100 text-slate-500"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {item.is_read ? "Read" : "Unread"}
                      </span>
                    </div>

                    <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                      {item.message || "No notification message."}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                      <span>{formatDate(item.created_at)}</span>

                      {item.type && (
                        <span className="rounded-full bg-slate-100 px-2 py-1 font-bold capitalize text-slate-500">
                          {item.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {(item.link || item.property_id) && (
                  <Link
                    to={item.property_id ? `/properties/${item.property_id}` : item.link}
                    className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800"
                  >
                    View Property
                  </Link>
                )}

                  {!item.is_read && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}