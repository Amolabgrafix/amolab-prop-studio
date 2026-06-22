import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

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

    if (!error) {
      setNotifications(data || []);
    }

    setLoading(false);
  }

  async function markAsRead(id) {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    loadNotifications();
  }

  async function markAllAsRead() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    loadNotifications();
  }

  useEffect(() => {
    let isMounted = true;

    const fetchNotifications = async () => {
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

      if (isMounted && !error) {
        setNotifications(data || []);
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    fetchNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Notifications
          </h1>
          <p className="text-sm text-slate-500">
            Stay updated on enquiries, inspections, payments, reviews and alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="rounded-xl bg-purple-700 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-800"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-6 shadow">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <h2 className="text-lg font-semibold text-slate-800">
            No notifications yet
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Your platform updates will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm ${
                item.is_read
                  ? "border-slate-200"
                  : "border-purple-300 bg-purple-50"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {!item.is_read && (
                      <span className="h-2.5 w-2.5 rounded-full bg-purple-700" />
                    )}

                    <h2 className="font-bold text-slate-900">
                      {item.title}
                    </h2>
                  </div>

                  <p className="mt-2 text-sm text-slate-600">
                    {item.message}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  {item.link && (
                    <Link
                      to={item.link}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Open
                    </Link>
                  )}

                  {!item.is_read && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}