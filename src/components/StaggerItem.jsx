import { motion } from "framer-motion";

export default function StaggerItem({
  children,
  className = "",
}) {
  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: 40,
          scale: 0.95,
        },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.6,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}