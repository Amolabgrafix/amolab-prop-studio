import { motion } from "framer-motion";
import { useCompare } from "./CompareContext";

export default function CompareButton({ property, className = "" }) {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  const active = isInCompare(property?.id);

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (active) {
      removeFromCompare(property.id);
    } else {
      addToCompare(property);
    }
  }

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`rounded-xl px-4 py-3 text-sm font-black transition ${
        active
          ? "bg-purple-700 text-white"
          : "bg-slate-950 text-white hover:bg-purple-700"
      } ${className}`}
    >
      {active ? "✓ Added" : "➕ Compare"}
    </motion.button>
  );
}