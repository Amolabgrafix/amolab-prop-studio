import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const propertyTypes = [
  {
    title: "Apartments",
    desc: "Modern flats and serviced apartment options.",
    to: "/properties?type=apartment",
    icon: "🏢",
  },
  {
    title: "Houses",
    desc: "Family homes, duplexes and standalone houses.",
    to: "/properties?type=house",
    icon: "🏠",
  },
  {
    title: "Land",
    desc: "Plots, estates and investment land opportunities.",
    to: "/properties?type=land",
    icon: "🌍",
  },
  {
    title: "Rentals",
    desc: "Properties available for rent and short stays.",
    to: "/properties?type=rent",
    icon: "🔑",
  },
  {
    title: "For Sale",
    desc: "Approved properties listed for purchase.",
    to: "/properties?type=sale",
    icon: "💼",
  },
  {
    title: "Luxury",
    desc: "Premium homes and high-value properties.",
    to: "/properties",
    icon: "👑",
    featured: true,
  },
];

export default function PropertyTypeExplorer() {
  return (
    <section className="bg-white py-24 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-purple-600 dark:text-purple-300">
            Explore By Type
          </p>

          <h2 className="mt-3 text-4xl font-black text-slate-950 dark:text-white md:text-5xl">
            Find Properties Your Way
          </h2>

          <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
            Browse properties by category and jump straight into the type of
            listing you need.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {propertyTypes.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -8, scale: 1.01 }}
            >
              <Link
                to={item.to}
                className={`group relative block overflow-hidden rounded-[2rem] border p-7 shadow-xl backdrop-blur-xl transition ${
                  item.featured
                    ? "border-yellow-300/30 bg-gradient-to-br from-slate-950 to-purple-950 text-white"
                    : "border-white/70 bg-white/85 text-slate-950 dark:border-white/10 dark:bg-slate-900/80 dark:text-white"
                }`}
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-400/20 blur-2xl" />

                <div className="relative z-10">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-3xl text-3xl ${
                      item.featured
                        ? "bg-white/10"
                        : "bg-purple-100 dark:bg-purple-500/20"
                    }`}
                  >
                    {item.icon}
                  </div>

                  <h3 className="mt-6 text-2xl font-black">{item.title}</h3>

                  <p
                    className={`mt-3 leading-7 ${
                      item.featured
                        ? "text-white/75"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {item.desc}
                  </p>

                  <p
                    className={`mt-6 inline-flex items-center gap-2 text-sm font-black transition group-hover:translate-x-1 ${
                      item.featured
                        ? "text-yellow-300"
                        : "text-purple-700 dark:text-purple-300"
                    }`}
                  >
                    Explore <span>→</span>
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}