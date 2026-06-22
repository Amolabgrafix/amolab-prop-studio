import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import AnimatedPage from "../components/AnimatedPage";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message || "Login failed");
      return;
    }

    toast.success("Welcome back!");
    navigate("/dashboard");
  }

  return (
    <AnimatedPage className="min-h-screen overflow-hidden bg-slate-950">
      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.35, 0.6, 0.35],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-purple-600 blur-3xl"
        />

        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.55, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-blue-500 blur-3xl"
        />

        <div className="relative grid w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl lg:grid-cols-2">
          <div className="hidden min-h-[620px] flex-col justify-between bg-gradient-to-br from-purple-700 via-indigo-700 to-slate-950 p-10 text-white lg:flex">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-4xl font-black leading-tight"
              >
                Find verified homes faster with Amolab Prop Studio.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="mt-5 max-w-md text-white/80"
              >
                Search, compare, inspect, save favorites, and connect with
                trusted sellers from one premium real estate platform.
              </motion.p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                ["10k+", "Views"],
                ["Fast", "Search"],
                ["Secure", "Login"],
              ].map((item, index) => (
                <motion.div
                  key={item[1]}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + index * 0.1 }}
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
                Welcome Back
              </p>

              <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                Login to your account
              </h2>

              <p className="mt-3 text-slate-500">
                Continue managing your properties, inspections, favorites, and
                enquiries.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
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
                transition={{ delay: 0.25 }}
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
                  placeholder="Enter password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 outline-none transition focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-100"
                />
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 px-6 py-4 font-black text-white shadow-lg shadow-purple-200 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}
              </motion.button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-black text-purple-700 hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}