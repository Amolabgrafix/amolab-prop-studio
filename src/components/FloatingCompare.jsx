import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useCompare } from "./CompareContext";

export default function FloatingCompare() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();

  return (
    <AnimatePresence>
      {compareItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 120, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 120, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="fixed bottom-5 left-1/2 z-[70] w-[94%] max-w-5xl -translate-x-1/2 rounded-[2rem] border border-white/60 bg-white/90 p-4 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/90"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-purple-700 dark:text-purple-300">
                Property Compare ({compareItems.length}/3)
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Compare selected properties side-by-side.
              </p>
            </div>

            <div className="flex flex-1 gap-3 overflow-x-auto lg:justify-center">
              {compareItems.map((item) => (
                <div
                  key={item.id}
                  className="flex min-w-[210px] items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-white/5"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-500">
                        🏠
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                      {item.title || "Property"}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      ₦{Number(item.price || 0).toLocaleString()}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCompare(item.id)}
                    className="rounded-full bg-white px-2 py-1 text-xs font-black text-rose-600 shadow dark:bg-white/10"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={clearCompare}
                className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-white"
              >
                Clear
              </button>

              <Link
                to="/compare"
                className="rounded-2xl bg-purple-700 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-purple-800"
              >
                Compare Now →
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}