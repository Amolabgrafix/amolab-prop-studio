import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AddProperty() {
  const [message, setMessage] = useState("");

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

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("properties").insert({
      owner_id: user.id,
      ...formData,
      status: "pending",
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Property submitted successfully.");
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-700">
        Add Property
      </h1>

      {message && (
        <div className="mt-4 p-3 bg-purple-50 text-purple-700 rounded-xl">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <input
          name="title"
          placeholder="Property Title"
          className="w-full border rounded-xl px-4 py-3"
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          className="w-full border rounded-xl px-4 py-3"
          onChange={handleChange}
        />

        <input
          name="property_type"
          placeholder="Property Type"
          className="w-full border rounded-xl px-4 py-3"
          onChange={handleChange}
        />

        <select
          name="listing_type"
          className="w-full border rounded-xl px-4 py-3"
          onChange={handleChange}
        >
          <option value="sale">Sale</option>
          <option value="rent">Rent</option>
        </select>

        <input
          name="price"
          placeholder="Price"
          className="w-full border rounded-xl px-4 py-3"
          onChange={handleChange}
        />

        <input
          name="state"
          placeholder="State"
          className="w-full border rounded-xl px-4 py-3"
          onChange={handleChange}
        />

        <input
          name="city"
          placeholder="City"
          className="w-full border rounded-xl px-4 py-3"
          onChange={handleChange}
        />

        <input
          name="bedrooms"
          placeholder="Bedrooms"
          className="w-full border rounded-xl px-4 py-3"
          onChange={handleChange}
        />

        <input
          name="bathrooms"
          placeholder="Bathrooms"
          className="w-full border rounded-xl px-4 py-3"
          onChange={handleChange}
        />

        <button className="bg-purple-700 text-white px-6 py-3 rounded-xl">
          Submit Property
        </button>
      </form>
    </div>
  );
}