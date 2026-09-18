import { motion } from "motion/react";

/**
 * AnimatedCard component
 * Crisp card container with subtle entry and micro-hover elevation.
 * Avoids heavy glowing dropshadows or floating glassmorphism.
 */
export default function AnimatedCard({
  children,
  delay = 0,
  className = "sports-card",
  style = {},
  hoverEffect = false,
  onClick,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{
        duration: 0.3,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={
        hoverEffect
          ? {
              y: -2,
              transition: { duration: 0.15, ease: "easeOut" },
            }
          : undefined
      }
      className={className}
      style={style}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}
