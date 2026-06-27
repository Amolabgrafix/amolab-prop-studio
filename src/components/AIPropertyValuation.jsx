import { motion } from "framer-motion";
import { calculatePropertyValuation } from "../lib/aiPropertyValuation";

function money(value) {
  return `₦${Number(value || 0).toLocaleString()}`;
}

export default function AIPropertyValuation({ property }) {
  if (!property) return null;

  const ai = calculatePropertyValuation(property);

  const positive = ai.difference >= 0;

  const verdictColor = {
    "Excellent Deal": "text-green-600",
    "Good Deal": "text-blue-600",
    "Fairly Priced": "text-yellow-600",
    "Overpriced": "text-red-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-purple-600 dark:text-purple-300">
            AI Property Valuation
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {ai.verdict}
          </h2>
        </div>

        <div className="rounded-full bg-purple-100 px-5 py-4 dark:bg-purple-500/20">
          <span className="text-3xl">🤖</span>
        </div>
      </div>

      <div className="mt-6 space-y-4">

        <div className="flex items-center justify-between rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
          <span className="font-bold text-slate-600 dark:text-slate-300">
            Asking Price
          </span>

          <span className="text-lg font-black text-slate-900 dark:text-white">
            {money(ai.askingPrice)}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-purple-50 p-4 dark:bg-purple-500/10">
          <span className="font-bold text-purple-700 dark:text-purple-300">
            AI Estimated Value
          </span>

          <span className="text-lg font-black text-purple-700 dark:text-purple-300">
            {money(ai.estimatedValue)}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
          <span className="font-bold text-slate-600 dark:text-slate-300">
            Difference
          </span>

          <span
            className={`text-lg font-black ${
              positive ? "text-green-600" : "text-red-600"
            }`}
          >
            {positive ? "+" : ""}
            {money(ai.difference)}
          </span>
        </div>

      </div>

      <div className="mt-6 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 p-5 dark:from-slate-800 dark:to-slate-900">

        <p className="text-sm font-black uppercase tracking-widest text-purple-700 dark:text-purple-300">
          AI Verdict
        </p>

        <h3
          className={`mt-2 text-2xl font-black ${
            verdictColor[ai.verdict]
          }`}
        >
          {ai.verdict}
        </h3>

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          This estimate is calculated using buyer interest, featured status,
          boosted listings, property size and premium market locations.
        </p>

      </div>
    </motion.div>
  );
}