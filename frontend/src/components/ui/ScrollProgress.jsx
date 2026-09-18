import { useScroll, useSpring, motion } from "motion/react";

/**
 * ScrollProgress component
 * Displays a clean, minimal progress line tracking page scroll depth.
 */
export default function ScrollProgress({
  className = "",
  color = "var(--accent)",
  height = 2,
}) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className={className}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height,
        background: color,
        transformOrigin: "0%",
        scaleX,
        zIndex: 9999,
      }}
    />
  );
}
