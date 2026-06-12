import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AddProperty() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    property_type: "",
    listing_type: "sale",
    price: "",
    state: "",
    city: "",
    bedrooms: "",
    bathrooms: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) throw userError;

      const user = userData?.user;

      if (!user) {
        setMessage("Please login before uploading a property.");
        setLoading(false);
        return;
      }

      let imageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
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

      const { error } = await supabase.from("properties").insert({
        title: formData.title,
        description: formData.description,
        property_type: formData.property_type,
        listing_type: formData.listing_type,
        price: Number(formData.price),
        state: formData.state,
        city: formData.city,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
        image_url: imageUrl,
        owner_id: user.id,
        status: "pending",
      });

      if (error) throw error;

      setMessage("Property submitted successfully. Waiting for admin approval.");

      setFormData({
        title: "",
        description: "",
        property_type: "",
        listing_type: "sale",
        price: "",
        state: "",
        city: "",
        bedrooms: "",
        bathrooms: "",
      });

      setImageFile(null);
    } catch (error) {
      setMessage(error.message);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold text-purple-700">
          Add Property
        </h1>

        <p className="mb-6 text-gray-600">
          Upload your property details. Admin will review and approve it before
          it appears publicly.
        </p>

        {message && (
          <div className="mb-5 rounded-lg bg-purple-100 p-4 text-purple-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="title"
            placeholder="Property Title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
            className="h-32 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
          />

          <div className="grid gap-5 md:grid-cols-2">
            <input
              type="text"
              name="property_type"
              placeholder="Property Type e.g Duplex, Apartment"
              value={formData.property_type}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
            />

            <select
              name="listing_type"
              value={formData.listing_type}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
            >
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
            />

            <input
              type="text"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
            />

            <input
              type="number"
              name="bedrooms"
              placeholder="Bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <input
              type="number"
              name="bathrooms"
              placeholder="Bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-purple-700 px-6 py-3 font-semibold text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? "Submitting..." : "Submit Property"}
          </button>
        </form>
      </div>
    </div>
  );
}