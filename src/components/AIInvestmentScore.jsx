import { motion } from "framer-motion";
import { calculateInvestmentScore } from "../lib/aiInvestmentScore";

export default function AIInvestmentScore({ property }) {
  if (!property) return null;

  const ai = calculateInvestmentScore(property);

  const percentage = Math.min(Math.max(ai.score, 0), 100);
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const gradeColor =
    percentage >= 90
      ? "text-green-600"
      : percentage >= 80
      ? "text-blue-600"
      : percentage >= 70
      ? "text-yellow-500"
      : "text-red-500";

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
            AI Investment Score
          </p>

          <h2 className={`mt-2 text-2xl font-black ${gradeColor}`}>
            {ai.grade}
          </h2>
        </div>

        <div className="relative h-28 w-28">
          <svg className="h-28 w-28 -rotate-90">
            <circle
              cx="56"
              cy="56"
              r={radius}
              strokeWidth="10"
              className="fill-none stroke-slate-200 dark:stroke-slate-700"
            />

            <motion.circle
              cx="56"
              cy="56"
              r={radius}
              strokeWidth="10"
              strokeLinecap="round"
              className="fill-none stroke-purple-600"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.4 }}
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-black text-purple-700 dark:text-purple-300">
              {percentage}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 p-4 dark:from-slate-800 dark:to-slate-900">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Investment Grade
          </span>

          <span className={`font-black ${gradeColor}`}>
            {ai.grade}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
          Why AI recommends this property
        </h3>

        <div className="space-y-3">
          {ai.reasons.length > 0 ? (
            ai.reasons.map((reason, index) => (
              <motion.div
                key={reason}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex items-center gap-3 rounded-2xl bg-slate-100 p-3 dark:bg-slate-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 font-bold text-white">
                  ✓
                </div>

                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {reason}
                </p>
              </motion.div>
            ))
          ) : (
            <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                This property has a balanced investment profile.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}