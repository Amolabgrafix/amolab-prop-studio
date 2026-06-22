import { motion } from "framer-motion";

export default function AnimatedCard({
  children,
  className = "",
  delay = 0,
  hover = true,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 40,
        scale: 0.95,
        filter: "blur(10px)",
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      viewport={{ once: true, amount: 0.15 }}
      whileHover={
        hover
          ? {
              y: -12,
              scale: 1.03,
            }
          : {}
      }
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}