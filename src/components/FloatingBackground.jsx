import { motion } from "framer-motion";

export default function FloatingBackground() {
  return (
    <>
      <motion.div
        animate={{
          x: [0, 80, 0],
          y: [0, 120, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="fixed left-0 top-20 h-[450px] w-[450px] rounded-full bg-purple-600/30 blur-[160px]"
      />

      <motion.div
        animate={{
          x: [0, -120, 0],
          y: [0, -100, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="fixed right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[180px]"
      />

      <motion.div
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
        className="fixed left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
      />
    </>
  );
}