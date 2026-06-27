import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";

export default function SaveSearchButton({
  search,
  location,
  propertyType,
  maxPrice,
}) {
  async function saveSearch() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please login first");
      return;
    }

    const { error } = await supabase.from("saved_searches").insert({
      user_id: user.id,
      location: location || search || "",
      type: propertyType || "",
      budget: maxPrice || null,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Search saved successfully 🔔");
  }

  return (
    <button
      onClick={saveSearch}
      className="rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white hover:bg-purple-800"
    >
      🔔 Save Search
    </button>
  );
}