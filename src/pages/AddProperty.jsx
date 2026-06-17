import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AddProperty() {
  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    type: "",
    description: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        setMessage("Please login first.");
        return;
      }

      let imageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("property-images")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("property-images")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from("properties")
      .insert({
        title: form.title,
        location: form.location,
        address: form.location,
        price: Number(form.price),
        type: form.type,
        listing_type: form.type,
        description: form.description,
        image_url: imageUrl,
        owner_id: user.id,
        status: "pending",
      });

      if (error) throw error;

      setMessage("Property uploaded successfully. Waiting for admin approval.");
      setForm({
        title: "",
        location: "",
        price: "",
        type: "",
        description: "",
      });
      setImageFile(null);
    } catch (error) {
      console.log("FULL ADD PROPERTY ERROR:", error);
      console.log("ERROR MESSAGE:", error.message);
      console.log("ERROR DETAILS:", error.details);
      console.log("ERROR HINT:", error.hint);
      console.log("ERROR CODE:", error.code);

      setMessage(
        error.message ||
          error.details ||
          "Something went wrong while uploading property."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">Upload Property</h1>

        {message && (
          <div className="mb-4 p-3 rounded bg-blue-100 text-blue-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Property title"
            className="w-full border p-3 rounded"
            required
          />

          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full border p-3 rounded"
            required
          />

          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Price"
            type="number"
            className="w-full border p-3 rounded"
            required
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            required
          >
            <option value="">Select type</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Property description"
            className="w-full border p-3 rounded h-32"
            required
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full border p-3 rounded"
            required
          />

          <button
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded font-semibold"
          >
            {loading ? "Uploading..." : "Submit Property"}
          </button>
        </form>
      </div>
    </div>
  );
}