import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";

export default function DesignRequest() {
  const [form, setForm] = useState({
    client_name: "",
    phone: "",
    whatsapp: "",
    service: "",
    description: "",
    budget: "",
    deadline: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.client_name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    if (!form.phone.trim()) {
      toast.error("Please enter your phone number.");
      return;
    }

    if (!form.service.trim()) {
      toast.error("Please select a service.");
      return;
    }

    if (!form.description.trim()) {
      toast.error("Please describe your design request.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please login first.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("design_requests").insert({
      user_id: user.id,
      client_name: form.client_name.trim(),
      phone: form.phone.trim(),
      whatsapp: form.whatsapp.trim() || form.phone.trim(),
      service: form.service,
      description: form.description.trim(),
      budget: form.budget ? Number(form.budget) : null,
      deadline: form.deadline || null,
      status: "pending",
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Design request submitted successfully.");
      setForm({
        client_name: "",
        phone: "",
        whatsapp: "",
        service: "",
        description: "",
        budget: "",
        deadline: "",
      });
    }

    setLoading(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mx-auto max-w-4xl"
    >
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-purple-900 to-indigo-900 p-8 text-white shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-8 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative z-10">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-purple-200">
            Amolab Graphix Service
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight">
            Request a Design
          </h1>

          <p className="mt-3 max-w-2xl text-purple-100">
            Need a flyer, logo, banner, real estate advert, social media design,
            or branding material? Submit your request and our design team will
            review it.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="grid gap-5 md:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">
              Client Name
            </span>

            <input
              name="client_name"
              required
              value={form.client_name}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-all duration-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-purple-900/40"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">
              Phone Number
            </span>

            <input
              name="phone"
              required
              value={form.phone}
              onChange={handleChange}
              placeholder="080..."
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-all duration-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-purple-900/40"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">
              WhatsApp Number
            </span>

            <input
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              placeholder="Optional"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-all duration-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-purple-900/40"
            />
          </label>
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">
            Service Required
          </span>

          <select
            name="service"
            required
            value={form.service}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-all duration-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-purple-900/40"
          >
            <option value="">Select a service</option>
            <option value="Logo Design">Logo Design</option>
            <option value="Flyer Design">Flyer Design</option>
            <option value="Business Card">Business Card</option>
            <option value="Banner Design">Banner Design</option>
            <option value="Social Media Design">Social Media Design</option>
            <option value="Real Estate Flyer">Real Estate Flyer</option>
            <option value="Brand Identity">Brand Identity</option>
            <option value="Packaging Design">Packaging Design</option>
            <option value="Printing">Printing</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">
            Design Description
          </span>

          <textarea
            name="description"
            required
            value={form.description}
            onChange={handleChange}
            rows="6"
            placeholder="Example: I need a premium real estate flyer for a 4 bedroom duplex in Lekki..."
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-all duration-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-purple-900/40"
          />
        </label>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">
              Budget
            </span>

            <input
              name="budget"
              type="number"
              value={form.budget}
              onChange={handleChange}
              placeholder="Example: 10000"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-all duration-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-purple-900/40"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">
              Deadline
            </span>

            <input
              name="deadline"
              type="date"
              value={form.deadline}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-all duration-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-purple-900/40"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-7 rounded-2xl bg-purple-700 px-6 py-3 font-black text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-purple-950/40"
        >
          {loading ? "Submitting..." : "Submit Design Request"}
        </button>
      </form>
    </motion.div>
  );
}