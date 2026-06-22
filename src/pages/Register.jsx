import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import AnimatedPage from "../components/AnimatedPage";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setLoading(false);
      toast.error(error.message || "Registration failed");
      return;
    }

    const user = data?.user;

    if (user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: user.id,
          fullname: form.fullname,
          email: form.email,
          role: form.role,
          status: "active",
        },
      ]);

      if (profileError) {
        setLoading(false);
        toast.error(profileError.message || "Profile creation failed");
        return;
      }
    }

    setLoading(false);
    toast.success("Account created successfully!");
    navigate("/login");
  }

  return (
    <AnimatedPage className="min-h-screen overflow-hidden bg-slate-950">
      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <motion.div
          animate={{
            scale: [1, 1.18, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-32 top-16 h-80 w-80 rounded-full bg-purple-600 blur-3xl"
        />

        <motion.div
          animate={{
            scale: [1.15, 1, 1.15],
            opacity: [0.25, 0.55, 0.25],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-32 bottom-16 h-96 w-96 rounded-full bg-blue-500 blur-3xl"
        />

        <div className="relative grid w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl lg:grid-cols-2">
          <div className="hidden min-h-[680px] flex-col justify-between bg-gradient-to-br from-slate-950 via-purple-800 to-indigo-800 p-10 text-white lg:flex">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-bold uppercase tracking-[0.35em] text-purple-200"
              >
                Join Amolab Prop Studio
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-4 text-4xl font-black leading-tight"
              >
                Create your property account and start exploring verified homes.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-5 max-w-md text-white/80"
              >
                Buyers can save favorites and book inspections. Sellers can
                upload, boost, feature, and track property performance.
              </motion.p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                ["Buy", "Find homes"],
                ["Sell", "List property"],
                ["Grow", "Track leads"],
              ].map((item, index) => (
                <motion.div
                  key={item[0]}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.12 }}
                  whileHover={{ y: -8, scale: 1.04 }}
                  className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"
                >
                  <h3 className="text-2xl font-black">{item[0]}</h3>
                  <p className="text-sm text-white/70">{item[1]}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 sm:p-10 lg:p-14">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-purple-700">
                Create Account
              </p>

              <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                Register now
              </h2>

              <p className="mt-3 text-slate-500">
                Start your real estate journey with a secure and premium
                property platform.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Full Name
                </label>
                <input
                  name="fullname"
                  type="text"
                  value={form.fullname}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 outline-none transition focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-100"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22 }}
              >
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 outline-none transition focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-100"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.29 }}
              >
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 outline-none transition focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-100"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.36 }}
              >
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Account Type
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 outline-none transition focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-100"
                >
                  <option value="user">Buyer / Renter</option>
                  <option value="seller">Seller / Agent</option>
                </select>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 px-6 py-4 font-black text-white shadow-lg shadow-purple-200 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create Account"}
              </motion.button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-black text-purple-700 hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}