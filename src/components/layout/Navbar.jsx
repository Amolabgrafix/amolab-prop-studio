import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "../../lib/supabase";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/properties", label: "Properties" },
  { to: "/properties", label: "Buy" },
  { to: "/properties", label: "Rent" },
  { to: "/dashboard/seller/add-property", label: "List Property" },
];

export default function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function getUser() {
      const { data } = await supabase.auth.getUser();
      if (mounted) setUser(data?.user || null);
    }

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setMobileOpen(false);
    navigate("/");
  }

  function linkClass({ isActive }) {
    return `rounded-2xl px-4 py-2 text-sm font-black transition ${
      isActive
        ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200"
        : "text-slate-600 hover:bg-slate-100 hover:text-purple-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
    }`;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/80 shadow-sm backdrop-blur-xl transition dark:border-white/10 dark:bg-slate-950/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link to="/" className="group flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 8, scale: 1.05 }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-700 to-slate-950 text-lg font-black text-white shadow-lg shadow-purple-200 dark:shadow-purple-950/40"
          >
            AP
          </motion.div>

          <div>
            <h1 className="text-lg font-black leading-tight text-slate-950 transition group-hover:text-purple-700 dark:text-white dark:group-hover:text-purple-300 md:text-2xl">
              Amolab Prop Studio
            </h1>
            <p className="hidden text-xs font-bold text-slate-500 dark:text-slate-400 sm:block">
              Premium Property Marketplace
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {navLinks.map((item, index) => (
            <NavLink key={`${item.to}-${item.label}-${index}`} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-2xl bg-purple-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-purple-800 dark:shadow-purple-950/40"
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-black text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-600 hover:text-white dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-2xl border border-purple-200 bg-white/70 px-5 py-3 text-sm font-black text-purple-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-purple-50 dark:border-purple-400/20 dark:bg-white/5 dark:text-purple-200 dark:hover:bg-white/10"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-2xl bg-purple-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-purple-800 dark:shadow-purple-950/40"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-lg dark:bg-white dark:text-slate-950 md:hidden"
        >
          ☰
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm md:hidden"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="ml-auto flex h-full w-[86%] max-w-sm flex-col bg-white p-5 shadow-2xl dark:bg-slate-950"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">
                    Amolab Prop
                  </h2>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Premium Menu
                  </p>
                </div>

                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl bg-slate-100 px-4 py-2 font-black text-slate-800 dark:bg-white/10 dark:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                {navLinks.map((item, index) => (
                  <NavLink
                    key={`${item.to}-${item.label}-mobile-${index}`}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={linkClass}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>

              <div className="mt-6 grid gap-3">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-2xl bg-purple-700 px-5 py-3 text-center text-sm font-black text-white"
                    >
                      Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black text-white"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-2xl border border-purple-200 px-5 py-3 text-center text-sm font-black text-purple-700 dark:border-purple-400/20 dark:text-purple-200"
                    >
                      Login
                    </Link>

                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-2xl bg-purple-700 px-5 py-3 text-center text-sm font-black text-white"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}