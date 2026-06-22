import { motion } from "framer-motion";

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.94,
        filter: "blur(10px)",
        y: 40,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 1.05,
        filter: "blur(10px)",
        y: -40,
      }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}