import { supabase } from "./supabase";

export async function createNotification({
  userId,
  title,
  message,
  type = "general",
  link = "/dashboard/notifications",
}) {
  if (!userId || !title || !message) return;

  const { error } = await supabase.from("notifications").insert([
    {
      user_id: userId,
      title,
      message,
      type,
      link,
      is_read: false,
    },
  ]);

  if (error) {
    console.error("Notification error:", error);
  }
}