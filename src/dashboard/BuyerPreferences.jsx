import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import AIMatchedProperties from "../components/AIMatchedProperties";

export default function BuyerPreferences() {
  const [form, setForm] = useState({
    property_type: "",
    state: "",
    city: "",
    min_price: "",
    max_price: "",
    bedrooms: "",
    bathrooms: "",
    purpose: "",
  });

  const [preferenceId, setPreferenceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadPreference() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("Please login to save buyer preferences.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("buyer_preferences")
      .select("*")
      .eq("buyer_id", user.id)
      .maybeSingle();

    if (error) {
      setMessage(error.message);
    }

    if (data) {
      setPreferenceId(data.id);
      setForm({
        property_type: data.property_type || "",
        state: data.state || "",
        city: data.city || "",
        min_price: data.min_price || "",
        max_price: data.max_price || "",
        bedrooms: data.bedrooms || "",
        bathrooms: data.bathrooms || "",
        purpose: data.purpose || "",
      });
    }

    setLoading(false);
  }

  useEffect(() => {
    // call asynchronously to avoid synchronous setState inside effect
    (async () => {
      await loadPreference();
    })();
  }, []);

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      setSaving(false);
      return;
    }

    const payload = {
      buyer_id: user.id,
      property_type: form.property_type,
      state: form.state,
      city: form.city,
      min_price: form.min_price ? Number(form.min_price) : null,
      max_price: form.max_price ? Number(form.max_price) : null,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
      purpose: form.purpose,
      updated_at: new Date().toISOString(),
    };

    const query = preferenceId
      ? supabase
          .from("buyer_preferences")
          .update(payload)
          .eq("id", preferenceId)
          .select()
          .single()
      : supabase
          .from("buyer_preferences")
          .insert(payload)
          .select()
          .single();

    const { data, error } = await query;

    if (error) {
      setMessage(error.message);
    } else {
      setPreferenceId(data.id);
      setMessage("Buyer preference saved successfully.");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-300">
          Loading buyer preferences...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mx-auto max-w-5xl"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          AI Buyer Match
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Tell Amolab Prop Studio what you are looking for. We will use this to
          recommend properties that match your buying interest.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        {message && (
          <div className="mb-5 rounded-2xl bg-purple-50 px-4 py-3 text-sm font-medium text-purple-700 dark:bg-purple-950/40 dark:text-purple-200">
            {message}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Property Type">
            <select
              name="property_type"
              value={form.property_type}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-all duration-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-purple-900/40"
            >
              <option value="">Select type</option>
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
              <option value="Land">Land</option>
              <option value="Commercial">Commercial</option>
            </select>
          </Field>

          <Field label="Purpose">
            <select
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-all duration-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-purple-900/40"
            >
              <option value="">Select purpose</option>
              <option value="Sale">Sale</option>
              <option value="Rent">Rent</option>
              <option value="Shortlet">Shortlet</option>
            </select>
          </Field>

          <Field label="Preferred State">
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="Lagos"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-all duration-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-purple-900/40"
            />
          </Field>

          <Field label="Preferred City">
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Lekki"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-all duration-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-purple-900/40"
            />
          </Field>

          <Field label="Minimum Budget">
            <input
              name="min_price"
              type="number"
              value={form.min_price}
              onChange={handleChange}
              placeholder="10000000"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-all duration-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-purple-900/40"
            />
          </Field>

          <Field label="Maximum Budget">
            <input
              name="max_price"
              type="number"
              value={form.max_price}
              onChange={handleChange}
              placeholder="50000000"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-all duration-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-purple-900/40"
            />
          </Field>

          <Field label="Minimum Bedrooms">
            <input
              name="bedrooms"
              type="number"
              value={form.bedrooms}
              onChange={handleChange}
              placeholder="3"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-all duration-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-purple-900/40"
            />
          </Field>

          <Field label="Minimum Bathrooms">
            <input
              name="bathrooms"
              type="number"
              value={form.bathrooms}
              onChange={handleChange}
              placeholder="3"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-all duration-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-purple-900/40"
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-7 rounded-2xl bg-purple-700 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Buyer Preference"}
        </button>
      </form>

      <AIMatchedProperties />
    </motion.div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </span>
      {children}
    </label>
  );
}