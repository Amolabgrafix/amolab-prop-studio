import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function PropertyAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    property_type: "",
    state: "",
    city: "",
    min_price: "",
    max_price: "",
  });

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("property_alerts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setAlerts(data || []);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function createAlert(e) {
    e.preventDefault();
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      return;
    }

    const { error } = await supabase.from("property_alerts").insert({
      user_id: user.id,
      property_type: form.property_type,
      state: form.state,
      city: form.city,
      min_price: form.min_price ? Number(form.min_price) : null,
      max_price: form.max_price ? Number(form.max_price) : null,
      is_active: true,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Property alert created successfully.");
      setForm({
        property_type: "",
        state: "",
        city: "",
        min_price: "",
        max_price: "",
      });
      loadAlerts();
    }
  }

  async function toggleAlert(id, currentStatus) {
    await supabase
      .from("property_alerts")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    loadAlerts();
  }

  async function deleteAlert(id) {
    await supabase.from("property_alerts").delete().eq("id", id);
    loadAlerts();
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-slate-900">
          Property Alerts
        </h1>

        <p className="mt-2 text-slate-600">
          Save what you are looking for and get notified when matching
          properties are available.
        </p>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-slate-900">
          Create New Alert
        </h2>

        {message && (
          <div className="mb-4 rounded-xl bg-purple-100 p-3 text-purple-700">
            {message}
          </div>
        )}

        <form onSubmit={createAlert} className="grid gap-4 md:grid-cols-2">
          <select
            name="property_type"
            value={form.property_type}
            onChange={handleChange}
            className="rounded-xl border p-3"
          >
            <option value="">Any Property Type</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="land">Land</option>
            <option value="duplex">Duplex</option>
            <option value="office">Office</option>
            <option value="shop">Shop</option>
          </select>

          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            placeholder="State e.g Lagos"
            className="rounded-xl border p-3"
          />

          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="City e.g Lekki"
            className="rounded-xl border p-3"
          />

          <input
            name="min_price"
            value={form.min_price}
            onChange={handleChange}
            placeholder="Minimum Price"
            type="number"
            className="rounded-xl border p-3"
          />

          <input
            name="max_price"
            value={form.max_price}
            onChange={handleChange}
            placeholder="Maximum Price"
            type="number"
            className="rounded-xl border p-3"
          />

          <button className="rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white hover:bg-purple-800 md:col-span-2">
            Create Alert
          </button>
        </form>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-slate-900">
          My Saved Alerts
        </h2>

        {alerts.length === 0 ? (
          <p className="text-slate-500">No alerts created yet.</p>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-2xl border p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-bold text-slate-900">
                      {alert.property_type || "Any Property"} in{" "}
                      {alert.city || alert.state || "Any Location"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      ₦{Number(alert.min_price || 0).toLocaleString()} - ₦
                      {Number(alert.max_price || 0).toLocaleString()}
                    </p>

                    <p className="mt-1 text-sm">
                      Status:{" "}
                      <span
                        className={
                          alert.is_active
                            ? "font-semibold text-green-600"
                            : "font-semibold text-red-600"
                        }
                      >
                        {alert.is_active ? "Active" : "Paused"}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAlert(alert.id, alert.is_active)}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      {alert.is_active ? "Pause" : "Resume"}
                    </button>

                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}