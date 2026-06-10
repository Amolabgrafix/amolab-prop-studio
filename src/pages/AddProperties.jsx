import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AddProperty() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("sale");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAddProperty = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Please login first.");
        setLoading(false);
        return;
      }

      let imageUrl = "";

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `properties/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("property-images")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("property-images")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from("properties").insert([
        {
          user_id: user.id,
          title,
          location,
          price: Number(price),
          type,
          description,
          image_url: imageUrl,
          status: "pending",
        },
      ]);

      if (error) throw error;

      alert("Property uploaded successfully. Waiting for admin approval.");

      setTitle("");
      setLocation("");
      setPrice("");
      setType("sale");
      setDescription("");
      setImageFile(null);
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">Add Property</h1>

        <form onSubmit={handleAddProperty} className="space-y-4">
          <input
            type="text"
            placeholder="Property title"
            className="w-full border p-3 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Location"
            className="w-full border p-3 rounded"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Price"
            className="w-full border p-3 rounded"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <select
            className="w-full border p-3 rounded"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>

          <textarea
            placeholder="Property description"
            className="w-full border p-3 rounded h-32"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <input
            type="file"
            accept="image/*"
            className="w-full border p-3 rounded"
            onChange={(e) => setImageFile(e.target.files[0])}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white py-3 rounded font-semibold hover:bg-blue-800"
          >
            {loading ? "Uploading..." : "Submit Property"}
          </button>
        </form>
      </div>
    </div>
  );
}