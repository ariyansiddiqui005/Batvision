import { motion } from "motion/react";

/**
 * TextReveal component
 * Staggered word/phrase reveal using Motion for smooth cinematic entrances.
 */
export default function TextReveal({
  children,
  as: Component = "span",
  delay = 0,
  staggerDelay = 0.05,
  className = "",
  style = {},
}) {
  if (typeof children !== "string") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
        className={className}
        style={style}
      >
        {children}
      </motion.div>
    );
  }

  const words = children.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <Component className={className} style={{ display: "inline-block", ...style }}>
      <motion.span
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: "inline-flex", flexWrap: "wrap", gap: "0.25em" }}
      >
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            variants={wordVariants}
            style={{ display: "inline-block" }}
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  );
}
