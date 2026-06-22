import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { getSubscriptionLimits } from "../../lib/subscriptionLimits";

export default function AddProperty() {
  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    type: "",
    description: "",
    latitude: "",
    longitude: "",
  });

  const [imageFiles, setImageFiles] = useState([]);
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
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("subscription_plan")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      const plan = profile?.subscription_plan || "free";
      const limits = getSubscriptionLimits(plan);

      const { count, error: countError } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", user.id);

      if (countError) throw countError;

      if (count >= limits.maxProperties) {
        setMessage(
          `Your ${limits.name} plan allows only ${limits.maxProperties} properties. Please upgrade your plan.`
        );
        setLoading(false);
        return;
      }

      if (imageFiles.length === 0) {
        setMessage("Please upload at least one image.");
        setLoading(false);
        return;
      }

      const uploadedUrls = [];

      for (const file of imageFiles) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("property-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("property-images")
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      const { data: propertyData, error: propertyError } = await supabase
        .from("properties")
        .insert({
          title: form.title,
          location: form.location,
          address: form.location,
          price: Number(form.price),
          type: form.type,
          listing_type: form.type,
          description: form.description,
          image_url: uploadedUrls[0],
          latitude: form.latitude ? Number(form.latitude) : null,
          longitude: form.longitude ? Number(form.longitude) : null,
          owner_id: user.id,
          status: "pending",
        })
        .select("id")
        .single();

      if (propertyError) throw propertyError;

      const imageRows = uploadedUrls.map((url) => ({
        property_id: propertyData.id,
        image_url: url,
      }));

      const { error: imagesError } = await supabase
        .from("property_images")
        .insert(imageRows);

      if (imagesError) throw imagesError;

      setMessage("Property uploaded successfully. Waiting for admin approval.");

      setForm({
        title: "",
        location: "",
        price: "",
        type: "",
        description: "",
        latitude: "",
        longitude: "",
      });

      setImageFiles([]);
      e.target.reset();
    } catch (error) {
      setMessage(error.message);
    }

    setLoading(false);
  }

  return (
    <div>
      <div className="max-w-2xl bg-white p-6 rounded-xl shadow">
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

          <div className="rounded-xl border bg-slate-50 p-4">
            <h2 className="mb-2 font-bold text-slate-900">Map Coordinates</h2>

            <p className="mb-3 text-sm text-slate-500">
              Enter latitude and longitude so the property can show on the map.
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="Latitude e.g. 6.5244"
                type="number"
                step="any"
                className="w-full border p-3 rounded"
              />

              <input
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="Longitude e.g. 3.3792"
                type="number"
                step="any"
                className="w-full border p-3 rounded"
              />
            </div>
          </div>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImageFiles(Array.from(e.target.files))}
            className="w-full border p-3 rounded"
            required
          />

          {imageFiles.length > 0 && (
            <p className="text-sm text-slate-600">
              {imageFiles.length} image(s) selected
            </p>
          )}

          <button
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded font-semibold disabled:bg-gray-400"
          >
            {loading ? "Uploading..." : "Submit Property"}
          </button>
        </form>
      </div>
    </div>
  );
}